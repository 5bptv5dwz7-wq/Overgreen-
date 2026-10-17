(function(root){
'use strict';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validateDraft(raw,ctx){
 if(!raw||typeof raw!=='object')throw Error('Bozza non valida');
 const day=raw.day;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')||new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)throw Error('Data non valida');
 if(day<ctx.today)throw Error('La data è nel passato');
 const ids=(values,allowed,label)=>{if(!Array.isArray(values)||values.length>100||values.some(x=>!uuid.test(x)||!allowed.includes(x))||new Set(values).size!==values.length)throw Error(label+' non validi');return [...values]};
 const members=ids(raw.members,ctx.profiles.filter(p=>p.attivo).map(p=>p.id),'Dipendenti');
 const stores=ids(raw.stores,ctx.stores.map(s=>s.id),'Punti vendita');
 const extras=ids(raw.extras,ctx.extras.filter(e=>!['completato','annullato','in_attesa'].includes(e.stato)).map(e=>e.id),'Extra');
 if(!members.length||!stores.length&&!extras.length)throw Error('Servono una squadra e almeno un lavoro');
 const text=v=>{if(v!=null&&typeof v!=='string')throw Error('Appunto non valido');if((v||'').length>2000)throw Error('Appunto troppo lungo');return (v||'').trim()};
 const item_notes={};for(const [id,note]of Object.entries(raw.item_notes||{})){if(!stores.includes(id))throw Error('Appunto senza sede');item_notes[id]=text(note)}
 // Existing extra assignments must be moved explicitly through the established UI.
 for(const id of extras){const e=ctx.extras.find(e=>e.id===id);if(e.execution_date_mode==='on'&&e.execution_date&&day!==e.execution_date||e.execution_date_mode==='not_before'&&e.execution_date&&day<e.execution_date)throw Error('Data non conforme al vincolo dell’extra');if(e.deadline_at){const limit=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.deadline_at));if(day>limit)throw Error('Data oltre la scadenza dell’extra')}if(e.schedule_item_id||e.stato==='programmato')throw Error('Extra già programmato: gestisci lo spostamento dalla programmazione')}
 for(const id of stores){if(ctx.items.some(i=>i.store_id===id&&!['completato','annullato','riportato'].includes(i.stato)&&ctx.schedules.some(s=>s.id===i.schedule_id&&s.giorno===day)))throw Error('Una sede è già programmata nella stessa giornata')}
 return {day,members,stores,extras,item_notes,note:text(raw.note)||null,auto_rollover:raw.auto_rollover===true};
}
function remember(entries,text){text=String(text||'').trim();if(!text||text.length>500)throw Error('Preferenza richiesta, massimo 500 caratteri');return [...new Set([...entries,text])].slice(-30)}
function transcript(rows,role,text){const copy=rows.map(x=>({...x}));if(copy.at(-1)?.role===role)copy.at(-1).text+=text;else copy.push({role,text});return copy.slice(-40).map(x=>({role:x.role,text:x.text.slice(-2000)}))}
const api={validateDraft,remember,transcript};if(typeof module==='object')module.exports=api;else root.OvergreenVoiceCore=api;
})(typeof window==='undefined'?globalThis:window);
