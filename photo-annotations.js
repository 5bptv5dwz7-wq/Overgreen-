/* V242: nondestructive photo instructions, Pointer Events for Pencil/mouse/touch. */
function drawPhotoAnnotation(ctx,a){
 ctx.save();ctx.strokeStyle=a.color;ctx.fillStyle=a.color;ctx.lineWidth=a.width;ctx.lineCap='round';ctx.lineJoin='round';
 const p=a.points,start=p[0],end=p[p.length-1];
 if(a.tool==='text'){ctx.font=`bold ${a.width*5+18}px sans-serif`;ctx.textBaseline='top';ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.strokeText(a.text,start.x,start.y);ctx.fillText(a.text,start.x,start.y)}
 else if(a.tool==='circle'){ctx.beginPath();ctx.ellipse((start.x+end.x)/2,(start.y+end.y)/2,Math.max(1,Math.abs(end.x-start.x)/2),Math.max(1,Math.abs(end.y-start.y)/2),0,0,Math.PI*2);ctx.stroke()}
 else if(a.tool==='arrow'){const angle=Math.atan2(end.y-start.y,end.x-start.x),head=Math.max(20,a.width*4);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.moveTo(end.x-head*Math.cos(angle-.5),end.y-head*Math.sin(angle-.5));ctx.lineTo(end.x,end.y);ctx.lineTo(end.x-head*Math.cos(angle+.5),end.y-head*Math.sin(angle+.5));ctx.stroke()}
 else{if(a.tool==='highlight'){ctx.globalAlpha=.35;ctx.lineWidth=a.width*5}ctx.beginPath();ctx.moveTo(start.x,start.y);if(p.length===1)ctx.lineTo(start.x+.1,start.y);else for(const point of p.slice(1))ctx.lineTo(point.x,point.y);ctx.stroke()}
 ctx.restore();
}
async function openPhotoAnnotator(store,source){
 if(!admin()||!store||!source)return;
 let objectUrl,dialog;
 try{
  const isNew=source instanceof Blob;
  const blob=isNew?source:await fetch(await signedAttachmentUrl(source)).then(r=>{if(!r.ok)throw Error('Foto non disponibile');return r.blob()});
  if(blob.size>40*1024*1024)throw Error('Foto troppo grande: scegli un’immagine sotto 40 MB.');
  objectUrl=URL.createObjectURL(blob);const photo=new Image();photo.src=objectUrl;
  await photo.decode().catch(()=>{throw Error('Formato non leggibile. Esporta la foto in JPEG o PNG e riprova.');});
  dialog=document.createElement('dialog');dialog.className='photo-annotation-dialog';dialog.setAttribute('aria-label','Annota foto');
  dialog.innerHTML=`<header><div><h2>Annota foto</h2><p></p></div><button type="button" data-pa-close aria-label="Chiudi">×</button></header><div class="pa-toolbar"><div class="pa-tools" role="group" aria-label="Strumento">${[['pen','Penna'],['highlight','Evidenzia'],['arrow','Freccia'],['circle','Cerchio'],['text','Testo']].map(([v,t])=>`<button type="button" data-pa-tool="${v}" aria-pressed="${v==='pen'}">${t}</button>`).join('')}</div><div class="pa-options"><label>Colore<input type="color" data-pa-color value="#e32727"></label><label>Spessore<select data-pa-width><option value="4">Fine</option><option value="8" selected>Medio</option><option value="14">Spesso</option></select></label><label>Zoom<select data-pa-zoom><option value="1">Adatta</option><option value="1.5">150%</option><option value="2">200%</option></select></label><label class="pa-touch"><input type="checkbox" data-pa-touch> Disegna col dito</label><button type="button" class="secondary" data-pa-undo>↶ Annulla</button><button type="button" class="secondary" data-pa-redo>↷ Ripeti</button></div><label class="pa-text" hidden>Testo da inserire<input type="text" maxlength="160" data-pa-text placeholder="Scrivi qui, poi tocca la foto con la Pencil"></label></div><div class="pa-surface"><canvas aria-label="Foto da annotare"></canvas></div><footer><span data-pa-status role="status">Pencil o mouse per disegnare. Per il dito attiva l’opzione.</span><button type="button" data-pa-save>Salva copia annotata</button></footer>`;
  dialog.querySelector('header p').textContent=store.nome;document.body.appendChild(dialog);
  const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),scale=Math.min(1,2200/Math.max(photo.naturalWidth,photo.naturalHeight));
  canvas.width=Math.round(photo.naturalWidth*scale);canvas.height=Math.round(photo.naturalHeight*scale);
  let tool='pen',steps=[],redo=[],stroke=null,pointer=null,saving=false,originalSaved=!isNew,frame=null;
  const sessionId=Date.now()+'-'+crypto.randomUUID(),base=`punti-vendita/${store.id}/foto/${sessionId}`;
  const status=dialog.querySelector('[data-pa-status]'),saveButton=dialog.querySelector('[data-pa-save]');
  const render=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(photo,0,0,canvas.width,canvas.height);for(const a of steps)drawPhotoAnnotation(ctx,a);if(stroke)drawPhotoAnnotation(ctx,stroke);dialog.querySelector('[data-pa-undo]').disabled=!steps.length||saving;dialog.querySelector('[data-pa-redo]').disabled=!redo.length||saving;saveButton.disabled=!steps.length||saving};
  const scheduleRender=()=>{if(frame===null)frame=requestAnimationFrame(()=>{frame=null;render()})};
  const fit=()=>{const zoom=Number(dialog.querySelector('[data-pa-zoom]').value),surface=dialog.querySelector('.pa-surface'),width=Math.min(surface.clientWidth-24,canvas.width,Math.max(100,surface.clientHeight-24)*canvas.width/canvas.height);canvas.style.width=Math.max(100,width)*zoom+'px';canvas.style.height='auto'};
  const point=e=>{const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))}};
  canvas.onpointerdown=e=>{
   if(saving||pointer!==null||e.button>0||e.pointerType==='touch'&&!dialog.querySelector('[data-pa-touch]').checked)return;
   e.preventDefault();const text=dialog.querySelector('[data-pa-text]').value.trim();if(tool==='text'&&!text){status.textContent='Scrivi il testo nella barra prima di posizionarlo.';return}
   pointer=e.pointerId;canvas.setPointerCapture(pointer);stroke={tool,color:dialog.querySelector('[data-pa-color]').value,width:Number(dialog.querySelector('[data-pa-width]').value),text,points:[point(e)]};scheduleRender();
  };
  canvas.onpointermove=e=>{if(e.pointerId!==pointer||!stroke)return;e.preventDefault();if(['arrow','circle','text'].includes(stroke.tool))stroke.points=[stroke.points[0],point(e)];else for(const event of e.getCoalescedEvents?.()||[e])stroke.points.push(point(event));scheduleRender()};
  const finish=e=>{if(e.pointerId!==pointer||!stroke)return;if(e.type!=='pointercancel'){steps.push(stroke);redo=[]}stroke=null;pointer=null;scheduleRender()};
  canvas.onpointerup=finish;canvas.onpointercancel=finish;canvas.onlostpointercapture=e=>{if(pointer===e.pointerId){stroke=null;pointer=null;render()}};
  dialog.querySelectorAll('[data-pa-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.paTool;dialog.querySelectorAll('[data-pa-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));dialog.querySelector('.pa-text').hidden=tool!=='text';fit()});
  dialog.querySelector('[data-pa-undo]').onclick=()=>{if(steps.length)redo.push(steps.pop());render()};dialog.querySelector('[data-pa-redo]').onclick=()=>{if(redo.length)steps.push(redo.pop());render()};dialog.querySelector('[data-pa-zoom]').onchange=fit;
  const observer=new ResizeObserver(fit);observer.observe(dialog.querySelector('.pa-surface'));
  const close=()=>{if(saving)return;if(steps.length&&!confirm('Chiudere senza salvare le annotazioni?'))return;dialog.close()};
  dialog.querySelector('[data-pa-close]').onclick=close;dialog.oncancel=e=>{e.preventDefault();close()};
  const beforeUnload=e=>{if(steps.length){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',beforeUnload);
  dialog.onclose=()=>{observer.disconnect();if(frame!==null)cancelAnimationFrame(frame);window.removeEventListener('beforeunload',beforeUnload);URL.revokeObjectURL(objectUrl);dialog.remove()};
  saveButton.onclick=async()=>{
   if(saving||!steps.length||!admin())return;saving=true;stroke=null;pointer=null;render();status.textContent='Salvataggio in corso…';
   try{
    if(!originalSaved){const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':blob.type.includes('heic')?'heic':'jpg';const {error}=await sb.storage.from('documenti').upload(base+'-originale.'+ext,blob,{upsert:true,contentType:blob.type||'image/jpeg'});if(error)throw error;originalSaved=true}
    const output=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Impossibile esportare la foto')),'image/jpeg',.92));
    const {error}=await sb.storage.from('documenti').upload(base+'-ANNOTATA.jpg',output,{upsert:true,contentType:'image/jpeg',cacheControl:'3600'});if(error)throw error;
    steps=[];dialog.close();toast('Foto annotata salvata nella sede');await showStoreDetail(store);$('storeDetailBody').querySelector('[data-sheet-tab="photos"]')?.click();
   }catch(err){status.textContent='Salvataggio non riuscito: '+err.message+'. Le annotazioni sono ancora qui: riprova.'}finally{saving=false;if(dialog.isConnected)render()}
  };
  dialog.showModal();fit();render();
 }catch(err){if(objectUrl)URL.revokeObjectURL(objectUrl);dialog?.remove();alert('Impossibile aprire la foto: '+err.message)}
}
