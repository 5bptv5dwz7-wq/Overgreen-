const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module'),G=require('../locations.js');
const code=stripTypeScriptTypes(fs.readFileSync(__dirname+'/../supabase/functions/resolve-maps-link/index.ts','utf8').replace("import '../../../locations.js';",''));
function setup({role='admin',active=true,auth=true}={}){
  const calls=[];let handle;const ctx={OvergreenLocations:G,Response,TextDecoder,AbortSignal,console,Deno:{env:{get:k=>({SUPABASE_URL:'https://project.supabase.co',SUPABASE_ANON_KEY:'public-test-key'})[k]},serve:f=>handle=f},fetch:async(url,options)=>{
    calls.push({url,options});if(url.endsWith('/auth/v1/user'))return Response.json(auth?{id:'user-id'}:{},{status:auth?200:401});
    if(url.includes('/rest/v1/profiles'))return Response.json([{ruolo:role,attivo:active}]);
    return new Response(null,{status:302,headers:{location:'https://www.google.com/maps/search/?api=1&query=45.500379047325,10.347979028977'}});
  }};vm.createContext(ctx);vm.runInContext(code,ctx);return {handle,calls};
}
const request=(url='https://maps.app.goo.gl/Example',auth=true)=>new Request('https://project.supabase.co/functions/v1/resolve-maps-link',{method:'POST',headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer test-user-token'}:{})},body:JSON.stringify({url})});
test('resolver rejects missing/invalid sessions, employees and disabled administrators before map requests',async()=>{
  for(const options of [{auth:false},{role:'dipendente'},{active:false}]){const f=setup(options),r=await f.handle(request());assert.ok([401,403].includes(r.status));assert.equal(f.calls.filter(x=>x.url.includes('maps.app')).length,0)}
  const f=setup(),r=await f.handle(request(undefined,false));assert.equal(r.status,401);assert.equal(f.calls.length,0);
});
test('authenticated admin resolves a shared link without exposing its token to Maps',async()=>{
  const f=setup(),r=await f.handle(request());assert.equal(r.status,200);assert.deepEqual((await r.json()).point,{lat:45.500379047325,lon:10.347979028977});
  assert.equal(f.calls.length,3);assert.equal(f.calls[2].options.headers,undefined);assert.equal(f.calls[1].options.headers.Authorization,'Bearer test-user-token');
});
test('resolver rejects arbitrary destinations and oversized requests; preflight has no side effects',async()=>{
  const f=setup();assert.equal((await f.handle(request('https://127.0.0.1/secret'))).status,422);assert.equal(f.calls.length,2);
  assert.equal((await f.handle(request('x'.repeat(9000)))).status,413);
  const count=f.calls.length;assert.equal((await f.handle(new Request('https://project.supabase.co',{method:'OPTIONS'}))).status,200);assert.equal(f.calls.length,count);
});
