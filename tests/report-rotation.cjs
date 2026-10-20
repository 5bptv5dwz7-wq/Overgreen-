const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const PDFLib=require('pdf-lib');
const src=fs.readFileSync('package-review.js','utf8').split('async function rotatedReviewFile')[1];
function context(extra={}){const c={File,window:{PDFLib},ensureLibraries:async()=>{},...extra};vm.createContext(c);vm.runInContext('async function rotatedReviewFile'+src,c);return c}
test('PDF rotation preserves every page and rotates only the selected page, including existing rotation',async()=>{
 const doc=await PDFLib.PDFDocument.create();doc.addPage([300,500]);doc.addPage([400,600]).setRotation(PDFLib.degrees(270));
 const source=new File([await doc.save()],'report.pdf',{type:'application/pdf'}),c=context();
 const rotated=await c.rotatedReviewFile(source,2,90),out=await PDFLib.PDFDocument.load(await rotated.arrayBuffer());
 assert.equal(out.getPageCount(),2);assert.equal(out.getPage(0).getRotation().angle,0);assert.equal(out.getPage(1).getRotation().angle,0);assert.equal(out.getPage(1).getWidth(),400);
 const left=await c.rotatedReviewFile(rotated,1,-90),result=await PDFLib.PDFDocument.load(await left.arrayBuffer());assert.equal(result.getPage(0).getRotation().angle,270);
 const original=await PDFLib.PDFDocument.load(await source.arrayBuffer());assert.equal(original.getPage(1).getRotation().angle,270);
 await assert.rejects(c.rotatedReviewFile(source,3,90),/Pagina/);
});
test('Image rotation swaps dimensions, uses correct angle and saves losslessly',async()=>{
 let angle,revoked=false;const canvas={getContext:()=>({translate(){},rotate:a=>angle=a,drawImage(){}}),toBlob:cb=>cb(new Blob(['pixels'],{type:'image/png'}))};
 const c=context({Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked=true},Image:class{naturalWidth=300;naturalHeight=500;set src(v){this.onload()}},document:{createElement:()=>canvas}});
 const out=await c.rotatedReviewFile(new File(['image'],'report.jpg',{type:'image/jpeg'}),1,90);
 assert.equal(canvas.width,500);assert.equal(canvas.height,300);assert.equal(angle,Math.PI/2);assert.equal(out.type,'image/png');assert.equal(revoked,true);
});
