const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom'),model=require('../extra-economics.js'),cases=require('./economics-cases.json');
for(const scenario of cases)test(scenario.name,()=>{
  const row={...scenario.input,...model.rates(scenario.input.pricing_category,scenario.input.equipment)},calc=model.calculate(row);
  for(const [key,value] of Object.entries(scenario.expected))assert.deepEqual(calc[key],value,key);
});
test('changed category/report and unaccepted quotes cannot contribute to the verified sum',()=>{
  const row={...cases[0].input,...model.rates('verde'),source_attachment_id:'old'};
  assert.equal(model.review(row,{categoria_target:'pulizie'},{id:'new'}).ready,false);
  assert.equal(model.review(row,{categoria_target:'verde'},{id:'old'}).ready,true);
  assert.equal(model.review({...row,pricing_mode:'preventivo',quote_amount:10,quote_status:'inviato'},{categoria_target:'verde'},{id:'old'}).ready,false);
});
test('month/category/mode filters include drafts and exclude other clients or cancelled extras',()=>{
  const extras=[{id:'1',client_type:'eurospin',categoria_target:'verde',stato:'completato',giorno_intervento:'2026-09-08'},{id:'2',client_type:'eurospin',stato:'annullato',giorno_intervento:'2026-09-08'},{id:'3',client_type:'intesa',giorno_intervento:'2026-09-08'},{id:'4',client_type:'eurospin',categoria_target:'pulizie',data_richiesta:'2026-09-02'},{id:'5',client_type:'eurospin',giorno_intervento:'2026-08-01'}];
  assert.deepEqual(model.filterRows(extras,[],[],{month:'2026-09'}).map(x=>x.extra.id),['4','1']);
  assert.deepEqual(model.filterRows(extras,[{extra_id:'1',...cases[0].input,...model.rates('verde')}],[],{month:'2026-09',category:'verde',mode:'tariffa'}).map(x=>x.extra.id),['1']);
});
function uiSetup(){
  const dom=parseHTML(fs.readFileSync(__dirname+'/../index.html','utf8')),document=dom.document;
  Object.defineProperty(dom.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(v){for(const o of this.querySelectorAll('option'))if(o.value===String(v))o.setAttribute('selected','');else o.removeAttribute('selected')}});
  const c={document,window:{OvergreenEconomics:model},console,$:id=>document.getElementById(id),admin:()=>c.isAdmin,isAdmin:true,stores:[],extras:[{id:'e',client_type:'eurospin',categoria_target:'verde',nome_esterno:'<img src=x>',stato:'completato',giorno_intervento:'2026-09-08'}],attachments:[],today:()=> '2026-09-08',esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),readAllRows:async()=>({data:[{extra_id:'e',...cases[0].input,...model.rates('verde')}]}),loadAll:async()=>{},openExtraHours:()=>{},renderExtras:()=>{}};
  c.$('extraEconomicsBook').showModal=()=>c.$('extraEconomicsBook').setAttribute('open','');c.$('extraEconomicsBook').close=()=>c.$('extraEconomicsBook').removeAttribute('open');
  vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../extra-economics-ui.js','utf8'),c);return c;
}
test('monthly summary renders money and literal labels, opens exact extra, and clears on role change',async()=>{
  const c=uiSetup();let opened;c.openExtraHours=e=>opened=e;await c.loadExtraEconomics();c.openExtraEconomicsBook();await new Promise(r=>setImmediate(r));
  assert.equal(c.$('extraEconomicsBookList').querySelectorAll('img').length,0);assert.match(c.$('extraEconomicsBookSummary').textContent,/320,00/);
  c.$('extraEconomicsBookList').querySelector('button').click();assert.equal(opened.id,'e');
  c.isAdmin=false;c.syncExtraEconomicsRole();assert.equal(c.$('extraEconomicsBookList').childElementCount,0);assert.equal(vm.runInContext('extraEconomicsRecords.length',c),0);
});
test('failed economic fetch does not present a zero balance or allow export',async()=>{
  const c=uiSetup();c.readAllRows=async()=>({error:Error('offline')});await c.loadExtraEconomics();c.renderExtraEconomicsBook();
  assert.match(c.$('extraEconomicsBookStatus').textContent,/non caricati/);assert(c.$('extraEconomicsBookExport').disabled);assert.equal(c.$('extraEconomicsBookSummary').childElementCount,0);
});
test('Excel columns retain nullable amounts and exclude a draft quote from the summary sum',()=>{
  const c=uiSetup(),sheets=[];
  const workbook={addWorksheet(name){const rows=[];const sheet={name,rows,getRow(n){return rows[n-1]||(rows[n-1]={getCell(){return {}}})},addRow(values){const r={values,getCell(){return {}}};rows.push(r);return r},eachRow(fn){rows.forEach(fn)}};sheets.push(sheet);return sheet}};
  const input={...cases[8].input,...model.rates('verde')},row={extra:c.extras[0],row:input,calc:model.review(input,c.extras[0])};
  c.addEconomicsWorksheet(workbook,[row]);const values=sheets[0].rows[1].values;
  assert.equal(values[18],1200);assert.equal(values[19],'No');assert.equal(sheets[1].rows[2].values[1],0);
});
