# V216 — Scanner Apple, pilot Lorenzo

The extra closure form exposes the native scanner bridge only when both the authenticated and effective profile match Lorenzo's existing UUID. Employee impersonation is excluded. Camera/photo/PDF uploads remain available.

The app creates a Supabase signed upload URL scoped to a new object in the current extra's folder, with no upsert. The installed `Scansiona Overgreen` shortcut receives this upload URL only, not an access/refresh token. It invokes Actions' system document scanner and PUTs the resulting PDF. URLs expire after two hours and are not persisted locally.

Only the destination metadata is persisted locally so the same PWA/browser can recover after suspension/reload. The app downloads the PDF through normal authenticated Storage access, checks its signature and size, and stages it in the correct report field. Ordinary extra save registers that object without uploading it twice; partial/definitive closure requirements remain unchanged. Interrupted uploads and replaced scans may leave unregistered Storage objects, consistent with the existing app's file retention behavior; no automatic deletion is introduced.

## Device setup

`apple-scanner-setup.html` provides the exact manual Shortcut configuration. Actions must be installed once per iPhone. No signed, directly importable Shortcut is supplied: producing/testing that artifact requires an Apple environment. The guide is available inside the Lorenzo-only panel. Returning to the Home Screen PWA may require a manual tap; Safari and standalone PWA storage are not assumed to be shared.

## Verification

- Full existing regression suite passed.
- Eleven added tests cover real/effective user gating, separate report destinations, no persisted upload capability, reload recovery, invalid PDF, cancellation, late responses, busy saves, manual replacement, idempotent save and normal upload preservation.
- No database policies/schema changes, credentials, or sample customer documents were created.
- Actual scanner camera, clipboard permissions and Shortcuts handoff still need testing on Lorenzo's iPhone; not represented as verified.
