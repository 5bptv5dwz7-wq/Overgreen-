const {test}=require('node:test'),assert=require('node:assert/strict');
const model=require('../remote-reload.js');
const command=()=>({id:'command',device_id:'device',status:'pending',mode:'safe',required_version:'V230',expires_at:new Date(Date.now()+86400000).toISOString()});
function setup(shared){
 const values=shared||new Map(),state={user:'worker',busy:false,command:command(),reloads:0,acks:[],errors:[],registered:[],updates:0};
 let serial=0;const o={window:{setTimeout,clearTimeout,setInterval(){return 1},addEventListener(){}},document:{visibilityState:'visible',addEventListener(){}},storage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},uuid:()=>Math.random().toString()+serial++,user:()=>state.user,version:'V230',label:()=> 'iPhone',busy:async()=>state.busy,register:async row=>state.registered.push(row),heartbeat:async()=>{},latest:async()=>state.command,ack:async(id,row)=>{state.acks.push(row);Object.assign(state.command,row)},notice(){},updateWorker:async()=>{state.updates++},reload:()=>state.reloads++,error:e=>state.errors.push(e)};
 return {o,state,values,client:model.create(o)};
}
test('safe reload waits for work, then confirms only after a new page boot',async()=>{
 const h=setup();h.state.busy=true;await h.client.tick();assert.equal(h.state.reloads,0);assert.equal(h.state.command.status,'waiting');
 h.state.busy=false;await h.client.tick();assert.equal(h.state.reloads,1);assert.equal(h.state.command.status,'reloading');assert(!h.state.acks.some(x=>x.status==='completed'));
 const next=setup(h.values);next.state.command=h.state.command;await next.client.tick();assert.equal(next.state.command.status,'completed');assert.equal(next.state.command.loaded_version,'V230');assert.equal(next.state.reloads,0);
});
test('force bypasses busy, expired and already processed commands never reload',async()=>{
 const h=setup();h.state.busy=true;h.state.command.mode='force';await h.client.tick();assert.equal(h.state.reloads,1);
 for(const values of [{expires_at:'2020-01-01'}, {status:'completed'}, {expires_at:'invalid'}]){const h=setup();Object.assign(h.state.command,values);await h.client.tick();assert.equal(h.state.reloads,0)}
});
test('ack failure never reloads and never falsely reports completion on same page',async()=>{
 const h=setup();h.o.ack=async()=>{throw new Error('offline')};await h.client.tick();await h.client.tick();assert.equal(h.state.reloads,0);assert.equal(h.state.errors.length,2);assert.equal(h.state.acks.length,0);
});
test('safe reload rechecks newly opened forms after receipt',async()=>{
 const h=setup();h.o.ack=async(id,row)=>{h.state.acks.push(row);Object.assign(h.state.command,row);if(row.status==='reloading')h.state.busy=true};await h.client.tick();assert.equal(h.state.reloads,0);assert.equal(h.state.command.status,'waiting');
});
test('offline/hidden/signed-out pages do not execute; sign-in identity is not impersonated',async()=>{
 const h=setup();h.state.user=null;await h.client.tick();assert.equal(h.state.registered.length,0);h.state.user='actual-user';h.o.document.visibilityState='hidden';await h.client.tick();assert.equal(h.state.registered.length,0);h.o.document.visibilityState='visible';await h.client.tick();assert.equal(h.state.registered[0].user_id,'actual-user');
});
test('older cached version reports failure after reload instead of claiming success',async()=>{
 const h=setup();await h.client.tick();const next=setup(h.values);next.state.command=h.state.command;next.o.version='V229';await next.client.tick();assert.equal(next.state.command.status,'failed');assert.equal(next.state.reloads,0);
});
const fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
function panel(){
 const {document}=parseHTML('<div id="settingsView"></div><form id="edit"><input id="field"></form>');
 const commands=[],device={id:'device',user_id:'worker',label:'iPhone · App',version:'V230',busy:false,last_seen:new Date().toISOString()};
 const c={window:{OvergreenRemoteReload:model},document,console,Date,setTimeout,clearTimeout,AbortController,APP_VERSION:'V230',currentView:'settings',ordinarySaveBusy:false,extraSaveBusy:false,donePhotoFiles:[],closeExtraPhotoFiles:[],historyEditPhotoFiles:[],activityCompletePhotoFiles:[],admin:()=>c.isAdmin,isAdmin:true,profiles:[{id:'worker',nome:'Roberto'}],$:id=>document.getElementById(id),esc:s=>String(s??'').replaceAll('<','&lt;'),confirm:()=>c.confirmed,confirmed:false,toast(){},alert:m=>{throw new Error(m)},session:{access_token:'test'},cfg:{supabaseUrl:'https://example.test',supabaseKey:'test'}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../remote-reload-ui.js','utf8'),c);
 c.remoteReloadHttp=async(path,method,body)=>{if(method==='POST'){commands.push(body);return [body]}return path.startsWith('app_devices')?[device]:[]};
 return {c,commands,device};
}
test('admin panel sends safe requests and requires explicit force confirmation',async()=>{
 const h=panel();await h.c.renderRemoteReloadPanel();assert.match(h.c.$('remoteReloadPanel').textContent,/Roberto/);
 await h.c.document.querySelector('[data-safe]').onclick();assert.equal(h.commands[0].mode,'safe');
 await h.c.document.querySelector('[data-force]').onclick();assert.equal(h.commands.length,1);
 h.c.confirmed=true;await h.c.document.querySelector('[data-force]').onclick();assert.equal(h.commands[1].mode,'force');
 h.c.isAdmin=false;await h.c.renderRemoteReloadPanel();assert.equal(h.c.$('remoteReloadPanel'),null);
});
test('normal reload defers for dialogs, selected photos and unfinished photo queue',async()=>{
 const h=panel();assert.equal(await h.c.remoteReloadBusy(),false);h.c.donePhotoFiles.push({});assert.equal(await h.c.remoteReloadBusy(),true);h.c.donePhotoFiles=[];
 const dialog=h.c.document.createElement('dialog');dialog.setAttribute('open','');h.c.document.body.append(dialog);assert.equal(await h.c.remoteReloadBusy(),true);dialog.remove();
 h.c.photoDelivery={snapshot:async()=>({running:false,jobs:[{}],submissions:[]})};assert.equal(await h.c.remoteReloadBusy(),true);
});
test('a local busy check error blocks safe reload but still permits forced recovery',async()=>{
 for(const mode of ['safe','force']){const h=setup();h.state.command.mode=mode;h.o.busy=async()=>{throw Error('local store unavailable')};await h.client.tick();assert.equal(h.state.reloads,mode==='force'?1:0)}
});
