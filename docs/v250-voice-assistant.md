# V250 — private voice assistant (activation pending)

Implemented: GPT-Live WebRTC connection, server-only OpenAI key, authenticated owner
allowlist, bounded saved transcript and explicit preferences, recoverable schedule
draft, current business data / forecast tools, manual scheduling confirmation.
No AI tool can commit a business mutation. Confirmation revalidates IDs, dates,
duplicates and existing extra assignments before using the existing idempotent RPC.
Role changes, backgrounding, logout and connection failure stop local capture.

## Activation

1. Create/use an OpenAI project with billing and access to `gpt-live-1` and
   `gpt-6-luna` (or set `OVERGREEN_VOICE_BACKEND_MODEL` to a compatible model).
2. Set `OPENAI_API_KEY` only in Supabase Edge Function Secrets. Never put it in
   config.js, the browser, a GitHub commit or a chat message.
3. After approval of consumption, enable the owner's row in
   `public.voice_assistant_settings`. It is initially disabled.
4. Test on actual iPad/iPhone before considering voice production-ready.

Applied migration: docs/v250-voice-assistant.sql. Deployed function:
`voice-assistant`. Authentication is checked inside the handler using getUser,
active admin profile and explicit owner row. JWT gateway disabled only because
handler performs verification. No keys/secret values are returned by status.

## Limits and known gaps

- No paid API call or real audio/device test was performed before activation.
- Five-minute LOCAL session timeout and 20 server-counted session attempts/day.
  These are usage precautions, NOT a guaranteed monetary spending cap. A hard
  budget requires trusted provider usage accounting and server-side termination.
- GPT-Live costs $0.05/session minute plus backend tokens. Silence counts.
- Keeps last 40 transcript groups, max 2,000 characters/group; 30 explicit
  preferences. No audio files are stored by this app. Provider retention is
  governed by the project API settings/policies.
- Single active device recommended: state is one owner row (last write wins).
- Existing extra moves are deliberately blocked. Use normal scheduling UI.
- Memory edits apply to the next session. Fresh read_overgreen data supersedes
  old conversation. No ChatGPT history or subscription entitlement is imported.
- No performance SLA until actual account and device trials.

## Checks

`node --test tests/voice-assistant.cjs` (validation, auth UI removal, disabled
service, memory, dates, simulated tool/confirm lifecycle and duplicate event)
`node tests/flows.cjs` (existing idempotency and workflow regressions)
`node tests/version-consistency.cjs`
Server endpoint unauthenticated request returns 401. Owner-only RLS enabled;
API start remains disabled after deployment. No live schedules created in tests.
