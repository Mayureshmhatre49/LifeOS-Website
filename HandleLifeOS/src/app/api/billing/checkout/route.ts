import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { PLANS } from '@/lib/billing/plans'
import { createOrder, isRazorpayConfigured } from '@/lib/billing/razorpay'
import type { PlanId, BillingInterval } from '@/types/billing'

const schema = z.object({
  planId: z.enum(['pro', 'family']),
  interval: z.enum(['monthly', 'yearly']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { planId, interval } = parsed.data as { planId: PlanId; interval: BillingInterval }
  const plan = PLANS[planId]

  const priceINR = interval === 'yearly' ? plan.yearlyPriceINR : plan.monthlyPriceINR
  const amountPaise = priceINR * 100

  const order = await createOrder({
    amount: amountPaise,
    currency: 'INR',
    receipt: `lifeos_${session.user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      userId: session.user.id,
      planId,
      interval,
      email: session.user.email ?? '',
    },
  })

  return NextResponse.json({
    provider: 'razorpay',
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    planId,
    interval,
    planName: plan.name,
  })
}
