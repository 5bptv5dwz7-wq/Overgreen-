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
  const extras=[{id:'1',client_type:'eurospin',categoria_target:'verde',stato:'completato',closed_at:'2026-09-08T10:00:00Z',giorno_intervento:'2026-08-08'},{id:'2',client_type:'eurospin',stato:'annullato',giorno_intervento:'2026-09-08'},{id:'3',client_type:'intesa',giorno_intervento:'2026-09-08'},{id:'4',client_type:'eurospin',categoria_target:'pulizie',stato:'in_attesa',closed_at:'2026-09-02T10:00:00Z',data_richiesta:'2026-08-02'},{id:'5',client_type:'eurospin',giorno_intervento:'2026-08-01'}];
  assert.deepEqual(model.filterRows(extras,[],[],{month:'2026-09'}).map(x=>x.extra.id),['4','1']);
  assert.deepEqual(model.filterRows(extras,[{extra_id:'1',...cases[0].input,...model.rates('verde')}],[],{month:'2026-09',category:'verde',mode:'tariffa'}).map(x=>x.extra.id),['1']);
});
function uiSetup(){
  const dom=parseHTML(fs.readFileSync(__dirname+'/../index.html','utf8')),document=dom.document;
  Object.defineProperty(dom.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(v){for(const o of this.querySelectorAll('option'))if(o.value===String(v))o.setAttribute('selected','');else o.removeAttribute('selected')}});
  const c={excelDateValue:s=>s?new Date(s):null,extraRequestDate:e=>e.data_richiesta||null,document,window:{OvergreenEconomics:model},console,$:id=>document.getElementById(id),admin:()=>c.isAdmin,isAdmin:true,stores:[],extras:[{id:'e',client_type:'eurospin',categoria_target:'verde',nome_esterno:'<img src=x>',stato:'completato',closed_at:'2026-09-08T10:00:00Z',giorno_intervento:'2026-08-08'}],attachments:[],today:()=> '2026-09-08',esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),readAllRows:async()=>({data:[{extra_id:'e',...cases[0].input,...model.rates('verde')}]}),loadAll:async()=>{},openExtraHours:()=>{},renderExtras:()=>{}};
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
function excelBook(){
 const sheets=[];return {sheets,addWorksheet(name){const rows=[];const sheet={name,rows,mergeCells(){this.getRow(1)},getCell(){return {}},getRow(n){while(rows.length<n)rows.push({values:[],getCell(){return {}}});return rows[n-1]},addRow(values){const r={values,getCell(){return {}}};rows.push(r);return r}};sheets.push(sheet);return sheet}};
}
test('Eurospin export retains 18 exact headers, one sheet and unaccepted quote exclusion',()=>{
 const c=uiSetup(),book=excelBook(),input={...cases[8].input,...model.rates('verde')};
 c.addEconomicsWorksheet(book,[{extra:c.extras[0],row:input,calc:model.review(input,c.extras[0])}]);
 assert.equal(book.sheets.length,1);const sheet=book.sheets[0];
 assert.equal(sheet.rows[1].values.length,18);assert.equal(sheet.rows[1].values[10],'COSTO ORE ORDINARIE ');
 assert.equal(sheet.rows[1].values[17],'NOTE');assert.equal(sheet.rows[2].values[16],null);
 assert.match(sheet.rows[2].values[17],/escluso dal totale fatturato/);assert.match(sheet.autoFilter.to,/^R/);
});

test('V209 included targets and other closure profiles never enter the economic book',()=>{
 const extras=[{id:'paid',client_type:'eurospin',closure_profile:'eurospin'},{id:'included',client_type:'eurospin',closure_profile:'eurospin_ordinario'},{id:'legacy',client_type:'eurospin'},{id:'other',client_type:'eurospin',closure_profile:'privato'}];
 assert.equal(model.isBillableExtra(null),false);
 assert.deepEqual(model.filterRows(extras,[],[]).map(r=>r.extra.id),['paid','legacy']);
});

test('V212 discount is exact in cents and works with every pricing mode',()=>{
 for(const mode of ['tariffa','consuntivo','preventivo']){
  const r={...cases[0].input,...model.rates('verde'),pricing_mode:mode,quote_amount:120,quote_status:'accettato',discount_amount:19.99};
  const c=model.calculate(r);assert.equal(c.subtotal,32000);assert.equal(c.discount,1999);assert.equal(c.total,30001);
  assert.equal(model.calculate({...r,discount_amount:320}).total,0);
  assert.equal(model.calculate({...r,discount_amount:320.01}).complete,false);
  for(const bad of [-1,0.001,'abc'])assert.throws(()=>model.calculate({...r,discount_amount:bad}));
 }
});
test('Eurospin export keeps crew hours, expenses and discounts without extra columns',()=>{
 const c=uiSetup(),book=excelBook(),r={...cases[0].input,...model.rates('verde'),pricing_mode:'consuntivo',discount_amount:20,expenses:[{description:'Smaltimento',amount:50}]};
 c.addEconomicsWorksheet(book,[{extra:c.extras[0],row:r,closureNumber:'001234',calc:model.review(r,c.extras[0])}]);
 const v=book.sheets[0].rows[2].values;assert.equal(v.length,18);assert.equal(v[4],'001234');assert.equal(v[9],6);assert.equal(v[10],120);assert.equal(v[11],null);assert.equal(v[14],370);assert.equal(v[16],350);assert.match(v[17],/Smaltimento: 50/);assert.match(v[17],/Sconto: 20/);
});

test('V223 splits partial and full night work, with equipment, exact decimals and no extra operator multiplier',()=>{
 for(const equipment of [false,true])for(const night of [0,2.5,6]){
  const row={...cases[0].input,pricing_category:'pulizie',equipment,night_hours:night,...model.rates('pulizie',equipment)};
  const c=model.calculate(row),expected=(6-night)*(equipment?23:18)+night*(equipment?30:25);
  assert.equal(c.labor,Math.round(expected*100));assert.equal(c.total,Math.round(expected*100)+10000);
  assert.equal(c.dayHours,6-night);assert.equal(c.nightHours,night);assert.equal(c.complete,true);
 }
 const row={...cases[0].input,pricing_category:'pulizie',night_hours:1.33,total_hours:2.33,...model.rates('pulizie')};
 assert.equal(model.calculate(row).labor,5125);
});
test('V223 excessive night hours are incomplete, closure changes need review and quotes still replace labor',()=>{
 const row={...cases[0].input,pricing_category:'pulizie',night_hours:2,...model.rates('pulizie')};
 assert.equal(model.calculate({...row,night_hours:7}).complete,false);
 assert.equal(model.review(row,{categoria_target:'pulizie',night_hours:3}).ready,false);
 assert.equal(model.review(row,{categoria_target:'pulizie',night_hours:2}).ready,true);
 const quote=model.calculate({...row,pricing_mode:'preventivo',quote_status:'accettato',quote_amount:1000,quote_exit_included:true,discount_amount:20});
 assert.equal(quote.total,98000);assert.equal(quote.labor,12200);
});

test('V229 economic periods use Italian closure month; open and undated never fall back to scheduling',()=>{
 const extra=(id,values)=>({id,client_type:'eurospin',categoria_target:'verde',...values});
 const rows=[extra('oct',{stato:'completato',closed_at:'2026-09-30T22:30:00Z',giorno_intervento:'2026-09-01'}),extra('pending',{stato:'in_attesa',closed_at:'2026-10-04T10:00:00Z'}),extra('partial',{stato:'da_integrare',closed_at:'2026-10-01T10:00:00Z',giorno_intervento:'2026-10-01'}),extra('scheduled',{stato:'programmato',giorno_intervento:'2026-10-02'}),extra('missing',{stato:'completato',giorno_intervento:'2026-10-02'}),extra('invalid',{stato:'in_attesa',closed_at:'invalid',created_at:'2026-10-01'}),extra('cancelled',{stato:'annullato'})];
 const ids=month=>model.filterRows(rows,[],[],{month}).map(r=>r.extra.id).sort();
 assert.deepEqual(ids('2026-10'),['oct','pending']);assert.deepEqual(ids('2026-09'),[]);
 assert.deepEqual(ids('open'),['partial','scheduled']);assert.deepEqual(ids('undated'),['invalid','missing']);
 assert.equal(model.closureDate(rows[0]),'2026-10-01');
 assert.equal(model.period(extra('year',{stato:'completato',closed_at:'2026-12-31T23:15:00Z'})),'2027-01');
 rows[3].stato='in_attesa';rows[3].closed_at='2026-11-03T10:00:00Z';
 assert.deepEqual(ids('open'),['partial']);assert.deepEqual(ids('2026-11'),['scheduled']);
});
test('V229 period selector preserves Aperti through refresh and combines with category filters',async()=>{
 const c=uiSetup();c.extras.push({id:'open',client_type:'eurospin',categoria_target:'pulizie',stato:'ricevuto',titolo:'Aperto'}, {id:'undated',client_type:'eurospin',stato:'completato'});
 await c.loadExtraEconomics();c.renderExtraEconomicsBook();
 const select=c.$('extraEconomicsMonth');assert.deepEqual([...select.options].map(o=>o.value),['','open','2026-09','undated']);
 select.value='open';c.renderExtraEconomicsBook();assert.equal(select.value,'open');assert.equal(c.$('extraEconomicsBookList').children.length,1);assert.match(c.$('extraEconomicsBookList').textContent,/Aperti/);
 c.$('extraEconomicsBookCategory').value='verde';c.renderExtraEconomicsBook();assert.equal(c.$('extraEconomicsBookList').children.length,0);assert.equal(c.$('extraEconomicsBookExport').disabled,true);
});
test('Eurospin export preserves intervention date, notes open work and never invents a closure number',()=>{
 const c=uiSetup(),book=excelBook(),r={...cases[0].input,...model.rates('verde')};
 const extra={...c.extras[0],stato:'da_integrare',closed_at:null};
 c.addEconomicsWorksheet(book,[{extra,row:r,calc:model.review(r,extra)}]);
 const v=book.sheets[0].rows[2].values;assert.equal(v[2].toISOString().slice(0,10),'2026-08-08');assert.equal(v[4],'');assert.match(v[17],/Numero chiusura da verificare/);assert.match(v[17],/Intervento aperto/);
});

test('Cleaning export separates 5 euros per crew hour without duplicating equipment in totals',()=>{
 for(const equipment of [true,false])for(const night of [0,2.5,6]){
  const c=uiSetup(),book=excelBook(),r={...cases[0].input,pricing_category:'pulizie',equipment,night_hours:night,...model.rates('pulizie',equipment)};
  const extra={...c.extras[0],categoria_target:'pulizie',night_hours:night};
  c.addEconomicsWorksheet(book,[{extra,row:r,calc:model.review(r,extra)}]);
  const sheet=book.sheets[0],h=sheet.rows[1].values,v=sheet.rows[2].values;
  assert.equal(h.length,20);assert.equal(h[13],'ATTREZZATURE');assert.equal(h[14],'COSTO ATTREZZATURE');
  assert.equal(v[13],equipment?'SI':'NO');assert.equal(v[14],equipment?30:0);
  assert.equal(v[10],(6-night)*18+night*25);assert.equal(v[15],v[10]+v[14]);
  assert.equal(v[18],v[15]+100);assert.match(sheet.autoFilter.to,/^T/);
 }
});
