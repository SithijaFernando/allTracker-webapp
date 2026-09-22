# allTracker

A single webapp to track everything: health, workouts, finances, and habits.

v1 is a local-first prototype — all data lives in your browser via IndexedDB.
Nothing is sent to a server. The storage layer (`src/storage/db.ts`) is
isolated so it can be swapped for a real backend (e.g. Supabase, for
multi-user + auth) later without touching module code.

## Stack

- HTML / CSS / TypeScript, no framework
- Vite for dev server + build
- IndexedDB for local persistence
- Hash-based routing (no server config needed)
- GitHub Pages for free hosting

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL. Changes hot-reload.

## Deploy (free, via GitHub Pages)

1. Push this repo to GitHub as `allTracker-webapp` (already done).
2. In the repo settings → **Pages**, set the source to **GitHub Actions**.
3. Push to `main` — the included workflow (`.github/workflows/deploy.yml`)
   builds and deploys automatically to
   `https://<your-username>.github.io/allTracker-webapp/`.

If you rename the repo, update `base` in `vite.config.ts` to match.

## Project structure

```
src/
├── main.ts              # entry point, wires routes to modules
├── router.ts             # minimal hash router
├── types.ts               # shared TypeScript types for all records
├── dashboard.ts          # home view, aggregates across modules
├── storage/
│   └── db.ts              # IndexedDB wrapper — CRUD used by every module
└── modules/
    ├── health.ts
    ├── workouts.ts
    ├── finance.ts
    └── habits.ts
```

## Adding a new module

1. Add its types to `types.ts`.
2. Add a store name to `STORES` in `src/storage/db.ts`.
3. Create `src/modules/<name>.ts` following the pattern in `health.ts`
   (a form + a table, both driven by `add` / `getAll` / `remove`).
4. Register a route for it in `main.ts` and add a link in `index.html`'s
   sidebar nav.
5. Optionally add a summary card for it in `dashboard.ts`.

## Roadmap ideas

Sleep, nutrition, net worth, subscriptions, reading, and habits with
quantitative values (not just done/not-done) are natural next modules —
the schema and storage layer are designed to add these without a rewrite.
