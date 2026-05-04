import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { checkChatRateLimit } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/validators'
import { sanitizePromptForAI } from '@/lib/security/pii'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getLanguagePromptSnippet } from '@/lib/i18n/language'
import { trackAiMetrics } from '@/lib/observability/telemetry'

const schema = z.object({
  message: z.string().min(1).max(2000).transform(sanitizeText),
  conversationId: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(500),
      })
    )
    .max(10)
    .optional(),
})

const VOICE_PROMPT = `${SYSTEM_PROMPT}

## Voice Mode
You are responding to a voice request. Keep your answer concise and conversational — ideally under 3 sentences for simple questions, or a short paragraph for complex ones. Avoid bullet points, markdown headers, and code blocks since the response will be read aloud. Use natural spoken language. For Indian users, you may mix Hindi words naturally if the user spoke Hindi.`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimit = await checkChatRateLimit(ip)

  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Apply PII masking before sending to AI
  const userMessage = sanitizePromptForAI(parsed.data.message)
  const clientHistory = parsed.data.history ?? []

  if (isMockMode()) {
    return NextResponse.json({
      text: `Demo mode — no AI key set. You said: "${userMessage.slice(0, 80)}". Add ANTHROPIC_API_KEY to your environment to enable real responses.`,
      conversationId: parsed.data.conversationId ?? crypto.randomUUID(),
    })
  }

  let systemPrompt = VOICE_PROMPT
  if (isSupabaseConfigured()) {
    const session = await auth()
    if (session?.user?.id) {
      const [memCtx, langSnippet] = await Promise.all([
        buildMemoryContext(session.user.id),
        getLanguagePromptSnippet(session.user.id),
      ])
      const memSnippet = formatMemoryForPrompt(memCtx)
      systemPrompt = VOICE_PROMPT + langSnippet + (memSnippet ?? '')
    }
  }

  const model = getAIModel()
  const startTime = Date.now()

  try {
    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        ...clientHistory,
        { role: 'user', content: userMessage },
      ],
      maxOutputTokens: 400,
      temperature: 0.7,
    })

    trackAiMetrics({
      provider: model.provider,
      model: model.modelId,
      durationMs: Date.now() - startTime,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      success: true,
      path: '/api/voice/respond',
    })

    return NextResponse.json({
      text: result.text,
      conversationId: parsed.data.conversationId ?? crypto.randomUUID(),
    })
  } catch (err) {
    trackAiMetrics({
      provider: model.provider,
      model: model.modelId,
      durationMs: Date.now() - startTime,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown',
      path: '/api/voice/respond',
    })
    return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 500 })
  }
}
