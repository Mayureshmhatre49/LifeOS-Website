import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { checkAiQuota, getUserPlanId, incrementAiUsage } from '@/lib/billing/quota'
import { analyzeDecision } from '@/lib/decision/analyzeDecision'
import { compareOptions } from '@/lib/decision/compareOptions'
import { saveDecision } from '@/lib/db/decision-queries'

const schema = z.object({
  question: z.string().min(5).max(600).trim(),
  category: z
    .enum(['financial', 'career', 'relocation', 'education', 'family', 'business', 'investment', 'lifestyle'])
    .optional(),
  mode: z.enum(['analyze', 'compare']).default('analyze'),
  options: z.array(z.string().min(1).max(120)).max(5).optional(),
  additionalContext: z.string().max(600).trim().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  // Quota gate — same pattern as chat route
  const { allowed, quota } = await checkAiQuota(userId)
  if (!allowed) {
    return NextResponse.json(
      { error: 'AI quota exceeded', quota, upgradeUrl: '/billing' },
      { status: 402 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const input = parsed.data
  const planId = await getUserPlanId(userId)
  const isPremium = planId !== 'free'

  try {
    let result, contextSnapshot

    if (input.mode === 'compare' && input.options && input.options.length >= 2) {
      ;({ result, contextSnapshot } = await compareOptions(userId, input, isPremium))
    } else {
      ;({ result, contextSnapshot } = await analyzeDecision(userId, input, isPremium))
    }

    const saved = await saveDecision(userId, {
      question: input.question,
      category: input.category,
      mode: input.mode,
      options: input.options ?? [],
      contextSnapshot,
      result,
    })

    // Fire-and-forget quota increment
    incrementAiUsage(userId).catch(console.error)

    console.info('[Analytics] decision_completed', {
      userId,
      mode: input.mode,
      category: input.category ?? 'none',
      isPremium,
    })

    return NextResponse.json({ result, id: saved?.id ?? null, isPremium })
  } catch (err) {
    console.error('[decisions/analyze]', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
