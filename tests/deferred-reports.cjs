const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const source=fs.readFileSync('app.js','utf8');
test('adding deferred reports never updates dates, notes or economics',async()=>{
 const {document}=parseHTML(fs.readFileSync('index.html','utf8')), $=id=>document.getElementById(id),saved=[],errors=[];
 $('editExtraClosureForm').dataset.documentsOnly='true';$('editExtraClosureId').value='extra1';
 $('editExtraClosureDialog').close=()=>{};$('editExtraClosureForm').reset=()=>{};
 for(const id of ['editClosureRequest','editClosureOvergreen','editClosureEurospin','editExtraClosurePhotos'])Object.defineProperty($(id),'files',{value:id==='editClosureEurospin'?[{name:'report.pdf'}]:[]});
 const c={$,attachmentLabel:a=>a.tipo,admin:()=>true,replaceExtraAttachment:async(...args)=>saved.push(args),sb:{from(){throw Error('Must not update records')}},loadAll:async()=>{},toast(){},alert:m=>errors.push(m)};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf("$('editExtraClosureForm').onsubmit="),source.indexOf('function renderExtraClosureDetails')),c);
 await $('editExtraClosureForm').onsubmit({preventDefault(){}});
 assert.deepEqual(errors,[]);assert.equal(saved.length,1);assert.equal(saved[0][0],'extra1');assert.equal(saved[0][1],'rapportino_eurospin');
});
test('ZIP remains blocked until both deferred reports are present',()=>{
 const c={attachments:[]};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function eurospinPackagePrerequisites'),source.indexOf('function eurospinPackageFilename')),c);
 c.attachments.push({extra_id:'x',tipo:'pdf_richiesta'});assert.equal(c.eurospinPackagePrerequisites({id:'x'}).ready,false);
 c.attachments.push({extra_id:'x',tipo:'rapportino_eurospin'});assert.equal(c.eurospinPackagePrerequisites({id:'x'}).ready,false);
 c.attachments.push({extra_id:'x',tipo:'rapportino_overgreen'});assert.equal(c.eurospinPackagePrerequisites({id:'x'}).ready,true);
});
