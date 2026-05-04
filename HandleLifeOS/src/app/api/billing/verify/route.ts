import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { validatePaymentSignature } from '@/lib/billing/razorpay'
import { createSubscription } from '@/lib/db/billing-queries'
import { PLANS } from '@/lib/billing/plans'
import { isSupabaseConfigured } from '@/lib/db/client'
import type { PlanId, BillingInterval } from '@/types/billing'

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.enum(['pro', 'family']),
  interval: z.enum(['monthly', 'yearly']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, interval } = parsed.data

  const isValid = await validatePaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  )

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const plan = PLANS[planId as PlanId]
  const now = new Date()
  const periodEnd = new Date(now)
  if (interval === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  await createSubscription({
    userId: session.user.id,
    planId: planId as PlanId,
    status: 'active',
    interval: interval as BillingInterval,
    provider: 'razorpay',
    providerSubscriptionId: razorpay_payment_id,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
  })

  return NextResponse.json({
    success: true,
    planId,
    planName: plan.name,
    periodEnd: periodEnd.toISOString(),
  })
}
