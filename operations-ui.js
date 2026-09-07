/* V200: navigation uses the existing forms; this page never saves data itself. */
const operationsState = { tab: 'inbox', category: 'all', limit: 30 };
let operationsDataUpdatedAt = null;

function operationsSnapshot() {
  return { isAdmin: admin(), stores, interventions, schedules, scheduleMembers,
    scheduleItems: scheduleItems.map(item => ({ ...item, effective_state: effectiveScheduleState(item) })),
    extras, extraWorkers, attachments, extraWorkItems, profiles, scheduleActivities };
}
function openOperations(tabName = 'inbox') {
  if (!admin()) return;
  operationsState.tab = tabName === 'week' ? 'week' : 'inbox';
  setView('operations');
}
function renderOperationsShortcut() {
  const root = $('operationsShortcut'), model = window.OvergreenOperations;
  if (!root) return;
  root.classList.toggle('hidden', !admin());
  if (!admin() || !model) { root.replaceChildren(); return; }
  const rows = model.inbox(operationsSnapshot(), { today: today() });
  root.innerHTML = `<button type="button" data-ops-shortcut="inbox"><span><strong>Da gestire</strong><small>Priorità, foto e lavori aperti</small></span><b>${rows.length}</b></button><button type="button" data-ops-shortcut="week"><span><strong>Squadre · 7 giorni</strong><small>Assegnazioni e avanzamento</small></span><b aria-hidden="true">→</b></button>`;
  root.querySelectorAll('[data-ops-shortcut]').forEach(button => button.onclick = () => openOperations(button.dataset.opsShortcut));
}
function operationsFilters() {
  return { client: $('operationsClient').value, query: $('operationsSearch').value, worker: $('operationsWorker').value };
}
function renderOperations() {
  const root = $('operationsView'), model = window.OvergreenOperations;
  if (!root) return;
  if (!admin()) { $('operationsList').replaceChildren(); $('operationsWeekList').replaceChildren(); return; }
  if (!model) { $('operationsUpdated').textContent = 'Pagina non caricata. Riapri l’app con una connessione disponibile.'; return; }
  const week = operationsState.tab === 'week';
  root.querySelectorAll('[data-ops-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.opsTab === operationsState.tab)));
  $('operationsInboxPanel').classList.toggle('hidden', week);
  $('operationsWeekPanel').classList.toggle('hidden', !week);
  $('operationsWorkerWrap').classList.toggle('hidden', !week);
  $('operationsUpdated').textContent = (navigator.onLine === false ? 'Connessione assente · ' : '') + (operationsDataUpdatedAt ? 'Dati aggiornati alle ' + operationsDataUpdatedAt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'Aggiorna per leggere i dati più recenti.');
  const select = $('operationsWorker'), selected = select.value || 'all';
  select.innerHTML = '<option value="all">Tutti gli operatori</option><option value="unassigned">Senza squadra</option>' + profiles.filter(p => p.attivo !== false).map(p => `<option value="${esc(p.id)}">${esc(p.nome || 'Operatore')}</option>`).join('');
  select.value = [...select.options].some(o => o.value === selected) ? selected : 'all';
  const snapshot = operationsSnapshot(), filters = operationsFilters();
  if (week) renderOperationsWeek(model.week(snapshot, { ...filters, today: today() }));
  else renderOperationsInbox(model.filterInbox(model.inbox(snapshot, { today: today() }), { ...filters, category: operationsState.category }));
}
function renderOperationsInbox(result) {
  const model = window.OvergreenOperations, tabs = $('operationsCategories'), list = $('operationsList');
  tabs.innerHTML = Object.entries(model.categories).map(([key, label]) => `<button type="button" data-ops-category="${key}" aria-pressed="${operationsState.category === key}">${esc(label)}<b>${result.counts[key]}</b></button>`).join('');
  tabs.querySelectorAll('[data-ops-category]').forEach(button => button.onclick = () => { operationsState.category = button.dataset.opsCategory; operationsState.limit = 30; renderOperations(); });
  $('operationsCount').textContent = result.rows.length + (result.rows.length === 1 ? ' voce da gestire' : ' voci da gestire') + ' · una voce può richiedere più azioni';
  list.replaceChildren();
  if (!result.rows.length) {
    const filtered = operationsState.category !== 'all' || $('operationsClient').value !== 'all' || $('operationsSearch').value.trim();
    list.innerHTML = `<div class="ops-empty"><strong>${filtered ? 'Nessuna voce con questi filtri' : 'Nessuna segnalazione nei dati caricati'}</strong><p>${filtered ? 'Prova un altro filtro o cancella la ricerca.' : 'Le priorità, le foto attese e le attività da verificare compariranno qui.'}</p></div>`;
  }
  for (const row of result.rows.slice(0, operationsState.limit)) {
    const card = document.createElement('article'); card.className = 'ops-card'; card.dataset.severity = row.severity;
    const labels = ['Urgente', 'Da recuperare', 'Da organizzare', 'In scadenza'];
    const actionLabels = { extra: 'Apri extra', history: 'Controlla foto', resume: 'Riprendi intervento', pending: 'Apri convalide', planStore: 'Prepara programma', schedule: 'Apri giornata', consuntivo: 'Completa consuntivo' };
    card.innerHTML = `<div class="ops-card-head"><span>${esc(model.clientLabels[row.client] || 'Attività aziendale')}</span><span class="ops-priority">${row.severity === 2 && row.tags.includes('review') ? 'Da verificare' : labels[row.severity]}</span></div><h3>${esc(row.title)}</h3><p class="ops-subtitle">${esc(row.subtitle)}${row.date ? ' · ' + esc(fmt(row.date)) : ''}</p><ul class="ops-reasons">${row.reasons.map(r => `<li>${esc(r.text)}</li>`).join('')}</ul>${row.progress ? `<div class="ops-progress">${row.progress.done} di ${row.progress.total} lavorazioni completate<progress max="${row.progress.total}" value="${row.progress.done}" aria-label="Lavorazioni completate"></progress></div>` : ''}<div class="actions"><button type="button" data-ops-action>${actionLabels[row.action] || 'Apri'}</button>${row.kind === 'extra' && row.tags.includes('documents') ? '<button type="button" class="secondary" data-ops-edit>Modifica dati</button>' : ''}</div>`;
    card.querySelector('[data-ops-action]').onclick = () => runOperationsAction(row);
    card.querySelector('[data-ops-edit]')?.addEventListener('click', () => { if (!admin()) return; const e = extras.find(e => e.id === row.id); if (e) openExtraEdit(e); });
    list.appendChild(card);
  }
  const more = $('operationsMore'); more.classList.toggle('hidden', result.rows.length <= operationsState.limit);
  more.textContent = 'Mostra altre ' + Math.min(30, Math.max(0, result.rows.length - operationsState.limit));
}
function renderOperationsWeek(days) {
  const root = $('operationsWeekList'); root.replaceChildren();
  for (const day of days) {
    const card = document.createElement('section'); card.className = 'ops-day';
    const label = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(new Date(day.date + 'T12:00:00'));
    card.innerHTML = `<div class="ops-day-head"><div><h3>${day.date === today() ? 'Oggi · ' : ''}${esc(label)}</h3><small>${fmt(day.date)}</small></div><span class="ops-day-total">${day.total} lavori</span></div>${day.conflicts.length ? `<p class="ops-conflict">${esc(day.conflicts.join(', '))}: presente in più squadre nei lavori mostrati. Verifica gli orari.</p>` : ''}${day.groups.map(g => {
      const typeCounts = [['ordinary', 'ordinari'], ['extra', 'extra'], ['activity', 'attività']].map(([kind, name]) => { const n = g.jobs.filter(j => j.kind === kind).length; return n ? n + ' ' + name : ''; }).filter(Boolean).join(' · ');
      const names = [...new Set(g.jobs.map(j => j.title))];
      return `<div class="ops-team ${g.memberIds.length ? '' : 'ops-unassigned'}"><strong>${esc(g.label)}</strong><p>${typeCounts}</p><p>${esc(names.slice(0, 3).join(' · '))}${names.length > 3 ? ' · e altre ' + (names.length - 3) : ''}</p><div class="ops-team-state"><span>${g.open} da fare</span><span class="ops-pending">${g.pending} da convalidare</span><span>${g.done} completati</span></div><progress max="${g.jobs.length}" value="${g.done}" aria-label="Lavori completati da ${esc(g.label)}"></progress></div>`;
    }).join('') || '<p class="ops-subtitle">Nessun lavoro con questi filtri.</p>'}${day.groups.some(g => g.open || g.pending) ? '<button type="button" class="secondary ops-open-day" data-ops-day>Apri lavori aperti della giornata</button>' : ''}`;
    card.querySelector('[data-ops-day]')?.addEventListener('click', () => openOperationsDay(day.date)); root.appendChild(card);
  }
}
function openOperationsDay(date, options = null) {
  if (!admin()) return;
  const filters = options || operationsFilters();
  scheduleClientFilter = filters.client; $('scheduleClientFilter').value = scheduleClientFilter;
  openScheduleDate(date);
  // The existing planner has no "unassigned" filter: open the entire day in that case.
  scheduleWorkerFilter = filters.worker === 'unassigned' ? 'all' : filters.worker;
  $('scheduleWorkerFilter').value = scheduleWorkerFilter; renderSchedules();
}
async function runOperationsAction(row) {
  if (!admin()) return;
  try {
    if (row.action === 'extra') { openExtraById(row.id); return; }
    if (row.action === 'pending') { openPendingDialog(); return; }
    if (row.action === 'consuntivo') { const a = scheduleActivities.find(a => a.id === row.id); if (a) openActivityConsuntivoDialog(a); return; }
    if (row.action === 'schedule') { openOperationsDay(row.date, { client: row.client || 'all', worker: 'all' }); return; }
    if (row.action === 'history') { const i = interventions.find(i => i.id === row.id); if (i) openHistoryEdit(i); return; }
    const st = stores.find(s => s.id === (row.storeId || row.id));
    if (!st) { toast('Sede non attiva: controlla le convalide o lo storico.'); return; }
    if (row.action === 'resume') {
      const item = scheduleItems.find(i => i.store_id === st.id && effectiveScheduleState(i) === 'da_fare' && schedules.some(s => s.id === i.schedule_id && s.giorno === today()));
      await openDone(st, item?.id || ''); return;
    }
    if (row.action === 'planStore') {
      schedulePickerSelected.add(st.id); schedulePickerMode = 'selected'; schedulePickerLetter = '';
      $('schedulePickerClient').value = 'all'; $('scheduleSearch').value = '';
      if (!$('scheduleDate').value) $('scheduleDate').value = tomorrow();
      setView('schedule'); renderSchedulePicker(); $('scheduleForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Sede selezionata. Scegli data e squadra, poi salva.');
    }
  } catch (err) { alert(err?.message || String(err)); }
}
function bindOperationsUi() {
  $('operationsView').querySelectorAll('[data-ops-tab]').forEach(button => button.onclick = () => { operationsState.tab = button.dataset.opsTab; renderOperations(); });
  for (const id of ['operationsClient', 'operationsSearch', 'operationsWorker']) $(id).addEventListener(id === 'operationsSearch' ? 'input' : 'change', () => { operationsState.limit = 30; renderOperations(); });
  $('operationsMore').onclick = () => { operationsState.limit += 30; renderOperations(); };
  $('operationsRefresh').onclick = async () => {
    const button = $('operationsRefresh'); button.disabled = true;
    try { await loadAll(); renderOperations(); } catch (err) { alert('Aggiornamento non riuscito: ' + (err?.message || String(err))); }
    finally { button.disabled = false; }
  };
  $('operationsPdf').onclick = () => { if (!admin()) return; openSchedulePdfDialog(); $('schedulePdfFrom').value = today(); $('schedulePdfTo').value = window.OvergreenOperations.addDays(today(), 6); };
}
