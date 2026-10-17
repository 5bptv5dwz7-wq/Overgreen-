const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const {createUrlCache,createVisibilityLoader}=require('../attachment-media.js');
const tick=()=>new Promise(r=>setImmediate(r));
test('shared URL cache deduplicates requests, limits concurrency, expires and isolates actors',async()=>{
 let actor='a',time=0,calls=0,running=0,peak=0;const releases=[];
 const cache=createUrlCache({getScope:()=>actor,now:()=>time,ttl:100,concurrency:2,sign:path=>{calls++;running++;peak=Math.max(peak,running);return new Promise(r=>releases.push(()=>{running--;r(path+'-'+calls)}))}});
 const first=cache.get('one'),duplicate=cache.get('one');assert.equal(first,duplicate);
 const second=cache.get('two'),third=cache.get('three');await tick();assert.equal(calls,2);
 releases.shift()();await first;await tick();assert.equal(calls,3);assert.equal(peak,2);
 releases.shift()();releases.shift()();await Promise.all([second,third]);
 await cache.get('one');assert.equal(calls,3);
 time=101;const expired=cache.get('one');await tick();assert.equal(calls,4);releases.shift()();await expired;
 const refresh=cache.get('one',{refresh:true});await tick();assert.equal(calls,5);releases.shift()();await refresh;
 const stale=cache.get('old');const staleCheck=assert.rejects(stale,/Sessione/);await tick();actor='b';const next=cache.get('one');await tick();releases.shift()();releases.shift()();await staleCheck;await next;
 assert.equal(calls,7);
});
test('failed signatures can be retried and clearing cancels queued requests',async()=>{
 let count=0;const cache=createUrlCache({getScope:()=> 'a',sign:async()=>{if(++count===1)throw Error('network');return 'url'}});
 await assert.rejects(cache.get('one'),/network/);assert.equal(await cache.get('one'),'url');assert.equal(count,2);
 let finish;const limited=createUrlCache({getScope:()=> 'a',concurrency:1,sign:()=>new Promise(r=>finish=r)});
 const active=limited.get('first'),queued=limited.get('second');const checks=Promise.all([assert.rejects(active,/Sessione/),assert.rejects(queued,/Sessione/)]);await tick();limited.clear();finish('url');await checks;
});
function visibilityHarness(){
 let callback,changed;const observed=new Set();
 class IO{constructor(cb){callback=cb}observe(n){observed.add(n)}unobserve(n){observed.delete(n)}}
 class MO{constructor(cb){changed=cb}observe(){}}
 return {loader:createVisibilityLoader({IntersectionObserver:IO,MutationObserver:MO,document:{body:{}}}),reveal:n=>callback([{target:n,isIntersecting:true}]),hide:n=>callback([{target:n,isIntersecting:false}]),cleanup:()=>changed(),observed};
}
test('hidden galleries make zero requests; visible slots load independently and removed slots are released',()=>{
 const h=visibilityHarness(),nodes=Array.from({length:200},()=>({isConnected:true}));let loads=0;
 nodes.forEach(n=>h.loader.observe(n,()=>loads++));nodes.forEach(n=>h.hide(n));assert.equal(loads,0);
 h.reveal(nodes[0]);h.reveal(nodes[1]);assert.equal(loads,2);h.reveal(nodes[0]);assert.equal(loads,2);
 nodes[2].isConnected=false;h.cleanup();assert.equal(h.observed.size,197);h.reveal(nodes[2]);assert.equal(loads,2);
});
const app=fs.readFileSync('app.js','utf8');
test('archive refresh preserves the selected tab and the exact already-loaded image node',()=>{
 const {document}=parseHTML('<div id="storeDetailBody"></div>'),s={id:'s',nome:'Sede',ultimo_passaggio:null},a={id:'p',intervention_id:'i',storage_path:'photo',nome_file:'image.jpg',tipo:'foto_generica'};
 const c={document,stores:[s],interventions:[{id:'i',store_id:'s',stato:'convalidato'}],extras:[],attachments:[a],profiles:[],interventionWorkers:[],extraWorkers:[],schedules:[],scheduleItems:[],
  $:id=>document.getElementById(id),days:()=>null,storeHasInterval:()=>false,status:()=>'',today:()=> '2026-10-17',admin:()=>false,fmt:v=>v||'—',esc:v=>v??'',clientBadge:()=>'',storeReminderMarkup:()=>'',nextVisitNoteMarkup:()=>'',historyStatusLabel:()=>'',archiveKind:a=>a.tipo_archivio,
  mountAttachmentPhoto:(b,a)=>{const img=document.createElement('img');img.src=a.storage_path;b.append(img)},openStoreMaps(){},showHistory(){},openAttachment(){}};
 vm.createContext(c);vm.runInContext(app.slice(app.indexOf('function renderStoreDetail('),app.indexOf('function openDuplicateSchedule(')),c);
 c.renderStoreDetail(s,[]);const body=c.$('storeDetailBody'),tab=body.querySelector('[data-sheet-tab="photos"]');tab.click();const img=body.querySelector('img');
 c.renderStoreDetail(s,[{storage_path:'manual',tipo_archivio:'foto',nome_file:'manual.jpg'}],true);
 assert.equal(body.querySelector('[data-sheet-tab="photos"]'),tab);assert(tab.classList.contains('active'));assert.equal(body.querySelector('img'),img);assert.equal(body.querySelectorAll('img').length,2);assert.equal(body.querySelector('[data-sheet-photo-count]').textContent,'2');
});
test('extra gallery does not sign hidden photos and stale image completion cannot populate a removed card',async()=>{
 const {document}=parseHTML('<article><div data-extra-photos></div></article>');let calls=0,resolve;const h=visibilityHarness();
 const c={document,attachmentMediaScope:()=> 'a',attachmentVisibility:h.loader,signedAttachmentUrl:()=>{calls++;return new Promise(r=>resolve=r)},openAttachment(){}};
 vm.createContext(c);vm.runInContext(app.slice(app.indexOf('function mountAttachmentPhoto('),app.indexOf('async function openArchiveAttachment(')),c);
 vm.runInContext(app.slice(app.indexOf('function hydratePendingPhotos('),app.indexOf('function renderPending(')),c);
 const card=document.querySelector('article');c.hydratePendingPhotos(card,[{storage_path:'p1'},{storage_path:'p2'}]);assert.equal(calls,0);
 const first=card.querySelector('button');h.reveal(first);assert.equal(calls,1);card.remove();resolve('url');await tick();assert.equal(first.querySelector('img'),null);
});
