const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {create}=require('../data-sync.js'),{createUrlCache}=require('../attachment-media.js');
const tick=()=>new Promise(r=>setImmediate(r));
test('a delayed pre-delete response is discarded and a fresh snapshot is returned',async()=>{
 let rows=['a','b'],finishRead,finishWrite,reads=0;
 const sync=create({fetch:()=>new Promise(r=>finishWrite=r)});
 const reading=sync.fresh(()=>{reads++;const snapshot=[...rows];return reads===1?new Promise(r=>finishRead=()=>r(snapshot)):Promise.resolve(snapshot)});
 await tick();const writing=sync.fetch('/rest/v1/schedule_items',{method:'DELETE'});rows=['b'];finishRead();await tick();assert.equal(reads,1);finishWrite({ok:true});await writing;
 assert.deepEqual(await reading,['b']);assert.equal(reads,2);
});
test('schedule queues serialize rapid changes, recover after failure, and allow another program',async()=>{
 const sync=create({fetch:async()=>({})}),events=[];let release;
 const a=sync.enqueue('day',()=>new Promise(r=>{events.push('a');release=r}));
 const b=sync.enqueue('day',async()=>{events.push('b');throw Error('offline')});const rejected=assert.rejects(b,/offline/);
 const c=sync.enqueue('day',async()=>events.push('c'));await sync.enqueue('other',async()=>events.push('other'));
 assert.deepEqual(events,['a','other']);release();await Promise.all([a,rejected,c]);assert.deepEqual(events,['a','other','b','c']);
});
test('a signing timeout frees the queue and an explicit document tap jumps ahead',async()=>{
 const calls=[],releases={};const cache=createUrlCache({getScope:()=> 'user',concurrency:1,timeoutMs:30,sign:path=>{calls.push(path);return new Promise(r=>releases[path]=r)}});
 const blocked=assert.rejects(cache.get('blocked'),/lento/),background=cache.get('background'),tap=cache.get('document',{priority:10});
 await blocked;await tick();assert.deepEqual(calls,['blocked','document']);releases.document('doc');assert.equal(await tap,'doc');await tick();releases.background('bg');await background;
});
test('rapid real delete handlers hide both rows immediately and perform no full reload or reindex',async()=>{
 const src=fs.readFileSync(__dirname+'/../app.js','utf8'),sync=create({fetch:async()=>({})}),calls=[],releases=[],errors=[];
 const c={admin:()=>true,attachmentMediaScope:()=> 'a',currentView:'schedule',scheduleDeletePending:new Set(),scheduleItems:['a','b','c'].map((id,i)=>({id,schedule_id:'day',stato:'da_fare',posizione:i+1})),extras:[],effectiveScheduleState:x=>x.stato,confirm:()=>true,alert:x=>errors.push(x),toast(){},renderSchedules(){},renderDashboard(){},renderStores(){},dataSync:sync,scheduleOperation:(day,op,payload)=>{calls.push(payload.item_id);return new Promise(r=>releases.push(r))}};
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function renderScheduleChange'),src.indexOf('async function moveScheduleItem')),c);
 const [a,b]=c.scheduleItems;const p=c.deleteScheduleItem(a),q=c.deleteScheduleItem(b);assert.deepEqual(Array.from(c.scheduleItems,x=>x.id),['c']);await tick();assert.deepEqual(calls,['a']);releases.shift()();await p;await tick();assert.deepEqual(calls,['a','b']);releases.shift()();await q;assert.deepEqual(errors,[]);assert.equal(c.scheduleItems[0].posizione,3);
});
test('a failed delete restores only its own row while a second delete completes',async()=>{
 const src=fs.readFileSync(__dirname+'/../app.js','utf8'),sync=create({fetch:async()=>({})}),c={admin:()=>true,attachmentMediaScope:()=> 'a',currentView:'schedule',scheduleDeletePending:new Set(),scheduleItems:['a','b'].map(id=>({id,schedule_id:'day',stato:'da_fare'})),extras:[],effectiveScheduleState:x=>x.stato,confirm:()=>true,alert(){},toast(){},renderSchedules(){},renderDashboard(){},renderStores(){},dataSync:sync,scheduleOperation:async(day,op,p)=>{if(p.item_id==='a')throw Error('offline')}};
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function renderScheduleChange'),src.indexOf('async function moveScheduleItem')),c);const [a,b]=c.scheduleItems;await Promise.all([c.deleteScheduleItem(a),c.deleteScheduleItem(b)]);assert.deepEqual(Array.from(c.scheduleItems,x=>x.id),['a']);
});
test('durable extra files and IDs survive restart, stay account-scoped, and clear only on confirmation',async()=>{
 const {indexedDB}=require('fake-indexeddb'),{storage}=require('../photo-sync.js'),{create}=require('../extra-drafts.js');let owner='admin:worker';
 const store=storage(indexedDB,'draft-test-'+Date.now()),opts={store,scope:()=>owner},first=create(opts),file=new File(['real bytes'],'rapportino.pdf',{type:'application/pdf'});
 const id=first.fileId(file,'report');await first.save('extra',{notes:'bozza'},[{file,tipo:'report',id}]);
 const restarted=create(opts),saved=await restarted.load('extra');assert.equal(await saved.files[0].file.text(),'real bytes');assert.equal(restarted.fileId(saved.files[0].file,'report'),id);
 owner='someoneelse';assert.equal(await restarted.load('extra'),null);assert.equal((await restarted.list()).length,0);
 owner='admin:worker';await restarted.remove('extra');assert.equal(await restarted.load('extra'),null);
});
test('full refresh uses one snapshot RPC and renders only the active screen',async()=>{
 const src=fs.readFileSync(__dirname+'/../app.js','utf8'),calls=[],renders=[],d={profiles:{data:[{id:'admin',ruolo:'admin',attivo:true}]},stores:{data:[{id:'store',attivo:true}]}};
 const c={console,performance,session:{user:{id:'admin'}},sessionStorage:{getItem:()=>null,removeItem(){}},IMPERSONATE_PROFILE_KEY:'impersonation',currentView:'schedule',loadAllPromise:null,profile:null,realProfile:null,startupPerf:{},extraEconomicsRecords:[],extraEconomicsError:'',renderedViews:new Map(),viewDataVersion:0,viewRevision:()=> '1',attachmentMediaScope:()=> 'admin',admin:()=>true,extraDrafts:{list:async()=>[]},dataSync:create({fetch:async()=>({})}),sb:{rpc:async(name,args)=>{calls.push({name,args});return {data:Object.assign(Object.fromEntries(args.p_sections.map(k=>[k,{data:[]}])),d)}}},setTimeout(){},$:()=>null,toast(){},cleanupPhotoRecoveryRows:async()=>{}};
 for(const name of ['profiles','stores','interventions','schedules','scheduleMembers','scheduleItems','extras','extraWorkers','interventionWorkers','attachments','extraWorkItems','extraWorkItemPhotos','extraWorkItemNotes','savedRoutes','savedRouteItems','workContacts','contactStores','scheduleActivities','scheduleActivityPhotos','storeReminders'])c[name]=[];
 for(const name of ['renderWorkers','renderSchedulePicker','renderReportFilters','renderScheduleFilters','renderDashboard','renderStores','renderSchedules','renderExtras','renderDailyReport','renderStats','renderWorkContacts','renderPending','ensureCloudSettingsUi','renderCloudEmployeeList','syncImpersonationUi','updateSyncUi','handleNotificationDeepLink','processUploadQueue','renderStartupPerf'])c[name]=()=>renders.push(name);
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('const DATA_SECTIONS='),src.indexOf('let scheduleRolloverPromise')),c);await c.loadAll();
 assert.equal(calls.length,1);assert.equal(calls[0].name,'overgreen_read_data_v271');assert.equal(calls[0].args.p_sections.length,21);assert(renders.includes('renderSchedules'));for(const other of ['renderStores','renderDashboard','renderStats','renderCloudEmployeeList'])assert(!renders.includes(other));
});
test('a complete PDF rejects a missing photo instead of returning an incomplete file',async()=>{
 const source=fs.readFileSync(__dirname+'/../app.js','utf8'),page={drawText(){},drawLine(){},drawRectangle(){},drawImage(){}},pdf={embedFont:async()=>({}),addPage:()=>page};
 const c={ensureLibraries:async()=>{},window:{PDFLib:true},PDFLib:{PDFDocument:{create:async()=>pdf},StandardFonts:{Helvetica:'h',HelveticaBold:'b'},rgb:()=>0},File,dailyReportData:()=>({date:'2026-10-18',ordinary:[{id:'i',store_id:'s'}],extra:[]}),reportCounts:()=>({}),$:()=>({value:'all'}),stores:[],reportWorkerNames:()=>[],attachments:[{id:'p',intervention_id:'i',tipo:'foto_generica'}],fmt:()=>'',pdfSafeText:x=>String(x||''),fmtClosedAt:()=>'',closedByName:()=>'',reportStatusLabel:()=>'',drawWrappedPdfText:(p,f,t,x,y)=>y,signedAttachmentUrl:async()=> 'fake',compressedPhotoForPdf:async()=>{throw Error('offline photo')}};
 vm.createContext(c);vm.runInContext(source.slice(source.indexOf('async function createDailyReportFile('),source.indexOf('const dailyReportPdfCache')),c);await assert.rejects(c.createDailyReportFile('full'),/non inclusa.*offline photo/);
});
test('navigation audit writes do not invalidate cached application data',async()=>{
 const sync=create({fetch:async()=>({ok:true})});const revision=sync.revision();await sync.fetch('/rest/v1/rpc/write_client_audit',{method:'POST'});assert.equal(sync.revision(),revision);
 await sync.fetch('/rest/v1/rpc/overgreen_save_ordinary_v206',{method:'POST'});assert(sync.revision()>revision);
});
