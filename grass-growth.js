(function(root){
 'use strict';
 const H=3600000,D=86400000,finite=n=>typeof n==='number'&&Number.isFinite(n),mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'});
 const shift=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*D).toISOString().slice(0,10);
 const levels=['Praticamente nulla','Bassa','Media','Forte'];
 function thermal(t,kind){const opt=kind==='warm'?31:20,width=kind==='warm'?7:5.5;return Math.exp(-.5*((t-opt)/width)**2)}
 function daylight(lat,date){const n=(Date.parse(date+'T12:00:00Z')-Date.parse(date.slice(0,4)+'-01-01T12:00:00Z'))/D+1,decl=.409*Math.sin(2*Math.PI*n/365-1.39);return 24/Math.PI*Math.acos(Math.max(-1,Math.min(1,-Math.tan(lat*Math.PI/180)*Math.tan(decl))))}
 function dailyForecast(forecast){
  const rows=(forecast?.properties?.timeseries||[]).slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)),days=new Map();
  const get=t=>{const key=fmt.format(new Date(t));if(!days.has(key))days.set(key,{date:key,temps:[],rain:0,rainHours:0});return days.get(key)};
  let rainUntil=-Infinity;
  for(let i=0;i<rows.length;i++){
   const r=rows[i],start=Date.parse(r.time),temp=r.data?.instant?.details?.air_temperature;
   if(!Number.isFinite(start))continue;
   const next=rows[i+1],end=Date.parse(next?.time),nextTemp=next?.data?.instant?.details?.air_temperature;
   if(finite(temp)&&finite(nextTemp)&&end>start&&end-start<=6*H){for(let t=start;t<end;t+=H)get(t).temps.push(temp+(nextTemp-temp)*(t-start+H/2)/(end-start))}
   const hours=[1,6,12].find(h=>r.data?.[`next_${h}_hours`]);if(!hours||start<rainUntil)continue;rainUntil=start+hours*H;
   const amount=r.data[`next_${hours}_hours`].details?.precipitation_amount;
   if(!finite(amount))continue;
   for(let t=start;t<rainUntil;t+=H){const d=get(t);d.rain+=amount/hours;d.rainHours++}
  }
  return [...days.values()].map(d=>({date:d.date,temp:d.temps.length>=18?mean(d.temps):null,rain:d.rainHours>=18?d.rain:null,hours:d.temps.length}));
 }
 function estimate(forecast,history,date,latitude,settings={}){
  const future=dailyForecast(forecast),window=future.filter(d=>d.date>=date&&d.date<shift(date,7)&&finite(d.temp));
  if(window.length<2)return {level:null,label:'Dati insufficienti',reason:'Servono almeno due giornate di previsione sufficientemente coperte.',warnings:[]};
  const kind=settings.grass_kind==='warm'?'warm':'cool',irrigation=settings.grass_irrigation||'unknown',warnings=[];
  if(settings.grass_kind!=='cool'&&settings.grass_kind!=='warm')warnings.push('Tipo non noto: ipotizzato prato da clima temperato.');
  if(irrigation==='unknown')warnings.push('Irrigazione non nota: valutazione condizionata all’assenza di irrigazione.');
  const pastMap=new Map();
  for(const d of history?.days||[])if(d.date<date&&d.date>=shift(date,-21))pastMap.set(d.date,{...d});
  for(const d of future)if(d.date<date&&d.date>=shift(date,-21)){const old=pastMap.get(d.date)||{};pastMap.set(d.date,{date:d.date,temp:finite(old.temp)?old.temp:d.temp,rain:finite(old.rain)?old.rain:d.rain})}
  const historical=(history?.days||[]).filter(d=>d.date<date&&d.date>=shift(date,-21)&&finite(d.temp)),latest=historical.at(-1)?.date;
  const usableHistory=historical.length>=14&&latest>=shift(date,-10);
  const recent=[...pastMap.values()].filter(d=>d.date>=shift(date,-7)&&finite(d.temp));
  let score=mean(window.map(d=>thermal(d.temp,kind))),temp=mean(window.map(d=>d.temp));
  if(usableHistory&&recent.length>=3)score=.75*score+.25*mean(recent.map(d=>thermal(d.temp,kind)));
  else warnings.push('Storico termico incompleto o non recente: prevale il potenziale delle previsioni.');
  const light=finite(latitude)?daylight(latitude,date):null;if(light!=null)score*=Math.min(1,Math.max(.55,light/14));
  const priorRain=[...pastMap.values()].filter(d=>d.date>=shift(date,-14)&&finite(d.rain)),futureRain=window.filter(d=>finite(d.rain));
  const rainPast=priorRain.reduce((s,d)=>s+d.rain,0),rainAhead=futureRain.reduce((s,d)=>s+d.rain,0);
  let water='Disponibilità d’acqua non verificata.';
  if(irrigation==='yes')water='Irrigazione presente: non applicata una penalizzazione per scarse piogge. Quantità irrigata non conosciuta.';
  else if(usableHistory&&priorRain.length>=12&&futureRain.length===window.length){
   if(rainPast<10){if(rainAhead<5){score=Math.min(score,.34);water='Poche piogge precedenti e previste: possibile limitazione idrica senza irrigazione.'}else{score=Math.min(score,.69);water='Piogge in arrivo dopo un periodo poco piovoso: possibile ripresa graduale.'}}
   else water='Le piogge disponibili non indicano una marcata carenza d’acqua; umidità del terreno non misurata.';
  }else warnings.push('Copertura delle piogge insufficiente per valutare un periodo secco.');
  const level=score<.1?0:score<.35?1:score<.7?2:3;
  return {level,label:levels[level],reason:`Media prevista ${temp.toFixed(1).replace('.',',')} °C${light==null?'':` · circa ${light.toFixed(1).replace('.',',')} ore di luce`}. ${water}`,warnings,from:window[0].date,to:window.at(-1).date,days:window.length,historyFrom:historical[0]?.date,historyTo:latest,historyDays:historical.length,rainPast:priorRain.length>=12?Math.round(rainPast):null,rainPastDays:priorRain.length,confidence:warnings.length||window.length<5?'limitata':'indicativa'};
 }
 function render(host,store,date,result,historyResult,compact=false){
  host.innerHTML='';const e=estimate(result.forecast,historyResult?.history,date,historyResult?.latitude,store);host.className='grass-growth '+(e.level==null?'is-unknown':'level-'+e.level);
  const title=document.createElement('strong');title.textContent='🌱 Crescita stimata: '+e.label;host.appendChild(title);
  const text=document.createElement('small');text.textContent=e.level==null?e.reason:`${e.from.slice(8,10)}/${e.from.slice(5,7)}–${e.to.slice(8,10)}/${e.to.slice(5,7)} · ${e.days} giorni · stima ${e.confidence}`;host.appendChild(text);
  if(compact){host.title=[e.reason,...e.warnings,'Stima sperimentale, non altezza dell’erba.'].join(' ');return}
  const explanation=document.createElement('p');explanation.textContent=e.reason;host.appendChild(explanation);
  for(const warning of e.warnings){const p=document.createElement('small');p.textContent=warning;host.appendChild(p)}
  const history=document.createElement('small');history.textContent=e.historyDays?`Storico termico utilizzabile: ${e.historyFrom}–${e.historyTo} (${e.historyDays} giorni).${e.rainPast==null?'':` Piogge precedenti disponibili: circa ${e.rainPast} mm su ${e.rainPastDays}/14 giorni.`}`:'Storico non disponibile: nessuna pioggia mancante è considerata zero.';host.appendChild(history);
  const note=document.createElement('p');note.className='weather-bands-note';note.textContent='Stima sperimentale del potenziale di crescita, non dell’altezza o dell’urgenza contrattuale. Storico NASA su area ampia, giornate UTC; previsioni MET Norway, giornate italiane. Ombra, suolo, concimazione e condizioni reali del prato possono cambiare il risultato.'+(historyResult?.stale?' Storico recuperato dalla cache, non aggiornato.':'');host.appendChild(note);
  const source=document.createElement('p');source.className='weather-bands-note';source.innerHTML='Storico: <a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener">NASA POWER</a> · modello termico ispirato al Growth Potential; correzioni sperimentali Overgreen.';host.appendChild(source);
 }
 async function mount(host,store,date,result,options,compact=false){
  host.className='grass-growth is-loading';host.textContent='🌱 Valutazione crescita…';
  let historyResult;try{historyResult=await options.loadGrowth(store)}catch{historyResult={history:null}}
  if(!host.isConnected)return;render(host,store,date,result,historyResult,compact);
  if(!compact&&options.canEdit?.()){
   const form=document.createElement('form');form.className='grass-growth-settings';
   form.innerHTML='<label>Tipo di prato<select name="kind"><option value="unknown">Non noto</option><option value="cool">Clima temperato (festuca, loietto, poa)</option><option value="warm">Clima caldo (gramigna, zoysia)</option></select></label><label>Irrigazione<select name="irrigation"><option value="unknown">Non nota</option><option value="yes">Presente</option><option value="no">Assente</option></select></label><button type="submit">Salva caratteristiche della sede</button><small data-status></small>';
   form.querySelector('[name=kind]').value=store.grass_kind||'unknown';form.querySelector('[name=irrigation]').value=store.grass_irrigation||'unknown';host.appendChild(form);
   form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('button'),status=form.querySelector('[data-status]');button.disabled=true;status.textContent='Salvataggio…';try{await options.saveGrowth(store,{grass_kind:form.querySelector('[name=kind]').value,grass_irrigation:form.querySelector('[name=irrigation]').value});await mount(host,store,date,result,options,false)}catch{status.textContent='Salvataggio non riuscito. Riprova.';button.disabled=false}};
  }
 }
 const api={estimate,dailyForecast,thermal,daylight,mount};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenGrassGrowth=api;
})(typeof window!=='undefined'?window:globalThis);
