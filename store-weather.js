(function(root){
 'use strict';
 const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'});
 const day=ms=>dateFormat.format(new Date(ms));
 const hourFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',hourCycle:'h23'});
 const hour=ms=>Number(hourFormat.format(new Date(ms)));
 const bands=[{label:'Notte',from:0,to:6},{label:'Mattina',from:6,to:12},{label:'Pomeriggio',from:12,to:18},{label:'Sera',from:18,to:24}];
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 function condition(code){
  const s=String(code||'');
  if(s.includes('thunder'))return {icon:'⛈️',label:'Temporali',rank:7};
  if(s.includes('sleet'))return {icon:'🌨️',label:'Pioggia e neve',rank:6};
  if(s.includes('snow'))return {icon:'❄️',label:'Neve',rank:5};
  if(s.includes('rain'))return {icon:'🌧️',label:s.includes('heavy')?'Pioggia intensa':s.includes('showers')?'Rovesci':'Pioggia',rank:s.includes('heavy')?4:3};
  if(s.includes('fog'))return {icon:'🌫️',label:'Nebbia',rank:2};
  if(s.includes('partlycloudy')||s.includes('fair'))return {icon:'🌤️',label:'Poco nuvoloso',rank:1};
  if(s.includes('cloudy'))return {icon:'☁️',label:'Nuvoloso',rank:2};
  if(s.includes('clearsky'))return {icon:'☀️',label:'Sereno',rank:0};
  return {icon:'🌡️',label:'Previsione',rank:-1};
 }
 function summarize(forecast,date,range={from:0,to:24}){
  const inRange=t=>day(t)===date&&hour(t)>=range.from&&hour(t)<range.to;
  const rows=forecast?.properties?.timeseries||[],temps=[],segments=[];
  let coarse=false,selected=condition(''),rain=0,hasRain=false,prob=null,coveredUntil=-Infinity;
  for(const row of rows){
   const start=Date.parse(row.time),data=row.data||{};
   if(!Number.isFinite(start))continue;
   if(inRange(start)&&finite(data.instant?.details?.air_temperature))temps.push(data.instant.details.air_temperature);
   const hours=[1,6,12].find(h=>data[`next_${h}_hours`]);
   if(!hours||start<coveredUntil)continue;
   const block=data[`next_${hours}_hours`],end=start+hours*3600000;coveredUntil=end;
   // Split into hourly contributions so Rome midnight and DST do not double count rainfall.
   for(let t=start;t<end;t+=3600000){
    if(!inRange(t))continue;
    if(hours>1)coarse=true;
    segments.push(t);
    const c=condition(block.summary?.symbol_code);if(c.rank>selected.rank)selected=c;
    if(finite(block.details?.precipitation_amount)){rain+=block.details.precipitation_amount/hours;hasRain=true}
    if(finite(block.details?.probability_of_precipitation))prob=Math.max(prob??0,block.details.probability_of_precipitation);
   }
   if(inRange(start)&&inRange(end-1)){for(const key of ['air_temperature_min','air_temperature_max'])if(finite(block.details?.[key]))temps.push(block.details[key])}
  }
  if(!temps.length||!segments.length)return null;
  return {condition:selected,min:Math.round(Math.min(...temps)),max:Math.round(Math.max(...temps)),rain:hasRain?Math.round(rain*10)/10:null,probability:prob,coarse,partial:!segments.some(t=>hour(t)===range.from)||!segments.some(t=>hour(t)===range.to-1),updated:forecast.properties.meta?.updated_at};
 }
 function openBands(store,date,result){
  document.getElementById('weatherBandsDialog')?.remove();
  const dialog=document.createElement('dialog');dialog.id='weatherBandsDialog';dialog.className='weather-bands-dialog';
  const header=document.createElement('div');header.className='weather-bands-head';
  const heading=document.createElement('h2');heading.textContent='Meteo per fascia oraria';header.appendChild(heading);
  const close=document.createElement('button');close.type='button';close.className='secondary';close.textContent='Chiudi';close.onclick=()=>dialog.close();header.appendChild(close);dialog.appendChild(header);
  const subtitle=document.createElement('p');subtitle.textContent=`${store.nome||'Punto vendita'} · ${date.slice(8,10)}/${date.slice(5,7)}/${date.slice(0,4)}`;dialog.appendChild(subtitle);
  const list=document.createElement('div');list.className='weather-bands-list';dialog.appendChild(list);
  for(const band of bands){
   const w=summarize(result.forecast,date,band),card=document.createElement('section');card.className='weather-band'+(w?.condition.rank>=3?' has-rain':'');
   const label=document.createElement('h3');label.textContent=`${band.label} · ${String(band.from).padStart(2,'0')}:00–${String(band.to).padStart(2,'0')}:00`;card.appendChild(label);
   const description=document.createElement('p');description.textContent=w?`${w.condition.icon} ${w.condition.label} · ${w.min}° / ${w.max}°C`:'Previsione non disponibile per questa fascia';card.appendChild(description);
   if(w){const details=document.createElement('small');details.textContent=`${w.rain==null?'Precipitazioni non disponibili':`Precipitazioni ≈ ${w.rain.toLocaleString('it-IT')} mm`}${w.probability==null?'':` · probabilità massima ${Math.round(w.probability)}%`}${w.partial?' · copertura parziale':''}${w.coarse?' · stima da intervalli di più ore':''}`;card.appendChild(details)}
   list.appendChild(card);
  }
  const note=document.createElement('p');note.className='weather-bands-note';note.textContent='Orari italiani. Minima e massima nelle ore disponibili di ogni fascia. Le fasce già trascorse possono non essere disponibili. Per le previsioni a intervalli di più ore, gli accumuli sono ripartiti in proporzione: il momento esatto della pioggia può variare.';dialog.appendChild(note);
  const update=document.createElement('p');update.className='weather-bands-note';update.textContent=`MET Norway · elaborazione Overgreen${result.approximate?' · posizione stimata':''}${result.stale?' · ultimo dato disponibile':''} · aggiornamento ${result.forecast?.properties?.meta?.updated_at?new Date(result.forecast.properties.meta.updated_at).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):'non disponibile'}`;dialog.appendChild(update);
  dialog.addEventListener('close',()=>dialog.remove());document.body.appendChild(dialog);dialog.showModal();
 }
 function mount(container,store,date,options){
  if(!store?.id)return;
  const node=document.createElement('aside');node.className='store-weather is-loading';node.setAttribute('aria-label','Meteo previsto per il passaggio');
  node.textContent='☁️ Caricamento meteo…';
  container.querySelector('.job-main')?.appendChild(node);
  const load=async()=>{
   if(node.dataset.started)return;node.dataset.started='1';
   try{
    const result=await options.load(store);if(!node.isConnected)return;
    const w=summarize(result.forecast,date);if(!w)throw new Error('Previsione non ancora disponibile');
    node.className='store-weather'+(w.condition.rank>=3?' has-rain':'');
    node.innerHTML='';
    const title=document.createElement('strong');title.textContent=`${w.condition.icon} ${w.condition.label}`;node.appendChild(title);
    const temp=document.createElement('span');temp.className='weather-temperatures';temp.textContent=`${w.min}° / ${w.max}°C`;temp.title='Minima / massima previste nelle ore disponibili';node.appendChild(temp);
    const rain=document.createElement('span');rain.className='weather-rain';rain.textContent=w.rain==null?'':`Precipitazioni ≈ ${w.rain.toLocaleString('it-IT')} mm${w.probability==null?'':` · prob. max ${Math.round(w.probability)}%`}`;node.appendChild(rain);
    const info=document.createElement('small');info.textContent=`${date.slice(8,10)}/${date.slice(5,7)} · ${w.partial?'Ore disponibili':'Previsione giornaliera'}${result.approximate?' · zona stimata':''}${result.stale?' · ultimo dato disponibile':''}`;node.appendChild(info);
    const button=document.createElement('button');button.type='button';button.className='weather-bands-button';button.textContent='Vedi fasce orarie ›';button.setAttribute('aria-label','Meteo per fascia oraria · '+(store.nome||'Punto vendita'));button.onclick=event=>{event.stopPropagation();openBands(store,date,result)};node.appendChild(button);
    node.title='Condizione più significativa nelle ore previste. Temperature e precipitazioni aggregate da Overgreen; accumuli ripartiti tra le giornate. Aggiornamento: '+(w.updated?new Date(w.updated).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):'non disponibile');
   }catch(e){node.className='store-weather is-unavailable';node.textContent=e?.message==='location'?'📍 Meteo: verifica la posizione della sede':'☁️ Meteo non disponibile';node.title='La programmazione rimane disponibile. Riapri la Dashboard per riprovare.'}
  };
  const details=container.closest('details');
  if(!details||details.open)load();
  else details.addEventListener('toggle',()=>{if(details.open)load()});
 }
 const api={summarize,condition,mount,openBands,bands};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenWeather=api;
})(typeof window!=='undefined'?window:globalThis);
