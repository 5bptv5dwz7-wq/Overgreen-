const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8').split('function hasJourneyEndpoints(schedule){')[1].split('async function hydrateScheduleTravel')[0];
class El{
 constructor(){this.children=[];this.nodes={};this.textContent=''}
 set innerHTML(v){this.html=v}
 querySelector(s){return this.nodes[s]||=new El()}
 appendChild(e){this.children.push(e)}
 insertBefore(e){this.children.push(e)}
 after(e){this.afterNode=e}
}
function setup(overrides={}){
 const ctx={stores:[{id:'a',nome:'A'},{id:'b',nome:'B'}],scheduleItems:[{id:'2',schedule_id:'s',store_id:'b',tipo:'ordinario',posizione:4},{id:'1',schedule_id:'s',store_id:'a',tipo:'ordinario',posizione:1,stato:'completato'},{id:'3',schedule_id:'other',store_id:'a',tipo:'ordinario'},{id:'4',schedule_id:'s',store_id:'a',tipo:'ordinario',stato:'riportato'}],scheduleActivities:[],allExtraOccurrences:()=>[],routeAddressForStore:s=>s?'store:'+s.id:'',routeAddressForExtra:e=>e.address,activityRouteAddress:a=>a.indirizzo,extraRoutePosition:e=>e.posizione_giro,document:{createElement:()=>new El()},window:{},formatTravelMinutes:n=>n+' min',renderTravelError:el=>el.textContent='errore',routeBetweenAddresses:async()=>({km:10,minutes:15}),...overrides};vm.createContext(ctx);vm.runInContext('function hasJourneyEndpoints(schedule){'+src,ctx);return ctx;
}
const schedule={id:'s',route_endpoints:{start:{label:'Casa',lat:44,lon:9},end:{label:'Genova',lat:44.4,lon:8.9}}};
test('full order includes completed stops, endpoints, mixed work; excludes other schedules and rolled items',()=>{
 const c=setup({allExtraOccurrences:()=>[{id:'e',schedule_id:'s',posizione_giro:2,titolo:'Extra',address:'E'},{id:'linked',schedule_id:'s',schedule_item_id:'1'}],scheduleActivities:[{id:'act',schedule_id:'s',posizione:3,titolo:'Attività',indirizzo:'C'}]});
 assert.deepEqual(Array.from(c.scheduleJourneyStops(schedule),s=>s.address),['44,9','store:a','E','C','store:b','44.4,8.9']);
 assert.equal(c.hasJourneyEndpoints({}),false);
});
test('road total includes start and return; endpoint legs are visible',async()=>{
 const c=setup(),section=new El();await c.hydrateJourneyTravel(section,schedule,()=>true);const panel=section.querySelector('.schedule-card-head').afterNode;
 assert.match(panel.querySelector('[data-total]').textContent,/30.0 km · 45 min/);assert.equal(panel.children.length,2);assert.equal(panel.querySelector('[data-legs]').children.length,1);
});
test('failed leg yields partial total, never a fabricated complete route',async()=>{
 let n=0;const c=setup({routeBetweenAddresses:async()=>{if(++n===2)throw Error('offline');return {km:8,minutes:10,approximate:true}}}),section=new El();await c.hydrateJourneyTravel(section,schedule,()=>true);
 const text=section.querySelector('.schedule-card-head').afterNode.querySelector('[data-total]').textContent;assert.match(text,/Totale parziale: ≈ 16.0 km · 20 min/);assert.match(text,/posizioni indicative/);
});
test('single work stop with return only still calculates',async()=>{
 const c=setup({scheduleItems:[{id:'1',schedule_id:'s',store_id:'a',tipo:'ordinario'}]}),section=new El();await c.hydrateJourneyTravel(section,{id:'s',route_endpoints:{end:schedule.route_endpoints.end}},()=>true);assert.match(section.querySelector('.schedule-card-head').afterNode.querySelector('[data-total]').textContent,/10.0 km/);
});
test('stale async result cannot overwrite refreshed view',async()=>{
 let active=true;const c=setup({routeBetweenAddresses:async()=>{active=false;return {km:1,minutes:1}}}),section=new El();await c.hydrateJourneyTravel(section,schedule,()=>active);assert.match(section.querySelector('.schedule-card-head').afterNode.querySelector('[data-total]').textContent,/^$/);
});
