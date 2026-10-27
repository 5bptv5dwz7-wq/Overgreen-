const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function app(){
 const harness=fs.readFileSync(__dirname+'/app-startup.cjs','utf8').split("console.log('PASS full application")[0];
 const c=new Function('require','__dirname',harness+';return c;')(require,__dirname),run=s=>vm.runInContext(s,c);
 run(`session={user:{id:'admin'}};profile=realProfile={id:'admin',nome:'Lorenzo',ruolo:'admin',attivo:true};profiles=[profile];stores=[{id:'s',nome:'PV TEST',client_type:'eurospin',attivo:true,cleaning_enabled:true,cleaning_start:'2026-01-01',ultimo_passaggio:'2026-10-20',intervallo_giorni:15}];extras=[];attachments=[];restoreExtraDraft=async()=>{};sb.rpc=async()=>({data:null});`);
 return {c,run};
}
test('V314 service selector and theme are limited to Sedi and Programmazione; drafts survive switching',()=>{
 const {c,run}=app(),bar=c.document.getElementById('serviceModeBar');
 run(`setView('schedule');setSchedulePickerValue('s',true);scheduleItemNoteDrafts.set('s','Nota verde');switchService('pulizie');`);
 assert.equal(run('schedulePickerSelected.size'),0);assert.equal(bar.hidden,false);assert(c.document.body.classList.contains('service-cleaning'));
 run(`setSchedulePickerValue('s',true);scheduleItemNoteDrafts.set('s','Nota pulizie');switchService('verde');`);
 assert.equal(run("scheduleItemNoteDrafts.get('s')"),'Nota verde');assert.equal(run("schedulePickerSelected.has('s')"),true);
 run(`switchService('pulizie');`);assert.equal(run("scheduleItemNoteDrafts.get('s')"),'Nota pulizie');
 for(const page of ['dashboard','extras','cleaning','stats']){run(`setView('${page}');`);assert.equal(bar.hidden,true,page);assert.equal(c.document.body.classList.contains('service-cleaning'),false,page);assert.equal(run('serviceForView()'),'verde');}
 run(`setView('stores');`);assert.equal(bar.hidden,false);assert(c.document.body.classList.contains('service-cleaning'));assert.equal(run('activeService'),'pulizie');
 run(`setView('schedule');`);assert.equal(run("schedulePickerSelected.has('s')"),true);assert.equal(run("scheduleItemNoteDrafts.get('s')"),'Nota pulizie');
 run(`profile={id:'worker',ruolo:'dipendente',attivo:true};setView('schedule');`);assert.equal(run('currentView'),'dashboard');assert.equal(bar.hidden,true);
});
test('V314 dashboard reminders include both services and open the correct service independently',()=>{
 const {c,run}=app();
 run(`activeService='pulizie';storeReminders=[{store_id:'s',service:'verde',active:true,note:'ERBA',requested_at:'2026-10-20T10:00:00Z',due_date:'2026-10-26'},{store_id:'s',service:'pulizie',active:true,note:'VETRI',requested_at:'2026-10-20T10:00:00Z',due_date:'2026-10-25'}];setView('dashboard');renderStoreReminderPanels();`);
 const root=c.document.getElementById('dashboardReminders');assert.match(root.textContent,/ERBA/);assert.match(root.textContent,/VETRI/);assert.equal(root.querySelector('[data-service-reminder]').dataset.serviceReminder,'pulizie');
 root.querySelector('[data-service-reminder="verde"] [data-reminder-edit]').click();assert.equal(c.document.getElementById('storeReminderForm').dataset.service,'verde');assert.equal(c.document.getElementById('storeReminderNote').value,'ERBA');
 root.querySelector('[data-service-reminder="pulizie"] [data-reminder-edit]').click();assert.equal(c.document.getElementById('storeReminderForm').dataset.service,'pulizie');
 root.querySelector('[data-service-reminder="verde"] [data-reminder-plan]').click();assert.equal(run('currentView'),'schedule');assert.equal(run('serviceForView()'),'verde');assert.equal(run("schedulePickerSelected.has('s')"),true);
 assert.doesNotMatch(c.document.getElementById('scheduleReminders').textContent,/VETRI/);
});
test('V314 planned work is specific to its date and forwards per-site notes',async()=>{
 const {c,run}=app();let call;c.capture=x=>call=x;
 run(`sb.rpc=async(name,p)=>{capture({name,p});return {data:{id:'plan'}}};cleaningPlanDrafts.set(cleaningPlanKey('s','2026-10-27'),['D/2']);cleaningPlanDrafts.set(cleaningPlanKey('s','2026-10-28'),['C/1']);`);
 await run(`cleaningPlanOperation({day:'2026-10-27',stores:['s'],item_notes:{s:'Chiavi in reception'}});`);
 assert.deepEqual(JSON.parse(JSON.stringify(call.p.p_payload.cleaning_stores)),[{id:'s',codes:['D/2'],note:'Chiavi in reception'}]);
 assert.equal(run("cleaningPlannedCodes(stores[0],'2026-10-28').join(',')"),'C/1');
});
test('V314 semester availability follows actual date and excludes the current reservation',()=>{
 const {c,run}=app();
 run(`extras=[{id:'visit',store_id:'s',categoria_target:'pulizie',cleaning_codes:['D/2'],cleaning_year:2026,cleaning_slot:1,stato:'programmato'},{id:'other',store_id:'s',categoria_target:'pulizie',cleaning_codes:['D/2'],cleaning_year:2026,cleaning_slot:2,stato:'completato'},{id:'next1',store_id:'s',categoria_target:'pulizie',cleaning_codes:['D/2'],cleaning_year:2027,cleaning_slot:1,stato:'completato'},{id:'next2',store_id:'s',categoria_target:'pulizie',cleaning_codes:['D/2'],cleaning_year:2027,cleaning_slot:2,stato:'programmato'}];$('closeExtraClosedAt').value='2026-10-27T12:00';renderCleaningClosure(extras[0]);validateCleaningExecution(extras[0],'2026-10-27',['D/2']);`);
 assert.equal(c.document.querySelector('#cleaningClosureChoices [data-clean-codes="D/2"]').disabled,false);
 run(`$('closeExtraClosedAt').value='2027-01-02T12:00';renderCleaningClosure(extras[0]);`);assert.equal(c.document.querySelector('#cleaningClosureChoices [data-clean-codes="D/2"]').disabled,true);
 assert.throws(()=>run(`validateCleaningExecution(extras[0],'2027-01-02',['D/2'])`),/Nessuna semestrale disponibile/);
 assert.equal(run('OvergreenCleaning.active({...stores[0],attivo:false},"2026-10-27")'),false);
});
test('V314 new ordinary registration validates first, retries one atomic RPC and never uploads documents',async()=>{
 const {c,run}=app(),calls=[],errors=[];c.capture=x=>calls.push(x);c.alert=x=>errors.push(x);
 run(`saveCurrentExtraDraft=async()=>{};extraDrafts.remove=async()=>{};notifyAdminClosure=async()=>{};refreshAfterSave=async()=>true;saveExtraUpload=async()=>{throw Error('Upload inatteso')};let failRegistration=true;sb.rpc=async(name,p)=>{capture({name,p});if(failRegistration){failRegistration=false;return {error:{message:'Rete non disponibile'}}}return {data:{id:p.p_request_id,store_id:p.p_store,cleaning_codes:p.p_codes,stato:'in_attesa'}}};openCleaningOrdinary(stores[0]);$('closeExtraClosedAt').value='2026-10-27T12:00';$('closeExtraTicket').value='';$('closeExtraNotes').value='Lavoro eseguito';`);
 const form=c.document.getElementById('closeExtraForm'),submit=()=>form.onsubmit({preventDefault(){},submitter:c.document.getElementById('closeExtraFinalBtn')});
 await submit();assert.equal(calls.length,0);assert.match(errors.pop(),/operatore/);
 const worker=c.document.querySelector('#closeExtraWorkers input');worker.checked=true;worker.setAttribute('checked','');
 await submit();assert.equal(calls.length,1);assert.equal(calls[0].name,'overgreen_cleaning_register_v314');assert.match(errors.pop(),/Rete non disponibile/);assert.equal(run('cleaningOrdinaryDraft._unsavedCleaning'),true);assert(c.document.getElementById('closeExtraDialog').hasAttribute('open'));
 await submit();assert.equal(calls.length,2);assert.equal(calls[1].name,'overgreen_cleaning_register_v314');assert.equal(calls[0].p.p_request_id,calls[1].p.p_request_id);assert.equal(calls[1].p.p_payload.note_lorenzo,'Lavoro eseguito');assert.equal(calls[1].p.p_workers[0],'admin');assert.equal(errors.length,0);assert.equal(c.document.getElementById('closeExtraDialog').hasAttribute('open'),false);assert.equal(run('cleaningOrdinaryDraft'),null);assert.equal(run("sessionStorage.getItem(cleaningOrdinaryDraftKey('s'))"),null);
});
test('V314 approval lists show contract cleaning as ordinary and retain documents for hourly Targets',()=>{
 const {c,run}=app();
 run(`extras=[{id:'ordinary',store_id:'s',client_type:'eurospin',categoria_target:'pulizie',stato:'in_attesa',giorno_intervento:'2026-10-27',cleaning_codes:['A/1','A/2'],cleaning_done_codes:['A/1','A/2']}];renderPending();`);
 const list=c.document.getElementById('pendingList');assert.match(list.textContent,/Ordinario · Pulizie/);assert.doesNotMatch(list.textContent,/EXTRA|File Eurospin|File Overgreen|Eseguito in/);assert(list.querySelector('[data-approve]'));
 run(`extras=[{...extras[0],id:'target',cleaning_codes:['TARGET'],cleaning_done_codes:null}];renderPending();`);assert.match(list.textContent,/EXTRA/);assert.match(list.textContent,/File Eurospin/);assert.match(list.textContent,/File Overgreen/);
});
test('V314 adding sites to an existing day keeps task checkboxes out of the selected jobs',()=>{
 const {c,run}=app();run(`schedules=[{id:'day',giorno:'2026-10-28'}];setView('schedule');switchService('pulizie');openAddScheduleItems(schedules[0]);`);
 const checkbox=c.document.querySelector('#addScheduleStores [data-clean-store]');checkbox.checked=true;checkbox.setAttribute('checked','');checkbox.onchange();
 assert.equal(c.document.querySelectorAll('#addScheduleStores [data-clean-codes]').length,4);assert.equal(c.document.querySelectorAll('#addScheduleStores [data-clean-store]').length,1);
 run(`renderAddSchedulePicker();`);assert.equal(c.document.querySelectorAll('#addScheduleStores [data-clean-store]:checked').length,1);assert.equal(c.document.querySelectorAll('#addScheduleStores [data-clean-codes]').length,4);
 run(`openAddScheduleItems(schedules[0]);`);assert.equal(c.document.querySelectorAll('#addScheduleStores [data-clean-store]:checked').length,0);
});
test('V314 Target conversion never silently falls back to hourly work and does not force planning',async()=>{
 const {c,run}=app(),calls=[],errors=[];c.capture=x=>calls.push(x);c.alert=x=>errors.push(x);
 run(`extras=[{id:'target',store_id:'s',client_type:'eurospin',categoria_target:'pulizie',stato:'ricevuto',cleaning_codes:['TARGET']}];sb.rpc=async(name,p)=>{capture({name,p});return {data:{id:'target'}}};loadAll=async()=>{};openProgramExtraDialog=()=>{throw Error('Programmazione inattesa')};cleaningOpen('s','target');$('cleaningVisitDay').value='2026-10-27';$('cleaningRequestMatch').checked=true;stores[0].cleaning_enabled=false;`);
 await run(`cleaningSaveVisit({preventDefault(){}})`);assert.equal(calls.length,0);assert.match(errors.pop(),/Affidamento/);
 run(`stores[0].cleaning_enabled=true;`);await run(`cleaningSaveVisit({preventDefault(){}})`);assert.equal(calls.length,1);assert.equal(calls[0].p.p_existing,'target');assert.equal(calls[0].p.p_codes.join(','),'D/2');assert.equal(errors.length,0);
});
