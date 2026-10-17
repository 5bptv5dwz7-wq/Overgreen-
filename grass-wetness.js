(function(root){
 'use strict';
 // Conservative, uncalibrated planning heuristic, not a measured leaf-wetness model.
 const dt=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'});
 const hf=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',hourCycle:'h23'});
 const H=3600000,finite=n=>typeof n==='number'&&Number.isFinite(n);
 function estimate(forecast,date,band){
  const rows=(forecast?.properties?.timeseries||[]).filter(r=>Number.isFinite(Date.parse(r.time))).slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
  const targetRow=rows.find(r=>dt.format(new Date(r.time))===date&&Number(hf.format(new Date(r.time)))>=band.from&&Number(hf.format(new Date(r.time)))<band.to);
  const unknown=(reason,time=null)=>({state:'unknown',label:'Erba: dati insufficienti',reason,confidence:'limitata',time});
  if(!targetRow)return unknown('Nessuna previsione disponibile nella fascia.');
  const target=Date.parse(targetRow.time),time=hf.format(new Date(target))+':00',current=targetRow.data?.instant?.details||{};
  if(finite(current.air_temperature)&&current.air_temperature<=0)return {state:'unknown',label:'Erba: possibile gelo',reason:'Temperature previste non superiori a 0 °C: asciutto/bagnato non descrive adeguatamente la situazione.',confidence:'limitata',time};
  const bins=new Map();let end=-Infinity,coarse=false;
  for(const r of rows){
   const start=Date.parse(r.time),data=r.data||{},hours=[1,6,12].find(h=>data[`next_${h}_hours`]);
   if(!hours||start<end)continue;end=start+hours*H;
   const block=data[`next_${hours}_hours`];
   for(let t=start;t<end&&t<target;t+=H){
    if(t<target-24*H)continue;
    const amount=block.details?.precipitation_amount;
    bins.set(t,{rain:finite(amount)?amount/hours:null,details:data.instant?.details||{}});if(hours>1)coarse=true;
   }
  }
  let wet=0,rain=0,covered=0,weatherCovered=0,rainEvent=false,dewEvent=false,drying=0;
  for(let t=target-24*H;t<target;t+=H){
   const b=bins.get(t);if(!b||b.rain==null)continue;covered++;rain+=b.rain;
   const d=b.details,temp=d.air_temperature,rh=d.relative_humidity,wind=d.wind_speed,cloud=d.cloud_area_fraction,hour=Number(hf.format(t));
   if([temp,rh,wind,cloud].every(finite))weatherCovered++;
   if(b.rain>=.1){wet=3;rainEvent=true;drying=0;continue}
   if(finite(rh)&&rh>=95&&finite(wind)&&wind<3&&(hour<9||hour>=19)){wet=Math.max(wet,2);dewEvent=true;drying=0;continue}
   if([temp,rh,wind,cloud].every(finite)&&hour>=9&&hour<18&&rh<80&&temp>=10){const rate=(rh<65&&cloud<50&&wind>=1)?.75:.25;wet=Math.max(0,wet-rate);drying++}
  }
  const dewNow=finite(current.relative_humidity)&&current.relative_humidity>=95&&finite(current.wind_speed)&&current.wind_speed<3&&Number(hf.format(target))<10;
  if(dewNow){wet=Math.max(wet,2);dewEvent=true}
  if(covered<24&&!rainEvent&&!dewEvent)return unknown(`Mancano dati completi sulle 24 ore precedenti alle ${time}. Assenza di pioggia prevista non significa erba asciutta.`,time);
  if(weatherCovered<24&&wet===0)return unknown('Dati insufficienti per valutare l’asciugatura nelle ore precedenti.',time);
  const confidence=covered===24&&weatherCovered===24&&!coarse?'indicativa':'limitata';
  let reason=rainEvent?`Circa ${rain.toLocaleString('it-IT',{maximumFractionDigits:1})} mm previsti nelle ore precedenti disponibili.`:dewEvent?'Umidità elevata e vento debole: possibile rugiada.':'Nessuna pioggia significativa prevista nelle 24 ore precedenti.';
  if(drying)reason+=' Alcune ore presentano condizioni favorevoli all’asciugatura.';
  if(covered<24)reason+=' Copertura precedente incompleta.';
  if(coarse)reason+=' Dati a intervalli di più ore.';
  if(wet>=2)return {state:'wet',label:'Erba probabilmente bagnata',reason,confidence,time};
  if(wet>0||!drying)return {state:'damp',label:'Erba potenzialmente umida',reason,confidence,time};
  return {state:'dry',label:'Erba probabilmente asciutta',reason,confidence,time};
 }
 const api={estimate};if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenGrassWetness=api;
})(typeof window!=='undefined'?window:globalThis);
