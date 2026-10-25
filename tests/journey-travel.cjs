const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8'),source=app.slice(app.indexOf('function addJourneyEndpointCards('),app.indexOf('function historyStatusLabel('));
class El{
 constructor(){this.dataset={};this.nodes={};this.textContent=''}
 before(e){const siblings=this.siblings;siblings.splice(siblings.indexOf(this),0,e);e.siblings=siblings}
 after(e){const siblings=this.siblings;siblings.splice(siblings.indexOf(this)+1,0,e);e.siblings=siblings}
 querySelector(s){return this.nodes[s]||=new El()}
}
const schedule={route_endpoints:{start:{label:'Casa',lat:44,lon:9},end:{label:'Genova',lat:44.4,lon:8.9}}};
function setup(n=2,route){
 const cards=Array.from({length:n},(_,i)=>Object.assign(new El(),{dataset:{routeAddress:'store:'+i}})),head=new El(),siblings=[head,...cards];siblings.forEach(e=>e.siblings=siblings);
 const section={querySelectorAll:()=>cards,querySelector:()=>head},calls=[];
 const ctx={document:{createElement:()=>new El()},esc:s=>s.replaceAll('<','&lt;'),travelRenderToken:1,scheduleTravelRenderToken:1,formatTravelMinutes:n=>n+' min',renderTravelError:el=>el.textContent='errore',routeBetweenAddresses:async(a,b)=>{calls.push([a,b]);return route?route(a,b):{km:10,minutes:15}}};vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,section,cards,head,siblings,calls};
}
test('dashboard keeps inline distances, departure first and arrival last',async()=>{
 const {ctx,section,siblings,calls}=setup();await ctx.hydrateWorkerTravel(section,1,schedule);
 assert.deepEqual(calls,[['44,9','store:0'],['store:0','store:1'],['store:1','44.4,8.9']]);
 assert.deepEqual(siblings.slice(2).map(e=>e.dataset.routeAddress||'distance'),['44,9','distance','store:0','distance','store:1','distance','44.4,8.9']);
 assert.match(siblings[1].querySelector('span').textContent,/30 km · 45 min/);
});
test('planning uses the same inline layout with one job and return only',async()=>{
 const {ctx,section,calls,siblings}=setup(1);await ctx.hydrateScheduleTravel(section,1,{route_endpoints:{end:schedule.route_endpoints.end}});assert.deepEqual(calls,[['store:0','44.4,8.9']]);assert.equal(siblings.at(-1).dataset.routeAddress,'44.4,8.9');
});
test('no endpoints preserves existing travel between jobs',async()=>{
 const {ctx,section,calls,siblings}=setup();await ctx.hydrateWorkerTravel(section,1);assert.deepEqual(calls,[['store:0','store:1']]);assert.equal(siblings.filter(e=>e.className==='journey-endpoint-card').length,0);
});
test('failed boundary leg marks total partial',async()=>{
 const {ctx,section,siblings}=setup(2,async(a)=>{if(a==='44,9')throw Error('offline');return {km:8,minutes:10}});await ctx.hydrateWorkerTravel(section,1,schedule);assert.match(siblings[1].querySelector('span').textContent,/16 km · 20 min di guida · parziale/);
});
test('no work cards does not calculate a phantom direct home trip',async()=>{
 const {ctx,section,calls}=setup(0);await ctx.hydrateWorkerTravel(section,1,schedule);assert.equal(calls.length,0);
});
