# Massage by Stefania Ben — site

Public site and booking front end of a massage studio in Bordeaux:
catalogue, online booking, client area and studio administration. French
only. The data and every rule (prices, free times, readiness to book, roles)
live in the Booking API ([Massage-backend](https://github.com/OlehDribko/Massage-backend));
this app renders them and never decides them.

- Next.js **16.2.6** (App Router, JavaScript, webpack in dev) — this version
  differs from older Next.js; read `node_modules/next/dist/docs/` before
  changing framework code (see `AGENTS.md`).
- React 19, Tailwind CSS v4, Firebase Auth (web SDK, loaded after hydration).
- Tests: `node --test` (unit, no extra packages) and Playwright (browser).

## Quick start (fresh clone)

Requirements: **Node.js 24** (`.nvmrc`; CI uses 24, Next 16 needs ≥ 20.9,
`npm test` needs ≥ 22 for glob patterns) and npm 11.

```bash
cd my-app
npm ci
cp .env.example .env.local   # then fill in, see « Environment »
npm run dev                  # http://localhost:3000
```

Without any variable the site still runs: the catalogue says it is
unavailable and sign-in is switched off cleanly. To see real data, point
`NEXT_PUBLIC_API_BASE_URL` at a Booking API — either staging (with the
staging Firebase web app values) or a local backend (« Local backend »
below).

## Checks

The same commands run in CI (`.github/workflows/ci.yml` at the repository
root, on pull requests to `develop` and `main`, Node 24):

| Command                               | What                                                                  |
| ------------------------------------- | --------------------------------------------------------------------- |
| `npm run lint`                        | ESLint (next/core-web-vitals + Prettier compat)                       |
| `npx prettier . --check`              | Formatting                                                            |
| `npm test`                            | Unit tests, `tests/**/*.test.mjs` (`node --test`, no network)         |
| `npm run build`                       | Production build                                                      |
| `npm run test:e2e`                    | Browser tests against an isolated local stack (local only, see below) |
| `npm run contract:check -- <openapi>` | Backend OpenAPI vs the snapshot the site was checked against          |

## Structure

| What                                                        | Where                                         |
| ----------------------------------------------------------- | --------------------------------------------- |
| Routes (each page renders its own `<Header>`)               | `src/app/`                                    |
| Page sections, layout (header, footer, mobile menu)         | `src/components/sections/`, `…/layout/`       |
| Booking UI: catalogue, time picker, booking panel, bookings | `src/components/booking/`                     |
| Sign-in panels, `AuthProvider` / `useAuth`, account shell   | `src/components/auth/`                        |
| Admin UI (calendar, day, hours, gift card requests)         | `src/components/admin/`                       |
| Shared UI primitives                                        | `src/components/ui/`                          |
| API client, response contract, server diagnostics           | `src/lib/api/`, `src/lib/auth/session.js`     |
| Session owner (Firebase + profile sync), Firebase adapter   | `src/lib/auth/controller.js`, `…/firebase.js` |
| Booking logic: catalogue, slots, panel decisions, labels    | `src/lib/booking/`                            |
| Public configuration (Firebase web app, API URL), site data | `src/config/`                                 |
| Editorial layer of the catalogue (grouping, featured)       | `src/content/services.js`                     |
| Design tokens and utilities                                 | `src/app/globals.css` (`@theme`, `@utility`)  |
| OpenAPI snapshot of the checked components                  | `contracts/openapi-subset.json`               |
| Unit tests / browser tests                                  | `tests/`, `e2e/`                              |

Logic that decides something (session states, catalogue, slots, booking
transitions, labels, contract checks) is in plain modules with relative
imports under `src/lib/`, so `node --test` runs it without Next.js. React
components only wire it up.

New page: export `metadata = pageMetadata({ title, description, path })`
and add the path to `INDEXABLE_ROUTES` if it should be in the sitemap.

## Environment

All variables are public (`NEXT_PUBLIC_*`, inlined at build time); none is a
secret. Template with comments: `.env.example`.

| Variable                                                                    | Purpose                                                                                                                                                                    |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                                                  | Booking API origin of the same environment. HTTPS only, except `http://localhost` in `next dev`                                                                            |
| `NEXT_PUBLIC_FIREBASE_API_KEY` / `_AUTH_DOMAIN` / `_PROJECT_ID` / `_APP_ID` | Firebase web app (staging ≠ production project). While one is missing, sign-in is off                                                                                      |
| `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST`                                   | Local runs and browser tests only (`127.0.0.1:9099`); ignored outside `next dev` and local hosts                                                                           |
| `NEXT_PUBLIC_SITE_URL`                                                      | Production domain. **Required before release**: without it the site is `noindex` and canonical, sitemap and JSON-LD URLs are not generated. Vercel previews stay `noindex` |
| `NEXT_PUBLIC_PLANITY_BOOKING_URL`                                           | Secondary link to the studio's Planity profile (footer)                                                                                                                    |

The API must allow this site's origin (`FRONTEND_URL` / `CORS_ALLOWED_ORIGINS`
on the backend), and the domain must be in Firebase → Authentication →
Authorized domains.

## Backend contract

Contract: `Massage-backend/docs/openapi.json` (OpenAPI 3.1 generated from the
backend code; its CI fails when the file and the code disagree) and the
prose docs next to it: `booking.md`, `auth-and-profiles.md`,
`notifications.md`, `frontend-handoff.md`.

**Runtime checks.** `src/lib/api/contract.js` checks the fields the site
relies on in four answers: `GET /api/services`, `GET …/availability`, the
profile (`POST /api/me/sync`, `PATCH /api/me`) and `POST /api/bookings`. A
2xx answer that misses one of them fails as `INVALID_RESPONSE` (with the
field path, never the value) instead of breaking a component later. Extra
fields are accepted.

**Drift.** `contracts/openapi-subset.json` holds those OpenAPI components as
of a given backend commit (recorded in the file).
`tests/api/contract.test.mjs` fails when a checked field is missing,
optional or typed differently there. When the backend changes:

```bash
npm run contract:check -- ../../Massage-backend/docs/openapi.json            # exit 1 + list of changed components
npm run contract:check -- ../../Massage-backend/docs/openapi.json --write    # refresh the snapshot, then npm test
```

**Failures** are told apart (`src/lib/auth/session.js`, `ApiError`):
`TIMEOUT` (15 s per call, 4 s / 2.5 s for the server-rendered catalogue),
`NETWORK_ERROR`, HTTP errors (status + documented `code`),
`INVALID_RESPONSE`, `NOT_CONFIGURED`, and a catalogue `transform` failure.
Each has a French message; 5xx and unreadable answers also show
« Référence : <X-Request-Id> » so a client report can be matched to the
backend logs.

**Server diagnostics.** A failed catalogue load writes one line to the
server log (Vercel / `next start`):

```
[api] {"operation":"catalog","kind":"timeout","method":"GET","route":"/api/services","status":0,"code":"TIMEOUT","requestId":null}
```

Method, route **template** (`/api/services/{serviceId}/availability`),
status, code and X-Request-Id only — no token, query string, body, email or
phone.

## Sign-in (Firebase Auth + booking API)

Contract: `Massage-backend/docs/auth-and-profiles.md` (section 5).

- Every visitor gets an anonymous Firebase session after the page has
  hydrated (never on the server), then `POST /api/me/sync` with
  `Authorization: Bearer <ID token>`. Tokens are never stored by the site.
- One owner of the session (`createAuthController`): React only
  subscribes, so re-renders and Strict Mode cannot start a second anonymous
  sign-in or sync; a slow answer for a previous account is dropped.
- Role and profile come only from the (checked) sync response. Hiding links
  is not access control: the backend checks every `/api/me*` and admin
  request.
- Header: the account element is in the server HTML (neutral « Espace
  personnel », same size); the last known state is applied before first
  paint (`src/lib/auth/accountHint.js`), the real label follows the Firebase
  session, the admin link the confirmed profile.

## Booking, client area, administration

Studio time zone Europe/Paris, prices in euro cents, payment on site.

| Route                                   | What                                                                                   | Access                                |
| --------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| `/reserver`                             | Single booking entry: catalogue (`GET /api/services` + `src/content/services.js`)      | public, indexed                       |
| `/reserver/[serviceId]`                 | Texts, durations, price, free times (`…/availability`), booking (`POST /api/bookings`) | public; booking needs a ready profile |
| `/compte`                               | Profile: name/phone (`PATCH /api/me`), email check/change, newsletter status           | permanent account                     |
| `/compte/reservations`, `…/[bookingId]` | Own bookings, move (`…/reschedule`), cancel (`…/cancel`), email status                 | permanent account                     |
| `/admin/…`                              | Calendar, day bookings, hours and closures, gift card requests                         | admin (checked by the API)            |
| `/marketing/confirm`, `/unsubscribe`    | Newsletter email links (paths fixed by the backend); act on click only                 | public                                |

- `/`, `/reserver`, `/reserver/[serviceId]` and `/llms.txt` are rendered on
  the server per request when the API is configured (prices and sales change
  on their own); nothing failed is cached.
- Catalogue: names, durations, prices, availability **and texts**
  (`description`, `features`) come from the API. Texts exist per duration
  (one service id per duration); cards and the step page show the texts of
  the selected duration, and where one text stands for a prestation (home
  accordion) it is the one of its shortest duration, which those links open.
  `src/content/services.js` only groups durations by stable id, sets the
  category and marks the « populaires ».
- Readiness comes from `bookingReadiness.blockers`; missing steps (sign-in,
  name and phone, email link) are done on the booking page itself and the
  chosen time is kept (`?creneau=`, `?etape=coordonnees`).
- `POST /api/bookings` sends one `Idempotency-Key` per intent (service +
  time, `src/lib/booking/flow.js`). After an unknown outcome — network
  error, timeout, 5xx, `CALENDAR_BUSY`, unreadable 2xx — « Réessayer » sends
  the same key and body, so the server answers with the same booking. A new
  time or service is a new key. Other writes are never repeated
  automatically.
- `SLOT_UNAVAILABLE` (time taken meanwhile): the message stays, the choice
  is cleared and the week is reloaded. An expired session shows « Se
  reconnecter » back to the same time.
- Booking happens only on this site. Planity is a secondary footer link.

## Browser tests (Playwright)

`e2e/` covers the flows with the most value. Each test says what it runs
against:

| Test                                                                                         | Kind                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------- |
| Choose a soin and its duration, pick a time, book, read it in the account (desktop + mobile) | real local API                      |
| Time taken by someone else after it was chosen: conflict message, times refreshed            | real local API                      |
| Lost answer to the booking request: retry with the same Idempotency-Key, one booking         | real API + injected network failure |
| Guest signs in on the booking page: time kept, then books                                    | real local API                      |
| Profile without phone: only that step, completed inline, then books                          | real local API                      |
| Expired session: message, « Se reconnecter » to the same time, nothing booked                | mocked 401 answer                   |
| Header account element in the server HTML, then guest / client label                         | real local API                      |

`npm run test:e2e` starts everything itself and stops it afterwards
(`playwright.config.mjs` → `e2e/stack.mjs`):

- a PostgreSQL 17 container (Docker, `127.0.0.1:55432`, removed at the end)
  with the backend's own roles and migrations — the real catalogue and the
  default weekly hours;
- the Firebase Auth Emulator (`firebase-tools@15.34.1`, project
  `demo-massage-it`, port 9099) and the Booking API (port 3101) from a local
  checkout of Massage-backend;
- this site with `next dev` on port 3100.

Test accounts, profiles and bookings are created through the emulator and
the API (`e2e/fixtures.mjs`), each test with its own accounts; times are
read from the availability API, so the tests do not depend on today's date.
Nothing is sent to staging, production, real Firebase or email.

One-time setup (Docker running, no Java needed):

```bash
git clone https://github.com/OlehDribko/Massage-backend.git ../../Massage-backend   # next to this repo, or set E2E_BACKEND_DIR
(cd ../../Massage-backend && npm ci && npm run prisma -- generate)
npx playwright install chromium
```

Run:

```bash
npm run test:e2e
E2E_BACKEND_DIR=/path/to/Massage-backend npm run test:e2e   # other backend checkout
npx playwright test --project=desktop -g "Idempotency"        # one test
```

Ports can be changed with `E2E_SITE_PORT`, `E2E_API_PORT`, `E2E_PG_PORT`;
traces and screenshots of failures go to `$TMPDIR/massage-frontend-e2e`
(`E2E_OUTPUT_DIR`), outside the project — files written inside it make the
dev server reload the page under test. Server concurrency, the outbox and
email delivery are covered by the backend's own tests, not here.

## Local backend (manual runs)

The stack of the browser tests can also serve `npm run dev`:

```bash
E2E_BACKEND_DIR=../../Massage-backend node e2e/stack.mjs   # Ctrl-C stops and removes it
```

with `.env.local` = the values of `firebaseEnv` in `playwright.config.mjs`
(API `http://127.0.0.1:3101`, emulator `127.0.0.1:9099`, project
`demo-massage-it`) and `CORS_ALLOWED_ORIGINS` including
`http://localhost:3000` (`E2E_SITE_PORT=3000` before starting the stack).

## Known limitations

- Browser tests are not in CI yet: they need a checkout of the backend
  repository (a cross-repository token in CI) and Docker. They run locally
  in about a minute.
- The admin role cannot be set through the API (owner command only), so
  admin screens have unit tests of their logic but no browser test.
- No TypeScript: critical boundaries are covered by runtime checks against
  the OpenAPI snapshot and by unit tests; there is no typecheck step.
- Prices, free times and readiness are always decided by the server; the
  site shows the server's answer after every write.
- Production needs `NEXT_PUBLIC_SITE_URL` and the production Firebase / API
  values before release.
