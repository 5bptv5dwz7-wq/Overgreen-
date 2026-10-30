const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/../app.js','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
function setup(){
 const fields={},calls=[],$=id=>fields[id]||(fields[id]={value:'',dataset:{},checked:false,disabled:false,addEventListener(){}});
 const context={$,admin:()=>true,openStore(){ $('storeForm').dataset={};},syncStoreIntervalUi(){ $('storeInterval').disabled=$('storeNoInterval').checked;},locationEditor:()=>({open(){calls.push('location')}}),renderExtraStoreOptions:id=>calls.push(['create',id]),renderExtraEditStoreOptions:id=>calls.push(['edit',id]),syncExtraDestinationUi(){},toggleExtraEditDestination(){}};
 vm.createContext(context);vm.runInContext(src.slice(src.indexOf('function openExtraStore('),src.indexOf("$('storeNoInterval')?.addEventListener")),context);
 return {context,$,calls};
}
for(const prefix of ['extra','extraEdit'])test(prefix+': create from external place and select saved store without clearing target',()=>{
 const {context:c,$,calls}=setup();$(prefix+'Client').value='eurospin';$(prefix+'Destination').value='external';$(prefix+'ExternalName').value='Penny Goito';$(prefix+'ExternalAddress').value='Via Roma, Goito';$(prefix+'Title').value='Smontaggio scaffali';$(prefix+'Pdf').value='richiesta.pdf';
 c.openExtraStore(prefix);assert.equal($('storeClient').value,'eurospin');assert.equal($('storeClient').disabled,true);assert.equal($('storeNoInterval').checked,true);assert.equal($('storeInterval').disabled,true);assert.equal($('storeName').value,'Penny Goito');assert.equal($('storeAddress').value,'Via Roma, Goito');assert.equal($('storeForm').dataset.extraOrigin,prefix);
 c.selectExtraStore(prefix,{id:'saved'});assert.equal($(prefix+'Store').value,'saved');assert.equal($(prefix+'Destination').value,'store');assert.equal($(prefix+'StoreSearch').value,'');assert.equal($(prefix+'Title').value,'Smontaggio scaffali');assert.equal($(prefix+'Pdf').value,'richiesta.pdf');assert.deepEqual(calls.at(-1),[prefix==='extra'?'create':'edit','saved']);
});
test('request-only sites are excluded from bulk recurring interval changes',()=>{
 const c={stores:[{id:'ordinary',client_type:'eurospin',intervallo_giorni:15},{id:'extra',client_type:'eurospin',intervallo_giorni:null},{id:'bank',client_type:'intesa',intervallo_giorni:15}],clientType:s=>s.client_type,storeHasInterval:s=>Number(s.intervallo_giorni)>0,$:id=>({value:id==='bulkIntervalClient'?'eurospin':'all'})};vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function matchingStoresForBulkInterval('),src.indexOf('function updateBulkIntervalPreview(')),c);assert.deepEqual(Array.from(c.matchingStoresForBulkInterval(),s=>s.id),['ordinary']);
});
test('Maps verification is visible before opening location details',()=>{
 assert(html.indexOf('id="storeLocationPreview"')<html.indexOf('<details id="storeLocation"'));assert.equal((html.match(/id="storeLocationPreview"/g)||[]).length,1);assert.match(html,/id="storeLocationPreview" target="_blank" rel="noopener"/);
});
