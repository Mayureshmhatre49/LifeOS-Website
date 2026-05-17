# Life OS — Developer Guide

## Project
AI-powered personal assistant platform. Built with Next.js 16, TypeScript, Tailwind v4, AI SDK v6, NextAuth v5, Supabase. **Phases 1–7, 11–13, 15, 18 are fully complete.** Phases 16–17, 19–28 are actively in progress (most at 90–95%).

> QA Personas 1–41 cover global cross-section users. Personas 42–56 (edge-case / adversarial) are documented in `tests/e2e-personas/NEW_PERSONAS.md`.

## Quick Start
```bash
# 1. Copy and fill env vars
cp .env.local.example .env.local
# Add GOOGLE_GEMINI_API_KEY (or ANTHROPIC_API_KEY / OPENAI_API_KEY)

# 2. Run dev server
cmd /c npm run dev   # http://localhost:3000 (Windows)
# or
npm run dev          # http://localhost:3000 (Mac/Linux)
```

## Recent Major Updates (May 2026)
- **Security Hardening (Full Audit)**: Global rate limiting on all 137 API routes via edge proxy (200 req/60s per user + 10 billing req/hour); memory value sanitization before AI prompt injection; sanitizeFilename control-char regex fixed; Razorpay webhook idempotency via `webhook_events` dedup table; health endpoint information disclosure removed.
- **Design System Alignment**: All core UI components (Button, Input, Label) migrated from hardcoded Tailwind colors to CSS variable tokens (`--color-brand-*`, `--color-danger-*`, `--shadow-focus`). Navigation components (`LeftRail`, `BottomNav`) have `aria-current="page"` on active links. Focus page memory leak (missing AbortController) fixed.
- **Smart Notifications (Phase 12)**: Unified inbox with bell + dropdown, 8+ cross-module emitters, severity-coded UI, mark-read/dismiss/deep-link.
- **Habit Builder (Phase 18)**: Daily habits with frequency rules, streaks, 14-day visual strips, 8 suggested templates, notification nudges.
- **Travel & Trip Planner (Phase 16)**: 95% — trip CRUD, itinerary (8 item types), packing checklist, budget tracking, tabbed UI.
- **Career & Growth Hub (Phase 17)**: 90% — career goals, skill tracker, learning resource queue.
- **Home & Property (Phase 19)**: 90% — assets, maintenance scheduler, utility bills with notification integration.
- **Network & Relationships (Phase 20)**: 90% — personal CRM, birthday/anniversary reminders, follow-up nudges, interaction log.
- **Food & Nutrition (Phase 21)**: 95% — recipe library, 7-day meal planner, food logger with macro rings, auto grocery list.
- **Legal & Compliance (Phase 23)**: 95% — tax deadline calendar, AI document simplifier, compliance checklist.
- **Business Assistant (Phase 24)**: 95% — client CRM, project tracker, invoice generator (printable/PDF), P&L dashboard, GST calculator.
- **Social & Community (Phase 27)**: 90% — challenge catalog, progress tracking, accountability partners via invite code, auto-generated achievements.
- **AI Personalisation Engine (Phase 28)**: 90% — 45 distinct AI personalities, 8 pattern signals, opt-out privacy toggle, prompt injection into chat + briefing.
- **Storage Security (RLS)**: Supabase storage buckets (`vault-documents`, `aura-documents`) locked with folder-level RLS (`<user_id>/` prefix enforced).
- **PWA (Phase 26)**: 95% — custom SW, web app manifest, 4 launch shortcuts, in-app install prompt, offline fallback page.

## Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check only
npm audit            # Dependency vulnerability scan
```

## Project Structure
```
src/
├── app/
│   ├── (app)/
│   │   ├── chat/            # AI chat
│   │   ├── dashboard/       # Main dashboard (GreetingHero + RightPanel + InputBar)
│   │   ├── today/           # Today view
│   │   ├── planner/         # Daily Planner
│   │   ├── focus/           # Focus & Productivity (Pomodoro, body-doubling)
│   │   ├── money/           # Money Helper
│   │   ├── protection/      # Scam Checker / Contract Review
│   │   ├── family/          # Family Mode (shared tasks, calendar)
│   │   ├── aura/            # AURA child dev hub
│   │   ├── mind/            # Mental Health & Wellbeing
│   │   ├── notifications/   # Smart Notifications inbox
│   │   ├── vault/           # Document Vault
│   │   ├── habits/          # Habit Builder
│   │   ├── travel/          # Travel & Trip Planner
│   │   ├── career/          # Career & Growth Hub
│   │   ├── home/            # Home & Assets (appliances, maintenance, bills)
│   │   ├── property/        # Property Management OS (multi-property portfolio)
│   │   ├── network/         # Network & Relationships (CRM)
│   │   ├── nutrition/       # Food & Nutrition
│   │   ├── investments/     # Investment Tracker
│   │   ├── legal/           # Legal & Compliance
│   │   ├── business/        # Business Assistant
│   │   ├── briefing/        # AI Proactive Coach / Daily Briefing
│   │   ├── community/       # Social & Community
│   │   ├── voice/           # Voice & WhatsApp
│   │   ├── billing/         # Premium & Revenue
│   │   ├── insights/        # Insights & Analytics
│   │   ├── settings/        # Settings (incl. /settings/personalisation)
│   │   ├── capture/         # Quick Capture
│   │   └── implementation/  # Phase roadmap dashboard (PIN-protected)
│   ├── (auth)/login|signup  # Auth pages
│   └── api/                 # 137 API routes (all auth-gated + rate-limited)
├── components/
│   ├── voice/               # VoiceMicButton, useVoiceInput hook
│   ├── planner/             # TodayPlanner, AddTaskModal
│   ├── protection/          # Scam Checker
│   ├── money/               # Budget, EMI, AskMoneyAI
│   ├── home/                # GreetingHero, AIFeed, RightPanel, BackgroundPicker
│   ├── navigation/          # LeftRail, BottomNav, FloatingCapturePill
│   ├── notifications/       # Notification bell, dropdown, page
│   ├── mind/                # Journal, mood, sleep, gratitude, wellbeing
│   ├── aura/                # Milestone tracker, neuroadaptive alerts
│   ├── decision/            # AI Decision Copilot
│   ├── pwa/                 # Install prompt, SW registration
│   ├── dashboard/           # Dashboard widgets
│   ├── insights/            # Analytics charts
│   └── ui/                  # Core design system (CSS variable tokens throughout)
├── data/
│   └── phases.ts            # All 28 Life OS phases — progress, functionalities, status
├── lib/
│   ├── ai/provider.ts       # AI model abstraction (supports custom baseURL)
│   ├── memory/              # context-builder.ts — sanitizes values before AI injection
│   └── security/            # prompt-guard, pii, rate-limit, account-lockout, file-upload, validators
├── proxy.ts                 # Next.js 16 edge proxy — auth gate, CSP nonce, CORS, global rate limit
└── middleware.ts.disabled   # Renamed stub — do NOT rename back (conflicts with proxy.ts)
```

## Environment Variables
- `AI_PROVIDER` — 'google' (default), 'anthropic', or 'openai'
- `GOOGLE_GEMINI_API_KEY` — Primary key (uses `gemini-flash-latest` model)
- `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` — Optional (supports custom proxies like clod.io)
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` — Optional
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — **Required in production** for distributed rate limiting and account lockout. Falls back to in-memory in dev (not safe for multi-instance).
- `DEMO_MODE` — Set to `true` only in dev/staging. **Never set in production** — bypasses auth.

## Phase Roadmap (28 Phases Total)
| # | Phase | Status | Progress |
|---|-------|--------|----------|
| 1 | Core Assistant | ✅ Complete | 100% |
| 2 | Personal Memory | ✅ Complete | 100% |
| 3 | Daily Planner | ✅ Complete | 100% |
| 4 | Focus & Productivity | ✅ Complete | 100% |
| 5 | Protection Layer | ✅ Complete | 100% |
| 6 | Money Helper | ✅ Complete | 100% |
| 7 | Family Mode (AURA) | ✅ Complete | 100% |
| 8 | Voice & WhatsApp | 🔄 In Progress | 70% |
| 9 | Premium & Revenue | 🔄 In Progress | 15% |
| 10 | Scale & Growth | 📋 Planned | 5% |
| 11 | Mental Health & Wellbeing | ✅ Complete | 100% |
| 12 | Smart Notifications | ✅ Complete | 100% |
| 13 | AI Decision Engine | ✅ Complete | 100% |
| 14 | Wearables Integration | 📋 Planned | 0% |
| 15 | Document Vault | ✅ Complete | 100% |
| 16 | Travel & Trip Planner | 🔄 In Progress | 95% |
| 17 | Career & Growth Hub | 🔄 In Progress | 90% |
| 18 | Habit Builder | ✅ Complete | 100% |
| 19 | Home & Property | 🔄 In Progress | 90% |
| 20 | Network & Relationships | 🔄 In Progress | 90% |
| 21 | Food & Nutrition | 🔄 In Progress | 95% |
| 22 | Investment Tracker | 🔄 In Progress | 90% |
| 23 | Legal & Compliance | 🔄 In Progress | 95% |
| 24 | Business Assistant | 🔄 In Progress | 95% |
| 25 | AI Proactive Coach | 🔄 In Progress | 90% |
| 26 | Offline & PWA | 🔄 In Progress | 95% |
| 27 | Social & Community | 🔄 In Progress | 90% |
| 28 | AI Personalisation Engine | 🔄 In Progress | 90% |
| 29 | Property Management | 🔄 In Progress | 15% |

> Full phase data lives in `src/data/phases.ts` — update `progress` values there to reflect latest status.
> View the live dashboard at `/implementation` (linked as "Roadmap" in the Left Rail sidebar).

## QA Personas

Seed scripts live in `tests/e2e-personas/`. All accounts use password `E2eTest123!` and the domain `@e2e-test.handlelifeos.app`.

### Personas 1–41 (global cross-section)
Cover demographics across 30+ countries. See existing seed scripts in `tests/e2e-personas/`.

### Personas 42–56 (edge-case & adversarial)
Full profiles in [`tests/e2e-personas/NEW_PERSONAS.md`](tests/e2e-personas/NEW_PERSONAS.md). Quick reference:

| # | ID | Name | Age | Country | Currency | Occupation | Key Modules | Notes |
|---|----|----|-----|---------|----------|-----------|------------|-------|
| 42 | daniel | Daniel Reyes | 34 | USA | USD | Accessibility Engineer | Vault, Career, Briefing | Blind, screen-reader-only |
| 43 | lea | Léa Bernard | 28 | France (Lyon) | EUR | Graphic Designer | Voice, Notifications, Career | Deaf since birth, LSF native |
| 44 | marcus | Marcus Bell | 31 | USA (Portland) | USD | Bartender (in recovery) | Mind, Habits, Money | Bipolar I, post-hospitalization |
| 45 | jennifer | Jennifer Park | 52 | USA (Cleveland) | USD | RN + caregiver | Family, AURA, Home, Mind | Sandwich gen, parent w/ dementia + teen |
| 46 | anna | Anna K. | 36 | Canada (undisclosed) | CAD | Bookkeeper | Vault, Protection, Money | DV survivor, account lockdown critical |
| 47 | tomas | Tomás Herrera | 29 | Egypt (Cairo) | EGP | Translator | Vault, Mind, Travel | LGBTQ+ in restrictive jurisdiction |
| 48 | bisi | Bisi Adeyinka | 33 | Nigeria (Abuja) | NGN | On mat leave / lawyer | AURA, Mind, Habits | Postpartum month 3, PPD risk |
| 49 | margaret | Margaret Sutherland | 67 | Scotland (Edinburgh) | GBP | Retired (stage IV cancer) | Vault, Legal, Mind, Network | Hospice planning, advance directive |
| 50 | connor | Connor McGrath | 39 | Ireland (Cork) | EUR | Construction PM | Mind, Habits, Community | 14 mo sober, AA member |
| 51 | reggie | Reggie Thompson | 27 | USA (Houston) | USD | Uber + DoorDash + Instacart | Money, Focus, Career | Gig-stack, hourly cashflow |
| 52 | saskia | Saskia van Doorn | 31 | Nomad (Lisbon now) | EUR/USD/THB | Remote SaaS contractor | Money, Travel, Vault, Career | Digital nomad, 3 currencies live |
| 53 | kenji_a | Kenji Allen | 24 | UK (Manchester) | GBP | QA tester | Habits, Focus, Notifications | Autistic, sensory needs, literal UI |
| 54 | aanya | Aanya Verma | 16 | India (Pune) | INR | Class 11 student | Habits, Mind, AURA-child-view | Minor — consent + parental visibility |
| 55 | viktor | Viktor Reiss | 33 | Germany (Hamburg) | EUR | "Security researcher" | All (adversarial) | Red-team persona, tries injections |
| 56 | devika | Devika Goldberg-Iyer | 41 | India (Mumbai) | INR | Architect | Family, Nutrition, Habits | Hindu-Jewish interfaith, kosher-veg, Shabbat |

### Test-Matrix Summary (Personas → Phases)

| Phase / Update | Primary personas | What gets tested |
|---|---|---|
| Phase 2 — Personal Memory | Viktor (55), Anna (46), Tomás (47) | `sanitizeMemoryValue`, "forget" pattern, no PII leakage |
| Phase 5 — Protection Layer | Anna (46), Viktor (55) | Scam checker, account lockdown, 2FA enforcement |
| Phase 7 — Family Mode / AURA | Jennifer (45), Bisi (48), Aanya (54), Devika (56) | Non-child dependents, infant milestones, child-side privacy, interfaith |
| Phase 8 — Voice & WhatsApp | Léa (43), Daniel (42) | Text fallback for deaf, screen-reader compatibility |
| Phase 11 — Mental Health | Marcus (44), Connor (50), Margaret (49), Bisi (48) | Crisis language, no toxic positivity, alcohol scrub, PPD detection |
| Phase 12 — Smart Notifications | Léa (43), Kenji (53), Devika (56) | Visual-only, predictable, sunset-relative quiet hours |
| Phase 15 — Document Vault | Anna (46), Margaret (49), Tomás (47), Saskia (52) | Privacy-critical, end-of-life, multi-jurisdiction, hostile-actor-resistant |
| Phase 16 — Travel | Tomás (47), Saskia (52) | LGBTQ+ safety overlay, 183-day counter, visa runs |
| Phase 18 — Habit Builder | Connor (50), Kenji (53), Bisi (48), Devika (56) | Sober counter, rigid routine, postpartum reset, religious rest days |
| Phase 19 — Home & Property | Jennifer (45), Margaret (49) | Concurrent recurring + emergency, aging-in-place mods |
| Phase 21 — Food & Nutrition | Devika (56), Connor (50), Bisi (48), Marcus (44) | Compound dietary filters, alcohol scrub, lactation flags |
| Phase 22 — Investments | Saskia (52), Reggie (51) | Multi-currency, gig-worker SEP-IRA |
| Phase 23 — Legal & Compliance | Margaret (49), Saskia (52), Devika (56), Anna (46) | Scottish POA, multi-jurisdiction, interfaith inheritance, protective orders |
| Phase 25 — AI Proactive Coach | Jennifer (45), Marcus (44), Bisi (48), Margaret (49) | Burnout detection, mania-safe, PPD-safe, short-horizon mode |
| Phase 26 — Offline & PWA | Reggie (51), Léa (43) | Low-signal areas, mobile-only install |
| Phase 28 — AI Personalisation | Marcus (44), Kenji (53), Tomás (47), Aanya (54), Viktor (55) | No harmful copy, literal-tone mode, opt-out integrity, child-safe, injection-proof |
| Security Hardening (May 2026) | Viktor (55) | Every bullet in the security audit section |
| Storage RLS | Viktor (55), Anna (46) | Folder-level access, cross-user attempt |
| Webhook Idempotency | Viktor (55) | Razorpay replay, dedup table |
| Edge Proxy Rate Limit | Viktor (55), Reggie (51) | 200/60, 10/hour billing, 30/min chat |

## Engineering Rules
- All API inputs validated with Zod
- **Rate limiting**: Global 200 req/60s per user on all authenticated API routes (edge proxy). Billing: 10 req/hour. Chat: 30 req/min per IP + 60 req/min per user. Upload: 20/hour.
- AI provider is swappable via `AI_PROVIDER` env
- **Edge Proxy (`src/proxy.ts`)**: In Next.js 16 + NextAuth v5, `proxy.ts` is the edge middleware. It handles auth gate, CSP nonce injection, CORS, body-size limit (1 MB), and global rate limiting. Do NOT create `src/middleware.ts` — it conflicts with `proxy.ts`. The existing `src/middleware.ts.disabled` stub must stay renamed.
- **Storage Security**: Enforce folder-level path convention `<user_id>/<file_id>` for all private buckets. RLS policies on `storage.objects` verify the first path segment matches the session UID.
- **Hydration & Suspense**: Avoid blocking `auth()` in `layout.tsx`. When `auth()` is awaited in a Server Component (e.g. `dashboard/page.tsx`), include a `loading.tsx` file in the route segment to wrap the page in `<Suspense>` and prevent Next.js 16 "Blocking Route" errors. All 29 app routes have `loading.tsx`.
- **Design System**: All UI components must use CSS variable tokens (`--color-brand-*`, `--color-danger-*`, `--color-text-*`, `--color-surface-*`, `--shadow-focus`, `--duration-fast`). Do not use hardcoded Tailwind colors (`indigo-*`, `gray-*`, `red-*`).
- **AI Prompt Security**: Memory values are sanitized via `sanitizeMemoryValue()` in `lib/memory/context-builder.ts` before injection into system prompts. All user chat input passes through `guardPrompt()` (40+ injection patterns) and `sanitizeForAI()` + PII masking before reaching the model.
- **Webhook Idempotency**: Razorpay webhook handler checks `webhook_events` table before processing. Create the table with a unique constraint on `(provider, event_id)` before deploying payment features.
- **Phase Data**: All 28 phase definitions live in `src/data/phases.ts`. Edit progress values or functionalities there — never hardcode in UI components.
- **Windows Dev**: Use `cmd /c` for terminal scripts due to PowerShell execution policies.
- **Demo Account**: `demo@lifeos.app` / `Demo1234!` — only active when `DEMO_MODE=true`. Seeding real users: set `email_verified: true` in the `users` table directly via Supabase admin.

### Sensitivity & Safety Rules (surfaced by QA Personas 42–56)
- **No alcohol/celebration prompts**: No string containing "celebrate with a drink", "wine", "toast", "cheers" in any default AI template, travel suggestion, food recipe, or community challenge. Enforce an `alcohol-free mode` user preference flag that filters all such content. (Connor #50, Marcus #44)
- **No mania-hype copy**: AI Personalisation (Phase 28) must never generate "go-getter", "you're on fire", "channel that energy" copy for a user whose profile includes a mood-stabiliser or bipolar context. (Marcus #44)
- **Postpartum & weight-loss**: Nutrition module must NEVER suggest weight loss to a user within 6 months of a birth event. (Bisi #48)
- **Terminal / short-horizon mode**: Briefing and Proactive Coach must support a `short_horizon: true` flag — disables year-ahead planning prompts, long-term goal nudges. (Margaret #49)
- **Toxic positivity guard**: Mind module copy must not contain "stay strong", "every day is a gift", "you've got this" when user context includes terminal illness or severe grief. (Margaret #49)
- **Crisis resource — no assessment questions**: When `guardPrompt()` or Mind journaling detects suicidal ideation language, surface the country-appropriate crisis line (US: 988, IE: 116 123, IN: iCall) *without* asking assessment questions. (Marcus #44)
- **Sober streak is sacred**: Habit streak resets must be user-reversible (accidental tap undo). Streak-reset UI must require two-tap confirmation. (Connor #50)

### Accessibility Rules (surfaced by QA Personas 42–56)
- **All icon-only buttons must have `aria-label`**: No `<button>` with SVG-only content anywhere in the codebase. (Daniel #42)
- **`prefers-reduced-motion` must be respected globally**: All CSS `transition` and `animation` declarations must be wrapped in `@media (prefers-reduced-motion: no-preference)` or equivalent. (Kenji #53)
- **Voice module requires text fallback**: Every voice-triggered feature must expose a text input equivalent. Do not assume audio availability. (Léa #43)
- **Notification visual analogue**: Every notification that plays a sound must also have a visible badge/indicator. Notification preferences must expose a `vibration/visual only` mode. (Léa #43)
- **Focus order & modal traps**: Modals must trap focus on open and restore to trigger element on close. Charts and data-viz must have text alternatives (`aria-label` or adjacent table). (Daniel #42)
- **Literal UI copy**: All CTAs must accurately describe their action — no idioms, no motivational jargon in default copy. (Kenji #53)

### Privacy & Legal Rules (surfaced by QA Personas 42–56)
- **Age gate (DPDP / COPPA)**: If a user self-reports age < 18, trigger a consent flow. Do not surface financial product, credit, or investment prompts to minors. AI personalities must enforce child-safety content policy for minor profiles. (Aanya #54)
- **AURA child-side privacy**: A child with their own session must be able to control which habits/journal/mood data are visible to their linked parent. Default is NOT visible. (Aanya #54)
- **DV/safety account lockdown**: The settings module must expose: force-logout all sessions, wipe device cache, change recovery contact without revealing old value, mandatory 2FA, hide profile photo, disable all social/sharing features. (Anna #46)
- **Memory "forget" reliability**: `POST /api/memory/forget` must reliably delete the vector embedding AND the raw DB row. Verify with Viktor (#55) and Anna (#46) scenarios — a missed delete is a safety defect, not a UX bug.
- **Opt-out personalisation integrity**: When a user disables AI pattern signals (Phase 28), all downstream systems (Briefing, Proactive Coach, AI chat system prompt) must receive a context-free version — not merely hide the UI toggle. (Tomás #47, Viktor #55)
- **No implicit location inference**: If a user refuses to enter their city, the system must NOT infer it from IP, timezone, or language. (Anna #46)
- **Multi-jurisdiction legal module**: Legal module must not force a single-country selection for users with ambiguous tax residency. Surface a "multiple / unsure" option. (Saskia #52)
