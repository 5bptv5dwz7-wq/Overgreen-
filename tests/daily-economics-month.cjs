const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../extra-economics.js');
const extra={id:'manerba',numero_target:'3476613',stato:'da_integrare',client_type:'eurospin',categoria_target:'pulizie'};
const economics={pricing_mode:'tariffa',pricing_category:'pulizie',total_hours:20,night_hours:20,hourly_rate:23,night_hourly_rate:30,exit_rate:50,dedicated_trip:true,operator_count:4,expenses:[],source_attachment_id:null};
const nov={day:'2026-11-01',night_hours:20,economics,attachments:[]};
const oct={...nov,day:'2026-10-31',economics:{...economics,total_hours:10,night_hours:10},night_hours:10};
const records=[m.dailyRecord(extra.id,[oct,nov])];
test('unfinished Manerba appears in November and Open, with only November amounts and export days',()=>{
 const rows=m.filterRows([extra],records,[],{month:'2026-11'});
 assert.equal(rows.length,1);assert.equal(rows[0].calc.total,80000);assert.equal(rows[0].calc.nightHours,20);assert.equal(rows[0].calc.ready,true);
 assert.deepEqual(m.expandDailyRows(rows).map(x=>x.extra.giorno_intervento),['2026-11-01']);
 assert.equal(m.filterRows([extra],records,[],{month:'open'}).length,1);
 assert.equal(m.filterRows([extra],records,[],{month:'2026-12'}).length,0);
 assert.equal(records[0].days.length,2);
 assert.deepEqual(m.economicsPeriods([extra],records).sort(),['2026-10','2026-11','open']);
});
test('closing later does not count daily amounts again in the closing month',()=>{
 const closed={...extra,stato:'completato',closed_at:'2026-12-02T12:00:00Z'};
 assert.equal(m.filterRows([closed],records,[],{month:'2026-12'}).length,0);
 assert.equal(m.filterRows([closed],records,[],{month:'2026-11'})[0].calc.total,80000);
 assert.equal(m.filterRows([closed],records,[],{month:'open'}).length,0);
});
test('an unpriced day in another month does not invalidate recorded November economics',()=>{
 const r=m.dailyRecord(extra.id,[nov,{day:'2026-12-02',economics:null}]);
 assert.equal(m.filterRows([extra],[r],[],{month:'2026-11'})[0].calc.ready,true);
 assert.equal(m.filterRows([extra],[r],[],{month:'2026-12'}).length,0);
});
