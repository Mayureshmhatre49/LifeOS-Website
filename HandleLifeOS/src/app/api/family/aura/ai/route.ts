import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { checkChatRateLimit } from '@/lib/security/rate-limit'
import { getAuraGuidance, getMilestoneGuidance } from '@/lib/aura-ai'
import type { AuraChildProfile } from '@/types/aura'

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('guidance'),
    child: z.unknown(),
    question: z.string().min(1).max(600),
    topic: z.enum([
      'general', 'adhd', 'asd', 'physical_disability',
      'genetic', 'iep', 'financial', 'nutrition',
    ]),
  }),
  z.object({
    action: z.literal('milestone_guidance'),
    child: z.unknown(),
    missing_milestones: z.array(z.string()).min(1).max(20),
  }),
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimit = await checkChatRateLimit(ip)
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data
  const child = input.child as AuraChildProfile

  if (!child?.id || !child?.full_name || !child?.date_of_birth) {
    return NextResponse.json({ error: 'Invalid child profile' }, { status: 400 })
  }

  try {
    if (input.action === 'guidance') {
      const result = await getAuraGuidance(child, input.question, input.topic)
      return NextResponse.json({ result })
    }

    if (input.action === 'milestone_guidance') {
      const result = await getMilestoneGuidance(child, input.missing_milestones)
      return NextResponse.json({ result })
    }
  } catch (err) {
    console.error('AURA AI error:', err)
    return NextResponse.json(
      { error: 'AI request failed. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
