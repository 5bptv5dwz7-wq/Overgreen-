const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('cleaning screen: real application bindings, contract activation, shared visit and request classification',async()=>{
 const harness=fs.readFileSync(__dirname+'/app-startup.cjs','utf8').split("console.log('PASS full application")[0];
 // Run the same application startup harness, exposing its VM for these interactions.
 const wrapper=new Function('require','__dirname',harness+';return c;');const c=wrapper(require,__dirname),run=s=>vm.runInContext(s,c);
 const errors=[];c.alert=x=>errors.push(x);
 run(`sb.rpc=async()=>({data:null});session={user:{id:'test-admin'}};profile=realProfile={id:'test-admin',ruolo:'admin',attivo:true};profiles=[profile];
 stores=[{id:'s',nome:'PV prova',client_type:'eurospin',attivo:true,cleaning_enabled:true,cleaning_start:'2026-01-01'},{id:'other',nome:'PV senza ordinarie',client_type:'eurospin',attivo:true}];
 extras=[];extraWorkers=[];attachments=[];extraWorkItems=[];cleaningTab='due';setView('cleaning');`);
 assert.match(c.document.getElementById('cleaningContent').textContent,/PV prova/);
 assert.doesNotMatch(c.document.getElementById('cleaningContent').textContent,/PV senza ordinarie/);
 run(`cleaningOpen('s');`);assert.equal(c.document.querySelectorAll('#cleaningVisitCodes input').length,5);
 assert.equal(c.document.querySelectorAll('#cleaningVisitCodes input:checked').length,4);
 let payload,scheduled;
 c.capture=p=>payload=p;c.schedule=e=>scheduled=e;
 run(`sb.rpc=async(name,p)=>{capture(p);return {data:{id:'visit'}}};loadAll=async()=>{extras=[{id:'visit',store_id:'s',categoria_target:'pulizie',client_type:'eurospin',cleaning_codes:['A/1','A/2'],stato:'ricevuto'}]};openProgramExtraDialog=e=>schedule(e);`);
 await run(`cleaningSaveVisit({preventDefault(){}})`);
 assert.equal(payload.p_codes.length,4);assert.equal(scheduled.id,'visit');assert.equal(errors.length,0);
 run(`extras=[{id:'target',store_id:'s',categoria_target:'pulizie',client_type:'eurospin',stato:'ricevuto',giorno_intervento:'2026-10-27'}];cleaningOpen('s','target');$('cleaningRequestMatch').checked=true;cleaningVisitOptions();`);
 assert.match(c.document.getElementById('cleaningRequestOutcome').textContent,/D\/2/);
 await run(`cleaningSaveVisit({preventDefault(){}})`);assert.deepEqual(Array.from(payload.p_codes),['D/2']);assert.equal(payload.p_existing,'target');
 run(`profile={id:'worker',ruolo:'dipendente'};cleaningTab='due';renderCleaning();`);assert.equal(c.document.getElementById('cleaningAdminActions').hidden,true);
});
