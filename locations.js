/* V207. One destination for navigation and travel; only a confirmed pin is exact.
   Shared with resolve-maps-link. No network or storage access on import. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.OvergreenLocations=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function point(lat,lon){
    if(lat===null||lat===undefined||lon===null||lon===undefined||clean(lat)===''||clean(lon)==='')return null;
    lat=Number(lat);lon=Number(lon);
    return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;
  }
  const confirmedPoint=st=>point(st?.latitudine,st?.longitudine);
  const pair=p=>`${p.lat},${p.lon}`;
  function join(parts){const seen=new Set();return parts.map(clean).filter(x=>x&&!seen.has(norm(x))&&seen.add(norm(x))).join(', ')}
  function storeName(st){
    const brand=({eurospin:'Eurospin',intesa:'Intesa Sanpaolo'})[st?.client_type]||'';
    const name=clean(st?.nome);
    return brand&&!norm(name).includes(norm(brand))?[brand,name].filter(Boolean).join(' '):name;
  }
  const storeQuery=st=>join([storeName(st),st?.indirizzo,st?.citta,st?.provincia,'Italia']);
  function storeDestination(st){const p=confirmedPoint(st);return p?pair(p):storeQuery(st)}
  const mapsUrl=destination=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(destination);
  function fingerprint(st){return JSON.stringify([st?.id||'',norm(st?.client_type),norm(st?.nome),norm(st?.indirizzo),norm(st?.citta),norm(st?.provincia),confirmedPoint(st)])}
  function coordinateText(value){
    const m=clean(value).match(/^([+-]?\d{1,3}(?:\.\d+)?)\s*[,;]\s*([+-]?\d{1,3}(?:\.\d+)?)$/);
    return m?point(m[1],m[2]):null;
  }
  function allowedMapsUrl(value){
    let u;try{u=new URL(value)}catch{return null}
    if(u.protocol!=='https:'||u.username||u.password||u.port||u.href.length>4096)return null;
    const h=u.hostname.toLowerCase(),p=u.pathname;
    if(h==='maps.app.goo.gl'&&/^\/[a-zA-Z0-9_-]+\/?$/.test(p))return u;
    if(h==='goo.gl'&&p.startsWith('/maps/'))return u;
    if(['www.google.com','google.com','www.google.it','google.it'].includes(h)&&/^\/maps(?:\/|$)/.test(p))return u;
    if(h==='maps.google.com'&&(p==='/'||/^\/maps(?:\/|$)/.test(p)))return u;
    if(h==='maps.apple.com'||(h==='maps.apple'&&p.startsWith('/p/')))return u;
    return null;
  }
  function parseMapsPoint(value){
    const raw=clean(value),direct=coordinateText(raw);if(direct)return direct;
    // Accept the URL inside an iPhone share text, but never arbitrary numeric prose.
    const match=raw.match(/https:\/\/[^\s<>]+/),u=allowedMapsUrl(match?.[0]||raw);if(!u)return null;
    let decoded;try{decoded=decodeURIComponent(u.href)}catch{return null}
    const apple=u.hostname.startsWith('maps.apple');
    // A directions destination takes precedence over all camera/origin coordinates.
    if(/\/dir(?:\/|$)/.test(u.pathname)||u.searchParams.has('daddr')){
      return coordinateText(u.searchParams.get('destination')||u.searchParams.get('daddr')||'');
    }
    const pin=decoded.match(/!3d([+-]?\d+(?:\.\d+)?)!4d([+-]?\d+(?:\.\d+)?)/);
    if(pin)return point(pin[1],pin[2]);
    for(const key of apple?['coordinate','q']:['query','q']){
      const p=coordinateText(u.searchParams.get(key)||'');if(p)return p;
    }
    // Apple ll with a label is an explicit pin. Unlabelled ll / center / @lat,lon
    // describe the viewport and must NOT silently become a store location.
    if(apple&&u.searchParams.get('q'))return coordinateText(u.searchParams.get('ll')||'');
    return null;
  }
  async function resolveMapsLink(value,fetcher){
    const raw=clean(value),m=raw.match(/https:\/\/[^\s<>]+/);
    let u=allowedMapsUrl(m?.[0]||raw);if(!u)throw new Error('Incolla un collegamento Google Maps o Apple Maps valido.');
    const visited=new Set();
    for(let i=0;i<6;i++){
      const p=parseMapsPoint(u.href);if(p)return p;
      if(visited.has(u.href))break;visited.add(u.href);
      const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(8000)});
      const next=r.headers.get('location');
      if(r.body)await r.body.cancel();
      if(r.status<300||r.status>=400||!next)break;
      // Check every hop before fetching. Never forward a token or follow google /url.
      u=allowedMapsUrl(new URL(next,u).href);if(!u)break;
    }
    throw new Error('Il link non contiene un punto preciso. Sceglilo sulla mappa oppure incolla le coordinate del segnaposto.');
  }
  function candidateNominatim(row){
    const p=point(row?.lat,row?.lon);if(!p)return null;
    const a=row.address||{},kind=row.addresstype||row.type||'',category=row.class||row.category||'';
    return {...p,name:row.name||'',label:row.display_name||'',street:join([a.road||a.pedestrian||a.residential,a.house_number]),
      city:a.city||a.town||a.village||a.municipality||a.hamlet||'',province:a.county||'',country:a.country_code||'',
      localities:[a.city,a.town,a.village,a.municipality,a.hamlet].filter(Boolean),
      precision:['shop','amenity','office','building'].includes(category)?'place':a.house_number?'address':['road','street','residential','pedestrian','unclassified','tertiary','secondary','primary'].includes(kind)||category==='highway'?'street':'area',source:'Nominatim'};
  }
  function candidatePhoton(row){
    const p=point(row?.geometry?.coordinates?.[1],row?.geometry?.coordinates?.[0]);if(!p)return null;
    const a=row.properties||{};
    return {...p,name:a.name||'',label:join([a.name,a.street,a.housenumber,a.city||a.locality,a.state]),street:join([a.street,a.housenumber]),
      city:a.city||a.locality||'',province:a.county||'',country:a.countrycode||'',localities:[a.city,a.locality,a.district].filter(Boolean),
      precision:['shop','amenity','office','building'].includes(a.osm_key)?'place':a.housenumber?'address':a.osm_key==='highway'?'street':'area',source:'Photon'};
  }
  function matchesLocality(hit,st){
    if(norm(hit.country)!=='it')return false;
    const city=norm(st?.citta),province=norm(st?.provincia);
    if(city&&!hit.localities.some(x=>norm(x)===city))return false;
    if(!city&&st?.nome){
      const hint=norm(st.nome).replace(/eurospin|intesa sanpaolo/g,'').trim();
      if(hint&&!norm(hit.label).includes(hint))return false;
    }
    // Province abbreviations are not returned consistently by the providers.
    if(province.length>2&&!norm(hit.province).includes(province))return false;
    return true;
  }
  function isStorePlace(hit,st){
    if(!matchesLocality(hit,st)||hit.precision!=='place')return false;
    const n=norm(hit.name),brand=({eurospin:'eurospin',intesa:'intesa'})[st?.client_type];
    if(brand)return n.includes(brand);
    return !!norm(st?.nome)&&n.includes(norm(st.nome));
  }
  function createService({fetch:fetcher,getStore,readCache=()=>({}),writeCache=()=>{},now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms))}){
    const pending=new Map();let queue=Promise.resolve(),lastSearch=-Infinity;
    const cached=(key,ttl)=>{const e=readCache()[key];return e&&now()-e.savedAt<ttl?e.value:null};
    const put=(key,value)=>{const cache=readCache();cache[key]={savedAt:now(),value};
      const entries=Object.entries(cache).sort((a,b)=>b[1].savedAt-a[1].savedAt).slice(0,600);writeCache(Object.fromEntries(entries));return value};
    async function json(url){
      let r;try{r=await fetcher(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)})}catch{throw new Error('Errore di connessione durante il calcolo viaggio')}
      if(!r.ok)throw new Error('Servizio indirizzi o percorsi non disponibile (HTTP '+r.status+')');return r.json();
    }
    function search(query){
      const key='search:'+norm(query),old=cached(key,86400000);if(old)return Promise.resolve(old);
      if(pending.has(key))return pending.get(key);
      const task=queue.catch(()=>{}).then(async()=>{
        const delay=1100-(now()-lastSearch);if(delay>0)await sleep(delay);lastSearch=now();
        let hits=[];
        try{const rows=await json('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=it&q='+encodeURIComponent(query));hits=(rows||[]).map(candidateNominatim).filter(Boolean)}catch(e){
          if(String(e.message).includes('429'))throw e;
        }
        if(!hits.length){const data=await json('https://photon.komoot.io/api/?limit=5&lang=it&q='+encodeURIComponent(query));hits=(data.features||[]).map(candidatePhoton).filter(Boolean)}
        return put(key,hits.filter(h=>norm(h.country)==='it'));
      });queue=task;pending.set(key,task);task.finally(()=>pending.delete(key)).catch(()=>{});return task;
    }
    async function candidates(st){
      if(!clean(st?.nome)&&!clean(st?.indirizzo)&&!clean(st?.citta))return [];
      const qs=[storeQuery(st),join([storeName(st),st?.citta,st?.provincia,'Italia'])];
      let places=[];
      for(const q of [...new Set(qs)]){places=(await search(q)).filter(h=>isStorePlace(h,st));if(places.length)break}
      if(places.length)return places;
      // Fallbacks are suggestions only. They can never become a confirmed pin.
      const q=join([st?.indirizzo,st?.citta||st?.nome,st?.provincia,'Italia']);
      return (await search(q)).filter(h=>matchesLocality(h,st)).slice(0,5);
    }
    function describe(ref){
      if(String(ref).startsWith('store:')){
        const st=getStore(String(ref).slice(6));if(!st)throw new Error('Sede non disponibile');
        return {st,key:fingerprint(st),label:storeQuery(st),point:confirmedPoint(st)};
      }
      const label=clean(ref);if(!label||norm(label)==='italia')throw new Error('Indirizzo non trovato: specificare la sede');
      return {key:label,label,point:coordinateText(label)};
    }
    async function geocode(ref){
      const d=describe(ref);if(d.point)return {...d.point,approximate:false,resolvedAddress:d.label,source:'confirmed'};
      const key='geo207:'+d.key,old=cached(key,7*86400000);if(old)return old;
      if(pending.has(key))return pending.get(key);
      const task=(async()=>{
        const hits=d.st?await candidates(d.st):await search(d.label);
        // Multiple businesses with the same name need a human choice.
        const places=hits.filter(h=>h.precision==='place');
        if(places.length>1)throw new Error('Posizione da verificare: più sedi trovate. Apri l’anagrafica e imposta il punto Maps.');
        const hit=hits.find(h=>h.precision!=='area');
        if(!hit)throw new Error('Posizione da verificare: trovato soltanto un comune o una zona. Imposta il punto Maps in anagrafica.');
        // Until a user confirms a pin, even an apparently good result is a estimate.
        return put(key,{lat:hit.lat,lon:hit.lon,resolvedAddress:hit.label,source:hit.source,approximate:true});
      })();pending.set(key,task);task.finally(()=>pending.delete(key)).catch(()=>{});return task;
    }
    async function route(from,to){
      const d1=describe(from),d2=describe(to);
      const [a,b]=await Promise.all([geocode(from),geocode(to)]);
      // Resolve current points FIRST: a changed pin cannot hit an old route cache.
      const key='route207:'+JSON.stringify([d1.key,d2.key,a.lat,a.lon,b.lat,b.lon,a.approximate,b.approximate]);
      const old=cached(key,30*86400000);if(old)return old;
      if(pending.has(key))return pending.get(key);
      const task=(async()=>{
        const data=await json(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false&steps=false`);
        const r=data.routes?.[0];if(!r||!Number.isFinite(r.distance)||!Number.isFinite(r.duration)||r.distance<0||r.duration<0)throw new Error('Percorso stradale non trovato');
        return put(key,{km:r.distance/1000,minutes:Math.max(1,Math.round(r.duration/60)),approximate:!!(a.approximate||b.approximate),fromResolved:a.resolvedAddress,toResolved:b.resolvedAddress});
      })();pending.set(key,task);task.finally(()=>pending.delete(key)).catch(()=>{});return task;
    }
    return {search,candidates,geocode,route,describe};
  }
  return {clean,norm,point,pair,join,confirmedPoint,storeName,storeQuery,storeDestination,mapsUrl,fingerprint,coordinateText,allowedMapsUrl,parseMapsPoint,resolveMapsLink,candidateNominatim,candidatePhoton,matchesLocality,isStorePlace,createService};
});
