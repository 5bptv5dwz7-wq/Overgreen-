/* Monetary arithmetic in integer cents; hours are the sum for the whole crew. */
(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.OvergreenEconomics=model})(typeof window!=='undefined'?window:globalThis,()=>{
  const modes={tariffa:'A tariffa',preventivo:'A preventivo',consuntivo:'A consuntivo'};
  const quoteStates={bozza:'Bozza',inviato:'Inviato',accettato:'Accettato',rifiutato:'Rifiutato'};
  function decimal(value,maxDigits=7){
    const text=String(value??'').trim();if(!text)return null;
    if(!new RegExp('^\\d{1,'+maxDigits+'}([.,]\\d{1,2})?$').test(text))throw new Error('Usa un numero positivo con al massimo due decimali, senza separatori delle migliaia.');
    const [whole,fraction='']=text.replace(',','.').split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0'));
  }
  const cents=value=>decimal(value);
  const money=value=>value==null?'Da completare':new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(value/100);
  function rates(category,equipment=false){return category==='verde'?{hourly_rate:20,exit_rate:100}:category==='pulizie'?{hourly_rate:equipment?23:18,night_hourly_rate:equipment?30:25,exit_rate:50}:category==='manutenzioni'?{hourly_rate:equipment?33:28,night_hourly_rate:equipment?41:36,exit_rate:50}:{hourly_rate:null,exit_rate:null}}
  function isBillableExtra(extra){
    if(!extra)return false;
    if(extra.cleaning_codes?.length&&!extra.cleaning_codes.includes('TARGET'))return false;
    const client=extra?.client_type||'eurospin';
    const profiles=['eurospin','eurospin_ordinario','intesa','intesa_ordinario','privato'];
    const profile=profiles.includes(extra?.closure_profile)?extra.closure_profile:client;
    return client==='eurospin'&&profile==='eurospin';
  }
  function calculate(row={}){
    const missing=[];if(!modes[row.pricing_mode])missing.push('modalità');
    if(!['verde','pulizie','manutenzioni'].includes(row.pricing_category))missing.push('categoria');
    if(typeof row.dedicated_trip!=='boolean')missing.push('scelta addebito uscita');
    if(!Number.isInteger(Number(row.operator_count))||Number(row.operator_count)<1||Number(row.operator_count)>99)missing.push('numero operatori');
    const quoted=row.pricing_mode==='preventivo';
    const hourly=cents(row.hourly_rate),exitRate=cents(row.exit_rate);
    const hours=decimal(row.total_hours,5),quote=cents(row.quote_amount);
    if(quoted&&quote==null)missing.push('importo preventivo');
    if(!quoted&&hours==null)missing.push('ore');
    if(hourly==null||exitRate==null)missing.push('tariffe');
    const night=decimal(row.night_hours??0,5),nightRate=cents(row.night_hourly_rate);
    if(night>0&&!['pulizie','manutenzioni'].includes(row.pricing_category))missing.push('notturno/festivo solo per pulizie e manutenzioni');
    if(hours!=null&&night>hours)missing.push('ore notturne superiori al totale');
    if(night>0&&nightRate==null)missing.push('tariffa notturna');
    const validHours=hours!=null&&night<=hours;
    const dayHours=validHours?hours-night:null;
    const laborDay=validHours&&hourly!=null?Math.round(dayHours*hourly/100):null;
    const laborNight=night===0?0:nightRate!=null?Math.round(night*nightRate/100):null;
    const labor=validHours&&hourly!=null&&laborNight!=null?Math.round((dayHours*hourly+night*(nightRate??0))/100):null;
    const exitIncluded=quoted&&row.dedicated_trip===true&&row.quote_exit_included===true;
    const exit=row.dedicated_trip===false||exitIncluded?0:row.dedicated_trip===true&&exitRate!=null&&Number(row.operator_count)>0?exitRate*Number(row.operator_count):null;
    let expenses=0;
    for(const item of row.expenses||[]){const amount=cents(item.amount);if(!String(item.description||'').trim()||amount==null)missing.push('spese');else expenses+=amount}
    const base=quoted?quote:labor;
    const discount=cents(row.discount_amount)??0;
    const subtotal=base!=null&&exit!=null?base+exit+expenses:null;
    if(subtotal!=null&&discount>subtotal)missing.push('sconto superiore al subtotale');
    const complete=missing.length===0;
    const total=complete?subtotal-discount:null;
    return {complete,missing:[...new Set(missing)],labor,laborDay,laborNight,dayHours:dayHours==null?null:dayHours/100,nightHours:night/100,base,exit,exitIncluded,expenses,subtotal,discount,total,quotePending:quoted&&row.quote_status!=='accettato'};
  }
  function cleaningInvoiceLabel(row,category=row?.pricing_category){
    if(category==='manutenzioni')return 'Manutenzioni · IVA 22%';
    if(category!=='pulizie')return '';
    return row?.cleaning_scope==='interni'?'Pulizie interne · Reverse charge':row?.cleaning_scope==='esterni'?'Pulizie esterne · IVA ordinaria':'Pulizie: interni/esterni da indicare';
  }
  function review(row,extra,report){
    const result=calculate(row||{}),issues=[];
    if(['pulizie','manutenzioni'].includes(row?.pricing_category)&&Number(row.night_hours||0)!==Number(extra?.night_hours||0))issues.push('Ore notturne cambiate: ricontrolla Economia');
    if(row?.pricing_category&&extra?.categoria_target&&row.pricing_category!==extra.categoria_target)issues.push('Categoria cambiata: ricontrolla le tariffe');
    if(row?.total_hours!=null&&(row?.source_attachment_id||null)!==(report?.id||null))issues.push('Rapportino cambiato: ricontrolla le ore');
    return {...result,issues,ready:result.complete&&!result.quotePending&&!issues.length};
  }
  function closureDate(extra){
    if(!['completato','in_attesa'].includes(extra?.stato)||!extra.closed_at)return '';
    const date=new Date(extra.closed_at);if(Number.isNaN(date.getTime()))return '';
    const parts=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
  }
  function period(extra){
    if(!['completato','in_attesa'].includes(extra?.stato))return 'open';
    return closureDate(extra).slice(0,7)||'undated';
  }
  function periodLabel(value){
    if(value==='open')return 'Aperti';
    if(value==='undated')return 'Chiusi senza data';
    if(!value)return 'Tutti';
    const [year,month]=value.split('-').map(Number);
    return new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
  }
  function filterRows(extras,records,attachments,filter={}){
    const byId=new Map(records.map(r=>[r.extra_id,r]));
    const reports=new Map();for(const a of [...attachments].sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))||String(b.id).localeCompare(String(a.id))))if(a.tipo==='rapportino_eurospin'&&!reports.has(a.extra_id))reports.set(a.extra_id,a);
    return extras.filter(e=>isBillableExtra(e)&&!['annullato','rifiutato'].includes(e.stato))
      .map(e=>{const row=byId.get(e.id)||{};return {extra:e,row,calc:review(row,e,reports.get(e.id))}})
      .filter(x=>(!filter.month||period(x.extra)===filter.month)&&(!filter.category||x.extra.categoria_target===filter.category)&&(!filter.mode||x.row.pricing_mode===filter.mode)&&(!filter.state||x.extra.stato===filter.state))
      .sort((a,b)=>period(a.extra).localeCompare(period(b.extra))||closureDate(a.extra).localeCompare(closureDate(b.extra))||String(a.extra.numero_target||'').localeCompare(String(b.extra.numero_target||'')));
  }
  return {cleaningInvoiceLabel,closureDate,period,periodLabel,isBillableExtra,modes,quoteStates,decimal,cents,money,rates,calculate,review,filterRows};
});


