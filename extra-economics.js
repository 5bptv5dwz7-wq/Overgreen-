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
  function rates(category,equipment=false){return category==='verde'?{hourly_rate:20,exit_rate:100}:category==='pulizie'?{hourly_rate:equipment?23:18,exit_rate:50}:{hourly_rate:null,exit_rate:null}}
  function calculate(row={}){
    const missing=[];if(!modes[row.pricing_mode])missing.push('modalità');
    if(!['verde','pulizie'].includes(row.pricing_category))missing.push('categoria');
    if(typeof row.dedicated_trip!=='boolean')missing.push('tipo di uscita');
    if(!Number.isInteger(Number(row.operator_count))||Number(row.operator_count)<1||Number(row.operator_count)>99)missing.push('numero operatori');
    const quoted=row.pricing_mode==='preventivo';
    const hourly=cents(row.hourly_rate),exitRate=cents(row.exit_rate);
    const hours=decimal(row.total_hours,5),quote=cents(row.quote_amount);
    if(quoted&&quote==null)missing.push('importo preventivo');
    if(!quoted&&hours==null)missing.push('ore');
    if(hourly==null||exitRate==null)missing.push('tariffe');
    const labor=hours!=null&&hourly!=null?Math.round(hours*hourly/100):null;
    const exitIncluded=quoted&&row.dedicated_trip===true&&row.quote_exit_included===true;
    const exit=row.dedicated_trip===false||exitIncluded?0:row.dedicated_trip===true&&exitRate!=null&&Number(row.operator_count)>0?exitRate*Number(row.operator_count):null;
    let expenses=0;
    for(const item of row.expenses||[]){const amount=cents(item.amount);if(!String(item.description||'').trim()||amount==null)missing.push('spese');else expenses+=amount}
    const base=quoted?quote:labor;
    const complete=missing.length===0;
    const total=complete?base+exit+expenses:null;
    return {complete,missing:[...new Set(missing)],labor,base,exit,exitIncluded,expenses,total,quotePending:quoted&&row.quote_status!=='accettato'};
  }
  function review(row,extra,report){
    const result=calculate(row||{}),issues=[];
    if(row?.pricing_category&&extra?.categoria_target&&row.pricing_category!==extra.categoria_target)issues.push('Categoria cambiata: ricontrolla le tariffe');
    if(row?.total_hours!=null&&(row?.source_attachment_id||null)!==(report?.id||null))issues.push('Rapportino cambiato: ricontrolla le ore');
    return {...result,issues,ready:result.complete&&!result.quotePending&&!issues.length};
  }
  function filterRows(extras,records,attachments,filter={}){
    const byId=new Map(records.map(r=>[r.extra_id,r]));
    const reports=new Map();for(const a of [...attachments].sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))||String(b.id).localeCompare(String(a.id))))if(a.tipo==='rapportino_eurospin'&&!reports.has(a.extra_id))reports.set(a.extra_id,a);
    return extras.filter(e=>e.client_type==='eurospin'&&!['annullato','rifiutato'].includes(e.stato))
      .map(e=>{const row=byId.get(e.id)||{};return {extra:e,row,calc:review(row,e,reports.get(e.id))}})
      .filter(x=>(!filter.month||String(x.extra.giorno_intervento||x.extra.data_richiesta||x.extra.created_at||'').slice(0,7)===filter.month)&&(!filter.category||x.extra.categoria_target===filter.category)&&(!filter.mode||x.row.pricing_mode===filter.mode)&&(!filter.state||x.extra.stato===filter.state))
      .sort((a,b)=>String(a.extra.giorno_intervento||a.extra.data_richiesta||'').localeCompare(String(b.extra.giorno_intervento||b.extra.data_richiesta||''))||String(a.extra.numero_target||'').localeCompare(String(b.extra.numero_target||'')));
  }
  return {modes,quoteStates,decimal,cents,money,rates,calculate,review,filterRows};
});
