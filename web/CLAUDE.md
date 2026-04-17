# Life OS — Developer Guide

## Project Overview
AI-powered personal assistant for everyday life decisions. Built with Next.js 14, TypeScript, Tailwind CSS. Follow the 10-phase roadmap. Currently in **Phase 1: Core Assistant**.

## Commands
```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Architecture
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — UI components (chat/, layout/, ui/, shared/)
- `src/lib/ai/` — AI provider abstraction (Anthropic/OpenAI switchable via `AI_PROVIDER` env)
- `src/lib/validators/` — Zod schemas for all API inputs
- `src/services/` — Business logic per domain (chat, memory, user)
- `src/config/` — App-wide constants and configuration

## Key Files
- `src/app/api/chat/route.ts` — Chat streaming API
- `src/lib/ai/provider.ts` — AI model abstraction (swap provider without changing app code)
- `src/config/ai.ts` — AI config: model names, system prompt, limits
- `src/lib/validators/chat.ts` — Zod validation for chat requests

## Environment Setup
Copy `.env.local.example` → `.env.local` and fill in:
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- `AI_PROVIDER=anthropic` (default)

## Engineering Rules (from NFR Prompt.docx)
- Validate all inputs server-side with Zod
- No secrets in code — use env vars only
- Mobile-first, accessible UI
- AI provider abstraction layer — never hardwire to one provider
- Keep API responses under 500ms (excluding AI latency)
- OWASP Top 10 protections by default

## Phase Roadmap
1. **[Current]** Core Assistant — AI chat
2. Personal Memory — remember user preferences
3. Daily Planner — tasks, reminders, routines
4. Focus & Productivity — timers, body doubling
5. Protection Layer — scam/fraud detection
6. Money Helper — EMI, budget, expenses
7. Family Mode — shared tasks, family accounts
8. Voice & WhatsApp — accessibility
9. Premium & Revenue — subscription tiers
10. Scale & Growth — regional languages, enterprise
