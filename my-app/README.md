# Massage by Stefania Ben — site

Next.js 16 (App Router, JS) + Tailwind CSS v4. Site is French-only for now.

## Where things live

| What                                                                                              | Where                              |
| ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Domain, indexing, practice details (phone, address, hours)                                        | `src/config/site.js`               |
| Page metadata helper, LocalBusiness JSON-LD                                                       | `src/lib/seo.js`                   |
| Design tokens (colors, type scale, spacing, radii, z-index)                                       | `src/app/globals.css` (`@theme`)   |
| Shared layout/type utilities (`px-page`, `max-w-content`, `text-section-title`, `heading-accent`) | `src/app/globals.css` (`@utility`) |
| Icons exported from Figma                                                                         | `public/icons/`                    |
| Shared UI primitives (buttons, links, eyebrows…)                                                  | `src/components/ui/`               |
| Page sections                                                                                     | `src/components/sections/`         |
| Header / Footer, mobile menu, header account element                                              | `src/components/layout/`           |
| Header account states preview (only under `npm run dev`)                                          | `/dev/header-preview`              |
| Sign-in config (Firebase web app, API URL)                                                        | `src/config/auth.js`               |
| Session: controller, Firebase adapter, API client, pure helpers                                   | `src/lib/auth/`                    |
| `AuthProvider` / `useAuth`, `/connexion` and `/compte` panels                                     | `src/components/auth/`             |

New page: export `metadata = pageMetadata({ title, description, path })`
and add the path to `INDEXABLE_ROUTES` if it should be in the sitemap.
Each page renders its own `<Header variant="overlay" />` (over a dark hero;
the page keeps its content clear of it) or `<Header variant="solid" />`
(light pages, in the normal flow).

## Environment

See `.env.example`. **`NEXT_PUBLIC_SITE_URL` must be set for Production
before release** — without it the site is `noindex` and canonical, sitemap
and JSON-LD URLs are not generated. Vercel preview builds are always `noindex`.

## Sign-in (Firebase Auth + booking API)

Contract: `Massage-backend/docs/auth-and-profiles.md` (section 5).

- Every visitor gets an anonymous Firebase session after the page has
  hydrated (never on the server), then `POST /api/me/sync` with
  `Authorization: Bearer <ID token>`. Tokens are never stored by the site.
- Role and profile come only from the sync response. Hiding links is not
  access control: the backend checks every `/api/me*` and admin request.
- Configuration: the five `NEXT_PUBLIC_FIREBASE_*` / `NEXT_PUBLIC_API_BASE_URL`
  variables in `.env.example`, per environment (staging ≠ production). While
  one is missing, sign-in is switched off cleanly. The API must allow this
  site's origin (`FRONTEND_URL` on the backend), and the domain must be in
  Firebase → Authentication → Authorized domains.
- Tests of the session logic (races, account switch, errors): `npm test`
  (built-in `node:test`, no extra packages).

## Booking, client area, administration

Contract: `Massage-backend/docs/booking.md`, `docs/notifications.md` (§11),
`docs/auth-and-profiles.md`. Studio time zone Europe/Paris, prices in euro
cents, payment on site.

| Route                                   | What                                                                              | Access                                |
| --------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| `/reserver`                             | Single booking entry: catalogue (`GET /api/services` + `src/content/services.js`) | public, indexed                       |
| `/reserver/[serviceId]`                 | Durations, price, free times (`…/availability`), booking (`POST /api/bookings`)   | public; booking needs a ready profile |
| `/compte`                               | Profile: name/phone (`PATCH /api/me`), email check/change, newsletter status      | permanent account                     |
| `/compte/reservations`, `…/[bookingId]` | Own bookings, move (`…/reschedule`), cancel (`…/cancel`), email status            | permanent account                     |
| `/admin/reservations`, `…/[bookingId]`  | Bookings of a day, client details, email results, cancel with a reason            | admin (checked by the API)            |
| `/admin/horaires`                       | Weekly hours and date exceptions; conflicts with bookings are listed (409)        | admin (checked by the API)            |
| `/marketing/confirm`, `/unsubscribe`    | Newsletter email links (paths fixed by the backend); act on click only            | public                                |

- Readiness to book comes from `bookingReadiness.blockers` of the profile;
  missing steps link to sign-in / `/compte` and come back with `?retour=`.
- `POST /api/bookings` sends one `Idempotency-Key` per intent (service +
  time); a retry after a network error or `CALENDAR_BUSY` reuses it. Other
  writes are never repeated automatically.
- `/reserver` keeps its SEO (indexed, in the sitemap); the step pages
  (`/reserver/[serviceId]`) and private pages are `noindex`. `/prestations`
  redirects to `/reserver` (next.config.mjs).
- Catalogue content: names, durations, prices and availability come from the
  API only. `src/content/services.js` groups the durations of one prestation
  by stable service id, marks the home-page « populaires » and holds the
  approved descriptions (none yet: no description toggle is shown).
- Booking happens only on this site. Planity is a secondary link to the
  public profile in the footer (`NEXT_PUBLIC_PLANITY_BOOKING_URL`).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
