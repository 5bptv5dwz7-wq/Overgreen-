/* DOM-level interaction tests; no browser, network, Supabase calls or rendering. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { parseHTML } = require('linkedom');
const ops = require('../operations.js');
const app = fs.readFileSync(__dirname + '/../app.js', 'utf8');
const ui = fs.readFileSync(__dirname + '/../operations-ui.js', 'utf8');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
function source(start, end) { const a = app.indexOf(start), b = app.indexOf(end, a + start.length); assert(a >= 0 && b > a); return app.slice(a, b); }
function setup() {
  const dom = parseHTML(html), document = dom.document, calls = [];
  // LinkeDOM does not implement browser select.value assignment/default selection.
  Object.defineProperty(dom.HTMLSelectElement.prototype, 'value', {
    configurable: true,
    get() { return (this.querySelector('option[selected]') || this.querySelector('option'))?.value || ''; },
    set(value) { for (const o of this.querySelectorAll('option')) if (o.value === String(value)) o.setAttribute('selected', ''); else o.removeAttribute('selected'); }
  });
  dom.HTMLElement.prototype.scrollIntoView = function () { calls.push(['scroll', this.id]); };
  const c = { document, window: { OvergreenOperations: ops }, navigator: { onLine: true }, console,
    $: id => document.getElementById(id), today: () => '2026-09-07', tomorrow: () => '2026-09-08', fmt: d => d,
    admin: () => c.isAdmin, isAdmin: true, currentView: 'dashboard', CURRENT_VIEW_KEY: 'view', localStorage: { setItem() {} },
    stores: [{ id: 'st', nome: 'SEDE QA', client_type: 'privato', ultimo_passaggio: '2026-08-01', intervallo_giorni: 15 }],
    interventions: [{ id: 'i', store_id: 'st', stato: 'convalidato', foto_attese: 1 }],
    extras: [{ id: 'e', nome_esterno: '<img src=x onerror=alert(1)>', titolo: 'EXTRA QA', client_type: 'eurospin', stato: 'programmato' }],
    profiles: [{ id: 'a', nome: 'Operatore A', attivo: true }], schedules: [], scheduleItems: [], scheduleMembers: [], extraWorkers: [], attachments: [], extraWorkItems: [], scheduleActivities: [],
    scheduleClientFilter: 'all', scheduleWorkerFilter: 'all', scheduleDateFilter: 'all', scheduleExactDate: null,
    schedulePickerSelected: new Set(['previous']), schedulePickerMode: 'all', schedulePickerLetter: '',
    extraClientFilter: 'intesa', extraGroupOpenState: {}, pendingExtraFocusId: null,
    effectiveScheduleState: i => i.stato, extraIsScheduled: () => false,
    setTimeout() {}, focusExtraCard() {},
    esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])),
    toast: text => calls.push(['toast', text]), alert: text => calls.push(['alert', text]), loadAll: async () => calls.push(['refresh'])
  };
  for (const name of ['renderDashboard', 'renderStores', 'renderSchedules', 'renderExtras', 'renderDailyReport', 'renderStats', 'openSignatureSheetsView', 'openCompanyArchive', 'renderWorkContacts', 'auditViewOpen', 'renderSchedulePicker', 'openHistoryEdit', 'openDone', 'openPendingDialog', 'openActivityConsuntivoDialog', 'openExtraEdit', 'openSchedulePdfDialog']) c[name] = (...args) => calls.push([name, ...args]);
  vm.createContext(c);
  vm.runInContext(source('function setView(name)', 'function syncImpersonationUi'), c);
  vm.runInContext(source('function openExtraById', 'function extraSearchText'), c);
  vm.runInContext(source('function openScheduleDate', 'function contactStoreNames'), c);
  vm.runInContext(ui, c);
  c.bindOperationsUi(); c.renderOperationsShortcut(); c.openOperations();
  return { c, calls, document, Event: dom.Event };
}
test('page renders actions, escapes names, filters categories, switches to a seven-day view', () => {
  const { c, document } = setup();
  assert(!c.$('operationsView').classList.contains('hidden'));
  assert.equal(c.$('operationsList').querySelectorAll('.ops-card').length, 3);
  assert.equal(c.$('operationsList').querySelectorAll('img').length, 0);
  assert.match(c.$('operationsList').textContent, /<img src=x onerror=alert\(1\)>/);
  document.querySelector('[data-ops-category="documents"]').click();
  assert.equal(c.$('operationsList').querySelectorAll('.ops-card').length, 2);
  document.querySelector('[data-ops-tab="week"]').click();
  assert(c.$('operationsInboxPanel').classList.contains('hidden'));
  assert.equal(c.$('operationsWeekList').querySelectorAll('.ops-day').length, 7);
  assert(!c.$('operationsWorkerWrap').classList.contains('hidden'));
});
test('extra action clears inherited client/category/search filters and opens the intended extra', async () => {
  const { c } = setup(); c.$('extraCategoryFilter').value = 'pulizie'; c.$('extraSearchInput').value = 'old';
  await c.runOperationsAction({ action: 'extra', id: 'e' });
  assert.equal(c.extraClientFilter, 'all'); assert.equal(c.$('extraCategoryFilter').value, 'all'); assert.equal(c.$('extraSearchInput').value, '');
  assert.equal(c.pendingExtraFocusId, 'e'); assert(!c.$('extrasView').classList.contains('hidden'));
});
test('photo action opens the exact intervention editor; planner action preserves existing selection and date', async () => {
  const { c, calls } = setup();
  await c.runOperationsAction({ action: 'history', id: 'i', storeId: 'st' });
  assert.equal(calls.find(x => x[0] === 'openHistoryEdit')[1].id, 'i');
  c.$('scheduleDate').value = '2026-09-10';
  await c.runOperationsAction({ action: 'planStore', id: 'st' });
  assert.deepEqual([...c.schedulePickerSelected], ['previous', 'st']); assert.equal(c.$('scheduleDate').value, '2026-09-10');
  assert.equal(c.schedulePickerMode, 'selected'); assert(!c.$('scheduleView').classList.contains('hidden'));
});
test('inbox day actions reset a stale worker filter from the week tab', async () => {
  const { c } = setup(); c.$('operationsWorker').value = 'a';
  await c.runOperationsAction({ action: 'schedule', date: '2026-09-08', client: 'intesa' });
  assert.equal(c.scheduleWorkerFilter, 'all'); assert.equal(c.scheduleClientFilter, 'intesa'); assert.equal(c.scheduleExactDate, '2026-09-08');
});
test('a populated week shows team progress and opens the chosen day with the selected operator', () => {
  const { c, document, Event } = setup();
  c.extras = []; c.interventions = [];
  c.schedules = [{ id: 's', giorno: '2026-09-08' }];
  c.scheduleItems = [{ id: 'job', store_id: 'st', schedule_id: 's', stato: 'da_fare' }];
  c.scheduleMembers = [{ schedule_id: 's', profile_id: 'a' }];
  c.openOperations('week');
  c.$('operationsWorker').value = 'a'; c.$('operationsWorker').dispatchEvent(new Event('change'));
  assert.match(c.$('operationsWeekList').textContent, /Operatore A/);
  assert.match(c.$('operationsWeekList').textContent, /1 da fare/);
  document.querySelector('[data-ops-day]').click();
  assert.equal(c.scheduleExactDate, '2026-09-08'); assert.equal(c.scheduleWorkerFilter, 'a');
});
test('new route and actions are unavailable in the employee/impersonated view', async () => {
  const { c, calls } = setup(); c.isAdmin = false; c.setView('operations');
  assert(c.$('operationsView').classList.contains('hidden')); assert.equal(c.currentView, 'dashboard');
  const count = calls.length; await c.runOperationsAction({ action: 'pending' }); assert.equal(calls.length, count);
  c.renderOperationsShortcut(); assert(c.$('operationsShortcut').classList.contains('hidden')); assert.equal(c.$('operationsShortcut').childElementCount, 0);
});
test('refresh failure restores the button, and PDF opens the seven-day range', async () => {
  const { c, calls } = setup(); c.loadAll = async () => { throw new Error('offline'); };
  await c.$('operationsRefresh').onclick(); assert.equal(c.$('operationsRefresh').disabled, false); assert(calls.some(x => x[0] === 'alert' && x[1].includes('offline')));
  c.$('operationsPdf').click(); assert(calls.some(x => x[0] === 'openSchedulePdfDialog'));
  assert.equal(c.$('schedulePdfFrom').value, '2026-09-07'); assert.equal(c.$('schedulePdfTo').value, '2026-09-13');
});
test('large inbox is paginated and search resets pagination with a useful empty state', () => {
  const { c, Event } = setup(); c.interventions = []; c.extras = [];
  c.stores = Array.from({ length: 65 }, (_, i) => ({ id: String(i), nome: 'Sede ' + i, intervallo_giorni: 15 }));
  c.renderOperations(); assert.equal(c.$('operationsList').querySelectorAll('.ops-card').length, 30);
  c.$('operationsMore').click(); assert.equal(c.$('operationsList').querySelectorAll('.ops-card').length, 60);
  c.$('operationsSearch').value = 'nessunrisultato'; c.$('operationsSearch').dispatchEvent(new Event('input'));
  assert.match(c.$('operationsList').textContent, /Nessuna voce con questi filtri/);
  assert(c.$('operationsMore').classList.contains('hidden'));
});
