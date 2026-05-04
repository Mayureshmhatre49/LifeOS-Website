import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getSubscriptions, createSubscription } from '@/lib/db/money-queries'

const billingCycles = ['monthly', 'quarterly', 'annual', 'weekly'] as const

const createSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().max(10).optional(),
  billing_cycle: z.enum(billingCycles).optional(),
  category: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  next_billing_date: z.string().optional(),
  notes: z.string().max(200).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscriptions = await getSubscriptions(session.user.id)
  return NextResponse.json({ subscriptions })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const subscription = await createSubscription(session.user.id, parsed.data)
  return NextResponse.json({ subscription }, { status: 201 })
}
