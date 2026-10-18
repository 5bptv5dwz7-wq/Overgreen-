const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/../app.js','utf8');
function auth(){
 let callback,locked=false,loads=0,views=0;const tasks=[];
 const c={session:null,profile:null,attachmentUrls:{clear(){}},resetAppData(){},console,localStorage:{getItem:()=> 'extras'},CURRENT_VIEW_KEY:'view',currentView:'dashboard',
  $:()=>({classList:{add(){},remove(){}}}),setTimeout:fn=>tasks.push(fn),
  loadAll:async()=>{assert.equal(locked,false,'database calls must run after auth releases its lock');loads++},setView:()=>views++,
  sb:{auth:{onAuthStateChange:fn=>{callback=fn}}}};
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('sb.auth.onAuthStateChange('),src.indexOf("$('scheduleDate').value=tomorrow()",src.indexOf('sb.auth.onAuthStateChange('))),c);
 return {c,tasks,get loads(){return loads},get views(){return views},emit(event,s){locked=true;try{assert.equal(callback(event,s),undefined,'callback must return synchronously')}finally{locked=false}}};
}
test('initial authentication loads data outside the auth lock',async()=>{const h=auth();h.emit('INITIAL_SESSION',{user:{id:'a'}});assert.equal(h.loads,0);await h.tasks.shift()();assert.equal(h.loads,1);assert.equal(h.views,1)});
test('returning from camera and refreshing tokens preserve the active form',()=>{const h=auth();h.c.session={user:{id:'a'}};h.c.profile={id:'a'};h.emit('TOKEN_REFRESHED',{user:{id:'a'},access_token:'fresh'});h.emit('SIGNED_IN',{user:{id:'a'}});assert.equal(h.tasks.length,0);assert.equal(h.loads,0)});
test('pending initial load is discarded after sign out',async()=>{const h=auth();h.emit('SIGNED_IN',{user:{id:'a'}});h.emit('SIGNED_OUT',null);await h.tasks.shift()();assert.equal(h.loads,0)});
function upload(){
 const timers=new Map(),rows=new Map(),paths=[];let serial=0,hang='',lateResolve;
 const c={extraDrafts:{fileId:()=>require('node:crypto').randomUUID()},console,crypto:require('node:crypto'),window:{},attachments:[],profile:{id:'worker'},compressImage:async f=>f,
  setTimeout:fn=>{timers.set(++serial,fn);return serial},clearTimeout:id=>timers.delete(id),
  addAttachment:async row=>{rows.set(row.id,row);return row},
  sb:{from:()=>{let id;const q={select(){return q},eq(k,v){id=v;return q},maybeSingle:()=>hang==='lookup'?new Promise(r=>{lateResolve=r}):Promise.resolve({data:rows.get(id)})};return q},
   storage:{from:()=>({upload:(path)=>{paths.push(path);return hang==='upload'?new Promise(r=>{lateResolve=r}):Promise.resolve({})}})}}};
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('const extraUploadKeys='),src.indexOf('function setExtraSaveBusy')),c);
 return {c,timers,rows,paths,set hang(v){hang=v},resolve(v){lateResolve(v)}};
}
const file={name:'report.pdf',type:'application/pdf',size:42};
async function tick(){for(let n=0;n<10;n++)await Promise.resolve()}
test('a stalled lookup times out and cannot later continue uploading',async()=>{const h=upload();h.hang='lookup';const pending=h.c.saveExtraUpload('extra','rapportino_eurospin',file,[]);const rejected=assert.rejects(pending,/Verifica documento.*attesa troppo lunga/);await tick();[...h.timers.values()][0]();await rejected;h.resolve({data:null});await tick();assert.equal(h.paths.length,0);assert.equal(h.timers.size,0)});
test('upload timeout can retry with the same path and reuses registered attachment',async()=>{const h=upload();h.hang='upload';const pending=h.c.saveExtraUpload('extra','rapportino_eurospin',file,[]);const rejected=assert.rejects(pending,/Caricamento documento/);await tick();[...h.timers.values()][0]();await rejected;h.resolve({});await tick();assert.equal(h.rows.size,0);h.hang='';const added=await h.c.saveExtraUpload('extra','rapportino_eurospin',file,[]);assert.equal(h.paths[0],h.paths[1]);assert.equal(h.rows.size,1);const reused=await h.c.saveExtraUpload('extra','rapportino_eurospin',file,[]);assert.equal(reused.id,added.id);assert.equal(h.paths.length,2);assert.equal(h.c.attachments.length,1);assert.equal(h.timers.size,0)});
