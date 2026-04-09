# Frontend Plan — Ticketing System Web App

This document is the source of truth for the **StagePass** web app (`frontend/`): what the backend exposes, what the UI does today, and what remains optional. Use it as a checklist when extending the app.

---

## 1. Backend Overview (What the Web Must Support)

| Service           | Port | API Base              | Purpose |
|------------------|------|------------------------|---------|
| **API Gateway**   | 8080 | (single entry point)   | Routes all `/api/*` to the services below. |
| **Catalog**       | 8081 | `/api/shows`           | List shows; get show by ID (with seats); **create show** (admin). |
| **Availability**  | 8082 | `/api/availability`    | Get seat availability for a show (cached). |
| **Reservation**   | 8083 | `/api/reservations`    | Create hold; release hold; **batch hold/release**; locked seats; extend hold. |
| **Order**         | 8084 | `/api/orders`          | Create order from a hold (triggers payment flow). |
| **Payment**       | 8086 | (no REST API)          | Consumes events; no direct HTTP for frontend. |
| **Notification**  | 8085 | (no REST API)          | Consumes events; no direct HTTP for frontend. |

### API Endpoints (via Gateway at `http://localhost:8080`)

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/shows` | List all shows. |
| GET    | `/api/shows/:id` | Get one show with seats and venue metadata. |
| POST   | `/api/shows` | **Create show** (admin): title, category, venue, schedule, sections/seat layout, optional `coverImageUrl`. |
| GET    | `/api/availability/:showId` | Seat availability for a show. |
| POST   | `/api/reservations` | Create hold (`showId`, `seatIds[]`, `userId`). |
| DELETE | `/api/reservations/:holdId` | Release entire hold. |
| GET    | `/api/reservations/shows/:showId/locked-seats` | Seat IDs currently locked for the show. |
| POST   | `/api/reservations/hold` | **Batch hold** (incremental selection); optional `holdId` to merge. |
| POST   | `/api/reservations/release` | **Batch release** seats from a hold (`holdId`, `showId`, `userId`, `seats[]`). |
| POST   | `/api/reservations/extend-hold` | Refresh hold TTL for seats owned by user. |
| POST   | `/api/orders` | Create order (`holdId`, `showId`, `seatIds[]`, `userId`, `amount`, `currency`). |

**Note:** Payment and Notification are event-driven (Kafka). The frontend does not call them directly. Order creation triggers the payment flow; success UI is shown after `POST /api/orders` succeeds.

---

## 2. Goals of the Web App

- Let users **browse shows** with **filters** (category, price, availability, date/time, location via Nominatim) and **pagination**.
- Let users open a **show detail** page: **seat map** by section/row, **multi-select**, and **debounced batch holds** so each click does not spam the API.
- Let users **complete checkout** (order) and see **inline confirmation** (no separate route required).
- Let operators use **Admin** → **Create show**: full form (schedule, cover image compression, multi-section seating).
- Work on **desktop and mobile** (responsive).
- Keep a **layered structure** (types → API → hooks → pages) so auth, order history, and new endpoints are easy to add.

---

## 3. Tech Stack (As Implemented)

| Layer | Choice | Notes |
|-------|--------|--------|
| Build / Dev | **Vite 5** | Dev server on **port 3000**; `/api` → proxy to gateway `8080`. |
| UI | **React 18** | |
| Language | **TypeScript** | Strict types in `src/types/api.ts`. |
| Routing | **React Router 6** | Layout route with `<Outlet />`. |
| Server state | **TanStack Query v5** | Queries + mutations; defaults in `App.tsx` (`staleTime`, `retry`). |
| Styling | **Tailwind CSS 3** | |
| HTTP | **`fetch` wrapper** | `src/api/client.ts` — base URL, JSON, errors. |
| Dates (forms) | **react-datepicker** | Admin / filter date pickers. |
| Geocoding (browse) | **Nominatim** (OpenStreetMap) | `src/lib/nominatim.ts` — search places for distance filtering; **respect usage policy** in production. |

---

## 4. Information Architecture / Sitemap (Current)

```
/                     → Home: hero, filters, paginated show grid
/shows/:showId        → Show detail: availability + seat picker + continue to checkout
/checkout             → Checkout (expects `location.state`: `{ hold, show }`)
/admin                → Admin hub (link to create show)
/admin/shows/new      → Create show form (POST /api/shows)
```

**Not used today:** `/order-confirmed` — confirmation is **inline** on `/checkout` after a successful order mutation.

**Future:** `/my-orders`, `/auth/login`, etc., when the backend supports them.

---

## 5. User Flows

### Flow A: Browse and select seats

1. **Home** loads `GET /api/shows`; client-side filters + pagination reduce the list.
2. User opens **Show detail** → `GET /api/shows/:id` and `GET /api/availability/:showId`.
3. User toggles seats; **`useDebouncedSeatHold`** batches `POST /api/reservations/release` and `POST /api/reservations/hold` (~400ms debounce) instead of holding on every click.
4. **Continue** flushes pending sync, then navigates to **Checkout** with `{ hold, show }` in location state (`seatIds` reflect full selection).

### Flow B: Place order

1. **Checkout** reads `hold` + `show` from navigation state; if missing, redirects home.
2. **Place order** → `POST /api/orders` with computed `amount` / `currency` from seat prices.
3. On success → **Order confirmed** card on the same page; link back to home.

### Flow C: Abandon checkout

- If you add explicit cancel: call `DELETE /api/reservations/:holdId` and navigate away (pattern from earlier plan). Today, focus is on successful path; batch hold state is scoped to the show page.

### Flow D: Admin — create show

1. **Admin** → **Create new event**.
2. Fill title, category, description, venue/address/geo (with place search), times, sections (rows, seats per row, price, currency), optional cover image (compressed client-side to data URL within size limits).
3. Submit → `POST /api/shows` → redirect or success handling via `useCreateShow`.

---

## 6. Data Model (Frontend Types)

Single source: **`src/types/api.ts`**. Shapes align with catalog/reservation/order DTOs.

**Show (catalog response):** `id`, `title`, `category?`, `description?`, **`venue`** (`VenueLocation`: `venueName`, `city`, `country`, `address`, `geo`), `startTime`, `endTime?`, `doorsOpenTime?`, `seats[]`, `coverImageUrl?`.

**CreateShowRequest (admin):** `title`, `category`, `description?`, `venue`, `startTime`, `endTime`, `doorsOpenTime`, `sections[]` (`SectionInput`: section, rowCount, seatsPerRow, price, currency), `coverImageUrl?`.

**SeatInfo:** `id`, `section`, `row`, `number`, `price`, `currency`.

**SeatAvailability:** `showId`, `showTitle`, `seats[]`.

**Hold / batch:** `CreateHoldRequest`, `HoldResponse`, `BatchHoldResponse` (`success`, `failed`, `hold | null`), `BatchReleaseRequest`.

**Order:** `CreateOrderRequest`, `OrderResponse`.

---

## 7. Configuration & Environment

| Item | Implementation |
|------|----------------|
| **API base** | Dev: **empty** `VITE_API_BASE` → requests use relative `/api` and Vite proxy to `http://localhost:8080`. Prod: set `VITE_API_BASE` to the gateway origin (no trailing slash mishandled — trimmed in `env.ts`). |
| **Demo user** | `DEMO_USER_ID` in `src/config/constants.ts` (currently `frontend-user`) for holds/orders until auth exists. |
| **Query defaults** | `QUERY_STALE_TIME_MS`, `QUERY_RETRY_COUNT` in `constants.ts`. |

---

## 8. Implementation Checklist (Living)

### 8.1 Core platform

- [x] Vite + React + TypeScript + Tailwind; path alias `@/` → `src/`.
- [x] `src/types/api.ts` DTOs.
- [x] HTTP client `src/api/client.ts`.
- [x] Domain APIs: `shows`, `availability`, `reservations`, `orders` (`src/api/`).
- [x] TanStack Query + hooks: `useShows`, `useShow`, `useAvailability`, `useCreateHold`, `useCreateOrder`, `useCreateShow`, `useDebouncedSeatHold`, etc. (`src/hooks/`).
- [x] Router + `Layout` (header: StagePass, Shows, Admin).

### 8.2 Pages & UX

- [x] **Home** — filters, pagination, skeleton/error states, hero.
- [x] **Show detail** — section/row seat UI, availability merge, batch hold hook.
- [x] **Checkout** — summary, place order, inline confirmation.
- [x] **Admin** + **Create show** — multipart form, image handling, validation helpers.
- [x] Loading/error components; responsive layout.

### 8.3 Optional / later

- [ ] Dedicated `/order-confirmed` with order id deep-link.
- [ ] Hold expiry countdown on show/checkout.
- [ ] Auth + real `userId`.
- [ ] Order history when API exists.
- [ ] Toast notifications for payment outcome via WebSocket/poll if backend adds it.

---

## 9. File Structure (Actual)

```
frontend/
├── public/
├── scripts/                   # e.g. seed-1000-shows.mjs (npm run seed:shows)
├── src/
│   ├── api/                   # client.ts, shows, availability, reservations, orders, index
│   ├── components/            # Layout, ShowCard, filters, forms, Loading, …
│   ├── components/showFilters/
│   ├── components/forms/
│   ├── config/                # env.ts, constants.ts, queryKeys.ts, showFilterTabs, showSortOptions
│   ├── data/                  # eventCategories, currencies, concertImages
│   ├── hooks/                 # useShows, useShow, useAvailability, usePagination, useDebouncedSeatHold, …
│   ├── lib/                   # nominatim.ts
│   ├── pages/                 # HomePage, ShowDetailPage, CheckoutPage, AdminPage, CreateShowPage, createShow/*
│   ├── types/                 # api.ts
│   ├── utils/                 # filters, format, seat pricing, datetime, image, …
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts             # port 3000, proxy /api → 8080, alias @
├── tailwind.config.js
├── tsconfig.json
└── FRONTEND_PLAN.md           (this file)
```

---

## 10. NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (port 3000). |
| `npm run build` | Typecheck + production bundle. |
| `npm run lint` | ESLint. |
| `npm run preview` | Preview production build. |
| `npm run seed:shows` | Optional data seed for catalog (see `scripts/`). |

---

## 11. Success Criteria

- User can browse shows (with filters), open a show, select seats with efficient batch holds, check out, and place an order with clear loading/errors.
- Admin can create a show that appears in the catalog.
- All HTTP traffic targets `/api` via the gateway in production (`VITE_API_BASE`).
- Code stays organized: new endpoints get types → API module → hook → page.

When the backend adds endpoints, extend **section 1** here and mirror the same layers in code.
