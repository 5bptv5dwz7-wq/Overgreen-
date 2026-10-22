const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../app.js','utf8'),model=require('../extra-economics.js');
function setup(records=[],isAdmin=true){
 const texts=[],pages=[];
 const c={admin:()=>isAdmin,window:{OvergreenEconomics:model},extraEconomicsRecords:records,PDFLib:{StandardFonts:{},rgb:()=>0},pdfSafeText:String,wrapPdfText:s=>[s],latestEconomicsReport:()=>null,economicsStatus:c=>c.complete?'Dati completi':'Da completare'};
 vm.createContext(c);vm.runInContext(source.slice(source.indexOf('async function appendExtraEconomicsPdf'),source.indexOf('async function createDailyReportWithEconomics')),c);
 const pdf={embedFont:async()=>({}),addPage:()=>{const p={drawText:(s,o)=>{assert(o.y>=55);texts.push(s)}};pages.push(p);return p}};
 return {c,pdf,texts,pages};
}
test('saved economics includes all expenses, notes, discount and existing calculated total across pages',async()=>{
 const row={extra_id:'a',pricing_mode:'consuntivo',pricing_category:'pulizie',total_hours:10,night_hours:2,hourly_rate:18,night_hourly_rate:25,exit_rate:50,dedicated_trip:true,operator_count:2,discount_amount:4,cleaning_scope:'esterni',expenses:Array.from({length:50},(_,i)=>({description:'Spesa '+i,amount:1})),economic_notes:'Nota finale'};
 const {c,pdf,texts,pages}=setup([row]);await c.appendExtraEconomicsPdf(pdf,{id:'a',titolo:'Extra',night_hours:2});
 assert(texts.some(t=>t.includes('340,00')));assert(texts.some(t=>t.includes('Spesa 49')));assert(texts.some(t=>t.includes('Nota finale')));assert(texts.some(t=>t.includes('IVA ordinaria')));assert(pages.length>1);
});
test('missing economics does not invent a zero total',async()=>{const {c,pdf,texts}=setup();await c.appendExtraEconomicsPdf(pdf,{id:'a'});assert(texts.includes('Economia non compilata'));assert(!texts.some(t=>t.startsWith('Totale')))});
test('worker cannot generate financial pages',async()=>{const {c,pdf}=setup([],false);await assert.rejects(c.appendExtraEconomicsPdf(pdf,{id:'a'}),/non consentito/)});
test('economic cache includes saved data and generation refreshes it',()=>{assert.match(source,/mode==='economics'\?\[admin\(\),extraEconomicsRecords,extraEconomicsError\]/);assert.match(source,/if\(!await loadExtraEconomics\(\)\)/)});
function singleContext(){
 const {parseHTML}=require('linkedom'),{document}=parseHTML('<article><div class="actions"><button data-client-download>Report cliente PDF</button></div></article>');
 const calls=[],extra={id:'one',titolo:'Singolo'},c={document,admin:()=>true,attachmentMediaScope:()=> 'admin',loadExtraEconomics:async()=>{calls.push('load');return true},extraEconomicsError:'Errore caricamento',extras:[extra],attachments:[{extra_id:'one',tipo:'rapportino_overgreen',id:'report'},{extra_id:'two',tipo:'rapportino_eurospin',id:'other'},{extra_id:'one',tipo:'pdf_richiesta',id:'request'}],createSingleClientReportFile:async(kind,row)=>{calls.push([kind,row.id]);return {file:{arrayBuffer:async()=>new ArrayBuffer(0)},fileName:'Report - Singolo.pdf'}},PDFLib:{PDFDocument:{load:async()=>({setTitle(){},save:async()=>new Uint8Array([1,2])})}},appendExtraEconomicsPdf:async(pdf,row)=>calls.push(['economics',row.id]),appendAttachmentForPackage:async(pdf,a)=>calls.push(['attachment',a.id]),pdfSafeText:String,File,shareClientReportData:async()=>{},alert:()=>{},attachmentLabel:a=>a.id};
 vm.createContext(c);vm.runInContext(source.slice(source.indexOf('async function createSingleExtraEconomicsReport'),source.indexOf('async function previewSingleClientReport')),c);return {c,calls,extra,card:document.querySelector('article')};
}
test('single export refreshes economics and includes only selected extra documents',async()=>{const {c,calls,extra}=singleContext();const result=await c.createSingleExtraEconomicsReport(extra);assert.deepEqual(calls,['load',['extra','one'],['economics','one'],['attachment','report'],['attachment','request']]);assert.match(result.fileName,/completo con economia/)});
test('single button sits beside report download and is hidden from workers',()=>{const {c,extra,card}=singleContext();c.appendSingleExtraEconomicsButton(card,extra);assert.equal(card.querySelector('[data-client-download]').nextElementSibling.textContent,'PDF completo con economia');const other=c.document.createElement('article');other.innerHTML='<div class="actions"></div>';c.admin=()=>false;c.appendSingleExtraEconomicsButton(other,extra);assert.equal(other.querySelector('button'),null)});
test('single export blocks failed loading and unreadable documents',async()=>{const {c,extra}=singleContext();c.loadExtraEconomics=async()=>false;await assert.rejects(c.createSingleExtraEconomicsReport(extra),/Errore caricamento/);c.loadExtraEconomics=async()=>true;c.appendAttachmentForPackage=async()=>{throw Error('file illeggibile')};await assert.rejects(c.createSingleExtraEconomicsReport(extra),/non incluso/)});
