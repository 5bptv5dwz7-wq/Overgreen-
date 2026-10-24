# V287 — Client workspaces with mixed itineraries

Eurospin and Intesa now have persistent workspaces across locations, jobs, reports, economics, statistics, contacts, search, pending approvals and route history. The dashboard keeps the complete cross-client overview. Existing private-client work remains reachable in “Altri clienti”.

New jobs inherit the workspace. Intesa uses the ticket label, Eurospin the extra label; client and closure-model selectors are hidden and the existing ordinary-inclusion checkbox selects the proper closure rules. PDF recognition refuses a different client's document instead of silently changing the client. Opening a job selects its workspace.

Planning normally shows the current client's work. “Aggiungi lavoro di un altro cliente” explicitly enables mixed planning, keeping selected stops and showing the whole route. This preserves Eurospin → Intesa → Eurospin itineraries, route ordering controls and the existing shared team/day. Changing date, team or the day note warns when the whole mixed route is affected. Scoped exports and saved-route reuse match the selected planning mode. Workspace changes invalidate cached views and protect an unsaved planner selection.

The additive migration adds nullable `client_type` to company documents and schedule activities. New records use their workspace. Existing company-wide documents remain available without guessing their client. User accounts, permissions, synchronization and shared company settings retain their existing semantics. No existing intervention, photo, attachment or route is deleted or split.

The regression suite also exposed the existing missing-photo badge condition; the badge now remains visible when server-side photos are missing even if the local upload queue is empty.

Validation: `node tests/run.cjs` passes all 323 tests; full script startup, DOM workspace/navigation/form tests, mixed planning and scoped PDF data checks pass; version consistency is V287. Browser visual verification was unavailable because the Chromium download returned an invalid archive. Supabase columns were verified after applying the additive migration; existing RLS remains enabled.
