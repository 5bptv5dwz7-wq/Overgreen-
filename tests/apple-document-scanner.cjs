const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const USER='a59387b9-3e89-4432-bbb6-190874cc9925',EXTRA='cccccccc-cccc-4ccc-accc-cccccccccccc',KEY='overgreen-apple-scans-v1';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};
function setup(storage=memory()){
 const {document}=parseHTML('<dialog id="closeExtraDialog"><section id="doc-eurospin-card"></section><section id="doc-overgreen-card"></section></dialog>');
 const state={userId:USER,profileId:USER,extraId:EXTRA,active:true},selected={},objects=new Map(),saved=new Set(),calls=[];
 let busy=false;
 const client={auth:{getUser:async()=>({data:{user:{id:state.userId}}})},storage:{from:()=>({
 createSignedUploadUrl:async(path,opts)=>{calls.push({path,opts});return {data:{signedUrl:'https://example.supabase.co/storage/v1/object/upload/sign/documenti/'+path+'?token=single-object-token'}}},
 download:async path=>objects.has(path)?{data:objects.get(path)}:{error:{message:'Object not found',statusCode:'404'}}
 })},from:()=>({select:()=>({eq:(_,id)=>({maybeSingle:async()=>({data:saved.has(id)?{id}:null})})})})};
 const win={addEventListener(){},setInterval(){}},context={window:win,document,localStorage:storage,navigator:{userAgent:'iPhone',platform:'iPhone'},crypto:require('node:crypto'),File,Blob,console,Date,WeakMap,confirm:()=>true};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/../apple-document-scanner.js','utf8'),context);
 const api=win.AppleDocumentScanner;api.init({client,context:()=>state,documents:{get:t=>selected[t],isBusy:()=>busy,select:(t,f)=>{selected[t]=f;return true}}});
 storage.setItem('overgreen-apple-scanner-setup-v1','1');
 const jobs=()=>Object.values(JSON.parse(storage.getItem(KEY)||'{}'));
 const upload=(j,content='%PDF-1.7\n test')=>objects.set(j.path,new Blob([content],{type:'application/pdf'}));
 return {api,state,document,storage,selected,objects,saved,calls,context,jobs,upload,client,busy:v=>busy=v};
}
test('only real Lorenzo in own profile can start, staff and impersonation stay hidden',async()=>{
 for(const [user,profile] of [['worker','worker'],[USER,'worker'],['worker',USER]]){
  const h=setup();h.state.userId=user;h.state.profileId=profile;h.api.refresh();await h.api.prepare('eurospin');assert.equal(h.calls.length,0);assert(h.document.querySelector('.apple-scan-pilot').hidden);
 }
});
test('native bridge URL contains only a scoped upload URL; both reports have unique destinations',async()=>{
 const h=setup();await h.api.prepare('eurospin');await h.api.prepare('overgreen');
 assert.equal(h.jobs().length,2);assert.notEqual(h.jobs()[0].id,h.jobs()[1].id);assert(h.calls.every(c=>c.opts.upsert===false));
 const link=h.document.querySelector('[data-launch]').getAttribute('href'),url=new URL(link);assert.equal(url.protocol,'shortcuts:');assert.equal(url.searchParams.get('name'),'Scansiona Overgreen');assert.match(url.searchParams.get('text'),/upload\/sign/);
 assert(!h.storage.getItem(KEY).includes('token'));assert(!h.storage.getItem(KEY).includes('signedUrl'));
});
test('valid PDF recovers into its own report and uses staged upload metadata only for that extra and type',async()=>{
 const h=setup();await h.api.prepare('overgreen');h.upload(h.jobs()[0]);await h.api.check(true);
 assert(!h.selected.eurospin);assert.equal(h.selected.overgreen.type,'application/pdf');assert(h.api.metadata(h.selected.overgreen,EXTRA,'rapportino_overgreen'));
 assert.equal(h.api.metadata(h.selected.overgreen,'another','rapportino_overgreen'),null);assert.equal(h.api.metadata(h.selected.overgreen,EXTRA,'rapportino_eurospin'),null);
 h.api.committed(h.selected.overgreen);assert.equal(h.jobs().length,0);
});
test('reopening after PWA reload recovers PDF without persisting credentials',async()=>{
 const a=setup();await a.api.prepare('eurospin');const j=a.jobs()[0];const b=setup(a.storage);b.upload(j);await b.api.check(true);assert(b.selected.eurospin);
});
test('missing upload, invalid PDF, cancellation, or busy save cannot replace prior file',async()=>{
 const h=setup(),old=new File(['%PDF-old'],'old.pdf',{type:'application/pdf'});h.selected.eurospin=old;await h.api.prepare('eurospin');const j=h.jobs()[0];
 await h.api.check(true);assert.equal(h.selected.eurospin,old);h.upload(j,'bad');await h.api.check(true);assert.equal(h.selected.eurospin,old);
 h.upload(j);h.busy(true);await h.api.check(true);assert.equal(h.selected.eurospin,old);h.busy(false);h.api.forget('eurospin');await h.api.check(true);assert.equal(h.selected.eurospin,old);
});
test('changing extra during download discards late result',async()=>{
 const h=setup();await h.api.prepare('eurospin');let resolve;h.client.storage.from=()=>({download:()=>new Promise(r=>{resolve=r})});const pending=h.api.check(true);await new Promise(r=>setImmediate(r));h.state.extraId='other';resolve({data:new Blob(['%PDF-new'])});await pending;assert(!h.selected.eurospin);
});
test('manually choosing a new document cancels a late scan import',async()=>{
 const h=setup();await h.api.prepare('eurospin');let resolve;h.client.storage.from=()=>({download:()=>new Promise(r=>{resolve=r})});const pending=h.api.check(true);await new Promise(r=>setImmediate(r));h.api.forget('eurospin');const f=new File(['%PDF-manual'],'manual.pdf');h.selected.eurospin=f;resolve({data:new Blob(['%PDF-new'])});await pending;assert.equal(h.selected.eurospin,f);
});
test('registered attachment recovery is idempotent',async()=>{
 const h=setup();await h.api.prepare('eurospin');h.saved.add(h.jobs()[0].id);await h.api.check();assert(!h.selected.eurospin);assert.equal(h.jobs().length,0);
});
test('setup and verified user are required before issuing capability',async()=>{
 const h=setup();h.storage.removeItem('overgreen-apple-scanner-setup-v1');await h.api.prepare('eurospin');assert.equal(h.calls.length,0);
 h.storage.setItem('overgreen-apple-scanner-setup-v1','1');h.client.auth.getUser=async()=>({data:{user:{id:'other'}}});await h.api.prepare('eurospin');assert.equal(h.calls.length,0);
});
test('source integrates scanner before app and reuses the staged path when registering attachment',()=>{
 const html=fs.readFileSync(__dirname+'/../index.html','utf8'),app=fs.readFileSync(__dirname+'/../app.js','utf8');assert(html.indexOf('apple-document-scanner.js')<html.indexOf('src="app.js'));
 assert(app.includes("const id=scan?.id||keys.get(key)"));assert(app.includes("const path=scan?.path||'extra/'"));assert(app.includes('window.AppleDocumentScanner?.committed(originalFile)'));
});
test('save uses scanned object once, retries same attachment ID, and ordinary uploads still upload',async()=>{
 const src=fs.readFileSync(__dirname+'/../app.js','utf8');const start=src.indexOf('const extraUploadKeys=new WeakMap();'),end=src.indexOf('function setExtraSaveBusy',start);
 const rows=new Map(),uploads=[],committed=[],scanFile=new File(['%PDF-1.7'],'scanned.pdf',{type:'application/pdf'}),normal=new File(['%PDF-1.7'],'normal.pdf',{type:'application/pdf'});
 const scan={id:'scan-id',extraId:EXTRA,target:'eurospin',path:'extra/'+EXTRA+'/scanned.pdf'};
 const c={crypto:require('node:crypto'),WeakMap,Map,attachments:[],profile:{id:USER},window:{AppleDocumentScanner:{metadata:(f,e,t)=>f===scanFile&&e===EXTRA&&t==='rapportino_eurospin'?scan:null,committed:f=>committed.push(f)}},sb:{from:()=>({select:()=>({eq:(_,id)=>({maybeSingle:async()=>({data:rows.get(id)})})})}),storage:{from:()=>({upload:async(...args)=>{uploads.push(args);return {}}})}},addAttachment:async row=>{rows.set(row.id,row);return row}};
 vm.createContext(c);vm.runInContext(src.slice(start,end),c);const a=await c.saveExtraUpload(EXTRA,'rapportino_eurospin',scanFile,[]);await c.saveExtraUpload(EXTRA,'rapportino_eurospin',scanFile,[]);
 assert.equal(a.storage_path,scan.path);assert.equal(rows.size,1);assert.equal(uploads.length,0);await c.saveExtraUpload(EXTRA,'rapportino_overgreen',normal,[]);assert.equal(uploads.length,1);assert.equal(rows.size,2);
});
