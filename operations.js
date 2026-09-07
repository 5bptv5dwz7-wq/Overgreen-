/* V200: derived operational views. No network calls or writes. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OvergreenOperations = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const categories = { all: 'Tutto', priority: 'Priorità', plan: 'Da programmare', resume: 'Da riprendere', documents: 'Foto e dati', review: 'Da verificare' };
  const clientLabels = { eurospin: 'Eurospin', intesa: 'Intesa Sanpaolo', privato: 'Privati' };
  const closed = new Set(['completato', 'in_attesa', 'annullato', 'riportato']);
  const dayMs = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return NaN;
    const ms = Date.parse(value + 'T12:00:00Z');
    return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value ? ms : NaN;
  };
  const addDays = (day, n) => new Date(dayMs(day) + n * 86400000).toISOString().slice(0, 10);
  const age = (day, end) => Math.floor((dayMs(end) - dayMs(day)) / 86400000);
  const normalized = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it').trim();
  const index = rows => new Map((rows || []).map(row => [row.id, row]));
  function group(rows, key) {
    const out = new Map();
    for (const row of rows || []) { if (!out.has(row[key])) out.set(row[key], []); out.get(row[key]).push(row); }
    return out;
  }
  function context(data) {
    const c = {
      stores: index(data.stores), schedules: index(data.schedules), items: index(data.scheduleItems), profiles: index(data.profiles),
      members: group(data.scheduleMembers, 'schedule_id'), workers: group(data.extraWorkers, 'extra_id'),
      photos: group((data.attachments || []).filter(a => a.tipo === 'foto_generica'), 'intervention_id'),
      work: group(data.extraWorkItems, 'extra_id')
    };
    c.client = row => clientLabels[row?.client_type] ? row.client_type : c.stores.get(row?.store_id)?.client_type || 'eurospin';
    c.state = item => item.effective_state || item.stato || 'da_fare';
    c.memberIds = rows => [...new Set((rows || []).map(r => r.profile_id).filter(id => c.profiles.get(id)?.attivo !== false && c.profiles.has(id)))].sort();
    c.team = scheduleId => c.memberIds(c.members.get(scheduleId));
    c.extraSchedule = e => c.schedules.get(c.items.get(e.schedule_item_id)?.schedule_id || e.schedule_id);
    c.extraDay = e => e.giorno_intervento || c.extraSchedule(e)?.giorno || '';
    c.extraTeam = e => {
      const assigned = c.memberIds(c.workers.get(e.id));
      return assigned.length ? assigned : c.team(c.extraSchedule(e)?.id);
    };
    return c;
  }
  function inbox(data, { today, now = Date.now() } = {}) {
    if (!data.isAdmin || !Number.isFinite(dayMs(today))) return [];
    const c = context(data), rows = [];
    const ongoing = new Set((data.interventions || []).filter(i => i.multi_day_open && i.stato !== 'rifiutato').map(i => i.store_id));
    const planned = new Set((data.scheduleItems || []).filter(i => !['completato', 'annullato', 'riportato'].includes(c.state(i)) && !['annullato', 'riportato'].includes(i.stato) && c.schedules.has(i.schedule_id)).map(i => i.store_id));
    function add(kind, id, title, subtitle, client, date, reasons, action, extra = {}) {
      if (!reasons.length) return;
      const tags = [...new Set(reasons.map(r => r.category))];
      rows.push({ key: kind + ':' + id, kind, id, title, subtitle, client, date: date || '', reasons, tags, severity: Math.min(...reasons.map(r => r.severity)), action, ...extra });
    }
    const reason = (category, severity, text) => ({ category, severity, text });
    for (const e of data.extras || []) {
      if (['completato', 'annullato', 'riportato'].includes(e.stato)) continue;
      const st = c.stores.get(e.store_id), client = c.client(e), date = c.extraDay(e), reasons = [];
      const title = st?.nome || e.nome_esterno || e.titolo || 'Extra';
      const subtitle = [e.titolo, e.numero_target ? 'Target/Ticket ' + e.numero_target : '', st?.citta].filter(Boolean).join(' · ');
      if (e.stato === 'in_attesa') reasons.push(reason('review', 2, 'Extra eseguito, in attesa di convalida.'));
      else {
        const elapsed = age(e.data_richiesta || String(e.created_at || '').slice(0, 10), today);
        const deadline = Date.parse(e.deadline_at || '');
        if (e.urgente === true || e.priorita === 'urgente') reasons.push(reason('priority', 0, 'Segnalato come urgente.'));
        else if (elapsed >= 7) reasons.push(reason('priority', 0, 'Richiesta aperta da ' + elapsed + ' giorni.'));
        if (Number.isFinite(deadline) && deadline < now) reasons.push(reason('priority', 1, 'Scadenza superata.'));
        else if (Number.isFinite(deadline) && deadline <= now + 3 * 86400000) reasons.push(reason('priority', 3, 'Scadenza entro tre giorni.'));
        if (e.stato === 'da_integrare') reasons.push(reason('resume', 1, 'Esecuzione parziale: lavoro da riprendere.'));
        if (!date) reasons.push(reason('plan', 2, e.con_ordinario ? 'Da collegare a un passaggio ordinario.' : 'Data di esecuzione da scegliere.'));
        else if (date < today) reasons.push(reason('plan', 1, 'Data programmata superata: verifica esecuzione o nuova data.'));
        if (!c.extraTeam(e).length) reasons.push(reason('plan', 2, 'Squadra da assegnare.'));
        if (client === 'eurospin' && !String(e.numero_target || '').trim()) reasons.push(reason('documents', 2, 'Numero target mancante.'));
      }
      const work = c.work.get(e.id) || [];
      add('extra', e.id, title, subtitle, client, date, reasons, 'extra', { progress: work.length ? { done: work.filter(w => w.stato === 'completata').length, total: work.length } : null });
    }
    for (const i of data.interventions || []) {
      if (!['in_attesa', 'convalidato'].includes(i.stato) && !i.multi_day_open) continue;
      if (i.stato === 'rifiutato') continue;
      const st = c.stores.get(i.store_id), reasons = [], actual = (c.photos.get(i.id) || []).length, expected = Math.max(0, Number(i.foto_attese) || 0);
      if (actual < expected) reasons.push(reason('documents', 0, 'Ricevute ' + actual + ' delle ' + expected + ' foto attese. Controlla anche il dispositivo usato per inviarle.'));
      if (i.multi_day_open) reasons.push(reason('resume', 1, 'Intervento su più giorni ancora aperto.'));
      else if (i.stato === 'in_attesa' && actual >= expected) reasons.push(reason('review', 2, 'Intervento eseguito, pronto per la convalida.'));
      add('intervention', i.id, st?.nome || 'Sede non attiva', 'Intervento ordinario', c.client(i), i.data_intervento, reasons, actual < expected ? 'history' : i.multi_day_open && st ? 'resume' : 'pending', { storeId: i.store_id });
    }
    for (const st of data.stores || []) {
      if (st.attivo === false || planned.has(st.id) || ongoing.has(st.id) || !(Number(st.intervallo_giorni) > 0)) continue;
      const elapsed = age(st.ultimo_passaggio, today), late = elapsed - Number(st.intervallo_giorni), reasons = [];
      if (!st.ultimo_passaggio) reasons.push(reason('plan', 2, 'Primo passaggio da programmare: manca la data dell’ultimo intervento.'));
      else if (late > 0) reasons.push(reason('priority', late > 10 ? 0 : 1, 'Passaggio in ritardo di ' + late + (late === 1 ? ' giorno.' : ' giorni.')));
      else if (late >= -3) reasons.push(reason('priority', 3, late === 0 ? 'Passaggio in scadenza oggi.' : 'Passaggio in scadenza tra ' + Math.abs(late) + (late === -1 ? ' giorno.' : ' giorni.')));
      if (reasons.length && !reasons.some(r => r.category === 'plan')) reasons.push(reason('plan', Math.max(2, reasons[0].severity), 'Non ancora inserito in una programmazione.'));
      add('store', st.id, st.nome || 'Sede', [st.citta, st.indirizzo].filter(Boolean).join(' · '), c.client(st), Number.isFinite(dayMs(st.ultimo_passaggio)) ? addDays(st.ultimo_passaggio, Number(st.intervallo_giorni)) : '', reasons, 'planStore');
    }
    for (const item of data.scheduleItems || []) {
      const sch = c.schedules.get(item.schedule_id), st = c.stores.get(item.store_id);
      if (!sch || c.state(item) !== 'da_fare' || ['annullato', 'riportato'].includes(item.stato) || ongoing.has(item.store_id)) continue;
      const reasons = [];
      if (sch.giorno < today) reasons.push(reason('priority', 1, 'Lavoro ancora aperto in una giornata passata.'));
      if (!c.team(sch.id).length) reasons.push(reason('plan', 2, 'Lavoro programmato senza una squadra attiva.'));
      add('scheduleItem', item.id, st?.nome || 'Sede non attiva', 'Passaggio programmato', c.client(item), sch.giorno, reasons, 'schedule');
    }
    for (const a of data.scheduleActivities || []) {
      if (a.stato !== 'completato' || a.consuntivato_at) continue;
      add('activity', a.id, a.titolo || 'Attività', 'Consuntivo da completare', a.store_id ? c.client(a) : null, String(a.completed_at || '').slice(0, 10), [reason('review', 2, 'Attività conclusa: registra esito, tempo ed eventuali spese.')], 'consuntivo');
    }
    return rows.sort((a, b) => a.severity - b.severity || (a.date || '9999').localeCompare(b.date || '9999') || a.title.localeCompare(b.title, 'it') || a.key.localeCompare(b.key));
  }
  function filterInbox(rows, { client = 'all', query = '', category = 'all' } = {}) {
    const q = normalized(query);
    const base = rows.filter(r => (client === 'all' || r.client === client) && (!q || normalized([r.title, r.subtitle, clientLabels[r.client], ...r.reasons.map(x => x.text)].join(' ')).includes(q)));
    const counts = Object.fromEntries(Object.keys(categories).map(key => [key, key === 'all' ? base.length : base.filter(r => r.tags.includes(key)).length]));
    return { counts, rows: category === 'all' ? base : base.filter(r => r.tags.includes(category)) };
  }
  function week(data, { today, client = 'all', worker = 'all', query = '' } = {}) {
    if (!data.isAdmin || !Number.isFinite(dayMs(today))) return [];
    const c = context(data), days = Array.from({ length: 7 }, (_, i) => ({ date: addDays(today, i), groups: [], conflicts: [] }));
    const byDay = new Map(days.map(d => [d.date, new Map()])), seen = new Set(), q = normalized(query);
    function add(kind, row, date, memberIds, title, clientType, state, search = '') {
      const day = byDay.get(date), id = kind + ':' + row.id;
      if (!day || seen.has(id) || (client !== 'all' && clientType !== client) || (worker === 'unassigned' ? memberIds.length : worker !== 'all' && !memberIds.includes(worker))) return;
      if (q && !normalized([title, search, clientLabels[clientType]].join(' ')).includes(q)) return;
      seen.add(id);
      const key = memberIds.join('|') || 'unassigned';
      if (!day.has(key)) day.set(key, { key, memberIds, label: memberIds.map(id => c.profiles.get(id)?.nome || 'Operatore').join(' + ') || 'Da assegnare', jobs: [], open: 0, pending: 0, done: 0 });
      const team = day.get(key), bucket = state === 'in_attesa' ? 'pending' : closed.has(state) || state === 'convalidato' ? 'done' : 'open';
      team.jobs.push({ id: row.id, kind, title, state: bucket }); team[bucket]++;
    }
    for (const i of data.scheduleItems || []) {
      if (['annullato', 'riportato'].includes(i.stato) || ['annullato', 'riportato'].includes(c.state(i))) continue;
      const sch = c.schedules.get(i.schedule_id), st = c.stores.get(i.store_id);
      if (sch) add('ordinary', i, sch.giorno, c.team(sch.id), st?.nome || 'Sede non attiva', c.client(i), c.state(i), [st?.citta, st?.indirizzo].join(' '));
    }
    for (const e of data.extras || []) {
      if (['annullato', 'riportato'].includes(e.stato)) continue;
      const st = c.stores.get(e.store_id);
      add('extra', e, c.extraDay(e), c.extraTeam(e), st?.nome || e.nome_esterno || e.titolo || 'Extra', c.client(e), e.stato, [e.titolo, e.numero_target, st?.citta].join(' '));
    }
    for (const a of data.scheduleActivities || []) {
      if (['annullato', 'riportato'].includes(a.stato)) continue;
      const sch = c.schedules.get(a.schedule_id);
      if (sch) add('activity', a, sch.giorno, c.team(sch.id), a.titolo || 'Attività', a.store_id ? c.client(a) : null, a.stato);
    }
    for (const d of days) {
      d.groups = [...byDay.get(d.date).values()].sort((a, b) => Number(a.key === 'unassigned') - Number(b.key === 'unassigned') || a.label.localeCompare(b.label, 'it'));
      const teamsPerMember = new Map();
      for (const g of d.groups.filter(g => g.open)) for (const id of g.memberIds) teamsPerMember.set(id, (teamsPerMember.get(id) || 0) + 1);
      d.conflicts = [...teamsPerMember].filter(([, n]) => n > 1).map(([id]) => c.profiles.get(id)?.nome || 'Operatore');
      d.total = d.groups.reduce((n, g) => n + g.jobs.length, 0);
    }
    return days;
  }
  return { categories, clientLabels, inbox, filterInbox, week, addDays };
});
