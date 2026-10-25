const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const src=fs.readFileSync(__dirname+'/../app.js','utf8');
function block(a,b){return src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)+a.length))}
function setup(){
 const {document}=parseHTML('<div id="extraWorkProgressList"></div><input id="extraWorkProgressExtraId"><h2 id="extraWorkProgressTitle"></h2><div id="extraWorkProgressInfo"></div><button id="saveExtraWorkProgress"></button>');
 const c={currentView:"dashboard",document,$:id=>document.getElementById(id),profile:{id:'worker'},isAdmin:false,admin:()=>c.isAdmin,extraWorkers:[],scheduleItems:[],scheduleMembers:[],stores:[],workItemsForExtra:()=>[{id:'item',titolo:'Lavorazione',stato:'da_fare'}],workNotesForItem:()=>[],workPhotosForItem:()=>[],esc:s=>s||'',workStateIcon:()=>'',workStateLabel:s=>s,hydrateWorkProgressPhotos:()=>{}};
 vm.createContext(c);vm.runInContext(block('function canWorkOnExtra(','function assignedExtraIds('),c);vm.runInContext(block('function renderWorkProgressDialog(','function openExtraWorkProgress('),c);return c;
}
test('read access never authorizes unassigned work; direct and ordinary-team assignments remain supported',()=>{
 const c=setup(),e={id:'extra',stato:'ricevuto'};assert.equal(c.canWorkOnExtra(e),false);
 c.extraWorkers.push({extra_id:e.id,profile_id:'worker'});assert.equal(c.canWorkOnExtra(e),true);
 assert.equal(c.canWorkOnExtra({...e,stato:'completato'}),false);c.extraWorkers=[];
 c.scheduleItems.push({id:'ordinary',schedule_id:'s'});c.scheduleMembers.push({schedule_id:'s',profile_id:'worker'});
 assert.equal(c.canWorkOnExtra({...e,schedule_item_id:'ordinary'}),true);
 c.isAdmin=true;assert.equal(c.canWorkOnExtra(e),true);
});
test('unassigned work detail has no writable note/photo controls or save button; assigned work restores them',()=>{
 const c=setup(),e={id:'extra',stato:'ricevuto',titolo:'Extra'};
 c.renderWorkProgressDialog(e);assert.equal(c.$('saveExtraWorkProgress').hidden,true);
 assert.equal(c.document.querySelector('[data-progress-state]').disabled,true);
 assert.equal(c.document.querySelector('[data-progress-note]'),null);assert.equal(c.document.querySelector('input[type=file]'),null);
 c.extraWorkers.push({extra_id:e.id,profile_id:'worker'});c.renderWorkProgressDialog(e);
 assert.equal(c.$('saveExtraWorkProgress').hidden,false);assert(c.document.querySelector('[data-progress-note]'));assert(c.document.querySelector('input[type=file]'));
});
test('unassigned closure/delete calls stop before touching forms or database',async()=>{
 const c=setup();c.canWorkOnExtra=()=>false;c.$=()=>{throw Error('unexpected form access')};
 for(const [a,b,name] of [['function openExtraClosureDialog(','let closeExtraPhotoFiles','openExtraClosureDialog']]){
  // Only the guard is needed: execute the actual first statement with a sentinel body.
  const start=src.indexOf(a),guard=src.slice(start,src.indexOf('\n',src.indexOf('\n',start)+1));
  vm.runInContext(guard+'\n throw Error("guard bypassed");}',c);c[name]({id:'extra',stato:'ricevuto'});
 }
 vm.runInContext(block('async function deleteExtra(','async function openAttachment('),c);await c.deleteExtra({id:'extra'});
});

test('assigned employees can write only from dashboard; extra register is read only',()=>{
 const c=setup(),e={id:'extra',stato:'ricevuto',titolo:'Extra'};c.extraWorkers.push({extra_id:e.id,profile_id:'worker'});
 for(const view of ['extras','stores','schedule','settings']){c.currentView=view;assert.equal(c.canWorkOnExtra(e),false);c.renderWorkProgressDialog(e);assert(c.$('saveExtraWorkProgress').hidden);assert.equal(c.document.querySelector('[data-progress-note]'),null)}
 c.currentView='dashboard';assert(c.canWorkOnExtra(e));c.currentView='extras';c.isAdmin=true;assert(c.canWorkOnExtra(e));
});
