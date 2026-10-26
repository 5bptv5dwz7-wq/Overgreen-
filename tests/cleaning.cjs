const {test}=require('node:test'),assert=require('node:assert/strict');
const m=require('../cleaning.js'),econ=require('../extra-economics.js');
test('cleaning: only entrusted stores get all five services; month end, pending visits, annual slots',()=>{
 const s={id:'s',cleaning_enabled:true,cleaning_start:'2026-10-01'};
 assert.equal(m.due({...s,cleaning_enabled:false},[],'2026-10-27').length,0);
 assert.equal(m.due(s,[],'2026-10-27').length,5);
 assert.equal(m.due(s,[],'2026-09-30').length,0);
 assert.equal(m.shift('2026-01-31',1),'2026-02-28');
 const e={store_id:'s',cleaning_codes:['A/1','A/2','C/1'],giorno_intervento:'2026-10-26',stato:'completato'};
 const due=m.due(s,[e],'2026-10-27');assert.equal(due.find(x=>x.code==='A/1').next,'2026-11-02');assert.equal(due.find(x=>x.code==='C/1').next,'2026-11-26');assert(due.find(x=>x.code==='C/2').due);
 assert.equal(m.due(s,[{...e,stato:'ricevuto'}],'2026-10-27')[0].due,false);
 const rows=[{store_id:'s',cleaning_year:2026,cleaning_slot:1,stato:'completato'},{store_id:'s',cleaning_year:2026,cleaning_slot:2,stato:'programmato'}];
 assert.deepEqual(m.slots(rows,'s',2026),{used:1,reserved:1,free:0});assert.equal(m.slots(rows,'s',2027).free,2);rows[1].stato='annullato';assert.equal(m.slots(rows,'s',2026).free,1);
});
test('contract visits excluded from hourly billing, Targets retain existing economics',()=>{
 const e={client_type:'eurospin',categoria_target:'pulizie',closure_profile:'eurospin',cleaning_codes:['D/2']};assert.equal(econ.isBillableExtra(e),false);assert.equal(econ.isBillableExtra({...e,cleaning_codes:['TARGET']}),true);assert.equal(econ.isBillableExtra({...e,cleaning_codes:null}),true);
});
