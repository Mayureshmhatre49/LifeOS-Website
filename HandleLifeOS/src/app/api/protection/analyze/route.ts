import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  analyzeScam,
  analyzeQuote,
  analyzeContract,
  analyzeSubscriptions,
  analyzeDecision,
  hashContent,
} from '@/lib/protection-ai'
import { saveRiskCheck } from '@/lib/db/protection-queries'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkChatRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { z } from 'zod'
import { sanitizePromptForAI } from '@/lib/security/pii'

const analyzeSchema = z.object({
  type: z.enum(['scam', 'quote', 'contract', 'decision', 'subscription']),
  content: z.string().min(10).max(8000).trim(),
  title: z.string().min(1).max(200).trim().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().max(10).optional(),
  region: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  save: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const rateLimit = await checkChatRateLimit(ip)
  if (!rateLimit.success) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(rateLimit.remaining, rateLimit.resetIn) },
    })
  }

  const body = await req.json()
  const parsed = analyzeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { type, title, amount, currency, region, category, save } = parsed.data
  // Mask PII before sending to AI analysis
  const content = sanitizePromptForAI(parsed.data.content)
  const userId = session.user.id

  let userContext: string | undefined
  if (isSupabaseConfigured()) {
    const memCtx = await buildMemoryContext(userId)
    userContext = formatMemoryForPrompt(memCtx) || undefined
  }

  let result
  if (type === 'scam') result = await analyzeScam(content, userContext)
  else if (type === 'quote') result = await analyzeQuote(content, amount, currency, category, region, userContext)
  else if (type === 'contract') result = await analyzeContract(content, userContext)
  else if (type === 'subscription') result = await analyzeSubscriptions(content, currency, userContext)
  else result = await analyzeDecision(content, userContext)

  // Persist if user opted in or by default
  if (save !== false && isSupabaseConfigured()) {
    try {
      await saveRiskCheck(userId, {
        type,
        title: title ?? `${type.charAt(0).toUpperCase() + type.slice(1)} check`,
        input_hash: hashContent(content),
        risk_level: result.risk_level,
        result_summary: result.summary,
        red_flags: 'red_flags' in result ? result.red_flags : [],
        safe_next_step: 'safe_next_step' in result ? result.safe_next_step : undefined,
      })
    } catch {
      // Non-critical — don't fail the response
    }
  }

  return NextResponse.json(result)
}
