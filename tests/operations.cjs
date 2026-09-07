const test = require('node:test');
const assert = require('node:assert/strict');
const ops = require('../operations.js');
const options = { today: '2026-09-07', now: Date.parse('2026-09-07T12:00:00Z') };
function fixture(overrides = {}) {
  return { isAdmin: true, stores: [], interventions: [], schedules: [], scheduleItems: [], scheduleMembers: [],
    extras: [], extraWorkers: [], extraWorkItems: [], attachments: [], scheduleActivities: [],
    profiles: [{ id: 'a', nome: 'Operatore A', attivo: true }, { id: 'b', nome: 'Operatore B', attivo: true }, { id: 'inactive', nome: 'Non attivo', attivo: false }], ...overrides };
}
test('one actionable card per extra, even with urgency, missing date/team and missing target', () => {
  const data = fixture({ extras: [{ id: 'e', titolo: 'Richiesta QA', nome_esterno: 'Cantù', stato: 'programmato', client_type: 'eurospin', data_richiesta: '2026-08-30' }] });
  const rows = ops.inbox(data, options);
  assert.equal(rows.length, 1); assert.equal(rows[0].severity, 0);
  assert.deepEqual(rows[0].tags, ['priority', 'plan', 'documents']);
  const filtered = ops.filterInbox(rows, { client: 'eurospin', query: 'cantu', category: 'plan' });
  assert.equal(filtered.counts.all, 1); assert.equal(filtered.counts.priority, 1); assert.equal(filtered.rows.length, 1);
  assert.equal(ops.filterInbox(rows, { client: 'intesa' }).rows.length, 0);
});
test('pending extras need review; completed and cancelled extras never become overdue or unplanned', () => {
  const rows = ops.inbox(fixture({ extras: ['completato', 'annullato', 'in_attesa'].map((stato, i) => ({ id: String(i), stato, data_richiesta: '2020-01-01', deadline_at: '2020-01-01T00:00:00Z' })) }), options);
  assert.equal(rows.length, 1); assert.deepEqual(rows[0].tags, ['review']);
});
test('photo gaps use registered photos, not stale metadata; intentionally photo-free closures are allowed', () => {
  const rows = ops.inbox(fixture({
    interventions: [
      { id: 'gap', stato: 'in_attesa', foto_attese: 2, foto_sincronizzate: 2 },
      { id: 'free', stato: 'convalidato', foto_attese: 0 },
      { id: 'ready', stato: 'in_attesa', foto_attese: 1 },
      { id: 'rejected', stato: 'rifiutato', foto_attese: 3 }
    ], attachments: [{ id: '1', intervention_id: 'gap', tipo: 'foto_generica' }, { id: '2', intervention_id: 'gap', tipo: 'pdf_richiesta' }, { id: '3', intervention_id: 'ready', tipo: 'foto_generica' }]
  }), options);
  assert.equal(rows.length, 2);
  const gap = rows.find(r => r.id === 'gap'); assert.deepEqual(gap.tags, ['documents']); assert.match(gap.reasons[0].text, /1 delle 2/); assert.equal(gap.action, 'history');
  assert.equal(rows.find(r => r.id === 'ready').action, 'pending');
});
test('multi-day work is resumable without a second overdue-store card; assigned stores are not offered twice', () => {
  const data = fixture({ stores: ['multi', 'planned', 'cancelled', 'new', 'future', 'inactive'].map(id => ({ id, nome: id, attivo: id !== 'inactive', ultimo_passaggio: id === 'new' ? null : id === 'future' ? '2026-09-09' : '2026-08-01', intervallo_giorni: 15 })),
    interventions: [{ id: 'i', store_id: 'multi', multi_day_open: true, stato: 'in_attesa' }],
    schedules: [{ id: 's', giorno: '2026-09-08' }], scheduleMembers: [{ schedule_id: 's', profile_id: 'a' }],
    scheduleItems: [{ id: 'p', schedule_id: 's', store_id: 'planned', stato: 'da_fare' }, { id: 'c', schedule_id: 's', store_id: 'cancelled', stato: 'annullato' }]
  });
  const rows = ops.inbox(data, options);
  assert.equal(rows.find(r => r.id === 'i').action, 'resume');
  assert.deepEqual(rows.filter(r => r.kind === 'store').map(r => r.id).sort(), ['cancelled', 'new']);
});
test('date boundaries distinguish deadline, three-day warning and ordinary overdue severity', () => {
  const data = fixture({ stores: [
    { id: 'urgent', nome: 'Urgent', intervallo_giorni: 15, ultimo_passaggio: '2026-08-01' },
    { id: 'late', nome: 'Late', intervallo_giorni: 15, ultimo_passaggio: '2026-08-22' },
    { id: 'soon', nome: 'Soon', intervallo_giorni: 15, ultimo_passaggio: '2026-08-25' },
    { id: 'ok', nome: 'OK', intervallo_giorni: 15, ultimo_passaggio: '2026-09-01' }
  ] });
  const rows = ops.inbox(data, options);
  assert.deepEqual(rows.map(r => [r.id, r.severity]), [['urgent', 0], ['late', 1], ['soon', 3]]);
  // The planning reason must not turn a future deadline into a red/orange alert.
  assert(rows.find(r => r.id === 'soon').reasons.some(r => r.severity === 3));
});
test('activity review disappears once accounted for and does not invent a client for unlinked activity', () => {
  const rows = ops.inbox(fixture({ scheduleActivities: [
    { id: 'a', titolo: 'Sopralluogo', stato: 'completato' }, { id: 'b', stato: 'completato', consuntivato_at: '2026-09-07T11:00:00Z' }, { id: 'c', stato: 'annullato' }
  ] }), options);
  assert.equal(rows.length, 1); assert.equal(rows[0].action, 'consuntivo'); assert.equal(rows[0].client, null);
  assert.equal(ops.filterInbox(rows, { client: 'eurospin' }).rows.length, 0);
});
test('week counts linked extras once, inherits the team and ignores cancelled/rolled-forward copies', () => {
  const data = fixture({ stores: [{ id: 'st', nome: 'Sede QA', client_type: 'intesa' }],
    schedules: [{ id: 's', giorno: '2026-09-07' }], scheduleMembers: [{ schedule_id: 's', profile_id: 'a' }, { schedule_id: 's', profile_id: 'a' }],
    scheduleItems: [{ id: 'i', store_id: 'st', schedule_id: 's', stato: 'da_fare' }, { id: 'old', schedule_id: 's', stato: 'riportato', effective_state: 'completato' }, { id: 'cancelled', schedule_id: 's', stato: 'annullato' }],
    extras: [{ id: 'e', store_id: 'st', schedule_item_id: 'i', schedule_id: 's', stato: 'programmato' }, { id: 'cancelled', giorno_intervento: '2026-09-07', stato: 'annullato' }],
    scheduleActivities: [{ id: 'a', schedule_id: 's', store_id: 'st', stato: 'completato' }]
  });
  const days = ops.week(data, options); assert.equal(days.length, 7); assert.equal(days[6].date, '2026-09-13');
  assert.equal(days[0].total, 3); assert.equal(days[0].groups.length, 1); assert.deepEqual(days[0].groups[0].memberIds, ['a']);
  assert.equal(days[0].groups[0].open, 2); assert.equal(days[0].groups[0].done, 1);
  assert.equal(ops.week(data, { ...options, client: 'eurospin' })[0].total, 0);
  assert.equal(ops.week(data, { ...options, worker: 'b' })[0].total, 0);
});
test('a person in different open teams is flagged; same team across schedules is combined', () => {
  const data = fixture({ schedules: ['one', 'two', 'same', 'unassigned'].map(id => ({ id, giorno: '2026-09-07' })),
    scheduleMembers: [{ schedule_id: 'one', profile_id: 'a' }, { schedule_id: 'two', profile_id: 'a' }, { schedule_id: 'two', profile_id: 'b' }, { schedule_id: 'same', profile_id: 'a' }, { schedule_id: 'unassigned', profile_id: 'inactive' }],
    scheduleItems: ['one', 'two', 'same', 'unassigned'].map(id => ({ id, schedule_id: id, stato: 'da_fare' }))
  });
  const day = ops.week(data, options)[0]; assert.deepEqual(day.conflicts, ['Operatore A']); assert.equal(day.groups.length, 3);
  assert.equal(day.groups.find(g => g.key === 'a').jobs.length, 2);
  assert.equal(ops.week(data, { ...options, worker: 'unassigned' })[0].total, 1);
  assert.equal(ops.week(data, { ...options, worker: 'b' })[0].total, 1);
});
test('calendar dates remain consecutive across DST and year boundaries', () => {
  assert.equal(ops.addDays('2026-10-24', 2), '2026-10-26');
  assert.equal(ops.addDays('2026-12-29', 6), '2027-01-04');
  assert.deepEqual(ops.week(fixture(), { today: '2026-02-30' }), []);
});
test('employee/impersonated snapshots produce no admin data; derivation does not mutate source data', () => {
  assert.deepEqual(ops.inbox(fixture({ isAdmin: false }), options), []);
  assert.deepEqual(ops.week(fixture({ isAdmin: false }), options), []);
  const data = fixture({ extras: [{ id: 'e', stato: 'da_integrare', client_type: 'privato' }], extraWorkItems: [{ id: 'w', extra_id: 'e', stato: 'completata' }] });
  const before = JSON.stringify(data); const rows = ops.inbox(data, options); ops.week(data, options);
  assert.deepEqual(rows[0].progress, { done: 1, total: 1 }); assert.equal(JSON.stringify(data), before);
});
