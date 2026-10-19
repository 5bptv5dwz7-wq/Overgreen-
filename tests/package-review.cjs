const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const model=require('../extra-economics.js');
const tick=()=>new Promise(r=>setImmediate(r));
function setup(){
 const {document,HTMLSelectElement}=parseHTML('<html><body><dialog id="extraEconomicsBook"></dialog><select id="extraEconomicsMonth"><option value="2026-10">Ottobre</option></select></body></html>');
 Object.defineProperty(HTMLSelectElement.prototype,'value',{configurable:true,get(){return this._value??this.querySelector('option')?.value??''},set(v){this._value=String(v)}});
 const create=document.createElement.bind(document);document.createElement=t=>{const el=create(t);if(t==='dialog'){el.showModal=()=>el.setAttribute('open','');el.close=()=>el.removeAttribute('open')}if(t==='canvas')el.getContext=()=>({});return el};document.getElementById('extraEconomicsBook').close=()=>{};
 const e={id:'e',numero_target:'123',titolo:'Pulizia',categoria_target:'verde',stato:'completato',closed_at:'2026-10-10T10:00:00Z',giorno_intervento:'2026-10-10'};
 const row={extra_id:'e',pricing_mode:'tariffa',pricing_category:'verde',dedicated_trip:false,operator_count:1,total_hours:2,hourly_rate:20,exit_rate:100,source_attachment_id:'eu'};
 const at=[{id:'eu',extra_id:'e',tipo:'rapportino_eurospin',mime_type:'application/pdf',nome_file:'eu.pdf'},{id:'ov',extra_id:'e',tipo:'rapportino_overgreen',mime_type:'application/pdf',nome_file:'ov.pdf'}];
 const c={console,document,window:{OvergreenEconomics:model,devicePixelRatio:1},admin:()=>c.isAdmin,isAdmin:true,extras:[e],stores:[],attachments:at,extraEconomicsError:'',extraEconomicsRecords:[row],economicsExcludedIds:new Set(),extraEconomicsBookRows:[{extra:e,row,calc:model.review(row,e,at[0])}],$:id=>document.getElementById(id),restoreExtraEconomicsBook:()=>{},loadAll:async()=>{},signedAttachmentUrl:async a=>'https://test/'+a.id,ensureLibraries:async()=>{},readClosureNumberFromEurospinFile:async()=>({number:'123456'}),economicsZipIssues:()=>[],setTimeout:()=>{},URL:{createObjectURL:()=>{c.downloads++;return 'blob:test'},revokeObjectURL:()=>{}},downloads:0,context:{extra_id:'e',fingerprint:'v1',review:null},openAttachment:async()=>{},prompt:()=> 'Foto errata'};
 c.window.pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:2,destroy:()=>{},getPage:async()=>({getViewport:({scale})=>({width:600*scale,height:800*scale}),render:()=>({promise:Promise.resolve(),cancel(){}})})}),destroy(){}})};
 c.window.ExcelJS={Workbook:class{constructor(){this.worksheets=[];this.xlsx={writeBuffer:async()=>new Uint8Array([1]),load:async()=>{this.worksheets=[fakeSheet()]}}}}};
 function fakeSheet(){return {columnCount:2,rowCount:3,getRow:n=>({getCell:i=>({value:n===2?['TARGET','TOTALE'][i-1]:['123',40][i-1]})})}}
 c.addEconomicsWorksheet=(b,rows)=>{b.worksheets.push(fakeSheet())};
 c.sb={rpc:async(name,args)=>{if(name==='extra_package_review_context')return {data:[structuredClone(c.context)]};if(name==='save_extra_package_review'){
  if(args.p_fingerprint!==c.context.fingerprint)return {error:Error('Dati cambiati')};
  const r=c.context.review||{fingerprint:c.context.fingerprint,checks:{}};r.checks=args.p_step==='reset'?{}:{...r.checks,[args.p_step]:args.p_value};r.closure_number=args.p_number;r.note=args.p_note;c.context.review=r;return {data:structuredClone(r)};
 }throw Error(name)}};
 c.buildEconomicsZipUnderLimit=async()=>({size:1000});
 c.window.JSZip={loadAsync:async()=>({files:{a:{name:'Verde/001.pdf',async:async()=>new Uint8Array([1])},b:{name:'Verde/Excel.xlsx',async:async()=>new Uint8Array([1])}}})};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../package-review.js','utf8'),c);return c;
}
const byText=(c,label)=>[...c.document.querySelectorAll('button')].find(b=>b.textContent===label);
async function pages(c){byText(c,'→').onclick();await tick();await tick()}
test('Guided review requires all pages, saves each step and matches the final archive before download',async()=>{
 const c=setup();await c.window.PackageReview.open();
 assert.equal(c.$('pr-accept').disabled,true);await pages(c);assert.equal(c.$('pr-accept').disabled,false);
 await c.$('pr-accept').onclick();assert.equal(c.context.review.checks.eurospin,true);assert.equal(c.$('pr-accept').disabled,true);
 await pages(c);await c.$('pr-accept').onclick();assert.equal(c.context.review.checks.overgreen,true);
 assert.equal(c.$('pr-number').value,'123456');await c.$('pr-accept').onclick();assert.equal(c.context.review.checks.economics,true);
 assert.equal(c.$('pr-build').disabled,false);await c.$('pr-build').onclick();assert.equal(c.$('pr-download').disabled,true);
 await byText(c,'Verde/001.pdf').onclick();await pages(c);await byText(c,'Confermo leggibilità di tutte le pagine').onclick();
 await byText(c,'Verde/Excel.xlsx').onclick();const check=c.document.querySelector('[data-pr-file="Verde/Excel.xlsx"]');check.checked=true;check.onchange();
 assert.equal(c.$('pr-download').disabled,false);await c.$('pr-download').onclick();assert.equal(c.downloads,1);
});
test('Changes after review invalidate confirmations and prevent download',async()=>{
 const c=setup();c.context.review={fingerprint:'v1',checks:{eurospin:true,overgreen:true,economics:true},closure_number:'123456'};
 await c.window.PackageReview.open();c.context.fingerprint='v2';await c.$('pr-build').onclick();assert.equal(c.$('pr-build').disabled,true);assert.match(c.$('pr-status').textContent,/cambiati/);assert.equal(c.downloads,0);
});
test('Role loss closes and removes sensitive preview data',async()=>{
 const c=setup();await c.window.PackageReview.open();c.isAdmin=false;c.window.PackageReview.clearForRole();assert.equal(c.document.getElementById('packageReviewDialog').hasAttribute('open'),false);assert.equal(c.$('pr-content').textContent,'');
});
test('Review fingerprints include review changes as well as data changes',()=>{
 const c=setup(),a=new Map([['e',{fingerprint:'same',review:{closure_number:'123456'}}]]),b=new Map([['e',{fingerprint:'same',review:{closure_number:'123457'}}]]);assert.equal(c.window.PackageReview.same(a,b),false);assert.equal(c.window.PackageReview.approved({fingerprint:'new',review:{fingerprint:'old',checks:{eurospin:true,overgreen:true,economics:true},closure_number:'123456'}}),false);
});
