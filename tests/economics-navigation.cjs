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
    admin:()=>c.isAdmin,isAdmin:true,clientType:e=>e.client_type,stores:[],extraWorkers:[{extra_id:'e1',profile_id:'worker'}],
    restoreExtraEconomicsBook:()=>calls.push(['returnBook']),confirm:()=>c.confirmClose,confirmClose:true,
    signedAttachmentUrl:async()=>{if(options.urlError)throw Error('signed URL failed');return 'https://example.invalid/synthetic.pdf'},
    openAttachment:a=>calls.push(['original',a.id]),
    sb:{from(table){const query={select(){return query},eq(){return query},order(){return query},limit(){return query},async maybeSingle(){
      if(options.load)await options.load();
      return options.loadError?{error:Error('offline')}:{data:table==='extra_labor_hours'?db.row:table==='extras'?{id:'e1',client_type:'eurospin',categoria_target:options.category||null,closure_profile:options.profile,night_hours:options.nightHours??0}:db.report};
    }};return query},async rpc(name,args){calls.push([name,args]);if(options.rpc)return options.rpc(name,args);
      db.row={...args.p_values,...model.rates(args.p_values.pricing_category,args.p_values.equipment),extra_id:args.p_extra_id,source_attachment_id:args.p_source_attachment_id,revision:(db.row?.revision||0)+1,updated_at:'2026-09-08T10:00:00Z'};return {data:{record:db.row,calculation:model.calculate(db.row)}};
    }}
  };
  vm.createContext(c);vm.runInContext(code,c);
  const $=id=>document.getElementById(id);
  const extra={id:'e1',client_type:'eurospin',titolo:'<img src=x onerror=alert(1)>'};
  const open=()=>c.openExtraHours(extra,{returnToEconomics:options.fromBook===true}),save=()=>vm.runInContext('ExtraHoursUi.save()',c);
  return {c,$,document,calls,db,open,save,extra};
}


test('save exits to economics only when opened from the book',async()=>{
 for(const fromBook of [true,false]){const h=setup({fromBook,category:'pulizie'});await h.open();h.$('extraEconomicsCleaningScope').value='interni';await h.save();assert.equal(h.$('extraHoursDialog').hasAttribute('open'),false);assert.equal(h.calls.filter(x=>x[0]==='returnBook').length,fromBook?1:0);assert.equal(h.db.row.cleaning_scope,'interni');}
});
test('X restores book, cancelled discard and failed save stay open',async()=>{
 const h=setup({fromBook:true});await h.open();h.$('extraHoursClose').click();assert.equal(h.calls.filter(x=>x[0]==='returnBook').length,1);
 await h.open();h.$('extraHoursInput').value='4';h.c.confirmClose=false;h.$('extraHoursClose').click();assert(h.$('extraHoursDialog').hasAttribute('open'));assert.equal(h.calls.filter(x=>x[0]==='returnBook').length,1);
 const f=setup({fromBook:true,rpc:async()=>({error:{message:'offline'}})});await f.open();await f.save();assert(f.$('extraHoursDialog').hasAttribute('open'));assert.equal(f.calls.filter(x=>x[0]==='returnBook').length,0);
});
test('role loss never reopens administrative economics',async()=>{
 const h=setup({fromBook:true});await h.open();h.c.isAdmin=false;h.c.closeExtraHoursForRole();assert.equal(h.calls.filter(x=>x[0]==='returnBook').length,0);
});
