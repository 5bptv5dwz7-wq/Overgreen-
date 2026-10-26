const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const app=fs.readFileSync(__dirname+'/../app.js','utf8');
test('ordinary form selects assigned active team and clears previous selections',()=>{
  const {document}=parseHTML('<fieldset id="doneWorkersFieldset"><div id="doneWorkers"><input value="a"><input value="b"><input value="other"></div></fieldset>');
  let isAdmin=true;
  const c={document,$:id=>document.getElementById(id),admin:()=>isAdmin,profile:{id:'a'},profiles:[{id:'a',nome:'A',attivo:true},{id:'b',nome:'B',attivo:true},{id:'other',nome:'Other',attivo:true},{id:'inactive',attivo:false}],scheduleItems:[{id:'one',schedule_id:'s1'},{id:'two',schedule_id:'s2'}],scheduleMemberIds:id=>id==='s1'?['a','b','inactive']:['other'],renderWorkers(){}};
  vm.createContext(c);vm.runInContext(app.slice(app.indexOf('function ordinaryAssignedWorkerIds'),app.indexOf('async function openDone')),c);
  const start=app.indexOf('  renderWorkers();',app.indexOf('async function openDone'));
  const form=app.slice(start,app.indexOf("  openDialog('doneDialog')",start));
  function open(id){c.scheduleItemId=id;vm.runInContext('{'+form+'}',c);return [...document.querySelectorAll('input')].filter(x=>x.checked).map(x=>x.value)}
  assert.deepEqual(open('one'),['a','b']);
  assert.deepEqual(open('two'),['other']);
  assert.deepEqual(open(''),[]);
  isAdmin=false;assert.deepEqual(open('one'),['a','b']);assert.match(c.$('doneAssignedTeam').textContent,/A, B/);
  assert(c.$('doneWorkersFieldset').classList.contains('hidden'));
  assert.deepEqual(open(''),['a']);
  assert.match(app,/ordinaryDefaultWorkerIds\(\$\('doneScheduleItemId'\)\.value\)/);
});
