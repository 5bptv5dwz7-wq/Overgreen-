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
test('final closure moves every day and export amount exclusively to the closing month',()=>{
 for(const stato of ['completato','in_attesa']){
 const closed={...extra,stato,closed_at:'2026-12-02T12:00:00Z'};
 const december=m.filterRows([closed],records,[],{month:'2026-12'});
 assert.equal(december.length,1);assert.equal(december[0].calc.total,130000);
 assert.deepEqual(m.expandDailyRows(december).map(x=>x.extra.giorno_intervento),['2026-10-31','2026-11-01']);
 assert.equal(m.filterRows([closed],records,[],{month:'2026-11'}).length,0);
 assert.equal(m.filterRows([closed],records,[],{month:'2026-10'}).length,0);
 assert.equal(m.filterRows([closed],records,[],{month:'open'}).length,0);
 assert.deepEqual(m.economicsPeriods([closed],records),['2026-12']);
 }
});
test('closed daily work without closure date stays undated and reopening restores execution months',()=>{
 const closed={...extra,stato:'completato',closed_at:null};
 assert.equal(m.filterRows([closed],records,[],{month:'2026-11'}).length,0);
 assert.equal(m.filterRows([closed],records,[],{month:'undated'})[0].calc.total,130000);
 assert.deepEqual(m.economicsPeriods([closed],records),['undated']);
 assert.equal(m.filterRows([extra],records,[],{month:'2026-11'})[0].calc.total,80000);
});
test('an unpriced day in another month does not invalidate recorded November economics',()=>{
 const r=m.dailyRecord(extra.id,[nov,{day:'2026-12-02',economics:null}]);
 assert.equal(m.filterRows([extra],[r],[],{month:'2026-11'})[0].calc.ready,true);
 assert.equal(m.filterRows([extra],[r],[],{month:'2026-12'}).length,0);
});
