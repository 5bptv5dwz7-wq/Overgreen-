# Overgreen release requirements

For every published app change, increment the application version. Lorenzo explicitly requires the visible version to stay current.

1. Run `node scripts/set-version.cjs <next-version>` to update APP_VERSION, the index.html badge fallback, current asset query versions and the service-worker cache version together.
2. Run `node tests/version-consistency.cjs` before publishing. Do not publish if it fails.
3. Include app.js, index.html and sw.js in the release. Keep the visible badge synchronized from APP_VERSION at runtime.
4. Distinguish a pushed release from a verified live GitHub Pages deployment in the user-facing status.
