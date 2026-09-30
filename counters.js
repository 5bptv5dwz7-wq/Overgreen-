(function(root){
  'use strict';
  function age(date,today){if(!date)return null;const n=(Date.parse(today+'T12:00:00Z')-Date.parse(date+'T12:00:00Z'))/86400000;return Number.isFinite(n)?Math.max(0,Math.round(n)):null}
  function severity(s,today){const lim=Number(s.intervallo_giorni);if(!(lim>0))return 'request';const n=age(s.ultimo_passaggio,today);return n===null?'due':n>lim+10?'urgent':n>lim?'due':n>=lim-3?'warning':'ok'}
  function overdue(s,today){return ['due','urgent'].includes(severity(s,today))}
  function compare(a,b,today){const rank={urgent:0,due:1,warning:2,ok:3,request:4};return rank[severity(a,today)]-rank[severity(b,today)]||((age(b.ultimo_passaggio,today)??99999)-Number(b.intervallo_giorni||0))-((age(a.ultimo_passaggio,today)??99999)-Number(a.intervallo_giorni||0))||String(a.nome).localeCompare(String(b.nome),'it')}
  function extraDate(e){if(e.closed_at){const d=new Date(e.closed_at);if(Number.isFinite(d.getTime()))return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}return e.giorno_intervento||''}
  function hasItem(i,id){return !!id&&(i.schedule_item_id===id||(i.schedule_item_ids||[]).includes(id))}
  function completed({interventions=[],extras=[],date}){
    const ordinary=interventions.filter(i=>i.stato==='convalidato'&&!i.multi_day_open&&(i.data_fine||i.data_intervento)===date);
    const doneExtras=extras.filter(e=>e.stato==='completato'&&extraDate(e)===date);
    // Only nest an extra when its actual ordinary visit is present in this day.
    const linked=doneExtras.filter(e=>ordinary.some(i=>hasItem(i,e.schedule_item_id)));
    const linkedIds=new Set(linked.map(e=>e.id));
    const standalone=doneExtras.filter(e=>!linkedIds.has(e.id));
    return {ordinary,standalone,linked,total:ordinary.length+standalone.length};
  }
  const api={age,severity,overdue,compare,extraDate,hasItem,completed};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OvergreenCounters=api;
})(typeof globalThis!=='undefined'?globalThis:this);
