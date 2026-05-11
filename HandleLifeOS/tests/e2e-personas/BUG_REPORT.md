# Life OS E2E Bug Report

**Generated:** 2026-05-09  
**Raw bug captures:** 48 | **Unique issues after dedup:** 17  
**Personas tested:** 10 attempted | 1 fully executed (Fatima Al-Rashid)  

> 42 of 48 raw captures are the same root-cause repeating across 9 blocked personas.
> Unique issues are listed below with the full set of affected personas.

---

## CRITICAL (3 unique)

### CRIT-001 — Signup rate limit (3/hour) blocks multi-persona E2E testing
- **Severity:** critical
- **Category:** blocked / infrastructure
- **Personas:** carlos, yuki, sarah, abdullah, emma, rajesh, nina (7/10 blocked)
- **Module:** Signup — `POST /api/auth/signup`
- **Reproduction:** Create 3+ accounts from same IP within 1 hour
- **Expected:** All 10 personas can create accounts in a test run
- **Actual:** HTTP 429 "Too Many Requests" from 4th persona onward
- **Root cause:** `checkSignupRateLimit` enforces 3 signups/3600s per IP in `src/lib/security/rate-limit.ts`. Correct security behavior; no test-mode bypass exists.
- **Suggested fix:** `src/app/api/auth/signup/route.ts` — skip rate limit when `process.env.E2E_MODE === 'true'`; OR pre-seed all E2E accounts via Supabase admin API before the test run (preferred)

### CRIT-002 — Admin email verification API format mismatch — logins fail for priya, james
- **Severity:** critical
- **Category:** blocked
- **Personas:** priya, james
- **Module:** Signup → Email verification → Login
- **Reproduction:** Sign up → attempt admin API email confirmation → login
- **Expected:** Email verified via admin API → login succeeds
- **Actual:** Admin API call returns non-OK; users land on `/verify-email?status=pending`; proxy blocks dashboard access
- **Root cause:** Test harness `verifyEmailViaAdminApi()` calls `GET /auth/v1/admin/users?email=...` — Supabase admin API may not support email filter on this endpoint, or response structure differs
- **Suggested fix:** `tests/e2e-personas/helpers.ts` — use `POST /auth/v1/admin/generateLink` with `{type:"signup", email}` instead; or use direct DB update via service role

### CRIT-003 — /logout route returns 404
- **Severity:** critical
- **Category:** ui-break
- **Personas:** fatima (confirmed), all others
- **Module:** Auth / Logout
- **Reproduction:** `GET http://localhost:3000/logout`
- **Expected:** Signout executes, redirect to /login
- **Actual:** HTTP 404 — no page route at /logout
- **Root cause:** NextAuth v5 uses `signOut()` client function → `/api/auth/signout`. No `/logout` page exists.
- **Suggested fix:** Create `src/app/logout/page.tsx` with a server component that calls `signOut({ redirectTo: '/login' })`
- **Screenshot:** `screenshots/fatima/Auth-relogin-success.png`

---

## HIGH (9 unique)

### HIGH-001 — RTL layout not applied for ar-AE (Fatima) locale
- **Severity:** high
- **Category:** rtl
- **Personas:** fatima (ar-AE), inferred: abdullah (ur-PK)
- **Module:** Global — `src/app/layout.tsx`
- **Reproduction:** Log in with browser locale `ar-AE` → inspect `<html dir>`
- **Expected:** `<html dir="rtl">`
- **Actual:** `dir` attribute null
- **Suggested fix:** In `src/app/layout.tsx`, read locale from user profile or `Accept-Language` header and set `dir={isRTL ? 'rtl' : 'ltr'}` on `<html>`
- **Screenshot:** `screenshots/fatima/RTL-check-body-dir.png`

### HIGH-002 — Voice page: ClientFetchError + 6004ms load
- **Severity:** high
- **Category:** console-error / performance
- **Personas:** fatima
- **Module:** Voice — `/voice`
- **Reproduction:** Log in → navigate to `/voice`
- **Expected:** Voice page loads < 3s, no auth errors
- **Actual:** `ClientFetchError: Failed to fetch` (authjs) + 6004ms load time
- **Suggested fix:** `src/app/(app)/voice/page.tsx` — add error boundary; investigate auth session fetch timeout; add loading skeleton
- **Screenshot:** `screenshots/fatima/Voice-main.png`

### HIGH-003 — ERR_SSL_PROTOCOL_ERROR on auth session fetch (every page)
- **Severity:** high
- **Category:** console-error
- **Personas:** priya, james, fatima, and all others
- **Module:** Global
- **Reproduction:** Log in → navigate any page → RSC payload fetch fails
- **Expected:** Clean RSC payload responses
- **Actual:** `Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR` → fallback to browser navigation on every page
- **Root cause:** Something in the auth/RSC pipeline attempts HTTPS on localhost; possible `NEXTAUTH_URL` or `AUTH_URL` set to `https://`
- **Suggested fix:** `.env.local` — verify `NEXTAUTH_URL=http://localhost:3000`; check `src/auth.ts` for forced HTTPS

### HIGH-004 — Implementation roadmap loads without PIN gate
- **Severity:** high
- **Category:** security
- **Personas:** fatima
- **Module:** Implementation — `/implementation`
- **Reproduction:** Log in as any user → navigate to `/implementation`
- **Expected:** PIN prompt before roadmap content
- **Actual:** Roadmap loaded (no PIN input rendered before content)
- **Suggested fix:** `src/app/(app)/implementation/page.tsx` — render PIN gate server-side before content; do not rely on client-side useEffect for security gate
- **Screenshot:** `screenshots/fatima/Implementation-pin-gate.png`

### HIGH-005 — Habits / Planner / Focus / Travel primary action buttons not selectable
- **Severity:** high
- **Category:** ui-break / testability
- **Personas:** fatima
- **Modules:** Habits, Planner, Focus, Travel
- **Reproduction:** Navigate to each module → attempt to find "Add"/"New"/"Start" button by text
- **Expected:** Primary action buttons accessible by text content or role
- **Actual:** No button matched by text patterns `/add|new|task|\+/i` etc.
- **Root cause:** Buttons are icon-only (Plus icon without text) or use tooltip labels only
- **Suggested fix:** Add `data-testid` attributes: `add-habit-btn`, `add-task-btn`, `start-timer-btn`, `new-trip-btn`
- **Screenshots:** `screenshots/fatima/Habits-main.png`, `screenshots/fatima/Planner-task-added.png`

### HIGH-006 — Vault uploader has no `<input type="file">` in DOM
- **Severity:** high
- **Category:** ui-break / testability
- **Personas:** fatima
- **Module:** Vault — `/vault`
- **Reproduction:** Navigate to `/vault` → query `input[type="file"]`
- **Expected:** Hidden file input for programmatic upload
- **Actual:** Zero `input[type="file"]` elements
- **Root cause:** Drag-and-drop only UI; no hidden file input
- **Suggested fix:** `src/components/vault/` — add `<input type="file" data-testid="vault-file-input" className="sr-only">` to uploader
- **Screenshot:** `screenshots/fatima/Vault-main.png`

### HIGH-007 — Personalisation personality buttons not found by role/text
- **Severity:** high
- **Category:** ui-break / accessibility
- **Personas:** fatima
- **Module:** Personalisation — `/settings/personalisation`
- **Reproduction:** Navigate to `/settings/personalisation` → find personality selector
- **Expected:** Buttons or radio inputs for each personality option
- **Actual:** No `button` or `[role="radio"]` matching personality names
- **Root cause:** Personality cards likely use `<div onClick>` — not ARIA-correct
- **Suggested fix:** `src/app/(app)/settings/personalisation/page.tsx` — use `<button>` or `role="radio"` with `data-testid="personality-{slug}"`

### HIGH-008 — Settings page: Zero toggle/switch elements in DOM
- **Severity:** high
- **Category:** ui-break / accessibility
- **Personas:** fatima
- **Module:** Settings — `/settings`
- **Reproduction:** Navigate to `/settings` → count `input[type="checkbox"]` and `[role="switch"]`
- **Expected:** Preference toggles accessible as semantic form elements
- **Actual:** `toggleCount=0`
- **Root cause:** Custom toggle components missing ARIA `role="switch"` or not rendering as checkbox
- **Suggested fix:** Audit `src/components/ui/` toggle components for ARIA compliance

### HIGH-009 — Dashboard: Personalized greeting (first name) not displayed
- **Severity:** high  
- **Category:** ui-break
- **Personas:** fatima
- **Module:** Dashboard — `/dashboard`
- **Reproduction:** Log in as Fatima → check dashboard for "Fatima" in page text
- **Expected:** "Good morning, Fatima" or similar
- **Actual:** First name not found in page text
- **Root cause:** Profile may not be created during signup (especially when email_verified=false); or greeting uses `session.user.name` which is not populated
- **Suggested fix:** `src/components/home/GreetingHero.tsx` — ensure profile creation on signup; fall back to `session.user.name` → `session.user.email.split('@')[0]`

---

## MEDIUM (3 unique)

### MED-001 — Career page load time 3642ms (> 3s)
- **Severity:** medium
- **Category:** performance
- **Personas:** fatima
- **Module:** Career — `/career`
- **Reproduction:** Navigate to `/career` as authenticated user, measure
- **Expected:** < 3000ms
- **Actual:** 3642ms
- **Suggested fix:** `src/app/(app)/career/page.tsx` — add Suspense boundaries; defer non-critical data fetches

### MED-002 — Next.js scroll-behavior warning on html element
- **Severity:** medium
- **Category:** console-error
- **Personas:** all
- **Module:** Global
- **Reproduction:** Any page navigation in dev mode
- **Expected:** No Next.js scroll-behavior warning
- **Actual:** `Detected scroll-behavior: smooth on the <html> element...`
- **Suggested fix:** `src/app/layout.tsx` — add `data-scroll-behavior="smooth"` to `<html>` element

### MED-003 — Notification bell / Capture pill not detectable by Playwright
- **Severity:** medium
- **Category:** testability
- **Personas:** fatima
- **Modules:** Dashboard, Global
- **Reproduction:** Look for notification bell and capture pill by text/role selectors
- **Expected:** Components accessible to automated tests
- **Actual:** Neither found by current selectors
- **Suggested fix:** Add `data-testid="notification-bell"` to `src/components/notifications/NotificationBell.tsx`; add `data-testid="capture-pill"` to `src/components/navigation/FloatingCapturePill.tsx`

---

## Infrastructure / Test Harness Issues (Not App Bugs)

| Issue | File | Fix |
|-------|------|-----|
| `verifyEmailViaAdminApi()` wrong endpoint format | `tests/e2e-personas/helpers.ts` | Use Supabase admin `generateLink` API |
| Rate limit blocks sequential persona creation | N/A | Pre-seed accounts via admin API before test run |
| Vault upload needs `<input type="file">` fallback | App component | Add hidden file input `data-testid="vault-file-input"` |
| Drag-and-drop UI not testable headlessly | App components | Add keyboard/programmatic upload paths |
