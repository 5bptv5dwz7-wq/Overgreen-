const {test}=require('node:test'),assert=require('node:assert/strict');
const {clean,point}=require('../route-endpoints.js');
test('endpoint validation rejects incomplete, invalid and out-of-range locations',()=>{
 for(const value of [null,{}, {label:'X',lat:'44',lon:8},{label:'',lat:44,lon:8},{label:'X',lat:91,lon:8},{label:'X',lat:44,lon:-181},{label:'X',lat:NaN,lon:8},{label:'X',lat:44,lon:Infinity}])assert.equal(point(value),null);
});
test('endpoints remain independent, clean and serializable for saved route reuse',()=>{
 const value={start:{label:' Casa ',lat:44,lon:8,unknown:'discard'},end:{label:'Genova',lat:44.4,lon:8.9}};
 const result=clean(value);assert.deepEqual(result.start,{label:'Casa',lat:44,lon:8});assert.equal(result.end.label,'Genova');assert.deepEqual(clean(JSON.parse(JSON.stringify(result))),result);assert.deepEqual(clean(),{start:null,end:null});
 result.start.label='Changed';assert.equal(value.start.label,' Casa ');
});
