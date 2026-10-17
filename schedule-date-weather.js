/* Read-only weather preview for a proposed schedule date. */
(function(root){
 'use strict';
 function locations({items,extras,activities,stores}){
  const found=new Map();let unknown=0;
  for(const job of [...items,...extras,...activities]){
   const st=stores.find(s=>s.id===job.store_id);
   if(st)found.set(st.id,st);else unknown++;
  }
  return {stores:[...found.values()],unknown};
 }
 function assess(rows,unknown,score){
  let good=0,bad=0,uncertain=unknown,severe=0;
  for(const row of rows){
   const w=row.summary,s=w?score(w):null;
   if(s!==null&&s<2){bad++;if(s===0)severe++}
   else if(!w||w.partial||row.result?.stale||w.rain==null||w.condition?.rank<0)uncertain++;
   else good++;
  }
  if(bad)return {tone:'bad',title:severe?'Meteo critico per lavori esterni':'Giornata da valutare: pioggia prevista',good,bad,uncertain};
  if(uncertain)return {tone:'unknown',title:'Fattibilità non confermata: dati incompleti',good,bad,uncertain};
  if(!rows.length)return {tone:'unknown',title:'Nessuna sede da valutare',good,bad,uncertain};
  return {tone:'good',title:'Meteo favorevole per il giro',good,bad,uncertain};
 }
 function create({dialog,input,host,getScheduleId,getLocations,load,summarize,score,formatDate}){
  let generation=0,lastKey='';
  const node=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el};
  async function refresh(force=false){
   if(!dialog.open)return;
   const id=getScheduleId(),date=input.value,key=id+'|'+date;
   if(!force&&key===lastKey)return;lastKey=key;
   const token=++generation;host.removeAttribute('aria-busy');host.replaceChildren();host.className='schedule-date-weather';
   if(!date||!input.validity.valid){host.append(node('p','Scegli una data per vedere il meteo.'));return}
   const title=node('strong','Meteo · '+formatDate(date));host.append(title);
   const pending=node('p','Controllo le sedi della programmazione…');pending.setAttribute('role','status');host.append(pending);host.setAttribute('aria-busy','true');
   try{
    const selection=getLocations(id);
    const rows=await Promise.all(selection.stores.map(async st=>{
     try{const result=await load(st);return {store:st,result,summary:summarize(result.forecast,date,{from:6,to:18})}}
     catch{return {store:st,summary:null}}
    }));
    if(token!==generation||!dialog.open||id!==getScheduleId()||date!==input.value)return;
    const review=assess(rows,selection.unknown,score);host.classList.add('is-'+review.tone);pending.remove();
    host.append(node('p',review.title,'schedule-weather-verdict'));
    host.append(node('p',`${review.good} sedi favorevoli · ${review.bad} da valutare${review.uncertain?' · '+review.uncertain+' sedi/lavori non valutabili con dati completi':''}`,'schedule-weather-counts'));
    if(rows.length){
     const details=document.createElement('details');details.append(node('summary','Dettaglio delle '+rows.length+' sedi'));
     const list=document.createElement('ul');
     for(const row of rows){
      const li=document.createElement('li'),w=row.summary;li.append(node('strong',row.store.nome||'Sede'));
      if(!w)li.append(node('span','Previsione non disponibile per questa data o sede.'));
      else{
       li.append(node('span',`${w.condition.icon} ${w.condition.label} · ${w.min}° / ${w.max}°C · ${w.rain==null?'pioggia n/d':w.rain.toLocaleString('it-IT')+' mm'}${w.probability==null?'':' · prob. max '+Math.round(w.probability)+'%'}`));
       const hints=[w.partial?'Copertura oraria parziale':'',w.coarse?'Stima su intervalli di più ore':'',row.result.stale?'Ultima previsione disponibile, non aggiornata':'',row.result.approximate?'Posizione stimata':''].filter(Boolean);
       if(hints.length)li.append(node('small',hints.join(' · ')));
      }
      list.append(li);
     }
     details.append(list);host.append(details);
    }
    if(selection.unknown)host.append(node('p',`${selection.unknown} lavori senza una sede localizzabile: meteo non incluso.`,'schedule-weather-note'));
    if(rows.some(r=>!r.summary))host.append(node('p','Le date lontane possono essere fuori dall’orizzonte delle previsioni.','schedule-weather-note'));
    host.append(node('p','Ore 06–18 italiane · stima per lavori esterni, non per attività al coperto. Non valuta la portanza del terreno. Fonte: MET Norway · CC BY 4.0.','schedule-weather-note'));
   }catch{
    if(token===generation&&dialog.open){pending.textContent='Meteo non disponibile. Riprova cambiando data o riaprendo questa finestra.'}
   }finally{if(token===generation)host.removeAttribute('aria-busy')}
  }
  input.addEventListener('input',()=>void refresh());input.addEventListener('change',()=>void refresh());
  dialog.addEventListener('close',()=>{generation++;lastKey='';host.removeAttribute('aria-busy')});
  return {refresh};
 }
 const api={locations,assess,create};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenScheduleDateWeather=api;
})(typeof window!=='undefined'?window:globalThis);
