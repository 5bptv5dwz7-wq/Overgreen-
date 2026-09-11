const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../locations.js');
const st={id:'atm',client_type:'intesa',nome:'ATM chiuso 123',indirizzo:'Via Roma 12',citta:'Torino'};
test('closed ATM navigates to the entered address without business name',()=>{
  assert.equal(G.storeDestination(st),'Via Roma 12, Torino, Italia');
  assert.equal(new URL(G.mapsUrl(G.storeDestination(st))).searchParams.get('query'),'Via Roma 12, Torino, Italia');
  assert.equal(G.storeDestination({...st,latitudine:45,longitudine:7}),'45,7');
  assert.match(G.storeDestination({...st,indirizzo:''}),/Intesa Sanpaolo/);
});
test('ATM geocoding accepts an address without an active bank listing',async()=>{
  const queries=[];
  const s=G.createService({getStore:()=>st,fetch:async url=>{
    queries.push(new URL(url).searchParams.get('q'));
    return {ok:true,json:async()=>[{lat:'45',lon:'7',class:'building',name:'',display_name:'Via Roma 12, Torino',address:{road:'Via Roma',house_number:'12',city:'Torino',country_code:'it'}}]};
  }});
  const p=await s.geocode('store:atm');assert.equal(p.lat,45);assert.equal(p.approximate,true);
  assert.deepEqual(queries,['Via Roma 12, Torino, Italia']);
});
test('no address match never triggers a search for another active branch',async()=>{
  const urls=[];const s=G.createService({getStore:()=>st,fetch:async url=>{
    urls.push(url);return {ok:true,json:async()=>url.includes('photon')?{features:[]}:[]};
  }});
  assert.deepEqual(await s.candidates(st),[]);
  assert.equal(urls.length,2);
  for(const url of urls)assert.equal(new URL(url).searchParams.get('q'),'Via Roma 12, Torino, Italia');
});
