const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const elements=new Map(),markers=[],lines=[];let rendered=0,isAdmin=true,mixed=false,endpoints={};
 function el(){return {dataset:{},children:[],attrs:{},classList:{add(){},remove(){},toggle(){}},append(x){this.children.push(x)},prepend(){},before(){},replaceChildren(){this.children=[]},setAttribute(k,v){this.attrs[k]=v},querySelector(k){return node(k)},querySelectorAll(){return []}}}
 function node(k){if(!elements.has(k))elements.set(k,el());return elements.get(k)}
 const stores=[{id:'a',nome:'A <nome>',client_type:'eurospin',latitudine:45,longitudine:9},{id:'b',nome:'B',client_type:'eurospin',latitudine:45.1,longitudine:9.1},{id:'c',nome:'C',client_type:'eurospin',latitudine:null,longitudine:null},{id:'d',nome:'D',client_type:'intesa',latitudine:45.2,longitudine:9.2}];
 const ctx={window:{OvergreenRouteEndpoints:{get:()=>endpoints},OvergreenLocations:{confirmedPoint:s=>s.latitudine==null?null:{lat:s.latitudine,lon:s.longitudine}}},document:{createElement:el,getElementById:node},stores,clientType:s=>s.client_type,planningMatches:s=>mixed||s.client_type==='eurospin',isStoreProgrammed:()=>false,activeStoreReminder:()=>false,isOverdueStore:()=>false,storeHasInterval:()=>true,admin:()=>isAdmin,renderScheduleItemNoteDrafts(){},$:node,esc:s=>String(s).replace(/</g,'&lt;'),renderSchedulePicker(){rendered++;ctx.updateScheduleSelectedCount()}};
 ctx.window.L={divIcon:x=>x,marker:(p,options)=>{const m={p,options,on(event,cb){this[event]=cb;return this},addTo(){markers.push(this);return this},bindTooltip(label,options){this.tooltip={label,options};return this}};return m},polyline:(points,options)=>({addTo(){lines.push({points,options});return this}})};
 vm.createContext(ctx);
 const app=fs.readFileSync('app.js','utf8');vm.runInContext(app.slice(app.indexOf('let schedulePickerSelected='),app.indexOf('function resetSchedulePickerSelection()')),ctx);
 const source=fs.readFileSync('store-map.js','utf8').replace('window.OvergreenStoreMap={open,sync()',"window.mapTest={toggleStop,moveStop,routeStores,drawPins,renderPlanSummary,renderList,rows,configure(m,l,d){map=m;layer=l;dialog=d;planning=true},search(q){query=q}};window.OvergreenStoreMap={open,sync()");
 vm.runInContext(source,ctx);
 const dialog=el();dialog.open=true;ctx.window.mapTest.configure({getZoom:()=>9},{clearLayers(){markers.length=0;lines.length=0}},dialog);
 return {ctx,stores,markers,lines,node,t:ctx.window.mapTest,ids:()=>Array.from(ctx.selectedScheduleStoreIds()),setRole:v=>isAdmin=v,setMixed:v=>mixed=v,setEndpoints:v=>endpoints=v,rendered:()=>rendered};
}
test('map taps share planner selection, numbering and removal without duplicating sites',()=>{
 const {t,stores,markers,lines,ids,node}=setup();t.toggleStop(stores[1]);t.toggleStop(stores[0]);assert.deepEqual(ids(),['b','a']);
 assert.equal(markers.length,2);assert.equal(lines.filter(x=>x.options.color==='#2563eb').length,1);
 assert.equal(JSON.stringify(lines[1].points),JSON.stringify([[45.1,9.1],[45,9]]));
 assert.match(markers.find(x=>x.options.title.startsWith('1')).options.title,/B/);
 assert.equal(markers.find(x=>x.options.title.endsWith('A <nome>')).tooltip.label.textContent,'2 · A <nome>');
 assert.equal(node('.ogm-plan-count').textContent,'2 tappe selezionate');
 t.toggleStop(stores[1]);assert.deepEqual(ids(),['a']);assert.equal(lines.length,0);
});
test('reorder keeps extras and ordinary payload order; missing coordinates break the line',()=>{
 const {ctx,t,stores,ids,lines,node}=setup();ctx.setSchedulePickerValue('extra:x',true);t.toggleStop(stores[0]);t.toggleStop(stores[1]);t.moveStop('b',-1);
 assert.deepEqual(ids(),['extra:x','b','a']);assert.deepEqual(ids().filter(x=>!x.startsWith('extra:')),['b','a']);assert.match(node('.ogm-plan-note').textContent,/1 extra/);
 t.toggleStop(stores[2]);t.moveStop('c',-1);assert.deepEqual(ids(),['extra:x','b','c','a']);assert.equal(lines.length,0);assert.match(node('.ogm-plan-note').textContent,/1 senza posizione/);
 t.toggleStop(stores[2]);assert.equal(lines.length,2);
});
test('search preserves route and selected pins; mixed workspace respects existing scope',()=>{
 const {t,stores,markers,lines,setMixed}=setup();assert.equal(t.rows().length,3);t.toggleStop(stores[0]);t.toggleStop(stores[1]);t.search('no match');t.drawPins();assert.equal(markers.length,2);assert.equal(lines.length,2);
 setMixed(true);t.search('');assert.equal(t.rows().length,4);t.toggleStop(stores[3]);assert.equal(t.routeStores().length,3);
});
test('map does not edit selection for employees or while saving',()=>{
 const {t,stores,ids,setRole,node}=setup();setRole(false);t.toggleStop(stores[0]);assert.deepEqual(ids(),[]);setRole(true);node('scheduleForm').dataset.saving='true';t.toggleStop(stores[0]);assert.deepEqual(ids(),[]);
});
test('departure and return connect to work stops without becoming selected jobs',()=>{
 const {t,stores,markers,lines,ids,setEndpoints}=setup();
 setEndpoints({start:{label:'Casa',lat:44,lon:8},end:{label:'Genova',lat:44.4,lon:8.9}});
 t.toggleStop(stores[0]);t.toggleStop(stores[1]);
 assert.deepEqual(ids(),['a','b']);assert.equal(lines.filter(x=>x.options.color==='#2563eb').length,3);
 assert.equal(JSON.stringify(lines[1].points),JSON.stringify([[44,8],[45,9]]));
 assert.equal(JSON.stringify(lines[5].points),JSON.stringify([[45.1,9.1],[44.4,8.9]]));
 assert.equal(markers.filter(m=>m.options.icon.html.includes('ogm-endpoint-pin')).length,2);
 assert.match(markers.find(m=>m.options.title==='1 · A <nome>').options.icon.html,/>1</);
});
test('return to departure has one P/R marker and two route legs',()=>{
 const {t,stores,markers,lines,setEndpoints}=setup();const home={label:'Casa',lat:44,lon:8};setEndpoints({start:home,end:home});t.toggleStop(stores[0]);
 assert.equal(markers.filter(m=>m.options.icon.html.includes('ogm-endpoint-pin')).length,1);assert.ok(markers.some(m=>m.options.icon.html.includes('P/R')));assert.equal(lines.length,4);
});
