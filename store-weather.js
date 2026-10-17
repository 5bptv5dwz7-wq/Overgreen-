(function(root){
 'use strict';
 const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'});
 const day=ms=>dateFormat.format(new Date(ms));
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
 function summarize(forecast,date){
  const rows=forecast?.properties?.timeseries||[],temps=[],segments=[];
  let selected=condition(''),rain=0,hasRain=false,prob=null,coveredUntil=-Infinity;
  for(const row of rows){
   const start=Date.parse(row.time),data=row.data||{};
   if(!Number.isFinite(start))continue;
   if(day(start)===date&&finite(data.instant?.details?.air_temperature))temps.push(data.instant.details.air_temperature);
   const hours=[1,6,12].find(h=>data[`next_${h}_hours`]);
   if(!hours||start<coveredUntil)continue;
   const block=data[`next_${hours}_hours`],end=start+hours*3600000;coveredUntil=end;
   // Split into hourly contributions so Rome midnight and DST do not double count rainfall.
   for(let t=start;t<end;t+=3600000){
    if(day(t)!==date)continue;
    segments.push(t);
    const c=condition(block.summary?.symbol_code);if(c.rank>selected.rank)selected=c;
    if(finite(block.details?.precipitation_amount)){rain+=block.details.precipitation_amount/hours;hasRain=true}
    if(finite(block.details?.probability_of_precipitation))prob=Math.max(prob??0,block.details.probability_of_precipitation);
   }
   if(day(start)===date&&day(end-1)===date){for(const key of ['air_temperature_min','air_temperature_max'])if(finite(block.details?.[key]))temps.push(block.details[key])}
  }
  if(!temps.length||!segments.length)return null;
  return {condition:selected,min:Math.round(Math.min(...temps)),max:Math.round(Math.max(...temps)),rain:hasRain?Math.round(rain*10)/10:null,probability:prob,partial:!segments.some(t=>new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',hourCycle:'h23'}).format(t)==='00'),updated:forecast.properties.meta?.updated_at};
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
    const info=document.createElement('small');info.textContent=`${date.slice(8,10)}/${date.slice(5,7)} · ${w.partial?'Ore restanti':'Previsione giornaliera'}${result.approximate?' · zona stimata':''}${result.stale?' · ultimo dato disponibile':''}`;node.appendChild(info);
    node.title='Condizione più significativa nelle ore previste. Temperature e precipitazioni aggregate da Overgreen; accumuli ripartiti tra le giornate. Aggiornamento: '+(w.updated?new Date(w.updated).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):'non disponibile');
   }catch(e){node.className='store-weather is-unavailable';node.textContent=e?.message==='location'?'📍 Meteo: verifica la posizione della sede':'☁️ Meteo non disponibile';node.title='La programmazione rimane disponibile. Riapri la Dashboard per riprovare.'}
  };
  const details=container.closest('details');
  if(!details||details.open)load();
  else details.addEventListener('toggle',()=>{if(details.open)load()});
 }
 const api={summarize,condition,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenWeather=api;
})(typeof window!=='undefined'?window:globalThis);
