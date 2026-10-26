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
    confirm:()=>c.confirmClose,confirmClose:true,
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
  const open=()=>c.openExtraHours(extra),save=()=>vm.runInContext('ExtraHoursUi.save()',c);
  return {c,$,document,calls,db,open,save,extra};
}

test('cleaning scope required, saved, reopened, hidden for green',async()=>{
const h=setup({category:'pulizie'});await h.open();assert.equal(h.$('extraEconomicsCleaningWrap').hidden,false);
await h.save();assert.equal(h.calls.length,0);assert.match(h.$('extraHoursFeedback').textContent,/interne/);
h.$('extraEconomicsCleaningScope').value='interni';await h.save();assert.equal(h.db.row.cleaning_scope,'interni');
h.$('extraHoursClose').click();await h.open();assert.equal(h.$('extraEconomicsCleaningScope').value,'interni');
h.$('extraEconomicsCleaningScope').value='esterni';await h.save();assert.equal(h.db.row.cleaning_scope,'esterni');
const g=setup({category:'verde'});await g.open();assert.equal(g.$('extraEconomicsCleaningWrap').hidden,true);await g.save();assert.equal(g.db.row.cleaning_scope,null);
});

test('maintenance saves day/night equipment prices, no cleaning scope, and displays 22% VAT',async()=>{
 const h=setup({category:'manutenzioni',nightHours:2});await h.open();
 assert.equal(h.$('extraEconomicsCleaningWrap').hidden,true);assert.equal(h.$('extraEconomicsNightWrap').hidden,false);assert.equal(h.$('extraEconomicsEquipmentWrap').hidden,false);
 h.$('extraEconomicsMode').value='tariffa';h.$('extraEconomicsOperators').value='2';h.$('extraEconomicsTrip').value='yes';h.$('extraHoursInput').value='6';h.$('extraEconomicsEquipment').checked=true;
 h.$('extraHoursForm').dispatchEvent(new h.c.document.defaultView.Event('input'));
 assert.match(h.$('extraEconomicsSummary').textContent,/IVA 22%/);
 await h.save();assert.equal(h.db.row.cleaning_scope,null);assert.equal(h.db.row.hourly_rate,33);assert.equal(h.db.row.night_hourly_rate,41);assert.equal(h.db.row.night_hours,2);assert.equal(model.calculate(h.db.row).total,31400);
 h.$('extraHoursClose').click();await h.open();assert.equal(h.$('extraEconomicsEquipment').checked,true);
});
