/* V225: move existing controls so their listeners and role restrictions survive. */
(function(){
  function disclosure(label,className){
    const d=document.createElement('details');d.className=className;
    const s=document.createElement('summary');s.textContent=label;d.append(s);return d;
  }
  function compactStore(card){
    const actions=card.querySelector('.actions');if(!actions)return;
    const more=disclosure('⋯','action-menu');more.firstElementChild.setAttribute('aria-label','Altre azioni della sede');
    const body=document.createElement('div');body.className='action-menu-body';
    [...actions.children].filter(b=>!b.matches('[data-map],[data-done]')).forEach(b=>body.append(b));
    if(body.children.length){more.append(body);actions.append(more)}
    card.classList.add('store-row');
    const place=card.querySelector('.card-top p');
    if(place&&(!place.textContent.trim()||place.textContent.trim().toLocaleLowerCase()===card.querySelector('h3').textContent.trim().toLocaleLowerCase()))place.remove();
  }
  function compactExtra(card){
    const actions=card.querySelector('.actions');if(!actions)return;
    const title=card.querySelector('.extra-card-heading')?.nextElementSibling;
    const detail=disclosure('Dettagli e altre azioni','extra-detail');
    const body=document.createElement('div');body.className='extra-detail-body';
    const dates=card.querySelector('.extra-date-summary');
    const meta=document.createElement('div');meta.className='extra-overview';
    if(dates){const execution=dates.querySelector('p:last-child');if(execution)meta.append(execution.cloneNode(true));const age=dates.querySelector('.elapsed-days');if(age)meta.append(age.cloneNode(true))}
    const keep=new Set([card.querySelector('.extra-card-heading'),title,card.querySelector('.extra-description'),card.querySelector('.target-number'),card.querySelector('.deadline'),card.querySelector('.extra-partial-badge'),card.querySelector('.extra-cancelled-badge'),card.querySelector('.extra-readonly-label'),card.querySelector('.linked-extra-reminder'),card.querySelector('.linked-ordinary-label')]);
    [...card.children].filter(n=>!keep.has(n)&&n!==actions).forEach(n=>body.append(n));
    const primary=document.createElement('div');primary.className='actions extra-primary';
    const action=actions.querySelector('[data-close-extra],[data-approve-extra]')||actions.querySelector('[data-program-extra],[data-work-progress],[data-generate-closure]');
    actions.querySelectorAll('[data-extra-map],[data-pdf]').forEach(button=>primary.append(button));
    if(action)primary.append(action);
    body.append(actions);detail.append(body);card.append(meta);
    const footer=document.createElement('div');footer.className='extra-footer';footer.append(detail,primary);card.append(footer);
    card.classList.add('extra-compact');
  }
  function initNavigation(){
    const nav=document.querySelector('.header-actions');if(!nav||nav.querySelector('.nav-more'))return;
    const more=disclosure('••• Altro','nav-more');const body=document.createElement('div');body.className='nav-more-body';
    const clients=document.querySelector('.client-workspaces');
    if(clients){
      const label=document.createElement('strong');label.className='workspace-menu-title';label.textContent='Cambia cliente';
      clients.prepend(label);body.append(clients);clients.classList.remove('hidden');
    }
    [...nav.children].filter(b=>!['dashboard','stores','schedule','extras'].includes(b.dataset.view)).forEach(b=>body.append(b));
    more.append(body);nav.append(more);
    body.addEventListener('click',e=>{if(e.target.closest('button'))more.open=false});
  }
  document.addEventListener('click',e=>{
    document.querySelectorAll('.action-menu[open],.nav-more[open]').forEach(d=>{if(!d.contains(e.target)||e.target.closest('button'))d.open=false});
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.action-menu[open],.nav-more[open]').forEach(d=>{d.open=false;d.firstElementChild.focus()})});
  window.OvergreenCompact={store:compactStore,extra:compactExtra,initNavigation};
})();
