// Synthetic DOM tests; PDF rendering is simulated, database is covered separately.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const model=require('../extra-economics.js');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const code=fs.readFileSync(__dirname+'/../extra-hours.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(options={}){
  const dom=parseHTML(html),document=dom.document,calls=[];
  Object.defineProperty(dom.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(value){for(const option of this.querySelectorAll('option'))if(option.value===String(value))option.setAttribute('selected','');else option.removeAttribute('selected')}});
  const dialog=document.getElementById('extraHoursDialog');
  dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>dialog.removeAttribute('open');
  dom.HTMLCanvasElement.prototype.getContext=()=>({});
  const db={row:options.row||null,report:options.report||null};
  const c={document,window:{addEventListener(){},devicePixelRatio:2,OvergreenEconomics:model,pdfjsLib:options.pdfjsLib},console,
    fmt:s=>s,admin:()=>c.isAdmin,isAdmin:true,clientType:e=>e.client_type,stores:[],extraWorkers:[{extra_id:'e1',profile_id:'worker'}],
    confirm:()=>c.confirmClose,confirmClose:true,
    signedAttachmentUrl:async()=>{if(options.urlError)throw Error('signed URL failed');return 'https://example.invalid/synthetic.pdf'},
    openAttachment:a=>calls.push(['original',a.id]),
    sb:{from(table){const query={select(){return query},eq(){return query},order(){return query},limit(){return query},async maybeSingle(){
      if(options.load)await options.load();
      return options.loadError?{error:Error('offline')}:{data:table==='extra_day_economics'?{record:db.row}:table==='extra_labor_hours'?db.row:table==='extras'?{id:'e1',client_type:'eurospin',categoria_target:options.category||null,closure_profile:options.profile,night_hours:options.nightHours??0}:db.report};
    }};return query},async rpc(name,args){calls.push([name,args]);if(options.rpc)return options.rpc(name,args);
      db.row={...args.p_values,...model.rates(args.p_values.pricing_category,args.p_values.equipment),extra_id:args.p_extra_id||'e1',source_attachment_id:args.p_source_attachment_id,revision:(db.row?.revision||0)+1,updated_at:'2026-09-08T10:00:00Z'};return {data:{record:db.row,calculation:model.calculate(db.row)}};
    }}
  };
  vm.createContext(c);vm.runInContext(code,c);
  const $=id=>document.getElementById(id);
  const extra={id:'e1',client_type:'eurospin',titolo:'<img src=x onerror=alert(1)>'};
  const open=async()=>{await c.openExtraHours(extra,{day:options.day,onClose:options.onClose});if(options.category==='pulizie'&&!options.row?.cleaning_scope)document.getElementById('extraEconomicsCleaningScope').value='esterni';await tick()},save=()=>vm.runInContext('ExtraHoursUi.save()',c);
  return {c,$,document,calls,db,open,save,extra};
}
test('daily editor reads and saves only the selected day with its own report and night hours',async()=>{
 let returned=0;
 const h=setup({category:'manutenzioni',nightHours:99,day:{id:'d1',day:'2026-10-30',night_hours:2,workers:['one','two'],attachments:[{id:'daily-report',tipo:'rapportino_eurospin',mime_type:'application/pdf'}]},row:{extra_id:'e1',total_hours:10,revision:3,pricing_mode:'tariffa',pricing_category:'manutenzioni',dedicated_trip:true,operator_count:2,night_hours:2},onClose:()=>returned++});
 let globalSaves=0;h.c.rememberExtraEconomics=()=>globalSaves++;
 await h.open();assert.equal(h.$('extraHoursInput').value,'10');assert.equal(h.$('extraEconomicsNightHours').value,'2');assert.match(h.$('extraHoursContext').textContent,/2026-10-30/);
 h.$('extraHoursInput').value='12';await h.save();
 const call=h.calls.find(c=>c[0]==='save_extra_day_economics_v319');assert(call);assert.equal(call[1].p_day_id,'d1');assert.equal(call[1].p_extra_id,undefined);assert.equal(call[1].p_expected_revision,3);assert.equal(call[1].p_source_attachment_id,'daily-report');assert.equal(call[1].p_values.expected_night_hours,2);assert.equal(globalSaves,0);assert.equal(returned,1);
});
test('daily PDF uses fresh isolated notes/photos/documents/economics, never the target totals',async()=>{
 const text=[],attached=[],economic=[],shared=[];const day={id:'d1',day:'2026-10-30',notes:'Only first day',workers:['p1'],night_hours:2,attachments:[{id:'photo1',tipo:'foto_generica'},{id:'report1',tipo:'rapportino_eurospin'}],economics:{extra_id:'e1',pricing_category:'manutenzioni',pricing_mode:'tariffa',total_hours:10,night_hours:2,dedicated_trip:false,operator_count:1,hourly_rate:28,night_hourly_rate:36,exit_rate:50,source_attachment_id:'report1'}};
 const pdf={embedFont:async()=>({}),addPage:()=>({drawText:s=>text.push(s)}),save:async()=>new Uint8Array([1])};
 const c={window:{OvergreenEconomics:model},admin:()=>true,attachmentMediaScope:()=> 'a',ensureLibraries:async()=>{},PDFLib:{PDFDocument:{create:async()=>pdf},StandardFonts:{},rgb:()=>0},pdfSafeText:String,wrapPdfText:s=>[s],fmt:s=>s,stores:[],profiles:[{id:'p1',nome:'First worker'}],appendAttachmentForPackage:async(p,a)=>attached.push(a.id),appendExtraEconomicsPdf:async(p,e,r,report)=>economic.push([e,r,report]),File,shareClientReportData:r=>shared.push(r)};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../extra-days.js','utf8'),c);c.readExtraDays=async()=>[day];
 await c.generateExtraDayReport({id:'e1',categoria_target:'manutenzioni',titolo:'Work',night_hours:100},day,true);
 assert.deepEqual(attached,['photo1','report1']);assert(text.includes('Only first day'));assert.equal(economic[0][1],day.economics);assert.equal(economic[0][0].night_hours,2);assert.equal(economic[0][2].id,'report1');assert.match(shared[0].fileName,/2026-10-30.*economia/);
 day.economics=null;await assert.rejects(c.generateExtraDayReport({id:'e1'},day,true),/Completa e salva/);
 c.admin=()=>false;await assert.rejects(c.generateExtraDayReport({id:'e1'},day,true),/Accesso/);
});
test('complete report includes both days, all photos and long notes; unreadable files block export',async()=>{
 const texts=[],files=[],pages=[];
 const c={PDFLib:{StandardFonts:{},rgb:()=>0},pdfSafeText:String,wrapPdfText:s=>[s],fmt:s=>s,stores:[],profiles:[{id:'p',nome:'Lorenzo'}],appendAttachmentForPackage:async(pdf,a)=>files.push(a.id)};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../extra-days.js','utf8'),c);
 const pdf={embedFont:async()=>({}),addPage:()=>{pages.push(1);return {drawText:(t,o)=>{assert(o.y>=60);texts.push(t)}}}};
 const days=[{day:'2026-10-31',workers:['p'],notes:Array.from({length:70},(_,i)=>'Nota prima '+i).join('\n'),attachments:Array.from({length:6},(_,i)=>({id:'photo'+i,tipo:'foto_generica'}))},{day:'2026-11-01',final:true,notes:'Note seconda giornata',attachments:[{id:'photo-last',tipo:'foto_generica'},{id:'report',tipo:'rapportino_overgreen'}]}];
 const included=await c.appendExtraDayDetails(pdf,{id:'e',titolo:'Goito'},days);
 assert(texts.includes('Nota prima 69'));assert(texts.includes('Note seconda giornata'));assert(texts.includes('Operatori: Lorenzo'));assert.equal(files.length,8);assert(included.has('photo0'));assert(included.has('photo-last'));assert(pages.length>2);
 c.appendAttachmentForPackage=async()=>{throw Error('unreadable')};await assert.rejects(c.appendExtraDayDetails(pdf,{id:'e'},days),/2026-10-31.*unreadable/);
});
