const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const model=require('../extra-economics.js');
const source=fs.readFileSync(__dirname+'/../extra-economics-ui.js','utf8');
const extra={id:'carpenedolo',nome_esterno:'Carpenedolo vecchio',numero_target:'3486151',stato:'da_integrare',client_type:'eurospin',closure_profile:'eurospin',categoria_target:'pulizie',closed_at:null};
const day={id:'day1',extra_id:extra.id,day:'2026-11-15',created_at:'2026-11-15T16:29:51Z',final:false,technician_count:3,work_start:'09:00:00',work_end:'17:00:00',break_minutes:60,night_hours:21,attachments:[]};
async function load(days=[day],records=[],daily=[]){
 const tables={extra_labor_hours:records,extra_work_days:days,extra_day_economics:daily};
 const c={window:{OvergreenEconomics:model},admin:()=>true,attachmentMediaScope:()=> 'admin',readAllRows:async table=>({data:tables[table]})};
 vm.createContext(c);vm.runInContext(source,c);assert.equal(await c.loadExtraEconomics(),true);
 return vm.runInContext('extraEconomicsRecords',c);
}
test('first partial without any saved economics appears in November, incomplete and editable by day',async()=>{
 const records=await load();
 const rows=model.filterRows([extra],records,[],{month:'2026-11'});
 assert.equal(rows.length,1);assert.equal(rows[0].calc.ready,false);assert.equal(rows[0].calc.total,null);
 assert.equal(rows[0].row.days[0].id,day.id);assert.equal(rows[0].row.days[0].economics,null);
 assert.equal(model.filterRows([extra],records,[],{month:'open'}).length,1);
 assert.equal(model.filterRows([extra],records,[],{month:'2026-10'}).length,0);
 assert(model.economicsPeriods([extra],records).includes('2026-11'));
 assert.equal(model.filterRows([{...extra,stato:'annullato'}],records,[],{month:'2026-11'}).length,0);
});
test('all unpriced work days follow the latest work month without creating a duplicate',async()=>{
 const records=await load([day,{...day,id:'day2',day:'2026-12-01'}]);
 assert.equal(records.length,1);assert.equal(model.filterRows([extra],records,[],{month:'2026-11'}).length,0);
 assert.equal(model.filterRows([extra],records,[],{month:'2026-12'})[0].row.days.length,2);
});
test('existing target economics and single final-day editor remain unchanged',async()=>{
 const target={extra_id:extra.id,pricing_mode:'tariffa',total_hours:21};
 assert.equal((await load([day],[target]))[0],target);
 assert.equal((await load([{...day,final:true}])).length,0);
});
test('saved daily economics replace target economics once, retaining unpriced days',async()=>{
 const target={extra_id:extra.id,pricing_mode:'tariffa',total_hours:21};
 const daily={pricing_category:'pulizie',pricing_mode:'tariffa'};
 const records=await load([day,{...day,id:'day2',day:'2026-11-16'}],[target],[{day_id:day.id,record:daily}]);
 assert.equal(records.length,1);assert.equal(records[0].pricing_mode,'giornate');
 assert.equal(records[0].days[0].economics,daily);assert.equal(records[0].days[1].economics,null);
 assert.equal(model.filterRows([extra],records,[],{month:'2026-11'})[0].calc.ready,false);
});
