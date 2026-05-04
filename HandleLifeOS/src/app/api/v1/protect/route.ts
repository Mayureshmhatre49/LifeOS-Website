/**
 * Life OS Public API v1 — Protection / scam-check endpoint
 * Auth: Authorization: Bearer lok_live_xxx
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { extractBearerToken, hashApiKey } from '@/lib/enterprise/api-keys'
import { resolveApiKey, incrementApiKeyUsage } from '@/lib/db/enterprise-queries'
import { checkAiQuota, incrementAiUsage } from '@/lib/billing/quota'
import { sanitizeText } from '@/lib/security/validators'

const schema = z.object({
  text: z.string().min(1).max(5000).transform(sanitizeText),
  type: z.enum(['scam', 'quote', 'contract', 'auto']).optional().default('auto'),
})

const PROTECT_PROMPT = `You are a scam and fraud detection expert. Analyse the provided text and respond with a JSON object (no markdown, raw JSON only):
{
  "riskLevel": "low" | "medium" | "high" | "unknown",
  "summary": "<one sentence summary>",
  "redFlags": ["<flag 1>", "<flag 2>"],
  "recommendation": "<one clear action for the user>"
}

Risk levels:
- low: No significant red flags
- medium: Some suspicious elements, proceed with caution
- high: Clear scam / fraud indicators
- unknown: Cannot determine from the text`

export async function POST(req: NextRequest) {
  const raw = extractBearerToken(req.headers.get('authorization'))
  if (!raw) {
    return NextResponse.json({ error: 'Missing Authorization header.' }, { status: 401 })
  }

  const keyHash = await hashApiKey(raw)
  const resolved = await resolveApiKey(keyHash)
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid or revoked API key.' }, { status: 401 })
  }

  const { allowed } = await checkAiQuota(resolved.userId)
  if (!allowed) {
    return NextResponse.json({ error: 'Monthly quota exceeded.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: parsed.error.flatten() }, { status: 400 })
  }

  const { text, type } = parsed.data
  const typeHint = type !== 'auto' ? `\n\nAnalysis type: ${type}` : ''

  let result: { riskLevel: string; summary: string; redFlags: string[]; recommendation: string }

  if (isMockMode()) {
    result = {
      riskLevel: 'unknown',
      summary: 'Demo mode — add an AI key to enable real analysis.',
      redFlags: [],
      recommendation: 'Configure ANTHROPIC_API_KEY in your environment.',
    }
  } else {
    const model = getAIModel()
    const { text: rawText } = await generateText({
      model,
      system: PROTECT_PROMPT,
      prompt: `Analyse this text:${typeHint}\n\n"${text}"`,
      maxOutputTokens: 400,
      temperature: 0.3,
    })

    try {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim()
      result = JSON.parse(cleaned) as typeof result
    } catch {
      result = {
        riskLevel: 'unknown',
        summary: rawText.slice(0, 200),
        redFlags: [],
        recommendation: 'Review the text manually.',
      }
    }
  }

  incrementAiUsage(resolved.userId).catch(() => {})
  incrementApiKeyUsage(resolved.keyId).catch(() => {})

  return NextResponse.json(result)
}
