const {test}=require('node:test'),assert=require('node:assert/strict'),{parseHTML}=require('linkedom'),fs=require('node:fs'),vm=require('node:vm'),G=require('../locations.js');
const source=fs.readFileSync(__dirname+'/../locations-ui.js','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const st={id:'m',nome:'MAZZANO',indirizzo:'Via padana superiore',citta:'Mazzano',client_type:'eurospin',latitudine:45.500379047325,longitudine:10.347979028977};
const flush=()=>new Promise(r=>setImmediate(r));
function setup({search=async()=>[],resolveLink=async()=>null}={}){
  const {document,window}=parseHTML(html),$=id=>document.getElementById(id);let form={...st},map;
  $('storeDialog').open=true;
  const L={map(){map={events:{},setView(){return this},getZoom(){return 16},invalidateSize(){},remove(){},on(n,f){this.events[n]=f;return this}};return map},tileLayer(){return {addTo(){return this},on(){return this}}},divIcon:v=>v,marker(coords){return {coords,addTo(){return this},setLatLng(v){this.coords=v},getLatLng(){return {lat:this.coords[0],lng:this.coords[1]}},on(){return this},remove(){}}}};
  const context={document,navigator:{},L,OvergreenLocations:G,console,setTimeout,clearTimeout};vm.createContext(context);vm.runInContext(source,context);
  const editor=context.OvergreenLocationUI.create({getStore:()=>form,resolveLink,search});editor.open(st);
  return {$,editor,window,getMap:()=>map,setForm:v=>form=v,form:()=>form,openMap:async()=>{$('storeLocation').open=true;$('storeLocation').dispatchEvent(new window.Event('toggle'));await flush()}};
}
test('opening or inspecting an existing pin does not write; map click creates a draft and cancel discards it',async()=>{
  const u=setup();assert.deepEqual({...u.editor.payload()},{});await u.openMap();assert.deepEqual({...u.editor.payload()},{});
  u.getMap().events.click({latlng:{lat:45.51,lng:10.35}});assert.equal(u.editor.payload().latitudine,45.51);
  u.$('storeDialog').dispatchEvent(new u.window.Event('close'));u.editor.open(st);assert.deepEqual({...u.editor.payload()},{});
});
test('pasted point updates both coordinate pairs without needing a street; invalid link preserves the saved point',async()=>{
  const u=setup();u.setForm({...st,indirizzo:''});u.$('storeLocationLink').value='45.501,10.349';await u.$('storeLocationUseLink').onclick();
  const p=u.editor.payload();assert.equal(p.latitudine,45.501);assert.equal(p.route_latitude,p.latitudine);assert.equal(p.route_longitude,p.longitudine);
  u.$('storeLocationLink').value='bad';await u.$('storeLocationUseLink').onclick();assert.equal(u.editor.payload().latitudine,45.501);
});
test('lookup result remains a suggestion until confirmed and never overwrites the typed address',async()=>{
  const hit={lat:45.502,lon:10.35,label:'Via indicativa',precision:'street'},u=setup({search:async()=>[hit]});
  const old=u.form().indirizzo;await u.editor.lookup();u.$('storeLocationResults').firstElementChild.onclick();await flush();
  assert.deepEqual({...u.editor.payload()},{});assert.equal(u.form().indirizzo,old);
  u.$('storeLocationConfirm').onclick();assert.equal(u.editor.payload().latitudine,hit.lat);
});
test('late geocoding cannot replace a manually chosen pin or a different store form',async()=>{
  let release;const u=setup({search:()=>new Promise(r=>release=r)});await u.openMap();
  const pending=u.editor.lookup();await flush();assert.throws(()=>u.editor.payload(),/Attendi/);
  u.getMap().events.click({latlng:{lat:45.503,lng:10.36}});release([{lat:1,lon:2,label:'stale'}]);await pending;
  assert.equal(u.editor.payload().latitudine,45.503);assert.equal(u.$('storeLocationResults').children.length,0);
  const pending2=u.editor.lookup();await flush();u.editor.open({...st,id:'other'});u.setForm({...st,id:'other'});release([{lat:3,lon:4,label:'wrong form'}]);await pending2;assert.deepEqual({...u.editor.payload()},{});
});
test('changing the lookup input invalidates the reply, while removing a pin clears both pairs explicitly',async()=>{
  let release;const u=setup({resolveLink:()=>new Promise(r=>release=r)});u.$('storeLocationLink').value='https://maps.app.goo.gl/Example';const p=u.$('storeLocationUseLink').onclick();
  u.setForm({...st,citta:'Genova'});release({lat:1,lon:2});await p;assert.deepEqual({...u.editor.payload()},{});
  u.$('storeLocationClear').onclick();const cleared=u.editor.payload();for(const k of ['latitudine','longitudine','route_latitude','route_longitude'])assert.equal(cleared[k],null);
});
