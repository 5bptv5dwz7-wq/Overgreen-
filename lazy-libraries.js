/* Heavy export/OCR engines are loaded only when their feature is requested. */
(function(root){
 const urls={PDFLib:'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',JSZip:'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',ExcelJS:'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',Tesseract:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',pdfjsLib:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'};
 const pending=new Map();
 root.ensureLibraries=async function(...names){await Promise.all(names.map(name=>{
  if(root[name])return Promise.resolve(root[name]);if(pending.has(name))return pending.get(name);
  if(!urls[name])return Promise.reject(new Error('Libreria sconosciuta'));
  const task=new Promise((resolve,reject)=>{
   const script=document.createElement('script');let timer;
   const fail=()=>{clearTimeout(timer);script.remove();pending.delete(name);reject(new Error('Caricamento '+name+' non riuscito. Controlla la connessione e riprova.'))};
   script.src=urls[name];script.async=true;script.onerror=fail;
   script.onload=()=>{clearTimeout(timer);if(!root[name])return fail();if(name==='pdfjsLib')root.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(root[name])};
   timer=setTimeout(fail,30000);document.head.append(script);
  });pending.set(name,task);return task;
 }))};
})(window);
