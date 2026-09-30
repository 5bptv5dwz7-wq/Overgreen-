const {test}=require('node:test'),assert=require('node:assert/strict');
const {IDBFactory,forceCloseDatabase}=require('fake-indexeddb');
const Sync=require('../photo-sync.js');
const lost=()=>new DOMException('Connection to Indexed Database server lost. Refresh the page to try again','UnknownError');
function factory({openFailures=0,synchronous=false,transactionFailures=0}={}){
  const real=new IDBFactory();let calls=0,connections=[];
  return {get calls(){return calls},connections,open(...args){
    calls++;
    if(openFailures-->0){if(synchronous)throw lost();const request={error:lost()};setTimeout(()=>request.onerror?.(),0);return request}
    const request=real.open(...args);
    request.addEventListener('success',()=>{const db=request.result;connections.push(db);const original=db.transaction.bind(db);db.transaction=(...params)=>{if(transactionFailures-->0)throw new DOMException('The database connection is closing','InvalidStateError');return original(...params)}});
    return request;
  }};
}
test('iOS asynchronous open failure reopens the same database and preserves bytes',async()=>{
  const idb=factory({openFailures:1}),db=Sync.storage(idb);
  await db.put('photos',{id:'photo',file:new Blob(['original'])});
  assert.equal(await (await db.get('photos','photo')).file.text(),'original');assert.equal(idb.calls,2);
});
test('synchronous opening failure is retried too',async()=>{
  const idb=factory({openFailures:1,synchronous:true});assert.deepEqual(await Sync.storage(idb).all('jobs'),[]);assert.equal(idb.calls,2);
});
test('stale transaction connection is discarded and reopened',async()=>{
  const idb=factory({transactionFailures:1}),db=Sync.storage(idb);await db.put('jobs',{id:'one'});assert.equal((await db.all('jobs')).length,1);assert.equal(idb.calls,2);
});
test('unexpected close between transactions preserves pending jobs',async()=>{
  const idb=factory(),db=Sync.storage(idb);await db.put('jobs',{id:'pending'});
  forceCloseDatabase(idb.connections[0]);await db.put('jobs',{id:'next'});
  assert.deepEqual((await db.all('jobs')).map(x=>x.id).sort(),['next','pending']);assert.equal(idb.calls,2);
});
test('asynchronous transaction failure rolls back before retrying the full write',async()=>{
  const idb=factory(),db=Sync.storage(idb);let tries=0;
  await db.tx(['photos','jobs'],'readwrite',tx=>{
    tx.objectStore('photos').add({id:'p',file:new Blob(['bytes'])});
    tx.objectStore('jobs').add({id:'p'});
    if(tries++===0)queueMicrotask(()=>tx._abort('UnknownError'));
  });
  assert.equal(tries,2);assert.equal((await db.all('photos')).length,1);assert.equal((await db.all('jobs')).length,1);
});
test('persistent storage loss stops after three attempts and cannot send a closure',async t=>{
  const idb=factory({openFailures:100});let sent=0;
  const q=Sync.create({indexedDB:idb,actor:()=>({profileId:'worker',callerId:'worker'}),api:{submit:async()=>{sent++}}});t.after(()=>q.stop());
  await assert.rejects(q.prepare({args:{p_request_id:'request'},photoIds:[],files:[]}),e=>e.code==='IDB_CONNECTION_LOST'&&/Non eliminare/.test(e.message));
  assert.equal(idb.calls,3);assert.equal(sent,0);
});
test('quota errors are not mislabeled as a lost connection or retried',async()=>{
  const db=Sync.storage(new IDBFactory());let attempts=0;
  await assert.rejects(db.tx(['photos'],'readwrite',()=>{attempts++;throw new DOMException('Storage full','QuotaExceededError')}),e=>e.name==='QuotaExceededError');
  assert.equal(attempts,1);
});
test('temporary opening loss recovers through durable prepare and delivery exactly once',async t=>{
  const idb=factory({openFailures:1});let sends=0,uploads=0,received=0;const objects=new Set();
  const q=Sync.create({indexedDB:idb,actor:()=>({profileId:'worker',callerId:'worker'}),api:{
    submit:async()=>{sends++;return {intervention:{id:'report'}}},register:async()=>({storage_path:'photo'}),event:async()=>{},
    upload:async p=>{assert.equal(await p.file.text(),'camera');uploads++;objects.add(p.id)},finalize:async p=>({received:objects.has(p.id)})
  },receivedIntervention:()=>received++});t.after(()=>q.stop());
  const a={args:{p_request_id:'request'},photoIds:['photo'],files:[new File(['camera'],'photo.jpg')]};
  await q.prepare(a);assert.equal(sends,0);await q.run();await q.resume();
  assert.equal(sends,1);assert.equal(uploads,1);assert.equal(received,1);assert.equal((await q.snapshot()).jobs.length,0);
});
test('simultaneous preparation of the same request preserves a single durable copy',async t=>{
  const q=Sync.create({indexedDB:new IDBFactory(),actor:()=>({profileId:'w',callerId:'w'}),api:{}});t.after(()=>q.stop());
  const a={args:{p_request_id:'same'},photoIds:['photo'],files:[new File(['image'],'photo.jpg')]};
  await Promise.all([q.prepare(a),q.prepare(a)]);
  assert.equal((await q.db.all('submissions')).length,1);assert.equal((await q.db.all('photos')).length,1);
});
