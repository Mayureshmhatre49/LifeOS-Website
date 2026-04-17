import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { getAIModel } from '@/lib/ai/provider'
import { chatRequestSchema } from '@/lib/validators/chat'
import { AI_CONFIG } from '@/config/ai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const model = getAIModel()

    const result = streamText({
      model,
      system: AI_CONFIG.systemPrompt,
      messages: parsed.data.messages,
      maxTokens: AI_CONFIG.maxTokens,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
