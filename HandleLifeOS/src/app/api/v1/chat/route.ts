/**
 * Life OS Public API v1 — Chat endpoint
 * Auth: Authorization: Bearer lok_live_xxx
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { extractBearerToken, hashApiKey } from '@/lib/enterprise/api-keys'
import { resolveApiKey, incrementApiKeyUsage } from '@/lib/db/enterprise-queries'
import { checkAiQuota, incrementAiUsage } from '@/lib/billing/quota'
import { sanitizeText } from '@/lib/security/validators'
import { languageSystemPromptSnippet } from '@/config/languages'

const schema = z.object({
  message: z.string().min(1).max(4000).transform(sanitizeText),
  language: z.string().max(10).optional(),
  context: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  // API key authentication
  const raw = extractBearerToken(req.headers.get('authorization'))
  if (!raw) {
    return NextResponse.json({ error: 'Missing Authorization header. Use Bearer <api_key>.' }, { status: 401 })
  }

  const keyHash = await hashApiKey(raw)
  const resolved = await resolveApiKey(keyHash)
  if (!resolved) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // Quota check
  const { allowed, quota } = await checkAiQuota(resolved.userId)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Monthly AI quota exceeded. Upgrade your plan.', quota },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: parsed.error.flatten() }, { status: 400 })
  }

  const { message, language, context } = parsed.data

  const langSnippet = language ? languageSystemPromptSnippet(language) : ''
  const contextNote = context ? `\n\n## Caller Context\n${context}` : ''
  const systemPrompt = SYSTEM_PROMPT + langSnippet + contextNote +
    '\n\n## API Mode\nYou are responding via the Life OS API. Be concise and structured. Return plain text or markdown.'

  let text: string
  if (isMockMode()) {
    text = `[Demo] You asked: "${message.slice(0, 80)}". Add ANTHROPIC_API_KEY to enable real responses.`
  } else {
    const model = getAIModel()
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: message,
      maxOutputTokens: 800,
      temperature: 0.7,
    })
    text = result.text
  }

  // Track usage (fire-and-forget)
  incrementAiUsage(resolved.userId).catch(() => {})
  incrementApiKeyUsage(resolved.keyId).catch(() => {})

  return NextResponse.json({
    text,
    requestId: crypto.randomUUID(),
  })
}
