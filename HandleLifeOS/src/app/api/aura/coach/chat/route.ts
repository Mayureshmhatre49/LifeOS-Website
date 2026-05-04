import { streamText, createUIMessageStreamResponse, createUIMessageStream, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { getCoachModeConfig } from '@/lib/aura/coach-prompts'
import { getCoachSession, saveCoachMessage } from '@/lib/db/aura-coach-queries'
import { getAuraProfiles } from '@/lib/db/aura-queries'
import { getAgeDisplay } from '@/lib/aura-logic'
import { sanitizeText } from '@/lib/security/validators'
import { sanitizeForAI } from '@/lib/security/prompt-guard'
import { checkChatRateLimit, checkChatUserRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'

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

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { session_id, messages } = parsed.data

  if (!isSupabaseConfigured()) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 503 })
  }
  const coachSession = await getCoachSession(session_id, session.user.id)
  if (!coachSession) {
    return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
  }
  const modeConfig = getCoachModeConfig(coachSession.mode)
  if (!modeConfig) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 })
  }

  // Build child context if session is linked to a child
  let childContext = ''
  if (coachSession.child_id) {
    try {
      const profiles = await getAuraProfiles(session.user.id)
      const child = profiles.find(p => p.id === coachSession.child_id)
      if (child) {
        const conditions: string[] = []
        if (child.neurodivergence?.adhd) conditions.push('ADHD' + (child.neurodivergence.adhd_type ? ` (${child.neurodivergence.adhd_type.replace('_', '-')})` : ''))
        if (child.neurodivergence?.asd) conditions.push('Autism' + (child.neurodivergence.asd_support_level ? ` (Level ${child.neurodivergence.asd_support_level})` : ''))
        if (child.physical_disabilities?.conditions.length) conditions.push(...child.physical_disabilities.conditions)
        if (child.genetic_conditions?.conditions.length) conditions.push(...child.genetic_conditions.conditions)

        childContext = `\n\n[CHILD CONTEXT — for your reference, not to be repeated back unless relevant]
- Age: ${getAgeDisplay(child.date_of_birth)}
- Conditions on record: ${conditions.length ? conditions.join(', ') : 'none documented'}
- IEP/504 status: ${child.education_plan?.plan_type ?? 'none'}
- Active therapies: ${child.therapies.length} on record
- Medications: ${child.medications.length} on record`
      }
    } catch {
      // child context is best-effort
    }
  }

  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const lastText = (() => {
    if (!lastUser) return ''
    if (lastUser.content) return lastUser.content
    if (lastUser.parts) {
      return lastUser.parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
    }
    return ''
  })()

  const cleanedLastText = sanitizeText(lastText)

  if (cleanedLastText) {
    saveCoachMessage({
      session_id, user_id: session.user.id,
      role: 'user', content: cleanedLastText,
    }).catch(() => {})
  }

  const systemPrompt = modeConfig.systemPrompt + childContext

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
    saveCoachMessage({
      session_id, user_id: session.user.id, role: 'assistant', content: '[mock response]',
    }).catch(() => {})
    return createUIMessageStreamResponse({ stream })
  }

  const sanitized = messages.map(m => ({
    ...m,
    parts: m.parts?.map(p => p.type === 'text'
      ? { ...p, text: sanitizeForAI(sanitizeText(p.text ?? '')) }
      : p,
    ),
  }))

  const model = getAIModel()
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

  ;(async () => {
    try {
      const text = await result.text
      if (text) {
        await saveCoachMessage({
          session_id, user_id: session.user.id,
          role: 'assistant', content: text,
        })
      }
    } catch {}
  })()

  return createUIMessageStreamResponse({ stream: result.toUIMessageStream() })
}
