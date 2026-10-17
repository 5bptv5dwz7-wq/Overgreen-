const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const tick=()=>new Promise(r=>setImmediate(r));
test('visit photo URLs share concurrent requests and refresh after an image failure',async()=>{
 let calls=0;const c={profile:{id:'admin'},Map,Date,Error,document:{addEventListener(){}},signedAttachmentUrl:async()=>`url-${++calls}`};vm.createContext(c);vm.runInContext(fs.readFileSync('visit-photos.js','utf8'),c);
 const urls=await Promise.all([c.visitPhotoUrl('photo'),c.visitPhotoUrl('photo')]);assert.deepEqual(urls,['url-1','url-1']);assert.equal(calls,1);
 const img={dataset:{},style:{}};c.loadVisitPhoto(img,'photo');await tick();assert.equal(img.loading,'eager');assert.equal(img.src,'url-1');img.onerror();await tick();assert.equal(img.src,'url-2');img.onerror();assert.match(img.alt,/riprovare/);assert.equal(typeof img.onclick,'function');
 c.profile={id:'other'};assert.equal(await c.visitPhotoUrl('photo'),'url-3');
});
test('store details render immediately and reject an older archive response',async()=>{
 const src=fs.readFileSync('app.js','utf8');const start=src.indexOf('let storeDetailRequest=');const end=src.indexOf('function renderStoreDetail',start);const pending={},renders=[];
 const body={prepend(){},querySelector(){return null}},dialog={open:true,scrollTop:0},title={};
 const c={profile:{id:'a'},document:{createElement:()=>({})},$:id=>id==='storeDetailBody'?body:id==='storeDetailDialog'?dialog:title,renderStoreDetail:(s,files)=>renders.push([s.id,files]),storeArchiveFiles:id=>new Promise(r=>pending[id]=r),openDialog(){}};
 vm.createContext(c);vm.runInContext(src.slice(start,end),c);
 const a=c.showStoreDetail({id:'a',nome:'A'}),b=c.showStoreDetail({id:'b',nome:'B'});assert.equal(renders.length,2);
 pending.a(['old']);await a;assert.equal(renders.length,2);pending.b(['new']);await b;assert.equal(renders.length,3);assert.equal(renders[2][0],'b');assert.deepEqual(renders[2][1],['new']);
 const d=c.showStoreDetail({id:'c',nome:'C'});dialog.open=false;pending.c(['closed']);await d;assert.equal(renders.length,4);
});
