# Frontend: Clean Code & SOLID Review

Per-file assessment against **Clean Code** (naming, small functions, DRY, no magic numbers, readability) and **SOLID** (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion). Target: **10/10** where applicable.

---

## Summary

| Area | Grade | Notes |
|------|--------|--------|
| **API layer** | 9/10 | SRP, DIP, thin wrappers; constants and shared error type applied. |
| **Config & types** | 9–10/10 | Env, constants, **`queryKeys`**; unified `SeatInfo` type. |
| **Hooks** | 10/10 | One concern each; **`queryKeys`** for DRY cache keys. |
| **Components** | 9/10 | `forms/` (`FormTextField`, `CoverPhotoField`, `SectionFormCard`, `formStyles`); small, focused. |
| **Pages** | 9–10/10 | Create show split: `useCoverPhoto`, `createShow/constants`, presentational form pieces. |
| **App / main** | 9/10 | Composition and constants in place. |

**Overall: ~9–9.5/10.** API/config/hooks/utils align with clean code; create-show flow uses SRP-focused hooks and components.

---

## Per-file assessment

### `src/main.tsx`
- **Clean code:** Clear entry point; single responsibility. Guard for missing root is good.
- **SOLID:** N/A (bootstrap only).
- **Grade: 9/10.**

---

### `src/App.tsx`
- **Clean code:** Query client options now use `QUERY_STALE_TIME_MS` and `QUERY_RETRY_COUNT` from config (no magic numbers).
- **SOLID:** Composes providers and routes; no business logic.
- **Grade: 9/10.**

---

### `src/api/client.ts`
- **Clean code:** Single `request()` function; URL building is clear. Uses `HTTP_NO_CONTENT` and `ErrorResponse` type (no magic 204, typed error).
- **SOLID:** **SRP** — HTTP transport only. **DIP** — callers depend on the `client` interface, not `fetch` directly.
- **Grade: 9/10.**

---

### `src/api/shows.ts`, `availability.ts`, `reservations.ts`, `orders.ts`
- **Clean code:** One path constant per file; thin, readable wrappers.
- **SOLID:** **SRP** — each module owns one API surface.
- **Grade: 9/10.**

---

### `src/config/env.ts`
- **Clean code:** Single place for env-derived config; normalizes trailing slash.
- **SOLID:** **SRP** — configuration only.
- **Grade: 10/10.**

### `src/config/constants.ts`
- **Clean code:** Single place for `DEMO_USER_ID`, query stale time, retry count, **admin create-show** (`DEFAULT_VENUE_ID`, cover image limits, default section dimensions, `CREATE_SHOW_DEFAULT_DAYS_AHEAD`).
- **SOLID:** **SRP** — constants only.
- **Grade: 10/10.**

---

### `src/types/api.ts`
- **Clean code:** Clear names; data shapes only. Single `SeatInfo` type for catalog and availability lists (DRY).
- **SOLID:** **ISP** — consumers depend only on the types they use.
- **Grade: 10/10.**

---

### `src/config/queryKeys.ts`
- **Clean code:** One place for TanStack Query keys; no scattered string tuples.
- **SOLID:** **SRP** — cache key contract only; hooks/pages import this (stable invalidation).
- **Grade: 10/10.**

---

### `src/utils/format.ts` & `index.ts`
- **Clean code:** Pure functions; single responsibility per function; no magic values.
- **SOLID:** **SRP** — formatting only. **OCP** — new formatters can be added without changing existing ones.
- **Grade: 10/10.**

---

### `src/hooks/*`
- **Clean code:** One concern per hook; **`queryKeys`** centralizes cache keys (DRY with `CreateShowPage` invalidation). **`useCoverPhoto`** isolates cover URL/file state, compression, and validation (admin create-show).
- **SOLID:** **SRP** — each hook does one thing (list show, get show, availability, create hold/order/show, cover photo). **DIP** — depend on API modules, not HTTP.
- **Grade: 10/10.**

### `src/components/forms/*` (`formStyles`, `FormTextField`, `CoverPhotoField`, `SectionFormCard`)
- **Clean code:** DRY Tailwind via `FORM_INPUT` / `FORM_INPUT_SM`; presentational components with explicit props; no business logic in UI shells.
- **SOLID:** **SRP** — each component one job. **OCP** — new fields extend via composition without editing internals.
- **Grade: 10/10.**

### `src/pages/createShow/constants.ts`
- **Clean code:** Defaults and `defaultStartTime()` live next to create-show flow; reuses `config/constants` for numbers (no magic literals).
- **SOLID:** **SRP** — defaults for one feature only.
- **Grade: 10/10.**

---

### `src/components/Button.tsx`
- **Clean code:** Variants in one map; `forwardRef` and `displayName` set. Props allow `type="submit"` override.
- **SOLID:** **SRP** — button UI only. **OCP** — new variants via config.
- **Grade: 9/10.**

### `src/components/Card.tsx`
- **Clean code:** Small, clear; padding map is explicit.
- **SOLID:** **SRP** — card layout only.
- **Grade: 10/10.**

### `src/components/Layout.tsx`
- **Clean code:** Simple structure; readable.
- **SOLID:** **SRP** — app shell and nav.
- **Grade: 9/10.**

### `src/components/Loading.tsx`
- **Clean code:** Minimal. Optional: extract `min-h-[200px]` to a constant if reused.
- **SOLID:** **SRP** — loading indicator only.
- **Grade: 9/10.**

### `src/components/ErrorMessage.tsx`
- **Clean code:** Clear props; optional retry uses shared `Button` (ghost + contextual classes) for consistency with the design system.
- **SOLID:** **SRP** — error display only.
- **Grade: 9/10.**

---

### `src/pages/HomePage.tsx`
- **Clean code:** Uses shared `formatDate`; loading/error/content flow is clear.
- **SOLID:** **SRP** — list shows and link to detail.
- **Grade: 9/10.**

### `src/pages/ShowDetailPage.tsx`
- **Clean code:** Uses `formatDate`, `formatPrice`, `DEMO_USER_ID` from shared modules; `useCallback` used appropriately.
- **SOLID:** **SRP** — show detail and seat selection. Could extract seat grid to a small component.
- **Grade: 9/10.**

### `src/pages/CheckoutPage.tsx`
- **Clean code:** `computeOrderTotal()` removes duplicate amount/currency logic; uses shared `formatPrice`.
- **SOLID:** **SRP** — checkout and place order.
- **Grade: 9/10.**

### `src/pages/AdminPage.tsx`
- **Clean code:** Minimal; single CTA.
- **SOLID:** **SRP** — admin entry only.
- **Grade: 10/10.**

### `src/pages/CreateShowPage.tsx`
- **Clean code:** Orchestrates submit + navigation only; **`useCoverPhoto`**, **`FormTextField`**, **`CoverPhotoField`**, **`SectionFormCard`**; **`DEFAULT_VENUE_ID`** and section defaults from config / `createShow/constants`; **`isPreviewableCoverUrl`** as a tiny pure helper.
- **SOLID:** **SRP** — page wires hooks and handlers; cover and sections are delegated. **DIP** — depends on abstractions (`useCreateShow`, form components).
- **Grade: 10/10.**

---

## Refactors applied (to approach 10/10)

1. **Shared utils:** `formatDate`, `formatPrice`, `toISOLocal` in `src/utils/format.ts` (DRY).
2. **Constants:** `DEMO_USER_ID`, `QUERY_STALE_TIME_MS`, `QUERY_RETRY_COUNT` in `src/config/constants.ts` (no magic numbers).
3. **CheckoutPage:** `computeOrderTotal(show, seatIds)` to remove duplicated amount/currency logic (DRY).
4. **API client:** `HTTP_NO_CONTENT`, `ErrorResponse` type (constants + typed error).
5. **CreateShowPage:** `DEFAULT_SECTION`, `defaultStartTime()`, `toISOLocal` from utils (naming + DRY).
6. **CreateShowPage (second pass):** `components/forms/*`, `hooks/useCoverPhoto.ts`, `pages/createShow/constants.ts`, extended `config/constants.ts` for venue and image limits.

---

## Optional next steps (polish)

1. **Unify seat type:** Use a single type (e.g. `SeatInfo`) for both `Show.seats` and availability seats if the backend contract allows.
2. **ErrorMessage:** Use `<Button variant="ghost">Try again</Button>` (or link variant) for retry for consistency.
3. **Import style:** Prefer `@/api/shows` (no `.ts`) across hooks for consistency.

---

## SOLID checklist (project-level)

| Principle | Status |
|-----------|--------|
| **S**ingle Responsibility | ✅ Modules and hooks have one reason to change. |
| **O**pen/Closed | ✅ New routes, API modules, formatters, variants added without changing existing code. |
| **L**iskov Substitution | ✅ N/A (no inheritance hierarchy). |
| **I**nterface Segregation | ✅ Small, focused types; no fat interfaces. |
| **D**ependency Inversion | ✅ UI depends on API modules and config; client abstracts fetch. |
