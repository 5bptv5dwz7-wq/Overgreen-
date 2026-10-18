const fs=require('node:fs'),vm=require('node:vm'),{parseHTML}=require('linkedom');
const root=require('node:path').resolve(__dirname,'..')+'/',html=fs.readFileSync(root+'index.html','utf8'),{window,document}=parseHTML(html);
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const c={window,document,console,localStorage:store(),sessionStorage:store(),navigator:{userAgent:'test',onLine:true},location:{href:'https://example.test/',origin:'https://example.test/',search:'',pathname:'/'},history:{replaceState(){}},File,Blob,URL,URLSearchParams,crypto:require('node:crypto').webcrypto,performance,AbortController,AbortSignal,TextEncoder,TextDecoder,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},queueMicrotask,requestAnimationFrame:fn=>fn(),matchMedia:()=>({matches:false,addEventListener(){}}),fetch:async()=>({ok:true,json:async()=>({}),text:async()=>''}),indexedDB:require('fake-indexeddb').indexedDB,alert(){},confirm:()=>true,MutationObserver:window.MutationObserver};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return (this.querySelector('option[selected]')||this.querySelector('option'))?.value||''},set(value){for(const o of this.querySelectorAll('option'))if(o.value===String(value))o.setAttribute('selected','');else o.removeAttribute('selected')}});
window.HTMLElement.prototype.showModal=function(){this.setAttribute('open','')};window.HTMLElement.prototype.close=function(){this.removeAttribute('open')};window.HTMLElement.prototype.reset=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
window.fetch=c.fetch;window.matchMedia=c.matchMedia;window.setInterval=c.setInterval;window.setTimeout=c.setTimeout;window.clearTimeout=c.clearTimeout;window.URL=URL;
window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}})},functions:{invoke:async()=>({data:{users:[]}})},from:()=>({select(){return this},eq(){return this},order(){return this},then(resolve){return Promise.resolve({data:[]}).then(resolve)}})})};
vm.createContext(c);
for(const script of document.querySelectorAll('script[src]')){const src=script.getAttribute('src').split('?')[0];if(src.startsWith('http'))continue;vm.runInContext(fs.readFileSync(root+src,'utf8'),c,{filename:src});for(const key of Object.keys(window))if(key.startsWith('Overgreen')||key==='ensureLibraries')c[key]=window[key]}
console.log('PASS full application script order and initial binding');
vm.runInContext(`(async()=>{
 session={user:{id:'test-admin',email:'test@example.invalid'},access_token:'synthetic'};
 sb.rpc=async(name,args)=>({data:name==='overgreen_read_data_v271'?Object.fromEntries(args.p_sections.map(key=>[key,{data:key==='profiles'?[{id:'test-admin',nome:'Test',ruolo:'admin',attivo:true}]:[]}])):0});
 processUploadQueue=()=>{};cleanupPhotoRecoveryRows=async()=>{};
 await loadAll();
 if(!document.getElementById('syncFloatingBadge'))throw Error('Missing recovery badge');
 setView('stores',{reuse:true});const original=renderStores;let calls=0;renderStores=()=>{calls++;original()};
 setView('schedule',{reuse:true});setView('stores',{reuse:true});if(calls!==0)throw Error('Unchanged view rerendered');
 console.log('PASS authenticated snapshot, real view render, recovery UI and cached navigation');
})()`,c).catch(error=>{console.error(error);process.exitCode=1});
