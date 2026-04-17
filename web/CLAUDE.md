# Life OS — Developer Guide

## Project
AI-powered personal assistant platform. Built with Next.js 16, TypeScript, Tailwind v4, AI SDK v6, NextAuth v5, Supabase. Currently in **Phase 1: Core Assistant**.

## Quick Start
```bash
# 1. Copy and fill env vars
cp .env.local.example .env.local
# Add ANTHROPIC_API_KEY (or OPENAI_API_KEY) at minimum

# 2. Run dev server
npm run dev   # http://localhost:3000

# Works in mock mode with no API keys — shows placeholder responses
```

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
│   ├── (app)/chat/          # Chat app pages (requires no auth for guest)
│   ├── (auth)/login|signup  # Auth pages
│   ├── api/chat/            # Streaming AI route (rate-limited)
│   ├── api/conversations/   # Conversation CRUD
│   ├── api/auth/            # NextAuth + signup
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Button, Input, Badge, Avatar, Label, Separator
│   ├── layout/              # Header, Sidebar
│   ├── chat/                # ChatInterface, ChatMessage, ChatInput, WelcomeScreen
│   └── shared/              # Logo
├── config/
│   ├── ai.ts                # Model config, max tokens
│   ├── categories.ts        # 8 prompt categories
│   └── site.ts              # SEO metadata
├── lib/
│   ├── ai/provider.ts       # AI model abstraction (Anthropic/OpenAI/mock)
│   ├── ai/prompts.ts        # System prompts
│   ├── db/client.ts         # Supabase client
│   ├── db/queries.ts        # DB query helpers
│   ├── security/rate-limit.ts  # In-memory rate limiter
│   ├── security/validators.ts  # Zod schemas
│   └── seo/metadata.ts      # generatePageMeta helper
├── types/index.ts           # Shared TypeScript types
├── auth.ts                  # NextAuth v5 config (root level)
└── middleware.ts            # Route protection + CORS
```

## Environment Variables
See `.env.local.example` for full list. Minimum required:
- `NEXTAUTH_SECRET` — any random string
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` — for real AI responses

Optional:
- `GOOGLE_CLIENT_ID/SECRET` — Google OAuth
- `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` — chat persistence

## Database Setup (Supabase)
1. Create project at app.supabase.com
2. Run `supabase/schema.sql` in SQL editor
3. Add Supabase env vars to `.env.local`

## AI SDK v6 Notes (important)
- `useChat()` from `@ai-sdk/react` — no `api` option needed, defaults to `/api/chat`
- `sendMessage({ text })` — not `handleSubmit`
- Messages have `parts[]` array; text is in `{ type: 'text', text: string }` parts
- `convertToModelMessages()` is async — must `await`
- `maxTokens` → `maxOutputTokens`
- Response: `createUIMessageStreamResponse({ stream: result.toUIMessageStream() })`

## Phase Roadmap
1. **[Current]** Core Assistant — AI chat + auth + categories
2. Personal Memory — remember user context/preferences
3. Daily Planner — tasks, reminders, routines
4. Focus & Productivity — timers, body doubling
5. Protection Layer — scam/fraud detection
6. Money Helper — EMI, budget, expense tracking
7. Family Mode — shared tasks, multi-user households
8. Voice & WhatsApp — accessibility channels
9. Premium & Revenue — subscription tiers, priority access
10. Scale & Growth — regional languages, enterprise API

## Engineering Rules
- All API inputs validated with Zod
- Rate limit: 30 chat req/min per IP, 5 auth req/15min
- No secrets in frontend code
- AI provider is swappable via `AI_PROVIDER` env
- `isMockMode()` → true when no API keys set (safe for demo)
- Security headers set in `next.config.ts`
