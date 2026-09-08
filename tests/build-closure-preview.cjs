// Standalone visual fixture, with the real dialog, picker and closure handlers.
// All uploads and records stay in memory; no Supabase connection or real notification.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const styles=[...html.matchAll(/<style[\s\S]*?<\/style>|<link[^>]+rel="stylesheet"[^>]*>/g)].map(m=>{
 if(m[0].startsWith('<style'))return m[0];
 const file=m[0].match(/href="([^"]+)"/)[1].split('?')[0];
 return '<style>'+fs.readFileSync(path.join(root,file),'utf8')+'</style>';
}).join('\n');
const a=html.indexOf('<dialog id="closeExtraDialog"'),b=html.indexOf('</dialog>',a)+9;
const start=app.indexOf('function openExtraClosureDialog'),end=app.indexOf('function isRecoverableJwtError',start);
const setup=`
const $=id=>document.getElementById(id);
let attachments=[],closeExtraPhotoFiles=[],combinedExtraClosureQueue=[];
const profile={id:'test-worker'},stores=[{id:'test-store',nome:'Punto vendita di prova'}];
const extras=[{id:'test-extra',store_id:'test-store',titolo:'Pulizia parcheggio',numero_target:'PROVA-203',stato:'programmato'}];
const closureProfile=()=> 'eurospin',renderStructuredClose=()=>{},isStructuredExtra=()=>false,workItemsForExtra=()=>[],structuredCloseRows=()=>[];
const esc=s=>String(s??''),openDialog=id=>$(id).showModal(),openAttachment=()=>alert('Documento già caricato: questa è una prova.');
const toast=s=>$('result').textContent=s,refreshAfterSave=async()=>{},notifyAdminClosure=()=>{};
const sb={from(){return {update(){const q={eq:()=>q,select:()=>q,single:async()=>({})};return q;}}}};
`;
const finish=`
saveExtraUpload=async(id,tipo,file)=>{const row={id:crypto.randomUUID(),extra_id:id,tipo,nome_file:file.name};attachments.unshift(row);return row;};
cleanupReplacedAttachments=async()=>{};
$('open').onclick=()=>openExtraClosureDialog(extras[0]);
$('saved').onclick=()=>{attachments=[{id:'saved',extra_id:'test-extra',tipo:'rapportino_overgreen',nome_file:'Overgreen già caricato.pdf'}];openExtraClosureDialog(extras[0]);};
$('closeExtraDialog').querySelector('[data-close]').onclick=()=>$('closeExtraDialog').close();
openExtraClosureDialog(extras[0]);
`;
const child='<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles+'</head><body><main><h2>Prova chiusura extra</h2><button id="open">Apri extra di prova</button><button id="saved">Prova documento già caricato</button><p id="result" role="status"></p></main>'+html.slice(a,b)+'<script>'+fs.readFileSync(path.join(root,'extra-documents.js'),'utf8')+'\n'+setup+'\n'+app.slice(start,end)+'\n'+finish+'</script></body></html>';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const out='<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Chiusura extra V203 · prova</title></head><body style="font:16px system-ui;background:#e7eee8;margin:16px"><p>Prova V203 · file e salvataggi solo in memoria.</p><button onclick="document.querySelector(\'iframe\').style.width=\'390px\'">Telefono</button> <button onclick="document.querySelector(\'iframe\').style.width=\'1080px\'">Computer</button><iframe title="Chiusura extra di prova" style="display:block;width:390px;height:844px;max-width:100%;border:0;margin-top:12px" srcdoc="'+escape(child)+'"></iframe></body></html>';
fs.writeFileSync(process.argv[2]||path.join(__dirname,'closure-preview.html'),out);
