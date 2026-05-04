# Life OS — Developer Guide

## Project
AI-powered personal assistant platform. Built with Next.js 16, TypeScript, Tailwind v4, AI SDK v6, NextAuth v5, Supabase. Currently in **Phase 26: Offline & PWA** (in-progress). Phases 1-7, 11, and 13 are fully complete.

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

## Recent Major Updates (April 2026)
- **Storage Security (RLS)**: Locked down Supabase storage buckets (`vault-documents`, `aura-documents`) with folder-level RLS. Access is strictly enforced so users can only access files in their own `<user_id>/` folder.
- **AURA (Child Dev Hub)**: Fully implemented professional-grade paediatric tracking with CDC/AAP milestones, neuroadaptive alerts (ASD/Down Syndrome), and AI guidance.
- **Mental Health & Wellbeing (Phase 11)**: Shipped full DB-backed journaling, mood tracking, sleep logs, and wellbeing score analytics.
- **AI Decision Engine (Phase 13)**: Shipped AI Decision Copilot with pros/cons analysis, comparison mode, and persistence.
- **Roadmap Security**: Protected the Implementation Dashboard with a secondary **RoadmapLockGate** (PIN: 0000) for privacy.
- **Massive Schema Expansion**: Executed master migration for **Phases 15-25**, adding schemas for Document Vault, Personal CRM, Career Hub, Trip Planner, Investment Tracker, and Home Management.
- **PWA Ready**: Enabled Progressive Web App support via `next-pwa` (Phase 26).
- **Implementation Dashboard**: Built `/implementation` — a live roadmap dashboard tracking all 28 phases. Accessible via "Roadmap" in the Left Rail. PIN-protected for security.

## Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check only
```

## Project Structure
```
src/
├── app/
│   ├── (app)/chat/              # Chat app pages
│   ├── (app)/dashboard/         # Main dashboard (GreetingHero + RightPanel + InputBar)
│   ├── (app)/implementation/    # Phase roadmap tracking dashboard (/implementation)
│   ├── (auth)/login|signup      # Auth pages
│   ├── api/chat/                # Streaming AI route
│   └── ...
├── components/
│   ├── voice/                   # VoiceMicButton, useVoiceInput hook
│   ├── planner/                 # TodayPlanner, AddTaskModal (Voice enabled)
│   ├── protection/              # Scam Checker (Voice enabled)
│   ├── money/                   # Budget, EMI, AskMoneyAI (Voice enabled)
│   ├── home/                    # GreetingHero, AIFeed, RightPanel, BackgroundPicker, HomeFeed
│   ├── navigation/              # LeftRail, BottomNav, FloatingCapturePill
│   └── ui/                  # Core design system
├── data/
│   └── phases.ts                # All 28 Life OS phases — progress, functionalities, status
├── lib/
│   ├── ai/provider.ts       # AI model abstraction (supports custom baseURL)
│   └── ...
```

## Environment Variables
- `AI_PROVIDER` — 'google' (default), 'anthropic', or 'openai'
- `GOOGLE_GEMINI_API_KEY` — Primary key (uses `gemini-flash-latest` model)
- `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` — Optional (supports custom proxies like clod.io)
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` — Optional

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
| 12 | Smart Notifications | 📋 Planned | 0% |
| 13 | AI Decision Engine | ✅ Complete | 100% |
| 14 | Wearables Integration | 📋 Planned | 0% |
| 15 | Document Vault | ✅ Complete | 100% |
| 16 | Travel & Trip Planner | 🔄 In Progress | 10% |
| 17 | Career & Growth Hub | 🔄 In Progress | 10% |
| 18 | Habit Builder | 📋 Planned | 0% |
| 19 | Home & Property | 🔄 In Progress | 10% |
| 20 | Network & Relationships | 🔄 In Progress | 10% |
| 21 | Food & Nutrition | 📋 Planned | 0% |
| 22 | Investment Tracker | 🔄 In Progress | 10% |
| 23 | Legal & Compliance | 📋 Planned | 0% |
| 24 | Business Assistant | 📋 Planned | 0% |
| 25 | AI Proactive Coach | 🔄 In Progress | 10% |
| 26 | **[Current] Offline & PWA** | 🔄 In Progress | 50% |
| 27 | Social & Community | 📋 Planned | 0% |
| 28 | AI Personalisation Engine | 📋 Planned | 0% |

> Full phase data lives in `src/data/phases.ts` — update `progress` values there to reflect latest status.
> View the live dashboard at `/implementation` (linked as "Roadmap" in the Left Rail sidebar).

## Engineering Rules
- All API inputs validated with Zod
- Rate limit: 30 chat req/min per IP
- AI provider is swappable via `AI_PROVIDER` env
- **Storage Security**: Enforce folder-level path convention `<user_id>/<file_id>` for all private buckets. RLS policies on `storage.objects` verify the first path segment matches the session UID.
- **Hydration & Suspense**: Avoid blocking `auth()` in `layout.tsx`. When `auth()` is awaited in a Server Component (e.g. `dashboard/page.tsx`), include a `loading.tsx` file in the route segment to wrap the page in `<Suspense>` and prevent Next.js 16 "Blocking Route" errors.
- **Phase Data**: All 28 phase definitions live in `src/data/phases.ts`. Edit progress values or functionalities there — never hardcode in UI components.
- **Windows Dev**: Use `cmd /c` for terminal scripts due to PowerShell execution policies.
