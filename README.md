# AgroPredict — Crop rotation decisions from live Earth observation

AgroPredict is a Vue 3 + Express application that helps farmers and agricultural advisors in Cameroon compare multi-season crop rotations. Every figure it shows is computed from live **NASA POWER** telemetry for the plot's own coordinates and a reference crop catalogue served by the API. There is no mock data layer, no demo account and no fallback numbers.

> **Ethics:** "Indicative estimation, not a yield forecast." / « Estimation indicative, pas une prévision de rendement. »

---

## 1. Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (`<script setup lang="ts">`), Pinia, Vue Router 4, Tailwind CSS |
| Build | Vite 5 + `vite-plugin-pwa` (generated service worker) |
| Backend | Express 5 (ESM JavaScript, no build step) |
| Database | SQLite through `sql.js` (WASM), persisted to `server/data/agropredict.sqlite` |
| Auth | Email + password (bcrypt), JWT bearer tokens signed with a secret stored in `server/data/jwt-secret` |
| Telemetry | NASA POWER point API (no token required): `PRECTOTCORR`, `T2M*`, `RH2M`, `GWETTOP/GWETROOT`, `EVPTRNS` |
| Language | English by default, French available everywhere |
| Currency | FCFA (XAF) |

---

## 2. Run it

```bash
npm install

# Terminal 1 — API on :4000
npm run api

# Terminal 2 — Vite dev server on :5173 (proxies /api to :4000)
npm run dev
```

Production: `npm run build` then `npm start`. The Express server serves `dist/` itself (with SPA fallback), so the whole product runs on one port.

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | API port |
| `API_URL` | `http://127.0.0.1:4000` | Proxy target used by Vite in development |
| `AGROPREDICT_DATA_DIR` | `server/data` | Where the SQLite database and JWT secret live (used by the tests to get a throwaway DB) |
| `JWT_SECRET` | generated | Overrides the persisted signing secret, e.g. for containers |

---

## 3. First use

1. Open the app → you land on **Sign in**.
2. **Create an account** (name, email, password, organization, region).
3. The **onboarding wizard** asks for the first plot: locality + coordinates, surface, soil profile, previous crop.
4. The server immediately fetches POWER telemetry for those coordinates and the dashboard, climate, scenario, decision, crops, sources and profile pages all populate from that response.

Each account only ever sees its own plots — the API scopes every plot query by the JWT subject.

---

## 4. API

All routes are under `/api`. Everything except `/health`, `/crops`, `/auth/register` and `/auth/login` requires `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Liveness probe |
| POST | `/auth/register` | Create an account, returns `{ token, user }` |
| POST | `/auth/login` | Sign in, returns `{ token, user }` |
| GET / PATCH | `/auth/me` | Read or update name, organization, phone, region, language, currency, surface unit |
| GET | `/crops` | Reference catalogue (8 IRAD/FAO varieties, EN + FR fields) |
| GET / POST | `/plots` | List or create plots |
| GET / PATCH / DELETE | `/plots/:id` | Read, update or delete one plot |
| GET | `/telemetry?lat=&lng=&force=` | Live NASA POWER aggregation, cached 6 h |

The telemetry payload carries rainfall (7-day and 30-day), the 30-day anomaly against a 25-year normal, air temperature, relative humidity, surface and root-zone soil wetness, the 12 monthly normals with current-campaign rainfall and ET₀, the next seeding window, dry-spell detection, and a `provenance` block (provider, API version, parameters, resolution, time standard, fetch time, source URL).

---

## 5. How a recommendation is produced

1. **Telemetry** — actual POWER response for the plot coordinates, cached 6 h in `telemetry_cache`.
2. **Seasons** — `scenarioBuilder.deriveSeasons()` reads the bimodal rainfall normals to place the two cropping seasons.
3. **Rotations** — three rotations are assembled from the catalogue by family (cereal, legume, tuber, horticulture) with the live water balance.
4. **Scoring** — `scoringEngine.evaluateRotationScenario()` scores water security, climate match, soil fertility, diversification and margin, plus nitrogen balance, water-stress risk and failure risk. Findings are returned as codes and translated at render time (`src/i18n/findings.ts`).
5. **User weighting** — the Decision screen re-ranks the same three rotations against the user's own priorities without recomputing agronomy.

If the catalogue or telemetry is missing, the UI shows an explicit empty state instead of inventing numbers.

---

## 6. Project layout

```
server/
├── index.js        # Express app, auth, plots, telemetry, static SPA
├── db.js           # sql.js init, schema, persistence, helpers
├── catalog.js      # Reference crop catalogue (EN/FR)
└── power.js        # NASA POWER client, aggregation, 6 h cache
src/
├── components/     # Layout, common design-system and cartography components
├── i18n/           # en/fr messages + finding-code dictionary
├── router/         # Routes with auth guards (login, register, onboarding)
├── services/       # api client, scoring engine, scenario builder
├── stores/         # authStore, farmStore, appStore (language, currency, region)
├── types/          # Shared TypeScript contracts
└── views/          # Login, Register, Onboarding, Dashboard, Farm, Climate,
                    # Crops, Scenarios, Scenario detail, Decision, Sources, Profile
```

---

## 7. Tests

```bash
npm test
```

`scripts/test-api.mjs` boots the real server on a throwaway database (`AGROPREDICT_DATA_DIR` in a temp dir) and checks 14 behaviours end to end: health, catalogue, unauthenticated access, registration, session, profile persistence, plot create/update/list/delete, duplicate email rejection and password validation.

Type checking and the production build:

```bash
npm run build     # vue-tsc + vite build + service worker generation
```

---

## 8. Notes

- `better-sqlite3` is not used: its prebuilt binary segfaults on some Node builds. `sql.js` is pure WASM and works everywhere, with the database file written back after each mutation.
- The PWA service worker needs `workbox-build` 7.0.x on Node 18 (7.4+ requires Node 20).
- `server/data/` holds the database and the JWT secret and is gitignored.
- NASA POWER is queried without any Earthdata token; credentials are not required for the `AG` community endpoints used here.
