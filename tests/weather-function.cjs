const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const {stripTypeScriptTypes}=require('node:module');
const source=stripTypeScriptTypes(fs.readFileSync(__dirname+'/../supabase/functions/store-weather/index.ts','utf8').replace(/^import .*;\n/,''));
function setup({active=true,visible=true,cached=null,fail=false}={}){
 let handler,fetches=0,written;
 const db={auth:{getUser:async token=>({data:{user:token==='valid'?{id:'u'}:null}})},from:table=>({select(){return this},eq(){return this},single:async()=>({data:table==='profiles'?{attivo:active}:visible?{id:'pv',latitudine:45.46,longitudine:9.19}:null}),maybeSingle:async()=>({data:cached}),upsert:async value=>{written=value;return {}}})};
 const context={Deno:{env:{get:()=> 'mock'},serve:fn=>handler=fn},createClient:()=>db,Response,AbortSignal,console,fetch:async url=>{fetches++;assert.match(url,/lat=45.460&lon=9.190$/);if(fail)throw Error('offline');return new Response(JSON.stringify({properties:{timeseries:[]}}),{headers:{Expires:new Date(Date.now()+7200000).toUTCString()}})}};
 vm.runInNewContext(source,context);
 return {call:async token=>handler(new Request('https://test',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body:JSON.stringify({store_id:'pv',lat:0,lon:0})})),get fetches(){return fetches},get written(){return written}};
}
test('rejects anonymous, invalid, inactive users and inaccessible stores before provider access',async()=>{for(const [options,token,status] of [[{},null,401],[{},'bad',401],[{active:false},'valid',403],[{visible:false},'valid',403]]){const s=setup(options);assert.equal((await s.call(token)).status,status);assert.equal(s.fetches,0)}});
test('uses confirmed store coordinates and persists cache; fresh cache avoids provider',async()=>{const s=setup();assert.equal((await s.call('valid')).status,200);assert.equal(s.fetches,1);assert.equal(s.written.location_key,'45.460,9.190');const cached=setup({cached:s.written});assert.equal((await (await cached.call('valid')).json()).stale,false);assert.equal(cached.fetches,0)});
test('provider failure returns recent data explicitly stale and rejects old cache',async()=>{const c={payload:{properties:{timeseries:[]}},expires_at:new Date(0).toISOString(),fetched_at:new Date().toISOString()};assert.equal((await (await setup({cached:c,fail:true}).call('valid')).json()).stale,true);c.fetched_at=new Date(0).toISOString();assert((await (await setup({cached:c,fail:true}).call('valid')).json()).error)});
