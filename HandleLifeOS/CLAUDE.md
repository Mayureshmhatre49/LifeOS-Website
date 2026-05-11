# Life OS — Developer Guide

## Project
AI-powered personal assistant platform. Built with Next.js 16, TypeScript, Tailwind v4, AI SDK v6, NextAuth v5, Supabase. **Phases 1–7, 11–13, 15, 18 are fully complete.** Phases 16–17, 19–28 are actively in progress (most at 90–95%).

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
│   │   ├── home/            # Home & Property
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

> Full phase data lives in `src/data/phases.ts` — update `progress` values there to reflect latest status.
> View the live dashboard at `/implementation` (linked as "Roadmap" in the Left Rail sidebar).

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
