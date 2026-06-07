# CLAUDE.md — animalvalley-public

This file gives Claude Code full context about this project.
Read this before making any changes or creating any files.

---

## What this repo is

Stian's personal web platform for public apps and projects.
GitHub user: `stidyr`
Repo: `stidyr/animalvalley-public` (public)
Live at: `https://animalvalley.no`

Storage backend: Cloudflare Worker at `https://api.animalvalley.no`.

---

## Repo structure

```
animalvalley-public/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages on push to main
│
├── apps/
│   └── [app-name]/
│       ├── index.html
│       └── data/               # Static JSON data if needed
│
├── shared/
│   ├── storage-client.js       # Shared storage library (do not modify lightly)
│   └── styles/                 # Shared CSS if any
│
└── index.html                  # Public hub / landing page
```

When creating a new app, always place it under `apps/[app-name]/index.html`.

---

## Storage

All persistence goes through the shared Cloudflare Worker.
**Never use localStorage or sessionStorage** — use the storage client instead.

### Import the storage client

```javascript
import { storage } from '../../shared/storage-client.js';
```

### API

```javascript
await storage.set('my-app:key', { data: 123 });
const result = await storage.get('my-app:key');
const keys = await storage.list('my-app:');
await storage.del('my-app:key');
```

Keys are automatically namespaced with the `public:` prefix by the client.
So `storage.set('tipping:stian', ...)` is stored as `public:tipping:stian`.
You never need to write the prefix manually.

### storage-client.js (current implementation)

```javascript
const API_BASE = "https://api.animalvalley.no";
const API_KEY  = "__STORAGE_KEY__";  // injected at deploy time by GitHub Actions
const SCOPE    = "public";

export const storage = {
  get:  (key) =>
    fetch(`${API_BASE}/api/get?key=${SCOPE}:${key}`,
      { headers: { 'X-API-Key': API_KEY } }).then(r => r.json()),

  set:  (key, value) =>
    fetch(`${API_BASE}/api/set?key=${SCOPE}:${key}`,
      { method: 'PUT',
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(value) }),

  list: (prefix) =>
    fetch(`${API_BASE}/api/list?prefix=${SCOPE}:${prefix}`,
      { headers: { 'X-API-Key': API_KEY } }).then(r => r.json()),

  del:  (key) =>
    fetch(`${API_BASE}/api/delete?key=${SCOPE}:${key}`,
      { method: 'DELETE', headers: { 'X-API-Key': API_KEY } })
};
```

---

## Deploy

GitHub Actions deploys automatically on every push to `main`.
The workflow injects the API key and scope before deploying.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Inject secrets
        run: |
          find . -name "*.html" -o -name "*.js" | xargs sed -i \
            -e 's|__STORAGE_KEY__|${{ secrets.PUBLIC_API_KEY }}|g' \
            -e 's|__SCOPE__|public|g'
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
          cname: animalvalley.no
```

**GitHub Secret required:** `PUBLIC_API_KEY`

---

## Domains & infrastructure

| What              | Where                          |
|-------------------|--------------------------------|
| This site         | animalvalley.no                |
| Storage API       | api.animalvalley.no            |
| DNS               | Cloudflare (free plan)         |
| Hosting           | GitHub Pages                   |
| Storage backend   | Cloudflare Workers + KV        |

---

## Coding conventions

- Plain HTML/CSS/JS preferred — no build step, no bundler
- ES modules (`import/export`) are fine in modern browsers
- One `index.html` per app, self-contained where possible
- Static data (questions, match lists, etc.) goes in `apps/[app]/data/*.json`
- No secrets or API keys ever in source code
- CSS and JS can be inline in HTML for small apps

---

## Existing apps

### surdeig
Sourdough bread recipe with ingredient calculator (number of loaves + hydration slider).
Self-contained, no storage needed. Located at `apps/surdeig/index.html`.

---

## When creating a new app

1. Create folder: `apps/[app-name]/`
2. Create `apps/[app-name]/index.html`
3. Import storage client if persistence is needed: `../../shared/storage-client.js`
4. Update `index.html` (root) to link to the new app
5. Push to `main` — it goes live automatically at `animalvalley.no/apps/[app-name]/`
