# AGENTS.md

## Version Bumping

When bumping the CYL version, update the following files:

### `index.html`
- Cache-busting query params on `<link>` tags (icons, manifest, stylesheet): `?v=X.Y.Z`
- Cache-busting query param on `<script>` tag for `js/main.js`: `?v=X.Y.Z`
- Service worker registration URL: `navigator.serviceWorker.register('/sw.js?v=X.Y.Z', ...)` — must bump too, otherwise Cloudflare's edge cache serves the old `sw.js` (it caches by full URL incl. query, with a long TTL) and returning users never get the new SW.
- Footer display text: `X.Y.Z`

### `sw.js`
- `CACHE_VERSION` constant at the top of the file: `const CACHE_VERSION = 'X.Y.Z';`
- This triggers the service worker to activate a new cache and delete the old one, ensuring users get the latest assets without a force-refresh
