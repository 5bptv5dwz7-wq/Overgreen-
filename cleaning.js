(function(root){
 const catalog={
  'A/1':{label:'Bagni e spogliatoi',frequency:'Settimanale',days:7,description:'Pulizia ordinaria di bagni e spogliatoi.'},
  'A/2':{label:'Aree esterne',frequency:'Settimanale',days:7,description:'Pulizia di aree esterne, parcheggi, carrelli e cestini.'},
  'C/1':{label:'Vetri e infissi dei servizi',frequency:'Mensile',description:'Vetri, davanzali, infissi e zanzariere di bagni e spogliatoi.'},
  'C/2':{label:'Pulizia esterna approfondita',frequency:'Mensile',description:'Pavimentazioni esterne, carrelli e rifiuti previsti dal capitolato.'},
  'D/2':{label:'Pulizia semestrale',frequency:'2 all’anno',description:'Deragnatura, vetrate e rivestimenti esterni, bidoni in uso e rifiuti previsti. I vetri dei bagni rientrano nel C/1.'}
 };
 const contract=e=>Array.isArray(e?.cleaning_codes)&&e.cleaning_codes.length>0&&!e.cleaning_codes.includes('TARGET');
 const codes=e=>['in_attesa','completato'].includes(e.stato)&&e.cleaning_done_codes?e.cleaning_done_codes:(e.cleaning_codes||[]);
 const day=e=>e.giorno_intervento||e.cleaning_period;
 function active(s,d){return s.attivo!==false&&!!s.cleaning_enabled&&!!s.cleaning_start&&s.cleaning_start<=d&&(!s.cleaning_end||s.cleaning_end>=d)}
 function shift(date,months=0,days=0){const d=new Date(date+'T12:00:00Z');if(months){const n=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(n,end))}d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
 function slots(rows,id,year){const booked=rows.filter(e=>e.store_id===id&&Number(e.cleaning_year)===Number(year)&&e.cleaning_slot&&e.stato!=='annullato');return {used:booked.filter(e=>e.stato==='completato').length,reserved:booked.filter(e=>e.stato!=='completato').length,free:Math.max(0,2-booked.length)}}
 function due(s,rows,date){if(!active(s,date))return [];return Object.keys(catalog).map(code=>{
  const matches=rows.filter(e=>e.store_id===s.id&&codes(e).includes(code)&&e.stato!=='annullato');
  const pending=matches.filter(e=>e.stato!=='completato');
  const last=matches.filter(e=>e.stato==='completato').map(day).filter(Boolean).sort().pop();
  const next=last?shift(last,code==='D/2'?6:code.startsWith('C/')?1:0,code.startsWith('A/')?7:0):s.cleaning_start;
  return {code,last,next,pending:pending.length,due:!pending.length&&next<=date&&(code!=='D/2'||slots(rows,s.id,date.slice(0,4)).free>0)};
 })}
 root.OvergreenCleaning={catalog,contract,codes,day,active,shift,slots,due};
 if(typeof module!=='undefined')module.exports=root.OvergreenCleaning;
})(typeof window==='undefined'?globalThis:window);
