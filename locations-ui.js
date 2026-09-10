/* V207: the location draft belongs to the open store form; no writes until Save. */
(function(root){
  'use strict';
  root.OvergreenLocationUI={create({getStore,resolveLink,search}){
    const G=root.OvergreenLocations,$=id=>document.getElementById(id);
    let draft=null,candidate=null,changed=false,map=null,marker=null,tiles=null,epoch=0,busy=0,leafletPromise=null;
    const status=(message,error=false)=>{const n=$('storeLocationStatus');n.textContent=message;n.classList.toggle('location-error',error)};
    const current=()=>candidate||draft;
    function renderStatus(){
      $('storeLocationClear').hidden=!draft&&!candidate;
      $('storeLocationConfirm').hidden=!candidate;
      if(candidate)status('Posizione indicativa: controlla il segnaposto e confermalo oppure spostalo sull’ingresso.');
      else if(draft)status((changed?'Posizione scelta · premi Salva.':'Posizione precisa salvata.')+' Maps e distanze useranno questo punto.');
      else status('Nessuna posizione precisa. Maps cercherà il nome della sede.');
      $('storeLocationPreview').href=G.mapsUrl(current()?G.pair(current()):G.storeQuery(getStore()));
    }
    function setPin(p,confirmed=false){
      if(confirmed){draft=G.point(p.lat,p.lon);candidate=null;changed=true}else{candidate=p}
      if(map){
        if(marker)marker.setLatLng([p.lat,p.lon]);
        else{marker=root.L.marker([p.lat,p.lon],{draggable:true,icon:root.L.divIcon({className:'store-location-pin',iconSize:[22,22],iconAnchor:[11,11]}),title:'Trascina sul punto di accesso'}).addTo(map);marker.on('dragend',()=>{epoch++;busy=0;const q=marker.getLatLng();setPin({lat:q.lat,lon:q.lng},true)})}
        map.setView([p.lat,p.lon],Math.max(16,map.getZoom()));
      }
      renderStatus();
    }
    async function loadLeaflet(){
      if(root.L)return root.L;
      if(!leafletPromise)leafletPromise=new Promise((resolve,reject)=>{
        const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';document.head.appendChild(css);
        const s=document.createElement('script');s.src='vendor/leaflet/leaflet.js';
        const timer=setTimeout(()=>{s.remove();reject(new Error('Mappa non disponibile. Puoi comunque incollare un link o le coordinate.'))},12000);
        s.onload=()=>{clearTimeout(timer);resolve(root.L)};s.onerror=()=>{clearTimeout(timer);s.remove();reject(new Error('Mappa non disponibile. Puoi comunque incollare un link o le coordinate.'))};document.head.appendChild(s);
      }).catch(e=>{leafletPromise=null;throw e});return leafletPromise;
    }
    async function showMap(){
      const token=epoch;
      try{
        const L=await loadLeaflet();if(token!==epoch||!$('storeLocation').open||!$('storeDialog').open)return;
        if(!map){
          map=L.map('storeLocationMap',{scrollWheelZoom:false}).setView([44.7,10.5],6);
          tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(map);
          tiles.on('tileerror',()=>status('Sfondo mappa non disponibile: riprova con la connessione attiva o usa un link Maps.',true));
          map.on('click',e=>{epoch++;busy=0;setPin({lat:e.latlng.lat,lon:e.latlng.lng},true)});
        }
        map.invalidateSize();const p=current();if(p){const was=changed;setPin(p,!candidate&&!!draft);changed=was;renderStatus()}
      }catch(e){if(token===epoch)status(e.message,true)}
    }
    function begin(){return {epoch,identity:G.fingerprint(getStore())}}
    const valid=t=>t.epoch===epoch&&t.identity===G.fingerprint(getStore())&&$('storeDialog').open;
    async function run(button,action){
      if(button.disabled)return;
      epoch++;busy=1;const t=begin(),old=button.textContent;button.disabled=true;button.textContent='Attendi…';
      try{await action(t)}catch(e){if(t.epoch===epoch)status(e.message||String(e),true)}
      finally{if(t.epoch===epoch)busy=Math.max(0,busy-1);button.disabled=false;button.textContent=old}
    }
    $('storeLocation').addEventListener('toggle',()=>{if($('storeLocation').open)showMap()});
    $('storeLocationUseLink').onclick=()=>run($('storeLocationUseLink'),async t=>{
      const value=$('storeLocationLink').value.trim();if(!value)throw new Error('Incolla un link Maps oppure latitudine, longitudine.');
      const p=G.parseMapsPoint(value)||await resolveLink(value);if(!valid(t))return;
      if(!G.point(p?.lat,p?.lon))throw new Error('Il collegamento non contiene coordinate valide.');
      setPin(p,true);await showMap();
    });
    $('storeLocationGps').onclick=()=>run($('storeLocationGps'),async t=>{
      if(!navigator.geolocation)throw new Error('La posizione non è disponibile su questo dispositivo.');
      const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,()=>reject(new Error('Posizione non disponibile: abilita il GPS e il permesso di localizzazione.')),{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
      if(!valid(t))return;
      const p=G.point(pos.coords.latitude,pos.coords.longitude);if(!p)throw new Error('Il GPS non ha restituito una posizione valida.');
      if(pos.coords.accuracy>100)throw new Error('GPS troppo impreciso: riprova all’aperto oppure scegli il punto sulla mappa.');
      setPin(p);await showMap();status('Posizione del telefono (precisione circa '+Math.round(pos.coords.accuracy)+' m). Conferma solo se sei all’ingresso della sede.');
    });
    $('storeLocationConfirm').onclick=()=>{if(candidate){epoch++;busy=0;setPin(candidate,true)}};
    $('storeLocationClear').onclick=()=>{draft=null;candidate=null;changed=true;epoch++;busy=0;if(marker){marker.remove();marker=null}renderStatus()};
    $('storeLocationSearch').onclick=lookup;
    $('storeDialog').addEventListener('close',()=>{epoch++;busy=0;if(map){map.remove();map=null;marker=null;tiles=null}});
    // Editing while a lookup is running invalidates its reply; no stale coordinates.
    for(const id of ['storeName','storeAddress','storeCity','storeClient'])$(id).addEventListener('input',()=>{
      if(candidate){candidate=null;if(marker&&!draft){marker.remove();marker=null}else if(marker&&draft)marker.setLatLng([draft.lat,draft.lon])}
      $('storeLocationResults').replaceChildren();renderStatus();
    });
    async function lookup(){
      const button=$('storeAddressLookupBtn');
      return run(button,async t=>{
        const st=getStore();if(!st.nome&&!st.indirizzo&&!st.citta)throw new Error('Inserisci almeno il nome della sede o la città.');
        $('storeLocation').open=true;status('Ricerca della sede…');
        const hits=await search(st);if(!valid(t))return;
        const results=$('storeLocationResults');results.replaceChildren();
        if(!hits.length)throw new Error('Nessuna sede trovata. Incolla un link Maps o scegli il punto sulla mappa.');
        // Do not silently pick the first homonymous store or overwrite the address.
        for(const hit of hits){
          const b=document.createElement('button');b.type='button';b.className='secondary';
          b.textContent=(hit.precision==='area'?'Zona indicativa · ':hit.precision==='street'?'Via indicativa · ':'')+hit.label;
          b.onclick=()=>{epoch++;busy=0;setPin(hit);showMap()};results.appendChild(b);
        }
        if(hits.length===1&&!draft){setPin(hits[0]);await showMap()}
        else status('Scegli il risultato corretto e controllalo sulla mappa. La posizione salvata cambia soltanto dopo la tua scelta.');
      });
    }
    return {
      open(st){
        epoch++;busy=0;draft=G.confirmedPoint(st);changed=false;
        candidate=draft?null:G.point(st?.route_latitude,st?.route_longitude);
        if(map){map.remove();map=null;marker=null;tiles=null}
        $('storeLocation').open=false;$('storeLocationLink').value='';$('storeLocationResults').replaceChildren();renderStatus();
      },
      lookup,
      payload(){
        if(busy)throw new Error('Attendi che la ricerca della posizione sia terminata.');
        if(!changed)return {};
        const p=draft;
        return {latitudine:p?.lat??null,longitudine:p?.lon??null,route_latitude:p?.lat??null,route_longitude:p?.lon??null,
          route_geocoded_at:p?new Date().toISOString():null,route_geocode_label:p?G.storeQuery(getStore()):null};
      }
    };
  }};
})(typeof globalThis!=='undefined'?globalThis:this);
