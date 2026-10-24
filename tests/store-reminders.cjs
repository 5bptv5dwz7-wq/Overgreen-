const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
function setup(isAdmin=true){
 const {document}=parseHTML(fs.readFileSync(__dirname+'/../index.html','utf8'));
 const c={document,admin:()=>isAdmin,today:()=> '2026-10-16',fmt:s=>s,esc:s=>String(s||'').replaceAll('<','&lt;'),$:id=>document.getElementById(id),stores:[{id:'asap',nome:'Subito'},{id:'today',nome:'Oggi'},{id:'future',nome:'Futuro'},{id:'late',nome:'Scaduto'},{id:'none',nome:'Senza sollecito'}],interventions:[],scheduleItems:[],schedules:[],effectiveScheduleState:i=>i.stato,showStoreDetail(){},schedulePickerSelected:new Set(),schedulePickerMode:'all',schedulePickerLetter:'A',setView(){},renderSchedulePicker(){},updateScheduleSelectedCount(){},toast(){},openDialog:id=>{c.opened=id},withFormBusy:async(_id,fn)=>fn(),sb:{rpc:async()=>{throw Error('unexpected write')}},confirm:()=>true};
 c.workspaceMatches=r=>(r?.client_type||'eurospin')==='eurospin';vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../store-reminders.js','utf8'),c);
 vm.runInContext(`storeReminders=[{store_id:'asap',active:true,due_date:null},{store_id:'today',active:true,due_date:'2026-10-16'},{store_id:'future',active:true,due_date:'2026-10-20'},{store_id:'late',active:true,due_date:'2026-10-15'}].map(r=>({...r,requested_at:'2026-10-16T08:00:00Z',note:'<test>'}));`,c);
 c.$('scheduleForm').scrollIntoView=()=>{};return c;
}
test('ASAP, dated, late reminders have visible labels, escaped notes and precede ordinary stores',()=>{
 const c=setup(),rows=c.stores.slice().sort(c.compareStoreReminders);assert.deepEqual(rows.map(s=>s.id),['late','asap','today','future','none']);
 assert.match(c.storeReminderMarkup(rows[1]),/Il prima possibile/);assert.match(c.storeReminderMarkup(rows[0]),/Data superata/);assert.match(c.storeReminderMarkup(rows[2]),/OGGI/);assert.match(c.storeReminderMarkup(rows[3]),/2026-10-20/);assert(!c.storeReminderMarkup(rows[1]).includes('<test>'));
 assert.match(c.storeReminderMarkup(rows[3],'2026-10-19'),/data diversa/);assert(!c.storeReminderMarkup(rows[3],'2026-10-20').includes('data diversa'));
});
test('employees see both panels but no edit/plan commands and cannot save or open the editing dialog',async()=>{
 const c=setup(false);c.renderStoreReminderPanels();assert.equal(c.$('dashboardReminders').querySelectorAll('article').length,4);assert.equal(c.$('scheduleReminders').querySelectorAll('article').length,4);assert.equal(c.document.querySelector('[data-reminder-edit]'),null);assert.equal(c.document.querySelector('[data-reminder-plan]'),null);
 c.openStoreReminder(c.stores[0]);assert.equal(c.opened,undefined);await c.saveStoreReminder();
});
test('planning uses promised day or today for ASAP/overdue, preselects store and does not save anything',()=>{
 const c=setup();c.prepareStoreReminderPlan(c.stores[2]);assert.equal(c.$('scheduleDate').value,'2026-10-20');assert(c.schedulePickerSelected.has('future'));
 c.prepareStoreReminderPlan(c.stores[0]);assert.equal(c.$('scheduleDate').value,'2026-10-16');c.prepareStoreReminderPlan(c.stores[3]);assert.equal(c.$('scheduleDate').value,'2026-10-16');
});
test('plan status distinguishes absent, mismatched and matching ordinary dates',()=>{
 const c=setup(),st=c.stores[2];assert.equal(c.storeReminderPlanStatus(st),'Da programmare');c.schedules=[{id:'s',giorno:'2026-10-19'}];c.scheduleItems=[{id:'i',store_id:'future',schedule_id:'s',tipo:'ordinario',stato:'da_fare'}];assert.match(c.storeReminderPlanStatus(st),/non coperta/);c.schedules[0].giorno='2026-10-20';assert.match(c.storeReminderPlanStatus(st),/✓ Programmato/);
});
test('admin dialog supports no date and editing an existing date; inactive reminders disappear',()=>{
 const c=setup();c.openStoreReminder(c.stores[0]);assert.equal(c.$('storeReminderDate').value,'');assert.equal(c.opened,'storeReminderDialog');c.openStoreReminder(c.stores[2]);assert.equal(c.$('storeReminderDate').value,'2026-10-20');vm.runInContext('storeReminders.forEach(r=>r.active=false)',c);c.renderStoreReminderPanels();assert(c.$('dashboardReminders').hidden);assert.equal(c.storeReminderMarkup(c.stores[0]),'');
});
