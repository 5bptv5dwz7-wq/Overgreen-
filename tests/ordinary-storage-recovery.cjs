const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),Sync=require('../photo-sync.js');
const app=fs.readFileSync(__dirname+'/../app.js','utf8'),ui=fs.readFileSync(__dirname+'/../photo-sync-ui.js','utf8');
function source(text,start,end){return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)))}
function setup(){
  const {document}=parseHTML('<dialog id="doneDialog"><form id="doneForm"><button type="submit">Salva</button></form><button id="doneContinueBtn">Continua</button></dialog>');
  const notices=[],toasts=[];let closed=0,reloads=0,delivered=0;
  const attempt={args:{p_request_id:'same-request'},files:[{name:'camera.jpg'}],photoIds:['same-photo']};
  const c={document,console,OvergreenPhotoSync:Sync,ordinarySaveBusy:false,ordinarySaveAttempt:attempt,donePhotoFiles:[...attempt.files],$:id=>document.getElementById(id),
    alert:m=>notices.push(m),toast:m=>toasts.push(m),confirm:()=>true,location:{reload(){reloads++}},renderDonePhotoSelection(){},
    photoQueue:()=>({prepare:async()=>{},getSubmission:async()=>null}),waitForPhotoQueue:async()=>{delivered++},interventions:[],updateSyncUi:async()=>{}};
  c.$('doneDialog').open=true;c.$('doneDialog').close=()=>{closed++;c.$('doneDialog').open=false};
  vm.createContext(c);vm.runInContext(source(app,'async function saveOrdinaryIntervention',"$('doneForm').onsubmit"),c);
  vm.runInContext(source(ui,'function recoverPhotoStorage','async function legacyPhotoRows'),c);
  return {c,notices,toasts,attempt,button:document.querySelector('[type=submit]'),get closed(){return closed},get reloads(){return reloads},get delivered(){return delivered}};
}
test('local storage failure cannot close the form, erase camera files or send the report',async()=>{
  const h=setup();h.c.photoQueue=()=>({prepare:async()=>{throw Object.assign(Error('Archivio non disponibile'),{code:'IDB_CONNECTION_LOST'})},getSubmission:async()=>{throw Error('still unavailable')}});
  await h.c.saveOrdinaryIntervention(false,h.button);
  assert.equal(h.delivered,0);assert.equal(h.closed,0);assert.equal(h.c.donePhotoFiles.length,1);assert.equal(h.c.ordinarySaveAttempt,h.attempt);assert.equal(h.c.ordinarySaveBusy,false);assert.equal(h.button.disabled,false);assert.equal(h.toasts.length,0);
});
test('missing local receipt never claims a report is safely queued',async()=>{
  const h=setup();await h.c.saveOrdinaryIntervention(false,h.button);
  assert.equal(h.closed,0);assert.equal(h.c.donePhotoFiles.length,1);assert.equal(h.toasts.length,0);assert.match(h.notices[0],/Non riesco a verificare/);
});
test('confirmed local pending report closes the form but never claims server delivery',async()=>{
  const h=setup();h.c.photoQueue=()=>({prepare:async()=>{},getSubmission:async()=>({id:'same-request',result:null})});
  await h.c.saveOrdinaryIntervention(false,h.button);
  assert.equal(h.closed,1);assert.equal(h.toasts.length,1);assert.match(h.toasts[0],/invio da completare/);assert.equal(h.c.interventions.length,0);
});
test('reload recovery refuses to discard an open form or selected photos',()=>{
  const h=setup();h.c.recoverPhotoStorage(Error('storage lost'));assert.equal(h.reloads,0);assert.equal(h.c.donePhotoFiles.length,1);
  h.c.$('doneDialog').open=false;h.c.recoverPhotoStorage(Error('storage lost'));assert.equal(h.reloads,0);
});
test('safe preflight recovery offers a reload without deleting storage',()=>{
  const h=setup();h.c.$('doneDialog').open=false;h.c.donePhotoFiles=[];h.c.ordinarySaveAttempt=null;
  h.c.recoverPhotoStorage(Error('storage lost'));assert.equal(h.reloads,1);
});
test('opening a report with a broken queue cannot reset the form or change schedule state',async()=>{
  const h=setup();let recoveries=0;h.c.recoverPhotoStorage=()=>recoveries++;h.c.photoQueue=()=>({snapshot:async()=>{throw Error('storage lost')}});
  vm.runInContext(source(app,'async function openDone','async function compressImage'),h.c);
  await h.c.openDone({id:'rivoli'},'scheduled-rivoli');
  assert.equal(recoveries,1);assert.equal(h.c.ordinarySaveAttempt,h.attempt);assert.equal(h.c.interventions.length,0);
});
