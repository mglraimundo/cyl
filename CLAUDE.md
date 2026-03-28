# CLAUDE.md

## Version Bumping

When bumping the CYL version, update the following files:

### `index.html`
- Cache-busting query params on `<link>` tags (icons, manifest, stylesheet): `?v=X.Y.Z`
- Cache-busting query param on `<script>` tag for `js/main.js`: `?v=X.Y.Z`
- Footer display text: `X.Y.Z`

### `sw.js`
- `CACHE_VERSION` constant at the top of the file: `const CACHE_VERSION = 'X.Y.Z';`
- This triggers the service worker to activate a new cache and delete the old one, ensuring users get the latest assets without a force-refresh
