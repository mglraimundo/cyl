# CLAUDE.md

## Version Bumping

When bumping the BiomCYL version, update all occurrences in `index.html`:
- Cache-busting query params on `<link>` tags (icons, manifest, stylesheet): `?v=X.Y.Z`
- Cache-busting query param on `<script>` tag for `js/main.js`: `?v=X.Y.Z`
- Footer display text: `BiomCYL X.Y.Z`
