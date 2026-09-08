// Synthetic DOM tests; PDF rendering is simulated, database is covered separately.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const code=fs.readFileSync(__dirname+'/../extra-hours.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(options={}){
  const dom=parseHTML(html),document=dom.document,calls=[];
  const dialog=document.getElementById('extraHoursDialog');
  dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>dialog.removeAttribute('open');
  dom.HTMLCanvasElement.prototype.getContext=()=>({});
  const db={row:options.row||null,report:options.report||null};
  const c={document,window:{addEventListener(){},devicePixelRatio:2,pdfjsLib:options.pdfjsLib},console,
    admin:()=>c.isAdmin,isAdmin:true,clientType:e=>e.client_type,stores:[],
    confirm:()=>c.confirmClose,confirmClose:true,
    signedAttachmentUrl:async()=>{if(options.urlError)throw Error('signed URL failed');return 'https://example.invalid/synthetic.pdf'},
    openAttachment:a=>calls.push(['original',a.id]),
    sb:{from(table){const query={select(){return query},eq(){return query},order(){return query},limit(){return query},async maybeSingle(){
      if(options.load)await options.load();
      return options.loadError?{error:Error('offline')}:{data:table==='extra_labor_hours'?db.row:db.report};
    }};return query},async rpc(name,args){calls.push([name,args]);if(options.rpc)return options.rpc(name,args);
      db.row={extra_id:args.p_extra_id,total_hours:args.p_total_hours,source_attachment_id:args.p_source_attachment_id,revision:(db.row?.revision||0)+1,updated_at:'2026-09-08T10:00:00Z'};return {data:db.row};
    }}
  };
  vm.createContext(c);vm.runInContext(code,c);
  const $=id=>document.getElementById(id);
  const extra={id:'e1',client_type:'eurospin',titolo:'<img src=x onerror=alert(1)>'};
  const open=()=>c.openExtraHours(extra),save=()=>vm.runInContext('ExtraHoursUi.save()',c);
  return {c,$,document,calls,db,open,save,extra};
}
test('manual input distinguishes blank and zero, accepts comma/dot, rejects ambiguous or invalid hours',()=>{
  const {c}=setup();
  for(const [input,want] of [['',null],[' ',null],['0',0],['2,5',2.5],[' 6.25 ',6.25],['99999,99',99999.99]])assert.equal(c.parseExtraHours(input),want);
  for(const value of ['-1','1e3','2:30','1,234','NaN','Infinity','100000','2.5.3','1 000'])assert.throws(()=>c.parseExtraHours(value));
});
test('save and reopen preserve total operator hours without multiplying, and allow clearing',async()=>{
  const h=setup();await h.open();assert(h.$('extraHoursDialog').hasAttribute('open'));
  assert.equal(h.$('extraHoursContext').querySelectorAll('img').length,0);
  h.$('extraHoursInput').value='6,5';await h.save();assert.equal(h.db.row.total_hours,6.5);
  assert.match(h.$('extraHoursFeedback').textContent,/Ore salvate/);h.$('extraHoursClose').click();await h.open();
  assert.equal(h.$('extraHoursInput').value,'6,5');h.$('extraHoursInput').value='';await h.save();assert.equal(h.db.row.total_hours,null);
});
test('failed and concurrent saves keep the input; double submit is suppressed',async()=>{
  let finish;const pending=new Promise(resolve=>finish=resolve);
  const h=setup({rpc:()=>pending});await h.open();h.$('extraHoursInput').value='12,25';
  const first=h.save();await h.save();assert.equal(h.calls.length,1);assert(h.$('extraHoursSave').disabled);h.$('extraHoursClose').click();assert(h.$('extraHoursDialog').hasAttribute('open'));
  finish({error:{message:'Le ore sono state modificate da un’altra sessione.'}});await first;
  assert.equal(h.$('extraHoursInput').value,'12,25');assert.equal(h.$('extraHoursSave').disabled,false);assert.match(h.$('extraHoursFeedback').textContent,/altra sessione/);
});
test('a changed report is flagged, original opens, and save confirms the new report',async()=>{
  const h=setup({row:{extra_id:'e1',total_hours:4,revision:2,source_attachment_id:null},report:{id:'new-report',mime_type:'image/jpeg'}});await h.open();
  assert.equal(h.$('extraHoursChanged').hidden,false);h.$('extraHoursOriginal').click();assert.equal(h.calls[0][0],'original');
  await h.save();assert.equal(h.db.row.source_attachment_id,'new-report');assert.equal(h.$('extraHoursChanged').hidden,true);
});
test('load failure blocks saving; preview failure still allows manual hours',async()=>{
  const bad=setup({loadError:true});await bad.open();await bad.save();assert.equal(bad.calls.length,0);assert(bad.$('extraHoursSave').disabled);
  const h=setup({urlError:true,report:{id:'r',mime_type:'application/pdf'}});await h.open();assert.match(h.$('extraHoursPreviewStatus').textContent,/Anteprima non disponibile/);
  h.$('extraHoursInput').value='0';await h.save();assert.equal(h.db.row.total_hours,0);
});
test('employee access and a role change during async loading cannot expose hours or save',async()=>{
  const h=setup();h.c.isAdmin=false;await h.open();assert(!h.$('extraHoursDialog').hasAttribute('open'));
  let finish;const waiting=new Promise(resolve=>finish=resolve),k=setup({load:()=>waiting,row:{total_hours:20}});
  const opened=k.open();k.c.isAdmin=false;k.c.closeExtraHoursForRole();finish();await opened;await k.save();
  assert(!k.$('extraHoursDialog').hasAttribute('open'));assert.equal(k.$('extraHoursInput').value,'');assert.equal(k.calls.length,0);
});
test('dirty close can be cancelled and does not discard the typed hours',async()=>{
  const h=setup();await h.open();h.$('extraHoursInput').value='7';h.c.confirmClose=false;h.$('extraHoursClose').click();
  assert(h.$('extraHoursDialog').hasAttribute('open'));assert.equal(h.$('extraHoursInput').value,'7');h.c.confirmClose=true;h.$('extraHoursClose').click();assert(!h.$('extraHoursDialog').hasAttribute('open'));
});
test('PDF pages and zoom work; cancelled renders cannot replace a newer page',async()=>{
  const pending=[];let destroyCount=0;const configs=[];
  const pdf={numPages:3,destroy:async()=>{destroyCount++},getPage:async page=>({getViewport:({scale})=>({width:600*scale,height:800*scale}),render:options=>{
    if(page===1)return {promise:Promise.resolve(),cancel(){}};
    let resolve;const promise=new Promise(r=>resolve=r);pending.push({page,resolve,options});return {promise,cancel(){}};
  }})};
  const h=setup({report:{id:'r',nome_file:'report.pdf'},pdfjsLib:{getDocument(config){configs.push(config);return {promise:Promise.resolve(pdf),destroy:pdf.destroy}}}});
  await h.open();assert.equal(configs[0].isEvalSupported,false);assert.match(h.$('extraHoursPage').textContent,/1 \/ 3/);
  h.$('extraHoursNext').click();await tick();h.$('extraHoursNext').click();await tick();
  pending.find(x=>x.page===3).resolve();await tick();pending.find(x=>x.page===2).resolve();await tick();
  assert.equal(h.$('extraHoursCanvas').firstElementChild.getAttribute('aria-label'),'Rapportino Eurospin, pagina 3');
  assert(h.$('extraHoursNext').disabled);h.$('extraHoursPrev').click();await tick();pending.at(-1).resolve();await tick();
  assert.match(h.$('extraHoursPage').textContent,/2 \/ 3/);h.$('extraHoursZoomIn').click();await tick();pending.at(-1).resolve();await tick();
  assert.match(h.$('extraHoursPreviewStatus').textContent,/125%/);h.$('extraHoursClose').click();assert.equal(destroyCount,1);assert.equal(h.$('extraHoursCanvas').childElementCount,0);
});
