import { streamText, createUIMessageStreamResponse, createUIMessageStream, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { chatRequestSchema } from '@/lib/validators/chat'
import { AI_CONFIG } from '@/config/ai'
import { checkChatRateLimit, checkChatUserRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/validators'
import { guardPrompt, sanitizeForAI } from '@/lib/security/prompt-guard'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { extractMemoryCandidates } from '@/lib/memory/extractMemory'
import { saveMemoryCandidates } from '@/lib/memory/saveMemory'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAiQuota, incrementAiUsage } from '@/lib/billing/quota'
import { getLanguagePromptSnippet } from '@/lib/i18n/language'
import { sanitizePromptForAI } from '@/lib/security/pii'
import { trackAiMetrics } from '@/lib/observability/telemetry'
import { writeSecurityEvent } from '@/lib/security/audit-log'
import { getPersonalisationContext } from '@/lib/personalisation/context'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  // ── IP-level rate limit ──────────────────────────────────────────────────────
  const ipLimit = await checkChatRateLimit(ip)
  if (!ipLimit.success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders(ipLimit.remaining, ipLimit.resetIn),
        },
      }
    )
  }

  try {
    const body = await req.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const messages = parsed.data.messages.map((m) => ({
      ...m,
      parts: m.parts.map((p) => {
        if (p.type === 'text') {
          return { ...p, text: sanitizeText((p as { type: 'text'; text: string }).text) }
        }
        return p
      }),
    }))

    // ── Prompt injection guard ────────────────────────────────────────────────
    const lastUserText = messages
      .filter((m) => m.role === 'user')
      .pop()
      ?.parts.filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('') ?? ''

    const guardResult = guardPrompt(lastUserText)
    if (!guardResult.allowed) {
      writeSecurityEvent({
        type: guardResult.reason === 'prompt_injection' ? 'prompt_injection' : 'unusual_activity',
        severity: guardResult.reason === 'prompt_injection' ? 'warning' : 'info',
        details: { reason: guardResult.reason, inputSnippet: lastUserText.slice(0, 200) },
        ip_address: ip,
      })
      return new Response(
        JSON.stringify({ error: guardResult.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Apply AI sanitization + PII masking to anonymize sensitive data
    const sanitizedMessages = messages.map((m) => ({
      ...m,
      parts: m.parts.map((p) => {
        if (p.type === 'text') {
          const text = (p as { type: 'text'; text: string }).text
          return { ...p, text: sanitizePromptForAI(sanitizeForAI(text)) }
        }
        return p
      }),
    }))

    const recentMessages = sanitizedMessages.slice(-AI_CONFIG.maxMessagesInContext)

    // ── Session + per-user checks ─────────────────────────────────────────────
    let systemPrompt = SYSTEM_PROMPT
    const session = await auth()

    if (isSupabaseConfigured() && session?.user?.id) {
      const userId = session.user.id

      // Per-user rate limit (higher ceiling for authenticated users)
      const userLimit = await checkChatUserRateLimit(userId)
      if (!userLimit.success) {
        return new Response(
          JSON.stringify({ error: 'You are sending messages too fast. Please wait a moment.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...rateLimitHeaders(userLimit.remaining, userLimit.resetIn),
            },
          }
        )
      }

      // Quota enforcement
      const { allowed, quota } = await checkAiQuota(userId)
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: 'Monthly AI limit reached',
            quota,
            upgradeUrl: '/billing/plans',
          }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const [memCtx, langSnippet, personalisation] = await Promise.all([
        buildMemoryContext(userId),
        getLanguagePromptSnippet(userId),
        getPersonalisationContext(userId),
      ])
      const memSnippet = formatMemoryForPrompt(memCtx)
      systemPrompt = SYSTEM_PROMPT
        + langSnippet
        + (memSnippet ?? '')
        + '\n\n' + personalisation.systemFragment
    }

    if (isMockMode()) {
      const mockResponse = `**Demo mode** — no AI key configured yet.\n\nYou asked: *"${lastUserText.slice(0, 120)}"*\n\nTo enable real responses, add your \`ANTHROPIC_API_KEY\` (or \`OPENAI_API_KEY\`) to \`.env.local\` and restart the server.`

      const textId = crypto.randomUUID()
      const stream = createUIMessageStream({
        execute({ writer }) {
          writer.write({ type: 'text-start', id: textId })
          writer.write({ type: 'text-delta', delta: mockResponse, id: textId })
          writer.write({ type: 'text-end', id: textId })
        },
      })
      return createUIMessageStreamResponse({ stream })
    }

    const model = getAIModel()
    const modelMessages = await convertToModelMessages(
      recentMessages as Parameters<typeof convertToModelMessages>[0]
    )

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      temperature: AI_CONFIG.temperature,
      onFinish: (finishResult) => {
        trackAiMetrics({
          provider: model.provider,
          model: model.modelId,
          durationMs: Date.now() - startTime,
          inputTokens: finishResult.usage.inputTokens,
          outputTokens: finishResult.usage.outputTokens,
          success: true,
          path: '/api/chat',
        })
        if (session?.user?.id) {
          incrementAiUsage(session.user.id).catch(() => {})
          // Extract and persist meaningful facts from the user message (fire-and-forget)
          if (isSupabaseConfigured() && lastUserText.length >= 25) {
            const candidates = extractMemoryCandidates(lastUserText)
            if (candidates.length) {
              saveMemoryCandidates(session.user.id, candidates).catch(() => {})
            }
          }
        }
      },
    })

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[chat API]', error)
    
    trackAiMetrics({
      provider: 'unknown',
      model: 'unknown',
      durationMs: Date.now() - startTime,
      success: false,
      error: message,
      path: '/api/chat',
    })

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
