const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(__dirname+'/../app.js','utf8'),ui=fs.readFileSync(__dirname+'/../extra-economics-ui.js','utf8');
const c={};vm.createContext(c);
vm.runInContext(app.slice(app.indexOf('function excelDateValue('),app.indexOf('async function generateEurospinExcel(')),c);
vm.runInContext(ui.slice(0,ui.indexOf('/* Admin-only')),c);
for(const tz of ['Europe/Rome','UTC','America/Los_Angeles','Asia/Tokyo'])test('Excel calendar dates remain whole days in '+tz,()=>{
 const previous=process.env.TZ;process.env.TZ=tz;
 try{for(const date of ['2026-10-15','2026-10-31','2026-11-01','2026-11-03','2026-11-08','2026-11-09','2026-11-10','2026-11-11','2026-11-19','2026-11-20','2026-11-26','2026-07-01']){
  for(const fn of [c.excelDateValue,c.economicsExcelCalendarDate]){
   const value=fn(date),serial=value.getTime()/86400000+25569;
   assert.equal(value.toISOString(),date+'T00:00:00.000Z');assert.equal(serial,Math.trunc(serial));
  }
 }}finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous}
});
