// V235: customer timing constraints are independent of scheduling dates.
function extraDateRule(e){
 if(e?.execution_date&&['on','not_before'].includes(e.execution_date_mode))return {mode:e.execution_date_mode,date:e.execution_date};
 if(e?.deadline_at){const d=new Date(e.deadline_at);if(Number.isFinite(d.getTime()))return {mode:'deadline',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(d),at:e.deadline_at}}
 return null;
}
function extraDateRuleText(e){const r=extraDateRule(e);if(!r)return '';return r.mode==='on'?`TASSATIVAMENTE IL ${fmt(r.date)}`:r.mode==='not_before'?`NON PRIMA DEL ${fmt(r.date)}`:`ENTRO IL ${new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',dateStyle:'short',timeStyle:'short'}).format(new Date(r.at))}`}
function extraDatePlanIssue(e,day){
 const r=extraDateRule(e);if(!r||!day)return '';
 if(r.mode==='on'&&day!==r.date||r.mode==='not_before'&&day<r.date||r.mode==='deadline'&&day>r.date)return `${e.numero_target?'Target '+e.numero_target+' · ':''}${e.titolo||'Extra'}: ${extraDateRuleText(e)}. Data scelta: ${fmt(day)}.`;
 return '';
}
function extraDateRuleMarkup(e){
 const r=extraDateRule(e);if(!r)return '';
 const closed=['in_attesa','completato','annullato'].includes(e.stato),late=!closed&&r.mode!=='not_before'&&(r.mode==='deadline'?Date.parse(r.at)<Date.now():r.date<today());
 const issue=!closed?extraDatePlanIssue(e,e.giorno_intervento):'';
 return `<div class="deadline extra-date-rule ${late?'late':''} ${r.mode}"><strong>${esc(extraDateRuleText(e))}</strong>${late?'<small>⚠ Data superata · da gestire</small>':!closed&&r.date===today()?`<small>${r.mode==='not_before'?'✓ Eseguibile da oggi':'⚠ OGGI'}</small>`:''}${!closed&&r.mode==='not_before'&&r.date>today()?'<small>Non eseguire in anticipo</small>':''}${issue?`<small>⚠ Programmazione non conforme: ${fmt(e.giorno_intervento)}</small>`:''}</div>`;
}
function syncExtraDateRuleForm(prefix){
 const mode=$(prefix+'DateRule').value;
 $(prefix+'Deadline').closest('label').hidden=mode!=='deadline';$(prefix+'Deadline').required=mode==='deadline';
 $(prefix+'RuleDate').closest('label').hidden=!['on','not_before'].includes(mode);$(prefix+'RuleDate').required=['on','not_before'].includes(mode);
 $(prefix+'DateRuleHelp').textContent={none:'Nessun vincolo: scegli liberamente la data di programmazione.',deadline:'Termine massimo: il lavoro può essere eseguito anche prima.',on:'Giorno preciso richiesto dal cliente. Resta distinto dalla programmazione della squadra.',not_before:'Il lavoro può essere eseguito da questa data in avanti, mai prima.'}[mode];
}
function fillExtraDateRuleForm(prefix,e={}){
 const r=extraDateRule(e);$(prefix+'DateRule').value=r?.mode||'none';$(prefix+'RuleDate').value=r&&r.mode!=='deadline'?r.date:'';$(prefix+'Deadline').value=e.deadline_at?isoToLocalInput(e.deadline_at):'';syncExtraDateRuleForm(prefix);
}
function readExtraDateRuleForm(prefix){
 const mode=$(prefix+'DateRule').value,date=$(prefix+'RuleDate').value,deadline=$(prefix+'Deadline').value;
 if(mode==='deadline'&&!deadline||['on','not_before'].includes(mode)&&!date)throw Error('Indica la data del vincolo scelto.');
 return {execution_date_mode:['on','not_before'].includes(mode)?mode:null,execution_date:['on','not_before'].includes(mode)?date:null,deadline_at:mode==='deadline'?new Date(deadline).toISOString():null};
}
function validateExtraDatePlans(rows,day){const issues=rows.map(e=>extraDatePlanIssue(e,day)).filter(Boolean);if(issues.length)throw Error('La data non rispetta i vincoli del cliente:\n\n'+issues.join('\n')+'\n\nScegli una data compatibile oppure modifica prima il vincolo, se concordato col cliente.');}
function validateExtraDateOperation(operation,payload){
 if(operation==='extra_create'){validateExtraDatePlans([payload.extra],payload.extra.giorno_intervento);return}
 if(operation==='schedule_create'){
  const chosen=extras.filter(e=>(payload.extras||[]).includes(e.id)||e.con_ordinario&&!e.schedule_item_id&&(payload.stores||[]).includes(e.store_id)&&!['completato','in_attesa','annullato'].includes(e.stato));validateExtraDatePlans(chosen,payload.day);
 }
 if(operation==='schedule_date')validateExtraDatePlans(extras.filter(e=>(e.schedule_id===payload.id||scheduleItems.some(i=>i.id===e.schedule_item_id&&i.schedule_id===payload.id))&&!['completato','in_attesa','annullato'].includes(e.stato)),payload.day);
}
function confirmExtraDateExecution(rows,day){
 const issues=rows.map(e=>extraDatePlanIssue(e,day)).filter(Boolean);
 return !issues.length||confirm('ATTENZIONE: la data non rispetta il vincolo del cliente.\n\n'+issues.join('\n')+'\n\nConfermi che il lavoro è stato realmente eseguito in questa data?');
}
function renderExtraDateAlerts(){
 const open=extras.filter(e=>extraDateRule(e)&&!['in_attesa','completato','annullato'].includes(e.stato)).sort((a,b)=>extraDateRule(a).date.localeCompare(extraDateRule(b).date));
 for(const id of ['dashboardExtraDates','scheduleExtraDates']){
  const host=$(id);if(!host)continue;host.hidden=!open.length;host.innerHTML='';if(!open.length)continue;
  host.innerHTML='<h2>📅 Extra con date da rispettare</h2>';
  for(const e of open){const st=stores.find(s=>s.id===e.store_id),r=document.createElement('article');r.className='reminder-panel-row';r.innerHTML=`<strong>${esc(st?.nome||e.nome_esterno||'Extra')} · ${esc(e.titolo)}</strong>${e.numero_target?`<small>Target ${esc(e.numero_target)}</small>`:''}${extraDateRuleMarkup(e)}<small>${e.giorno_intervento?'In programma: '+fmt(e.giorno_intervento):'⚠ Da programmare'}</small><div class="actions"><button type="button" class="secondary">Apri extra</button></div>`;r.querySelector('button').onclick=()=>openExtraById(e.id);host.appendChild(r)}
 }
}
for(const prefix of ['extra','extraEdit'])document.getElementById(prefix+'DateRule').addEventListener('change',()=>syncExtraDateRuleForm(prefix));
