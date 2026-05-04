import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import {
  sendMetaTextMessage,
  markMessageRead,
  parseMetaWebhook,
  verifyMetaWebhook,
  isMetaConfigured,
} from '@/lib/whatsapp/meta-client'
import { formatForWhatsApp } from '@/lib/whatsapp/formatter'
import {
  findSessionByPhone,
  getRecentMessages,
  saveMessage,
} from '@/lib/db/whatsapp-queries'
import { sanitizeText } from '@/lib/security/validators'
import { sanitizePromptForAI } from '@/lib/security/pii'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAiQuota } from '@/lib/billing/quota'
import { trackAiMetrics } from '@/lib/observability/telemetry'
import { detectIntent } from '@/lib/whatsapp/intent-router'
import {
  buildWelcomeMenu,
  buildUnlinkedMessage,
  buildQuotaExceededMessage,
  buildErrorMessage,
  parseEmiFromText,
  calculateEmi,
  buildEmiResponse,
} from '@/lib/whatsapp/quick-replies'

export const maxDuration = 45

const WHATSAPP_SYSTEM = `${SYSTEM_PROMPT}

## WhatsApp Channel Rules
You are responding via WhatsApp to an Indian user. Keep responses concise — max 3 short paragraphs.
Use WhatsApp formatting: *bold*, _italic_. Use • for bullet points. Avoid markdown headers.
Be warm, practical, and direct. Mix in Hinglish naturally if the user writes in Hindi.`

// ── GET — Meta webhook verification challenge ────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const result = verifyMetaWebhook(mode, token, challenge)
  if (result.valid) {
    return new NextResponse(result.challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// ── POST — Incoming messages from Meta ──────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isMetaConfigured()) {
    return NextResponse.json({ error: 'Meta WhatsApp not configured' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Parse the message from Meta's payload
  const msg = parseMetaWebhook(body)
  if (!msg) {
    // Delivery receipts or status updates — acknowledge and ignore
    return new NextResponse('', { status: 200 })
  }

  // Mark as read immediately (shows blue ticks)
  markMessageRead(msg.messageId)

  // Normalize phone: Meta sends without '+', we store with '+'
  const phoneNumber = `+${msg.from}`
  const userText = sanitizeText(msg.text ?? '')

  if (!userText) return new NextResponse('', { status: 200 })

  // ── Account Linking Check ────────────────────────────────────────────────
  const session = isSupabaseConfigured() ? await findSessionByPhone(phoneNumber) : null

  if (!session) {
    await sendMetaTextMessage(phoneNumber, buildUnlinkedMessage())
    return new NextResponse('', { status: 200 })
  }

  // ── Greeting / Menu intent ───────────────────────────────────────────────
  const intent = detectIntent(userText)

  if (intent === 'greeting' || intent === 'menu' || intent === 'help') {
    const firstName = msg.profileName?.split(' ')[0] ?? session.displayName?.split(' ')[0]
    await sendMetaTextMessage(phoneNumber, buildWelcomeMenu(firstName))
    return new NextResponse('', { status: 200 })
  }

  // ── Quick EMI Calculation (no AI needed) ─────────────────────────────────
  if (intent === 'emi') {
    const params = parseEmiFromText(userText)
    if (params?.amount && params?.rate && params?.tenureMonths) {
      const result = calculateEmi(params.amount, params.rate, params.tenureMonths)
      const reply = buildEmiResponse({
        loanAmount: params.amount,
        interestRate: params.rate,
        tenureMonths: params.tenureMonths,
        ...result,
      })
      await saveMessage(session.id, 'user', userText)
      await saveMessage(session.id, 'assistant', reply)
      await sendMetaTextMessage(phoneNumber, reply)
      return new NextResponse('', { status: 200 })
    }
    // Partial EMI info → fall through to AI for clarification
  }

  // ── AI Quota Check ───────────────────────────────────────────────────────
  if (isSupabaseConfigured() && session.userId) {
    const { allowed } = await checkAiQuota(session.userId)
    if (!allowed) {
      await sendMetaTextMessage(phoneNumber, buildQuotaExceededMessage())
      return new NextResponse('', { status: 200 })
    }
  }

  // ── AI Response ──────────────────────────────────────────────────────────
  const history = await getRecentMessages(session.id, 8)
  const historyMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Build system prompt enriched with memory
  let systemPrompt = WHATSAPP_SYSTEM
  if (isSupabaseConfigured() && session.userId) {
    const memCtx = await buildMemoryContext(session.userId)
    const snippet = formatMemoryForPrompt(memCtx)
    if (snippet) systemPrompt = WHATSAPP_SYSTEM + snippet
  }

  // Apply PII masking before sending to AI
  const safeText = sanitizePromptForAI(userText)

  let replyText: string
  const startTime = Date.now()

  try {
    if (isMockMode()) {
      replyText = `Demo mode — AI key not configured. You said: "${safeText.slice(0, 80)}". Add ANTHROPIC_API_KEY to enable real responses.`
    } else {
      const model = getAIModel()
      const result = await generateText({
        model,
        system: systemPrompt,
        messages: [
          ...historyMessages,
          { role: 'user', content: safeText },
        ],
        maxOutputTokens: 600,
        temperature: 0.7,
      })
      replyText = result.text

      trackAiMetrics({
        provider: model.provider,
        model: model.modelId,
        durationMs: Date.now() - startTime,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        success: true,
        path: '/api/webhooks/whatsapp/meta',
      })
    }
  } catch (err) {
    console.error('[Meta WA webhook]', err)
    trackAiMetrics({
      provider: 'unknown',
      model: 'unknown',
      durationMs: Date.now() - startTime,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      path: '/api/webhooks/whatsapp/meta',
    })
    await sendMetaTextMessage(phoneNumber, buildErrorMessage())
    return new NextResponse('', { status: 200 })
  }

  // Save and send
  await saveMessage(session.id, 'user', userText)
  await saveMessage(session.id, 'assistant', replyText)

  const chunks = formatForWhatsApp(replyText)
  for (const chunk of chunks) {
    await sendMetaTextMessage(phoneNumber, chunk)
  }

  return new NextResponse('', { status: 200 })
}
