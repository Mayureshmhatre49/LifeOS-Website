import { streamText, createUIMessageStreamResponse, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { chatRequestSchema } from '@/lib/validators/chat'
import { AI_CONFIG } from '@/config/ai'
import { checkChatRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/validators'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimit = checkChatRateLimit(ip)

  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
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

    const recentMessages = messages.slice(-AI_CONFIG.maxMessagesInContext)

    if (isMockMode()) {
      const lastUserText = recentMessages
        .filter((m) => m.role === 'user')
        .pop()
        ?.parts.filter((p) => p.type === 'text')
        .map((p) => (p as { type: 'text'; text: string }).text)
        .join('') ?? ''

      const mockResponse = `**Mock Response** (no API key configured)\n\nYou asked: "${lastUserText.slice(0, 100)}"\n\nTo get real AI responses, add your \`ANTHROPIC_API_KEY\` or \`OPENAI_API_KEY\` to \`.env.local\`.`

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`0:"${mockResponse.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"\n`))
          controller.close()
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    const model = getAIModel()
    const modelMessages = await convertToModelMessages(
      recentMessages as Parameters<typeof convertToModelMessages>[0]
    )

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      temperature: AI_CONFIG.temperature,
    })

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[chat API]', error)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
