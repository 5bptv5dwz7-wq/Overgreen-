const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {create}=require('../data-sync.js'),{createUrlCache}=require('../attachment-media.js'),{parseHTML}=require('linkedom');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('JSON deadline includes the response body; an interrupted write releases the data barrier',async()=>{
 let signal;
 const sync=create({timeoutMs:25,fetch:async(_,{signal:s})=>{signal=s;return new Response(new ReadableStream({start(controller){s.addEventListener('abort',()=>controller.error(s.reason));}}),{headers:{'content-type':'application/json'}})}});
 const writing=sync.fetch('/rest/v1/extras',{method:'PATCH'});await assert.rejects(writing,/lenta/);assert.equal(signal.aborted,true);await sync.idle();
});
test('completed JSON keeps SDK status and headers and can be parsed once',async()=>{
 const sync=create({fetch:async()=>new Response('{"ok":true}',{status:201,headers:{'content-type':'application/json','content-range':'0-0/1'}})});
 const r=await sync.fetch('/rest/v1/extras',{method:'PATCH'});assert.equal(r.status,201);assert.equal(r.headers.get('content-range'),'0-0/1');assert.deepEqual(await r.json(),{ok:true});
});
test('logout cancels an active request and prevents queued mutations in a new account',async()=>{
 let actor='a',finish,started=0;const sync=create({getScope:()=>actor,fetch:(_,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason)))});
 const request=sync.fetch('/rest/v1/extras');const rejected=assert.rejects(request,/Sessione/);
 const first=sync.enqueue('schedule',()=>new Promise(r=>finish=r));const next=sync.enqueue('schedule',()=>started++);const cancelled=assert.rejects(next,/Sessione/);
 await tick();actor='b';sync.reset();finish();await Promise.all([first,rejected,cancelled]);assert.equal(started,0);
});
test('a read from a previous login cannot enter a new login with the same user ID',async()=>{
 let finish;const sync=create({getScope:()=> 'same-user',fetch:async()=>({})});
 const read=sync.fresh(()=>new Promise(r=>finish=r));const rejected=assert.rejects(read,/Sessione/);await tick();sync.reset();finish({old:true});await rejected;
});
test('switching media account releases a hung signing slot immediately',async()=>{
 let actor='a',aborted=false;
 const cache=createUrlCache({concurrency:1,timeoutMs:2000,getScope:()=>actor,sign:(path,{signal})=>{if(path==='new')return 'new-url';signal.addEventListener('abort',()=>aborted=true);return new Promise(()=>{})}});
 const old=assert.rejects(cache.get('old'),/Sessione/);await tick();actor='b';assert.equal(await cache.get('new'),'new-url');await old;assert(aborted);
});
test('background refresh preserves worker selections and does not recreate unchanged checkbox nodes',()=>{
 const {document}=parseHTML('<div id="doneWorkers"></div><div id="scheduleWorkers"></div><div id="extraWorkers"></div>');
 const c={document,$:id=>document.getElementById(id),profiles:[{id:'a',nome:'A',attivo:true},{id:'b',nome:'B',attivo:true}],esc:String};
 vm.createContext(c);const src=fs.readFileSync('app.js','utf8'),start=src.indexOf('function renderWorkers()'),end=src.indexOf('\n}',start)+2;vm.runInContext(src.slice(start,end),c);
 c.renderWorkers();const checkbox=document.querySelector('#scheduleWorkers input');checkbox.checked=true;c.renderWorkers();assert.equal(document.querySelector('#scheduleWorkers input'),checkbox);assert(checkbox.checked);
 c.profiles.push({id:'c',nome:'C',attivo:true});c.renderWorkers();assert(document.querySelector('#scheduleWorkers input').checked);assert.equal(document.querySelectorAll('#scheduleWorkers input').length,3);
});
test('eight visible photos use one signing request; a missing photo does not block the others',async()=>{
 const {createBatchSigner}=require('../attachment-media.js');let calls=0;
 const sign=createBatchSigner({getScope:()=> 'a',sign:async(paths)=>{calls++;return new Map(paths.map(p=>[p,p==='missing'?new Error('missing'):p+'-url']))}});
 const cache=createUrlCache({getScope:()=> 'a',concurrency:8,sign});const paths=['1','2','3','4','5','6','7','missing'];
 const result=await Promise.allSettled(paths.map(p=>cache.get(p)));assert.equal(calls,1);assert.equal(result.filter(x=>x.status==='fulfilled').length,7);assert.equal(result[7].reason.message,'missing');
});
test('batch cancellation cancels one photo without interrupting the other photo',async()=>{
 const {createBatchSigner}=require('../attachment-media.js');let release,batchSignal;
 const sign=createBatchSigner({getScope:()=> 'a',sign:(paths,{signal})=>{batchSignal=signal;return new Promise(r=>release=()=>r(new Map(paths.map(p=>[p,p]))))}});
 const controller=new AbortController();const a=sign('a',{signal:controller.signal}),b=sign('b');const cancelled=assert.rejects(a,/interrotta/);
 await new Promise(r=>setTimeout(r,5));controller.abort();assert.equal(batchSignal.aborted,false);release();await cancelled;assert.equal(await b,'b');
});
test('secondary screens share reads and cache them briefly, but invalidate on mutation, refresh and account change',async()=>{
 const {createReadCache}=require('../data-sync.js');let scope='a',revision=0,time=0,calls=0,release;
 const cache=createReadCache({getScope:()=>scope,getRevision:()=>revision,now:()=>time,ttl:100});
 const read=()=>{calls++;return new Promise(r=>release=r)};
 const first=cache.get('archive',read),other=cache.get('archive',read);await tick();assert.equal(calls,1);release('rows');assert.equal(await first,'rows');assert.equal(await other,'rows');
 assert.equal(await cache.get('archive',read),'rows');assert.equal(calls,1);
 const fast=async()=>++calls;
 revision++;await cache.get('archive',fast);assert.equal(calls,2);await cache.get('archive',fast,{force:true});assert.equal(calls,3);
 time=101;await cache.get('archive',fast);assert.equal(calls,4);scope='b';await cache.get('archive',fast);assert.equal(calls,5);
 const stale=cache.get('archive',read,{force:true}),rejected=assert.rejects(stale,/Sessione/);await tick();cache.clear();release('old');await rejected;
});
test('a late report cannot replace the newest preview or appear after an account change',async()=>{
 const src=fs.readFileSync('app.js','utf8'),nodes=new Map(),releases={};let actor='a',shown=0;
 const c={clientReportPreviewRequest:0,clientReportPreviewUrl:'',window:{},attachmentMediaScope:()=>actor,toast(){},alert(){},URL:{createObjectURL:file=>file,revokeObjectURL(){}},$:id=>{if(!nodes.has(id))nodes.set(id,{showModal(){shown++}});return nodes.get(id)},createSingleClientReportFile:(kind,row)=>new Promise(resolve=>releases[row.id]=()=>resolve({file:row.id,title:row.id,sizeKb:1}))};vm.createContext(c);vm.runInContext(src.slice(src.indexOf('async function previewSingleClientReport('),src.indexOf('async function createStoreInterventionsReportFile(')),c);
 const a=c.previewSingleClientReport('extra',{id:'a'}),b=c.previewSingleClientReport('extra',{id:'b'});releases.b();await b;releases.a();await a;assert.equal(shown,1);assert.equal(c.window.currentClientReportFile.title,'b');
 const old=c.previewSingleClientReport('extra',{id:'c'});actor='new';releases.c();await old;assert.equal(shown,1);
});
