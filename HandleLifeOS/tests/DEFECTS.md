# Life OS — Consolidated Defect Register

**Date:** 2026-05-09  
**Sources:** Unit test run (Phases 0–12) + 10-persona E2E run  
**Total app defects:** 14 | **Infrastructure fixes:** 3  

> To fix a defect in a future session: "fix defect D-001" (or a range, e.g. "fix D-001 through D-005").  
> Infrastructure items (I-001–I-003) are test-harness fixes, not app bugs.

---

## CRITICAL

### D-001 — /logout route returns 404
- **Severity:** critical
- **File:** `src/app/logout/page.tsx` (missing — must be created)
- **Fix:** Create a server component that calls `signOut({ redirectTo: '/login' })`. NextAuth v5 handles logout via `/api/auth/signout`; there is no `/logout` page route, so any direct navigation to `/logout` 404s.
- **Source:** E2E CRIT-003

---

## HIGH

### D-002 — RTL layout not applied for ar-AE / ur-PK locales
- **Severity:** high
- **File:** `src/app/layout.tsx`
- **Fix:** Read the authenticated user's locale from the session profile (or `Accept-Language` header as fallback). Set `dir={isRTL ? 'rtl' : 'ltr'}` and `lang={locale}` on the `<html>` element. RTL locales: `ar-AE`, `ur-PK`, `ar-*`, `he-*`, `fa-*`.
- **Source:** E2E HIGH-001

### D-003 — Voice page: ClientFetchError + 6 s load time
- **Severity:** high
- **File:** `src/app/(app)/voice/page.tsx`
- **Fix:** (a) Add a `<Suspense>` + error boundary wrapper around the auth-dependent component so a failed session fetch shows a fallback rather than crashing. (b) Investigate why the auth session fetch reaches the wrong protocol/port on this route specifically — likely the same root cause as D-004. (c) Add a loading skeleton (`loading.tsx` in the voice route segment) to prevent blocking.
- **Source:** E2E HIGH-002

### D-004 — ERR_SSL_PROTOCOL_ERROR on auth session fetch (all pages)
- **Severity:** high
- **Files:** `.env.local`, `src/auth.ts`
- **Fix:** Verify `NEXTAUTH_URL=http://localhost:3000` (not `https://`) in `.env.local`. Check for an `AUTH_URL` variable that overrides it. In `src/auth.ts`, ensure no `trustHost: false` or forced HTTPS redirect in dev. The symptom is that NextAuth v5 attempts to contact `https://localhost:3000` for session tokens, which fails on a plain HTTP dev server.
- **Source:** E2E HIGH-003

### D-005 — Implementation roadmap loads without PIN gate
- **Severity:** high
- **File:** `src/app/(app)/implementation/page.tsx`
- **Fix:** Move the PIN gate check to a server component (SSR) so it renders before any page content is hydrated. If the gate currently uses `useEffect` to show/hide content after mount, an authenticated user can see the roadmap before the gate appears. Use a server-side session check to redirect or render a PIN form unconditionally on first load.
- **Source:** E2E HIGH-004

### D-006 — Habits / Planner / Focus / Travel primary action buttons have no accessible selector
- **Severity:** high
- **Files:**
  - `src/app/(app)/habits/page.tsx` or its "Add habit" button component
  - `src/app/(app)/planner/page.tsx` or `src/components/planner/AddTaskModal.tsx`
  - `src/app/(app)/focus/page.tsx` (timer start button)
  - `src/app/(app)/travel/page.tsx` (new trip button)
- **Fix:** Add `data-testid` attributes to each primary action button:
  - `data-testid="add-habit-btn"` on the Habits "Add" / "+" button
  - `data-testid="add-task-btn"` on the Planner "Add task" button
  - `data-testid="start-timer-btn"` on the Focus timer start button
  - `data-testid="new-trip-btn"` on the Travel "New trip" button
- **Source:** E2E HIGH-005

### D-007 — Vault uploader has no `<input type="file">` in the DOM
- **Severity:** high
- **File:** Vault uploader component in `src/components/vault/` (exact filename: locate the drag-and-drop uploader)
- **Fix:** Add a visually hidden `<input type="file" data-testid="vault-file-input" className="sr-only" aria-label="Upload file" />` inside the uploader component. Wire its `onChange` to the same upload handler used by drag-and-drop. This enables both keyboard/programmatic file selection and E2E testing.
- **Source:** E2E HIGH-006

### D-008 — Personalisation: personality selector cards use non-interactive `<div>` elements
- **Severity:** high
- **File:** `src/app/(app)/settings/personalisation/page.tsx`
- **Fix:** Replace `<div onClick>` personality cards with `<button>` elements (or `<input type="radio">` with styled labels). Add `data-testid="personality-{slug}"` to each card (e.g. `data-testid="personality-anchor"`). This makes them keyboard-navigable and ARIA-correct.
- **Source:** E2E HIGH-007

### D-009 — Settings page: toggle/switch components have no ARIA role
- **Severity:** high
- **File:** Custom toggle components in `src/components/ui/` (whichever component is used for preference switches in `/settings`)
- **Fix:** Audit all toggle UI components. Each toggle must either render as `<input type="checkbox">` or carry `role="switch"` with `aria-checked`. Without this, screen readers and automated tests cannot detect or interact with the controls.
- **Source:** E2E HIGH-008

### D-010 — Dashboard greeting does not show the user's first name
- **Severity:** high
- **File:** `src/components/home/GreetingHero.tsx` (and possibly `src/app/(app)/dashboard/page.tsx`)
- **Fix:** Ensure the user profile row is created at signup with `display_name` populated. In `GreetingHero`, fall back in order: `profile.display_name` → `session.user.name` → `session.user.email.split('@')[0]`. If the profile is not yet created (e.g. email not verified), use the email prefix rather than showing no name.
- **Source:** E2E HIGH-009

### D-011 — Honeypot response in signup route is dead code
- **Severity:** high
- **File:** `src/app/api/auth/signup/route.ts`
- **Fix:** The route's Zod schema uses `website: z.string().max(0).optional()`. Any non-empty `website` value fails schema validation with a 400 before the handler's honeypot `if` block executes. The timing-matched `bcrypt` call meant to fool bots (simulate normal processing time) is therefore unreachable. Two options:
  1. Remove the `website` field from `signupSchema` entirely and handle the honeypot check *before* Zod parsing (read raw body, check `website`, then parse).
  2. Change the schema to `z.string().optional()` and move the honeypot 201 response above Zod parsing.
- **Source:** Unit test UT-001 (auth.test.ts)

---

## MEDIUM

### D-012 — Career page load time exceeds 3 s threshold
- **Severity:** medium
- **File:** `src/app/(app)/career/page.tsx`
- **Fix:** Add `<Suspense>` boundaries around non-critical data fetches (skills, resources, learning queue). Defer server data that is not needed for the initial paint. Measured at 3642ms on localhost dev server.
- **Source:** E2E MED-001

### D-013 — `scroll-behavior: smooth` on `<html>` triggers Next.js warning on every navigation
- **Severity:** medium
- **File:** `src/app/layout.tsx` (or global CSS)
- **Fix:** Replace the CSS `html { scroll-behavior: smooth; }` rule with the `data-scroll-behavior="smooth"` attribute approach recommended by Next.js 16, or move the smooth-scroll CSS to individual containers rather than the root `<html>` element.
- **Source:** E2E MED-002

### D-014 — Notification bell and Capture pill have no `data-testid`
- **Severity:** medium
- **Files:**
  - `src/components/notifications/NotificationBell.tsx`
  - `src/components/navigation/FloatingCapturePill.tsx`
- **Fix:** Add `data-testid="notification-bell"` to the bell button in `NotificationBell.tsx`. Add `data-testid="capture-pill"` to the floating pill trigger in `FloatingCapturePill.tsx`. Both components are currently undetectable by text/role selectors in automated tests.
- **Source:** E2E MED-003

---

## Infrastructure Fixes (Test Harness — Not App Bugs)

### I-001 — `verifyEmailViaAdminApi()` uses wrong Supabase endpoint format
- **File:** `tests/e2e-personas/helpers.ts` — `verifyEmailViaAdminApi()`
- **Fix:** Replace `GET /auth/v1/admin/users?email=...` (which filters by email via query param — not universally supported) with a two-step approach:
  1. `GET /auth/v1/admin/users?page=1&per_page=1000` and find the user by email in the response, OR
  2. Use `POST /auth/v1/admin/generateLink` with `{ type: "signup", email }` to generate a confirmation link, then call `PUT /auth/v1/admin/users/{id}` with `{ email_confirm: true }`.
  The current implementation returns non-OK for all 10 personas, preventing any persona from reaching a verified login state.

### I-002 — No E2E bypass for signup rate limit (3 signups/hour/IP)
- **Files:** `src/lib/security/rate-limit.ts`, `src/app/api/auth/signup/route.ts`
- **Fix:** Add a conditional bypass: when `process.env.E2E_MODE === 'true'` AND the request IP is `127.0.0.1` / `::1`, skip `checkSignupRateLimit`. Alternatively (preferred for security): pre-seed all 10 E2E persona accounts via the Supabase admin API in a `beforeAll` setup script rather than creating them through the signup flow during the test run.

### I-003 — Vault E2E upload requires a hidden file input (prerequisite for I-003)
- **File:** `tests/e2e-personas/persona-runner.ts` — `testVault()`
- **Fix:** This is resolved by shipping D-007 (the hidden `<input type="file" data-testid="vault-file-input">` in the Vault uploader). Once D-007 is merged, the E2E runner can use `page.locator('[data-testid="vault-file-input"]').setInputFiles(...)` instead of attempting drag-and-drop simulation.

---

## Fix Priority Order

| Order | Defect | Reason |
|-------|--------|--------|
| 1 | D-004 | SSL error affects every page — fix this first to unblock other testing |
| 2 | D-001 | /logout 404 breaks test flows that need persona resets |
| 3 | D-010 | Dashboard greeting — high visibility regression |
| 4 | D-002 | RTL — affects 50M+ potential users |
| 5 | D-005 | Security: roadmap accessible without PIN |
| 6 | D-011 | Security: honeypot dead code (bot timing protection bypassed) |
| 7 | D-003 | Voice page crash (error boundary + perf) |
| 8 | D-007 | Vault file input (also unblocks I-003) |
| 9 | D-006 | data-testid on 4 primary action buttons |
| 10 | D-008 | Personalisation ARIA fix |
| 11 | D-009 | Settings toggle ARIA fix |
| 12 | D-014 | data-testid on bell + pill |
| 13 | D-012 | Career page performance |
| 14 | D-013 | scroll-behavior warning |
| — | I-001 | Test harness: email verification endpoint |
| — | I-002 | Test harness: E2E_MODE rate-limit bypass |
| — | I-003 | Test harness: Vault upload (after D-007) |
