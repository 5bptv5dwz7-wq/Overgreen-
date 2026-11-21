const {test}=require('node:test'),assert=require('node:assert/strict');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',W='33333333-3333-4333-8333-333333333333';
async function setup(){
 const {createHandler}=await import('../supabase/functions/ios-extra-import/handler.mjs');
 const objects=new Map(),profiles=new Map([[A,{ruolo:'admin',attivo:true}],[B,{ruolo:'admin',attivo:true}],[W,{ruolo:'operatore',attivo:true}]]);
 const storage={
  async upload(path,body){objects.set(path,{blob:new Blob([body]),created_at:new Date().toISOString()});return {data:{path}}},
  async download(path){return objects.has(path)?{data:objects.get(path).blob}:{error:{message:'not found'}}},
  async remove(paths){for(const path of paths)objects.delete(path);return {data:[]}},
  async list(prefix){return {data:[...objects.entries()].filter(([p])=>p.startsWith(prefix+'/')).map(([p,v])=>({name:p.slice(prefix.length+1),created_at:v.created_at}))}}
 };
 const db={storage:{from:()=>storage},auth:{getUser:async token=>['admin-a','admin-b','worker'].includes(token)?{data:{user:{id:token==='admin-a'?A:token==='admin-b'?B:W}}}:{error:{message:'invalid'}}},from:()=>({select(){return this},eq(_key,id){return {maybeSingle:async()=>({data:profiles.get(id)})}}})};
 const handler=createHandler(db,'https://backend.test','https://app.test/Overgreen-/');
 const call=(action,token,body,id)=>handler(new Request('https://backend.test/functions/v1/ios-extra-import?'+new URLSearchParams({action,...(id?{id}:{})}),{method:'POST',headers:{Authorization:'Bearer '+(token||'')},...(body?{body}:{} )}));
 return {call,objects,profiles};
}
test('Shortcut sends a PDF, but only its signed-in owner may import or delete it',async()=>{
 const {call,objects}=await setup();
 assert.equal((await call('pair','worker')).status,403);
 assert.equal((await call('pair')).status,401);
 const pair=await (await call('pair','admin-a')).json();assert.ok(pair.token.startsWith(A+'.'));
 const pdf='%PDF-1.4\nsynthetic test';
 const upload=await call('upload',pair.token,pdf);assert.equal(upload.status,200);
 const shared=await upload.json();assert.equal(shared.appUrl,'webapp://app.test/Overgreen-/');
 const target=new URL(shared.url);assert.equal(target.origin,'https://app.test');
 const id=new URLSearchParams(target.hash.slice(1)).get('extra-import');
 assert.equal((await call('pending',pair.token)).status,401);
 assert.equal((await call('pending','worker')).status,403);
 assert.deepEqual((await (await call('pending','admin-b')).json()).imports,[]);
 assert.deepEqual((await (await call('pending','admin-a')).json()).imports.map(x=>x.id),[id]);
 assert.equal((await call('import',pair.token,null,id)).status,401);
 assert.equal((await call('import','admin-b',null,id)).status,404);
 const download=await call('import','admin-a',null,id);assert.equal(download.status,200);assert.equal(await download.text(),pdf);
 assert.equal((await call('delete','admin-b',null,id)).status,200); // deletes only B's namespace
 assert.equal((await call('import','admin-a',null,id)).status,200);
 assert.equal((await call('delete','admin-a',null,id)).status,200);
 assert.equal((await call('import','admin-a',null,id)).status,404);
 assert.deepEqual((await (await call('pending','admin-a')).json()).imports,[]);
 assert.ok([...objects.keys()].every(path=>path.startsWith('ios-extra-import/')));
});
test('Tokens are hashed, revocable, expiring, scoped and checked against active profiles',async()=>{
 const {call,objects,profiles}=await setup();
 const first=await (await call('pair','admin-a')).json();
 assert.ok(!(await objects.get('ios-extra-import/'+A+'/device.json').blob.text()).includes(first.token));
 const second=await (await call('pair','admin-a')).json();
 assert.equal((await call('upload',first.token,'%PDF-')).status,401);
 profiles.get(A).attivo=false;assert.equal((await call('upload',second.token,'%PDF-')).status,403);profiles.get(A).attivo=true;
 const record=objects.get('ios-extra-import/'+A+'/device.json'),data=JSON.parse(await record.blob.text());
 record.blob=new Blob([JSON.stringify({...data,expiresAt:0})]);assert.equal((await call('upload',second.token,'%PDF-')).status,401);
 const third=await (await call('pair','admin-a')).json();await call('revoke','admin-a');assert.equal((await call('upload',third.token,'%PDF-')).status,401);
 assert.equal((await call('import','admin-a',null,'../../other')).status,400);
});
test('Rejects links/non-PDFs and oversized files; cleans only abandoned imported PDFs',async()=>{
 const {call,objects}=await setup(),pair=await (await call('pair','admin-a')).json();
 assert.equal((await call('upload',pair.token,'https://example.test/a.pdf')).status,400);
 assert.equal((await call('upload',pair.token,new Uint8Array(10*1024*1024+1))).status,413);
 const expired='ios-extra-import/'+A+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.pdf';
 objects.set(expired,{blob:new Blob(['%PDF-']),created_at:'2020-01-01T00:00:00Z'});
 assert.deepEqual((await (await call('pending','admin-a')).json()).imports,[]);
 objects.set('extra/existing/document.pdf',{blob:new Blob(['%PDF-']),created_at:'2020-01-01T00:00:00Z'});
 assert.equal((await call('upload',pair.token,'%PDF-1.4')).status,200);
 assert.equal(objects.has(expired),false);assert.equal(objects.has('extra/existing/document.pdf'),true);
});
