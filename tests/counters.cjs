const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../counters.js'),{parseHTML}=require('linkedom');
const app=fs.readFileSync(__dirname+'/../app.js','utf8'),date='2026-09-30';
function block(a,b){return app.slice(app.indexOf(a),app.indexOf(b,app.indexOf(a)))}
test('extra-only visits never change ordinary age or urgency',()=>{
 const store={id:'s',nome:'Sede',ultimo_passaggio:'2026-09-01',intervallo_giorni:15};
 const before=JSON.stringify(store);
 const r=C.completed({date,extras:[{id:'e',store_id:'s',stato:'completato',closed_at:'2026-09-30T10:00:00Z'}]});
 assert.equal(r.total,1);assert.equal(r.ordinary.length,0);assert.equal(C.age(store.ultimo_passaggio,date),29);assert.equal(C.severity(store,date),'urgent');assert.equal(JSON.stringify(store),before);
});
test('execution day includes unscheduled work, excludes yesterday, pending and multi-day',()=>{
 const interventions=[{id:'unscheduled',stato:'convalidato',data_intervento:date},{id:'old-plan',schedule_item_id:'old',stato:'convalidato',data_intervento:'2026-09-20',data_fine:date},{id:'yesterday',schedule_item_id:'today',stato:'convalidato',data_intervento:'2026-09-29'},{id:'pending',stato:'in_attesa',data_intervento:date},{id:'partial',stato:'convalidato',data_intervento:date,multi_day_open:true}];
 assert.deepEqual(C.completed({date,interventions}).ordinary.map(i=>i.id),['unscheduled','old-plan']);
});
test('linked completed targets count inside the ordinary, other-day extra remains separate',()=>{
 const interventions=[{id:'i',schedule_item_ids:['a','b'],stato:'convalidato',data_intervento:date}];
 const extras=['a','b','yesterday',null].map((id,n)=>({id:'e'+n,schedule_item_id:id,stato:'completato',giorno_intervento:'2026-09-28',closed_at:'2026-09-30T11:00:00Z'}));
 const r=C.completed({date,interventions,extras});assert.equal(r.total,3);assert.equal(r.linked.length,2);assert.equal(r.standalone.length,2);
});
test('calendar days survive DST and extras use Italian closure day',()=>{
 assert.equal(C.age('2026-03-28','2026-03-30'),2);assert.equal(C.age('2026-10-24','2026-10-26'),2);
 assert.equal(C.extraDate({closed_at:'2026-09-29T22:30:00Z',giorno_intervento:'2026-09-20'}),date);
});
test('sorting puts urgent first and on-request last; scheduling cannot hide overdue',()=>{
 const rows=[{nome:'On request',ultimo_passaggio:null,intervallo_giorni:null},{nome:'Regular',ultimo_passaggio:date,intervallo_giorni:15},{nome:'Due',ultimo_passaggio:'2026-09-12',intervallo_giorni:15},{nome:'Urgent',ultimo_passaggio:'2026-09-01',intervallo_giorni:15},{nome:'Warning',ultimo_passaggio:'2026-09-17',intervallo_giorni:15}];
 assert.deepEqual(rows.sort((a,b)=>C.compare(a,b,date)).map(s=>s.nome),['Urgent','Due','Warning','Regular','On request']);
 const ctx={OvergreenCounters:C,today:()=>date,isStoreProgrammed:()=>true};vm.createContext(ctx);vm.runInContext(block('function status(s)','function completedToday'),ctx);assert.equal(ctx.status(rows[0]),'urgent');assert.equal(ctx.isOverdueStore(rows[0]),true);
});
test('program denominator stays 15 before and after its two linked targets close',()=>{
 const c={date,itemVisible:()=>true,itemDate:()=>date,scheduleForItem:()=>({}),isExtraVisible:()=>true,isScheduleVisible:()=>true,extraIsDone:e=>e.stato==='completato',itemDone:i=>i.stato==='completato',activeExtraStates:['programmato','ricevuto','da_integrare','in_attesa'],scheduleActivities:[],schedules:[],scheduleItems:Array.from({length:14},(_,n)=>({id:'s'+n,tipo:'ordinario',stato:n<11?'completato':'da_fare'})),extras:[{id:'a',schedule_item_id:'s1',giorno_intervento:date,stato:'programmato'},{id:'b',schedule_item_id:'s2',giorno_intervento:date,stato:'programmato'},{id:'c',giorno_intervento:date,stato:'completato'}]};
 const code=block('    const ordinary=scheduleItems.filter','    const details=document.createElement')+'\nresult={allJobsCount,completedCount};';
 function run(){const ctx={...c};vm.createContext(ctx);vm.runInContext(code,ctx);return ctx.result}
 assert.equal(run().allJobsCount,15);c.extras.forEach(e=>e.stato='completato');assert.equal(run().allJobsCount,15);assert.equal(run().completedCount,12);
 c.scheduleItems.push({id:'cancelled',tipo:'ordinario',stato:'annullato'},{id:'rollover',tipo:'ordinario',stato:'riportato'},{id:'extraItem',tipo:'extra',stato:'da_fare'});assert.equal(run().allJobsCount,15);
});
test('site summary and filters use the same overdue and ordinary-today sets',()=>{
 const {document}=parseHTML('<input id="searchInput" value=""><select id="sortSelect"><option value="urgent" selected>Urgent</option></select><div id="storesList"></div><b id="totalCount"></b><b id="dueCount"></b><b id="warningCount"></b><b id="todayCount"></b>');
 const stores=[{id:'a',nome:'Urgent',intervallo_giorni:15,ultimo_passaggio:'2026-09-01'},{id:'b',nome:'Ordinary today',intervallo_giorni:15,ultimo_passaggio:date},{id:'c',nome:'Extra only',intervallo_giorni:15,ultimo_passaggio:'2026-09-10'}];
 const ctx={document,$:id=>document.getElementById(id),OvergreenCounters:C,today:()=>date,completedToday:()=>({ordinary:[{store_id:'b'}]}),stores,storeClientFilter:'all',storeFilter:'all',clientType:()=> 'eurospin',clientLabel:()=> 'Eurospin'};
 document.getElementById('searchInput').value='no match';vm.createContext(ctx);vm.runInContext(block('function status(s)','function completedToday'),ctx);vm.runInContext(block('function renderStores(){','function renderWorkers'),ctx);ctx.renderStores();assert.equal(ctx.$('dueCount').textContent,'2');assert.equal(ctx.$('todayCount').textContent,'1');
});
