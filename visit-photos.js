let visitPhotoHydrationQueued=false;
function visitPhotoUrl(path,refresh=false){return signedAttachmentUrl({storage_path:path},{refresh})}
function loadVisitPhoto(img,path){
 const request=String(Number(img.dataset.photoRequest||0)+1);img.dataset.photoRequest=request;
 img.loading='eager';img.decoding='async';img.style.minHeight='115px';
 let retried=false;
 const current=()=>img.dataset.photoRequest===request;
 const failed=()=>{if(!current())return;img.alt='Foto non disponibile · tocca per riprovare';img.title=img.alt;img.onclick=()=>loadVisitPhoto(img,path);delete img.dataset.loading};
 const start=async refresh=>{try{const url=await visitPhotoUrl(path,refresh);if(current())img.src=url}catch{failed()}};
 img.onload=()=>{if(current()){delete img.dataset.loading;img.title='';img.onclick=null}};
 img.onerror=()=>{if(!current())return;if(!retried){retried=true;void start(true)}else failed()};
 img.alt='Caricamento foto…';void start(false);
}
function visitPhotosMarkup(item){
 const photos=item?.instruction_photos||[];if(!photos.length)return '';
 if(!visitPhotoHydrationQueued){visitPhotoHydrationQueued=true;queueMicrotask(()=>{visitPhotoHydrationQueued=false;hydrateVisitPhotos()})}
 return `<section class="visit-photo-panel"><strong>📷 FOTO E INDICAZIONI PER QUESTO PASSAGGIO</strong><div class="visit-photo-previews">${photos.map(p=>`<button type="button" class="visit-photo-thumb" data-visit-photos="${esc(item.id)}"><img data-visit-photo-path="${esc(p.path)}" alt="${esc(p.caption||'Indicazione fotografica')}" loading="eager"><span>${esc(p.caption||'Foto annotata · apri')}</span></button>`).join('')}</div></section>`;
}
function hydrateVisitPhotos(){document.querySelectorAll('img[data-visit-photo-path]:not([src])').forEach(img=>{if(img.dataset.loading)return;img.dataset.loading='1';attachmentVisibility.observe(img,()=>loadVisitPhoto(img,img.dataset.visitPhotoPath))})}
async function openVisitPhotos(item){
 if(!item)return;let dialog=$('visitPhotosDialog');if(dialog)dialog.remove();
 dialog=document.createElement('dialog');dialog.id='visitPhotosDialog';dialog.className='visit-photos-dialog';
 const store=stores.find(s=>s.id===item.store_id),schedule=schedules.find(s=>s.id===item.schedule_id);
 dialog.innerHTML=`<header><div><h2>Foto e indicazioni</h2><p>${esc(store?.nome||'Sede')} · ${esc(schedule?.giorno?fmt(schedule.giorno):'')}</p></div><button type="button" data-close-visit aria-label="Chiudi">×</button></header>${admin()?'<section class="visit-photo-add"><label>Didascalia (facoltativa)<input data-visit-caption maxlength="500" placeholder="Es. Tagliare solo la zona cerchiata"></label><label class="file-label"><span>＋ Foto da annotare</span><input type="file" accept="image/*" data-visit-upload></label><p>La foto sarà visibile alla squadra solo su questo passaggio.</p></section>':''}<div class="visit-photos-list"></div>`;
 document.body.appendChild(dialog);dialog.querySelector('[data-close-visit]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
 dialog.querySelector('[data-visit-upload]')?.addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';if(file)void openPhotoAnnotator(store,file,{item,caption:dialog.querySelector('[data-visit-caption]').value.trim(),onSaved:async()=>{dialog.close();await loadAll();await openVisitPhotos(scheduleItems.find(x=>x.id===item.id)||item)}})});
 const list=dialog.querySelector('.visit-photos-list');
 for(const p of item.instruction_photos||[]){const card=document.createElement('article');card.innerHTML=`<img alt="${esc(p.caption||'Indicazione fotografica')}" loading="eager"><p>${esc(p.caption||'Foto annotata')}</p><div class="actions"><button type="button" class="secondary" data-original>Vedi originale</button>${admin()?'<button type="button" class="secondary" data-remove>Rimuovi dal passaggio</button>':''}</div>`;list.appendChild(card);loadVisitPhoto(card.querySelector('img'),p.path);
  let original=false;card.querySelector('[data-original]').onclick=()=>{original=!original;loadVisitPhoto(card.querySelector('img'),original?p.original_path:p.path);card.querySelector('[data-original]').textContent=original?'Vedi annotata':'Vedi originale'};
  card.querySelector('[data-remove]')?.addEventListener('click',async e=>{if(!admin()||!confirm('Rimuovere questa foto dalle indicazioni di questo passaggio?'))return;const btn=e.currentTarget;btn.disabled=true;try{const r=await sb.rpc('overgreen_visit_photo_v243',{p_item_id:item.id,p_remove_id:p.id});if(r.error)throw r.error;item.instruction_photos=r.data;await loadAll();dialog.close();await openVisitPhotos(scheduleItems.find(x=>x.id===item.id)||item)}catch(err){alert(err.message);btn.disabled=false}});
 }
 if(!(item.instruction_photos||[]).length)list.innerHTML='<p class="muted">Nessuna foto collegata a questo passaggio.</p>';
 dialog.showModal();
}
function addVisitPhotosButton(host,item){if(!host||!item)return;const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='📷 Foto e indicazioni';button.onclick=()=>openVisitPhotos(item);host.appendChild(button)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-visit-photos]');if(!b)return;e.preventDefault();e.stopPropagation();void openVisitPhotos(scheduleItems.find(i=>i.id===b.dataset.visitPhotos))});
