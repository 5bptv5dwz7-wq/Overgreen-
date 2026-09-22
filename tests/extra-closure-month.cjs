const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const code=fs.readFileSync(__dirname+'/../app.js','utf8');
function setup(){
 const dom=parseHTML('<div id="extrasList"></div><input id="extraSearchInput"><select id="extraCategoryFilter"><option value="all">All</option><option value="verde">Verde</option></select><button id="clearExtraSearch"></button>');
 Object.defineProperty(dom.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(value){for(const o of this.querySelectorAll('option'))if(o.value===String(value))o.setAttribute('selected','');else o.removeAttribute('selected')}});
 const document=dom.document;
 const extras=[
  {id:'aug',stato:'completato',closed_at:'2026-08-21T12:00:00Z',giorno_intervento:'2026-09-01'},
  {id:'sep',stato:'completato',closed_at:'2026-08-31T22:30:00Z',giorno_intervento:'2026-08-31'},
  {id:'pending',stato:'in_attesa',closed_at:'2026-09-10T12:00:00Z'},
  {id:'unknown',stato:'completato',giorno_intervento:'2026-09-20'},
  {id:'todo',stato:'ricevuto'}, {id:'scheduled',stato:'programmato'}
 ].map(e=>({...e,client_type:'eurospin',categoria_target:'verde'}));
 const c={document,Intl,Date,extras,$:id=>document.getElementById(id),admin:()=>false,extraClientFilter:'all',extraCompletedMonthFilter:'',extraHideIncludedCompleted:false,extraGroupOpenState:{todo:true,scheduled:true,completed:true},pendingExtraFocusId:null,
  clientType:e=>e.client_type,extraCategory:e=>e.categoria_target,extraSearchText:e=>e.id,extraRequestDate:()=>'',extraIsScheduled:e=>e.stato==='programmato',esc:s=>s,
  extraCard(e){const p=document.createElement('article');p.dataset.id=e.id;p.textContent=e.id;return p},setView(){c.renderExtras()},setTimeout(){}};
 vm.createContext(c);vm.runInContext(code.slice(code.indexOf('function closureProfile('),code.indexOf('function deadlineLabel(')),c);vm.runInContext(code.slice(code.indexOf('function extraClosureMonth('),code.indexOf('function openExtraEdit(')),c);
 vm.runInContext(code.slice(code.indexOf('function openExtraById('),code.indexOf('function extraSearchText(')),c);
 c.renderExtras();return c;
}
const ids=(c,group)=>[...c.document.querySelectorAll('.extra-group-'+group+' article')].map(e=>e.dataset.id).sort();
function choose(c,value){const s=c.$('extraCompletedMonth');s.value=value;s.onchange()}
test('closure month uses Italy midnight across month/year boundaries and ignores scheduled dates',()=>{
 const c=setup();assert.equal(c.extraClosureMonth(c.extras[0]),'2026-08');assert.equal(c.extraClosureMonth(c.extras[1]),'2026-09');
 assert.equal(c.extraClosureMonth({closed_at:'2026-12-31T23:15:00Z'}),'2027-01');
 assert.equal(c.extraClosureMonth({closed_at:'bad'}),'');assert.equal(c.extraClosureMonth(c.extras[3]),'');
});
test('month selection filters only the completed group and supports reset and undated rows',()=>{
 const c=setup();assert.deepEqual([...c.$('extraCompletedMonth').options].map(o=>o.value),['','2026-09','2026-08','undated']);
 choose(c,'2026-09');assert.deepEqual(ids(c,'completed'),['pending','sep']);assert.deepEqual(ids(c,'todo'),['todo']);assert.deepEqual(ids(c,'scheduled'),['scheduled']);
 assert.equal(c.document.querySelector('.extra-group-completed summary strong').textContent,'2 / 4');
 choose(c,'undated');assert.deepEqual(ids(c,'completed'),['unknown']);choose(c,'');assert.equal(ids(c,'completed').length,4);
});
test('search and client filters combine with the month, preserve an empty selection and deep links clear it',()=>{
 const c=setup();choose(c,'2026-08');c.$('extraSearchInput').value='sep';c.renderExtras();assert.equal(ids(c,'completed').length,0);assert.equal(c.$('extraCompletedMonth').value,'2026-08');
 assert.match(c.document.querySelector('.extra-group-completed').textContent,/Nessun extra completato/);
 c.$('extraSearchInput').value='';c.extraClientFilter='intesa';c.renderExtras();assert.equal(ids(c,'completed').length,0);
 c.openExtraById('sep');assert.equal(c.extraCompletedMonthFilter,'');assert(ids(c,'completed').includes('sep'));
});

test('V211 hides only included extras, retaining paid work alongside ordinary visits without economics',()=>{
 const c=setup();c.extras.push(
  {id:'paid-with-ordinary',client_type:'eurospin',closure_profile:'eurospin',con_ordinario:true,stato:'completato',closed_at:'2026-09-20T12:00:00Z'},
  {id:'included',client_type:'eurospin',closure_profile:'eurospin_ordinario',con_ordinario:true,stato:'completato',closed_at:'2026-09-20T12:00:00Z'},
  {id:'included-todo',client_type:'eurospin',closure_profile:'eurospin_ordinario',stato:'ricevuto'}
 );c.renderExtras();assert.equal(c.$('extraHideIncludedCompleted').checked,false);
 const box=c.$('extraHideIncludedCompleted');box.checked=true;box.onchange();
 assert(!ids(c,'completed').includes('included'));assert(ids(c,'completed').includes('paid-with-ordinary'));assert(ids(c,'todo').includes('included-todo'));
 choose(c,'2026-09');assert.deepEqual(ids(c,'completed'),['paid-with-ordinary','pending','sep']);
 assert.equal(c.$('extraHideIncludedCompleted').checked,true);
 c.openExtraById('included');assert.equal(c.extraHideIncludedCompleted,false);assert(ids(c,'completed').includes('included'));
});
test('V211 economics eligibility depends on closure profile, never on being scheduled with ordinary work',()=>{
 const m=require('../extra-economics.js');
 const rows=[
 {id:'separate',client_type:'eurospin',closure_profile:'eurospin',con_ordinario:false},
 {id:'together',client_type:'eurospin',closure_profile:'eurospin',con_ordinario:true},
 {id:'included',client_type:'eurospin',closure_profile:'eurospin_ordinario',con_ordinario:true}
 ];
 assert.deepEqual(rows.map(m.isBillableExtra),[true,true,false]);
 assert.deepEqual(m.filterRows(rows,[],[]).map(x=>x.extra.id),['separate','together']);
 assert.equal(m.isBillableExtra({...rows[1],closure_profile:null}),true);
});
