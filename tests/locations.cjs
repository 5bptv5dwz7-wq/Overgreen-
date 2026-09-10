const {test}=require('node:test'),assert=require('node:assert/strict'),G=require('../locations.js'),fs=require('node:fs'),vm=require('node:vm');
const mazzano={id:'m',client_type:'eurospin',nome:'MAZZANO',indirizzo:'Via padana superiore',citta:'Mazzano',route_latitude:45.504384,route_longitude:10.3576099};
const official={lat:45.500379047325,lon:10.347979028977};
const pin=st=>({...st,latitudine:official.lat,longitudine:official.lon});
const row={lat:'45.5',lon:'10.348',name:'Eurospin',class:'shop',type:'supermarket',display_name:'Eurospin, Via Padana Superiore, Mazzano, Brescia, Italia',address:{road:'Via Padana Superiore',city:'Mazzano',county:'Brescia',country_code:'it'}};
function service(stores,rows=[row],saved={}){
  let cache=saved,now=2000000000000;const urls=[];
  const s=G.createService({getStore:id=>stores.find(s=>s.id===id),readCache:()=>cache,writeCache:v=>cache=v,now:()=>now,sleep:async n=>{now+=n},fetch:async url=>{
    urls.push(url);return {ok:true,json:async()=>url.includes('/route/v1/')?{routes:[{distance:1200+urls.length,duration:180}]}:url.includes('photon')?{features:[]}:structuredClone(rows)};
  }});return {s,urls,getCache:()=>cache};
}
test('Mazzano: confirmed official point wins over generic address and old stored geocode',async()=>{
  assert.match(G.storeDestination(mazzano),/Eurospin/);assert.match(G.storeDestination({...mazzano,indirizzo:''}),/Eurospin/);
  const st=pin(mazzano),f=service([st]);assert.equal(G.storeDestination(st),G.pair(official));
  assert.deepEqual(await f.s.geocode('store:m'),{...official,approximate:false,resolvedAddress:G.storeQuery(st),source:'confirmed'});assert.equal(f.urls.length,0);
  assert.equal(G.confirmedPoint(mazzano),null);
});
test('empty, malformed and out-of-range coordinates never become zero or an exact point',()=>{
  for(const v of [null,undefined,'',' ',NaN,Infinity])assert.equal(G.point(v,10),null);
  assert.equal(G.point(95,10),null);assert.equal(G.point(45,185),null);assert.deepEqual(G.point('45.5','10.3'),{lat:45.5,lon:10.3});
});
test('shared Maps parser selects the destination, never viewport or origin coordinates',()=>{
  const samples=[
    ['45.500379047325, 10.347979028977',official],
    ['https://www.google.com/maps/dir/?api=1&destination=45.500379047325%2C10.347979028977',official],
    ['https://www.google.com/maps/place/Eurospin/@45.6,10.8,17z/data=!8m2!3d45.500379047325!4d10.347979028977',official],
    ['Eurospin\nhttps://www.google.com/maps/search/?api=1&query=45.500379047325%2C10.347979028977',official],
    ['https://maps.apple.com/?ll=45.500379047325,10.347979028977&q=Eurospin',official],
    ['https://maps.apple.com/?coordinate=45.500379047325,10.347979028977',official],
    ['https://www.google.com/maps/@45.6,10.8,17z',null],
    ['https://www.google.com/maps/?center=45.6,10.8',null],
    ['https://maps.apple.com/?ll=45.6,10.8',null],
    ['https://www.google.com/maps/dir/?origin=45.6,10.8&destination=Eurospin',null],
    ['https://maps.apple.com/?saddr=45.6,10.8&daddr=Eurospin',null],
    ['https://evil.invalid/maps?query=45.5,10.3',null],
    ['https://www.google.com/maps/search/?query=200,300',null]
  ];for(const [url,p] of samples)assert.deepEqual(G.parseMapsPoint(url),p,url);
});
test('short link expansion follows only allowed HTTPS map hosts and never forwards credentials',async()=>{
  const calls=[];const result=await G.resolveMapsLink('https://maps.app.goo.gl/Example',async(url,options)=>{
    calls.push({url,options});return new Response(null,{status:302,headers:{location:'https://www.google.com/maps/place/Eurospin/data=!3d45.500379047325!4d10.347979028977'}});
  });assert.deepEqual(result,official);assert.equal(calls.length,1);assert.equal(calls[0].options.redirect,'manual');assert.equal(calls[0].options.headers,undefined);
  for(const redirect of ['http://127.0.0.1/','https://www.google.com.evil.invalid/maps','https://www.google.com/url?q=https://evil.invalid','https://user:secret@maps.google.com/','https://maps.google.com:8443/']){
    let n=0;await assert.rejects(G.resolveMapsLink('https://maps.app.goo.gl/Example',async()=>{n++;return new Response(null,{status:302,headers:{location:redirect}})}));assert.equal(n,1);
  }
  let n=0;await assert.rejects(G.resolveMapsLink('https://maps.app.goo.gl/Loop',async()=>{n++;return new Response(null,{status:302,headers:{location:'https://maps.app.goo.gl/Loop'}})}));assert.equal(n,1);
});
test('city-only results and homonymous cities never become accurate store locations',async()=>{
  const city={...row,class:'place',type:'town',name:'Mazzano'};
  await assert.rejects(service([mazzano],[city]).s.geocode('store:m'),/Posizione da verificare/);
  const wrong={...row,address:{...row.address,city:'Mazzano Romano'}};
  await assert.rejects(service([mazzano],[wrong]).s.geocode('store:m'),/Posizione da verificare/);
  assert.equal(G.isStorePlace(G.candidateNominatim({...row,name:'Lidl'}),mazzano),false);
  assert.equal(G.matchesLocality(G.candidateNominatim({...row,address:{...row.address,country_code:'ch'}}),mazzano),false);
});
test('a generic street is explicitly approximate, including after cache reload',async()=>{
  const street={...row,class:'highway',type:'secondary',name:'Via Padana Superiore'},f=service([mazzano],[street]);
  assert.equal((await f.s.geocode('store:m')).approximate,true);
  const reload=service([mazzano],[],f.getCache());assert.equal((await reload.s.geocode('store:m')).approximate,true);assert.equal(reload.urls.length,0);
});
test('multiple Eurospin results require a user choice',async()=>{
  await assert.rejects(service([mazzano],[row,{...row,lat:'45.51'}]).s.geocode('store:m'),/più sedi/);
});
test('changed source or destination immediately invalidates a cached route; same address does not alias two stores',async()=>{
  const a=pin({...mazzano,id:'a'}),b={...pin(mazzano),id:'b',latitudine:45.51};const f=service([a,b]);
  await f.s.route('store:a','store:b');const first=f.urls.at(-1);assert.match(first,/10.347979028977,45.500379047325;10.347979028977,45.51/);
  await f.s.route('store:a','store:b');assert.equal(f.urls.length,1);
  b.latitudine=45.52;await f.s.route('store:a','store:b');assert.equal(f.urls.length,2);assert.match(f.urls.at(-1),/45.52/);
  a.longitudine=10.349;await f.s.route('store:a','store:b');assert.equal(f.urls.length,3);assert.match(f.urls.at(-1),/10.349,45.500379047325/);
  const reloaded=service([a,b],[],f.getCache());await reloaded.s.route('store:a','store:b');assert.equal(reloaded.urls.length,0);
});
test('concurrent routes share requests; a transient failure can be retried',async()=>{
  const a=pin({...mazzano,id:'a'}),b=pin({...mazzano,id:'b'}),f=service([a,b]);
  await Promise.all([f.s.route('store:a','store:b'),f.s.route('store:a','store:b')]);assert.equal(f.urls.length,1);
  let failed=true;const s=G.createService({getStore:id=>id==='a'?a:b,fetch:async()=>{if(failed){failed=false;throw Error('offline')}return {ok:true,json:async()=>({routes:[{distance:1000,duration:60}]})}}});
  await assert.rejects(s.route('store:a','store:b'));assert.equal((await s.route('store:a','store:b')).km,1);
});
test('application links for ordinary, extra, sharing and linked activities agree; custom activity address is preserved',()=>{
  const code=fs.readFileSync(__dirname+'/../app.js','utf8'),ctx={OvergreenLocations:G,window:{location:{href:''}},alert(){}};vm.createContext(ctx);
  vm.runInContext(code.slice(code.indexOf('function openGoogleMaps('),code.indexOf('function storeSiteTypeLabel(')),ctx);
  vm.runInContext(code.slice(code.indexOf('function routeAddressForStore('),code.indexOf('function routeDisplayAddress(')),ctx);
  const st=pin(mazzano),url=G.mapsUrl(G.pair(official));ctx.openStoreMaps(st);assert.equal(ctx.window.location.href,url);ctx.openExtraMaps({},st);assert.equal(ctx.window.location.href,url);assert.equal(ctx.storeMapsShareUrl(st),url);
  ctx.openActivityMaps({indirizzo:st.indirizzo},st);assert.equal(ctx.window.location.href,url);assert.equal(ctx.activityRouteAddress({},st),'store:m');
  ctx.openActivityMaps({indirizzo:'Via Roma 10'},st);assert.match(decodeURIComponent(ctx.window.location.href),/Via Roma 10, Mazzano/);
  assert.match(ctx.extraMapsDestination({nome_esterno:'Condominio Blu',indirizzo_esterno:'Via Roma, Genova'}),/Condominio Blu/);
});
