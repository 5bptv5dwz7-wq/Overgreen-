const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const tick=()=>new Promise(r=>setImmediate(r));
test('visit photo failure refreshes the shared URL once and then offers retry',async()=>{
 const calls=[];const c={document:{addEventListener(){}},signedAttachmentUrl:async(a,options)=>{calls.push(options);return 'url-'+calls.length}};vm.createContext(c);vm.runInContext(fs.readFileSync('visit-photos.js','utf8'),c);
 const img={dataset:{},style:{}};c.loadVisitPhoto(img,'photo');await tick();assert.equal(img.src,'url-1');img.onerror();await tick();assert.equal(img.src,'url-2');assert.equal(calls[1].refresh,true);img.onerror();assert.match(img.alt,/riprovare/);assert.equal(typeof img.onclick,'function');
});
test('store details render immediately and reject an older archive response',async()=>{
 const src=fs.readFileSync('app.js','utf8');const start=src.indexOf('let storeDetailRequest=');const end=src.indexOf('function renderStoreDetail',start);const pending={},renders=[];
 const body={prepend(){},querySelector(){return null}},dialog={open:true,scrollTop:0},title={};
 const c={profile:{id:'a'},document:{createElement:()=>({remove(){}})},$:id=>id==='storeDetailBody'?body:id==='storeDetailDialog'?dialog:title,renderStoreDetail:(s,files,archiveOnly)=>renders.push([s.id,files,archiveOnly]),storeArchiveFiles:id=>new Promise(r=>pending[id]=r),openDialog(){}};
 vm.createContext(c);vm.runInContext(src.slice(start,end),c);
 const a=c.showStoreDetail({id:'a',nome:'A'}),b=c.showStoreDetail({id:'b',nome:'B'});assert.equal(renders.length,2);
 pending.a(['old']);await a;assert.equal(renders.length,2);pending.b(['new']);await b;assert.equal(renders.length,3);assert.equal(renders[2][0],'b');assert.deepEqual(renders[2][1],['new']);assert.equal(renders[2][2],true);
 const d=c.showStoreDetail({id:'c',nome:'C'});dialog.open=false;pending.c(['closed']);await d;assert.equal(renders.length,4);
});
