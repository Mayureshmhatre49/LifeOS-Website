import { streamText, createUIMessageStreamResponse, createUIMessageStream, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { getModeConfig } from '@/lib/mind/companion-prompts'
import { detectRisk } from '@/lib/mind/risk-detection'
import {
  getCompanionSession, saveCompanionMessage, flagSessionRisk,
} from '@/lib/db/companion-queries'
import { sanitizeText } from '@/lib/security/validators'
import { sanitizeForAI } from '@/lib/security/prompt-guard'
import { checkChatRateLimit, checkChatUserRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { getMindAccess } from '@/lib/mind/premium-gate'
import { findSimilarJournalEntries } from '@/lib/mind/embeddings'

export const maxDuration = 30

const bodySchema = z.object({
  session_id: z.string().uuid(),
  messages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
    })).optional(),
    content: z.string().optional(),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ipLimit = await checkChatRateLimit(ip)
  if (!ipLimit.success) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(ipLimit.remaining, ipLimit.resetIn) },
    })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userLimit = await checkChatUserRateLimit(session.user.id)
  if (!userLimit.success) {
    return new Response(JSON.stringify({ error: 'You are sending messages too fast.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(userLimit.remaining, userLimit.resetIn) },
    })
  }

  // ── Premium gate: free tier capped at 5 companion messages/day ─────────────
  const access = await getMindAccess(session.user.id)
  if (access.companion.daily_limit != null && access.companion.remaining === 0) {
    return new Response(
      JSON.stringify({
        error: `You've reached your free daily limit of ${access.companion.daily_limit} companion messages. Upgrade for unlimited.`,
        code: 'mind_companion_limit',
        plan: access.planId,
        used_today: access.companion.used_today,
        daily_limit: access.companion.daily_limit,
        upgrade_url: '/premium',
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { session_id, messages } = parsed.data

  // Verify session ownership + load mode
  if (!isSupabaseConfigured()) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 503 })
  }
  const companionSession = await getCompanionSession(session_id, session.user.id)
  if (!companionSession) {
    return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
  }
  const modeConfig = getModeConfig(companionSession.mode)
  if (!modeConfig) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 })
  }

  // Last user message text (for risk + persistence)
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const lastText = (() => {
    if (!lastUser) return ''
    if (lastUser.content) return lastUser.content
    if (lastUser.parts) {
      return lastUser.parts
        .filter(p => p.type === 'text')
        .map(p => p.text ?? '')
        .join('')
    }
    return ''
  })()

  const cleanedLastText = sanitizeText(lastText)
  const risk = detectRisk(cleanedLastText)

  // Persist the user message + risk flag
  if (cleanedLastText) {
    saveCompanionMessage({
      session_id,
      user_id: session.user.id,
      role: 'user',
      content: cleanedLastText,
      risk_level: risk.severity,
    }).catch(() => {})

    if (risk.severity === 'severe' || risk.severity === 'moderate') {
      const newFlags = Array.from(new Set([...(companionSession.risk_flags ?? []), risk.severity]))
      flagSessionRisk(session_id, session.user.id, newFlags).catch(() => {})
    }
  }

  // Build system prompt — augment with risk guidance when triggered
  let systemPrompt = modeConfig.systemPrompt
  if (risk.severity === 'severe') {
    systemPrompt += `\n\n[URGENT — RISK FLAG TRIGGERED IN USER MESSAGE]
The user just said something that could indicate self-harm or suicidal thoughts. Your response MUST:
1. Pause the normal flow.
2. Acknowledge what they shared with care, no judgment.
3. Tell them clearly: this is bigger than what I can hold alone.
4. List Indian helplines: iCall +91 9152987821 (Mon-Sat 8am-10pm), Vandrevala 1860 2662 345 (24/7), AASRA +91 9820466726 (24/7).
5. Encourage them to reach out to one trusted person they can call right now.
6. Stay warm and present. Do NOT lecture. Do NOT minimize.
Keep your response under 120 words and end with one soft question to keep the door open.`
  } else if (risk.severity === 'moderate') {
    systemPrompt += `\n\n[NOTE: User shared something heavy. Validate carefully. Suggest professional support gently if it feels right. Stay grounded and warm.]`
  }

  // ── RAG: pull semantically similar past journal entries ─────────────────────
  // Companion can recall "the last time you felt this way" without the user having to remind it.
  if (cleanedLastText && cleanedLastText.length >= 15) {
    try {
      const matches = await findSimilarJournalEntries(session.user.id, cleanedLastText, 3)
      if (matches.length > 0) {
        const ragSnippets = matches.map(m => {
          const date = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const moodEmoji = m.mood ? ['😔','😐','🙂','😊','🤩'][m.mood - 1] : ''
          return `- [${date} ${moodEmoji}] "${m.content.slice(0, 240).replace(/\s+/g, ' ').trim()}${m.content.length > 240 ? '…' : ''}"`
        }).join('\n')
        systemPrompt += `

[USER'S RECENT JOURNAL ENTRIES — semantically related to what they just said. Reference these naturally if useful. DO NOT quote them verbatim; instead reflect insight (e.g., "I remember last week you mentioned…").]
${ragSnippets}`
      }
    } catch {
      // RAG is best-effort; don't break the response
    }
  }

  // Mock mode
  if (isMockMode()) {
    const textId = crypto.randomUUID()
    const stream = createUIMessageStream({
      execute({ writer }) {
        writer.write({ type: 'text-start', id: textId })
        const mockReply = `**Demo mode** — no AI key configured. In real mode, ${modeConfig.title} would respond here. Add \`GOOGLE_GEMINI_API_KEY\` (or \`ANTHROPIC_API_KEY\`) to \`.env.local\` to enable real responses.`
        writer.write({ type: 'text-delta', delta: mockReply, id: textId })
        writer.write({ type: 'text-end', id: textId })
      },
    })
    saveCompanionMessage({
      session_id, user_id: session.user.id, role: 'assistant', content: '[mock response]',
    }).catch(() => {})
    return createUIMessageStreamResponse({ stream })
  }

  // Sanitize messages for the model
  const sanitized = messages.map(m => ({
    ...m,
    parts: m.parts?.map(p => p.type === 'text'
      ? { ...p, text: sanitizeForAI(sanitizeText(p.text ?? '')) }
      : p
    ),
  }))

  const model = getAIModel()
  // ai-sdk v6 expects UIMessage[] for convertToModelMessages
  const modelMessages = await convertToModelMessages(
    sanitized as Parameters<typeof convertToModelMessages>[0]
  )

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    maxOutputTokens: 600,
    temperature: 0.7,
  })

  // Persist the assistant reply once streaming completes (fire-and-forget)
  ;(async () => {
    try {
      const assistantText = await result.text
      if (assistantText) {
        await saveCompanionMessage({
          session_id,
          user_id: session.user.id,
          role: 'assistant',
          content: assistantText,
        })
      }
    } catch {
      // best-effort persistence; don't break the stream response
    }
  })()

  return createUIMessageStreamResponse({ stream: result.toUIMessageStream() })
}
