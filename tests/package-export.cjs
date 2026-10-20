const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Package attachments preserve every PDF page in order',async()=>{
 const src=fs.readFileSync('app.js','utf8'),added=[],indices=[];
 const c={ensureLibraries:async()=>{},fetchAttachmentBytes:async()=>new Uint8Array([1]),attachmentLabel:()=>'',PDFLib:{PDFDocument:{load:async()=>({getPageCount:()=>3,getPageIndices:()=>[0,1,2]})}}};vm.createContext(c);
 vm.runInContext(src.slice(src.indexOf('async function appendAttachmentForPackage'),src.indexOf('async function buildExtraClosurePdfBlob')),c);
 await c.appendAttachmentForPackage({copyPages:async(s,ids)=>{indices.push(...ids);return ['first','second','third']},addPage:p=>added.push(p)},{mime_type:'application/pdf'});
 assert.deepEqual(indices,[0,1,2]);assert.deepEqual(added,['first','second','third']);
});
test('Compression retries reuse original downloads and isolate each export',async()=>{
 let fetched=0,attempt=0;const src=fs.readFileSync('extra-economics-ui.js','utf8');
 const c={admin:()=>true,fetchAttachmentBytes:async()=>{fetched++;return new Uint8Array([7])},eurospinPackageFilename:()=> 'a.pdf',window:{JSZip:class{file(){}async generateAsync(){return {size:++attempt%2?10000001:100}}}},buildExtraClosurePdfBlob:async(e,q,side,read)=>{const bytes=await read({id:'a',storage_path:'a'});assert.equal(bytes[0],7);bytes[0]=0;return 'pdf'}};vm.createContext(c);vm.runInContext(src.slice(src.indexOf('async function buildEconomicsZipUnderLimit')),c);
 const groups=[{folder:'Verde',excel:'excel',rows:[{extra:{id:'e'}}]}];
 await c.buildEconomicsZipUnderLimit(groups,{});assert.equal(fetched,1);await c.buildEconomicsZipUnderLimit(groups,{});assert.equal(fetched,2);
});
