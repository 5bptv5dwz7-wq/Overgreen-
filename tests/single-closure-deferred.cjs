const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('app.js','utf8');
function setup(types){
 const attached=[],errors=[],downloads=[];
 const page={getWidth:()=>595,drawText(){},drawLine(){},drawImage(){}},font={widthOfTextAtSize:()=>60};
 const doc={addPage:()=>page,embedFont:async()=>font,save:async()=>new Uint8Array([1])};
 const PDFLib={PDFDocument:{create:async()=>doc},StandardFonts:{},rgb:()=>0};
 const c={admin:()=>true,ensureLibraries:async()=>{},attachments:types.map(tipo=>({extra_id:'x',tipo})),window:{PDFLib},PDFLib,stores:[],extraWorkers:[],profiles:[],extraCategory:()=> 'verde',pdfSafeText:s=>s||'',pdfSafeName:s=>s,wrapPdfText:s=>[s||''],fmt:s=>s||'',fmtClosedAt:()=>'',closedByName:()=>'',extraRequestDate:()=>'',appendAttachmentAsFullPage:async(d,a)=>attached.push(a.tipo),addPdfGeneratedAtFooter(){},Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},document:{createElement:()=>({click(){downloads.push(this.download)},remove(){}}),body:{appendChild(){}}},setTimeout(){},toast(){},alert:m=>errors.push(m),console};
 vm.createContext(c);vm.runInContext(src.slice(src.indexOf('async function generateExtraClosurePdf'),src.indexOf('let eurospinPackageState=')),c);
 return {c,attached,errors,downloads};
}
for(const reports of [[],['rapportino_overgreen'],['rapportino_eurospin'],['rapportino_overgreen','rapportino_eurospin']])test('single closure includes available documents: '+reports.join(','),async()=>{
 const h=setup(['pdf_richiesta',...reports]);await h.c.generateExtraClosurePdf({id:'x',titolo:'Test',giorno_intervento:'2026-10-30'});
 assert.deepEqual(h.errors,[]);assert.equal(h.downloads.length,1);assert.deepEqual(h.attached,['pdf_richiesta',...reports]);
});
test('request still required and workers cannot generate closure',async()=>{
 const h=setup([]);await h.c.generateExtraClosurePdf({id:'x'});assert.equal(h.downloads.length,0);assert.match(h.errors[0],/file richiesta/);
 const w=setup(['pdf_richiesta']);w.c.admin=()=>false;await w.c.generateExtraClosurePdf({id:'x'});assert.equal(w.downloads.length,0);
});
