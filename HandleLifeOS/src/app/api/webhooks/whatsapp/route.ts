import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import {
  sendWhatsAppMessage,
  validateTwilioSignature,
  isTwilioConfigured,
} from '@/lib/whatsapp/client'
import { formatForWhatsApp, parseWhatsAppNumber } from '@/lib/whatsapp/formatter'
import {
  findSessionByPhone,
  getRecentMessages,
  saveMessage,
} from '@/lib/db/whatsapp-queries'
import { sanitizeText } from '@/lib/security/validators'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import type { TwilioWebhookPayload } from '@/types/whatsapp'

export const maxDuration = 30

const WHATSAPP_SYSTEM = `${SYSTEM_PROMPT}

## WhatsApp Channel
You are responding via WhatsApp. Keep responses concise and conversational — 2-4 short paragraphs max. Use plain text with minimal formatting. WhatsApp supports *bold*, _italic_, and \`monospace\`. Avoid long bullet lists; use brief numbered points only when truly needed.`

const UNLINKED_REPLY = `👋 Hello! I'm Life OS, your personal AI assistant.

To use me, please link your WhatsApp number to your Life OS account:
1. Open Life OS on the web
2. Go to Settings → WhatsApp
3. Enter this phone number to link it

Once linked, I'll remember your context and help with planning, money, scam checks, and more!`

export async function POST(req: NextRequest) {
  if (!isTwilioConfigured()) {
    return new NextResponse('Twilio not configured', { status: 503 })
  }

  // Parse form body (Twilio sends application/x-www-form-urlencoded)
  const formData = await req.formData()
  const payload: TwilioWebhookPayload = {
    AccountSid: String(formData.get('AccountSid') ?? ''),
    MessageSid: String(formData.get('MessageSid') ?? ''),
    From: String(formData.get('From') ?? ''),
    To: String(formData.get('To') ?? ''),
    Body: String(formData.get('Body') ?? ''),
    NumMedia: String(formData.get('NumMedia') ?? '0'),
    ProfileName: formData.get('ProfileName')?.toString(),
    WaId: formData.get('WaId')?.toString(),
  }

  // Validate Twilio signature whenever TWILIO_AUTH_TOKEN is set.
  // In production without the token, reject all requests (fail-closed).
  const hasTwilioToken = Boolean(process.env.TWILIO_AUTH_TOKEN)
  if (hasTwilioToken) {
    const signature = req.headers.get('x-twilio-signature') ?? ''
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`
    const params = Object.fromEntries(formData.entries()) as Record<string, string>
    const isValid = await validateTwilioSignature(signature, url, params)
    if (!isValid) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.error('[WhatsApp] TWILIO_AUTH_TOKEN not set in production — rejecting webhook')
    return new NextResponse('Webhook misconfigured', { status: 503 })
  }

  const phoneNumber = parseWhatsAppNumber(payload.From)
  const userText = sanitizeText(payload.Body ?? '')

  if (!userText) {
    return new NextResponse('', { status: 200 })
  }

  // Look up the linked Life OS account
  const session = isSupabaseConfigured() ? await findSessionByPhone(phoneNumber) : null

  if (!session) {
    await sendWhatsAppMessage(phoneNumber, UNLINKED_REPLY)
    return new NextResponse('', { status: 200 })
  }

  // Build conversation history for context
  const history = await getRecentMessages(session.id, 10)
  const historyMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Build system prompt with memory
  let systemPrompt = WHATSAPP_SYSTEM
  if (isSupabaseConfigured() && session.userId) {
    const memCtx = await buildMemoryContext(session.userId)
    const snippet = formatMemoryForPrompt(memCtx)
    if (snippet) systemPrompt = WHATSAPP_SYSTEM + snippet
  }

  let replyText: string

  if (isMockMode()) {
    replyText = `Demo mode — no AI key set. You said: "${userText.slice(0, 80)}". Add ANTHROPIC_API_KEY to enable real responses.`
  } else {
    const model = getAIModel()
    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        ...historyMessages,
        { role: 'user', content: userText },
      ],
      maxOutputTokens: 500,
      temperature: 0.7,
    })
    replyText = result.text
  }

  // Save messages to history
  await saveMessage(session.id, 'user', userText)
  await saveMessage(session.id, 'assistant', replyText)

  // Send reply (split if over WhatsApp limit)
  const chunks = formatForWhatsApp(replyText)
  for (const chunk of chunks) {
    await sendWhatsAppMessage(phoneNumber, chunk)
  }

  return new NextResponse('', { status: 200 })
}
