import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/billing/razorpay'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'
import { getSubscriptionByProvider, updateSubscription } from '@/lib/db/billing-queries'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  const isValid = await validateWebhookSignature(rawBody, signature)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const event = JSON.parse(rawBody) as {
    event: string
    payload: {
      payment?: { entity?: { order_id?: string; id?: string; notes?: Record<string, string> } }
      subscription?: { entity?: { id?: string; status?: string; current_end?: number } }
    }
  }

  const db = getSupabaseAdmin()

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment?.entity
      const notes = payment?.notes ?? {}
      const userId = notes.userId
      const planId = notes.planId as string
      const interval = notes.interval as string

      if (userId && planId) {
        const now = new Date()
        const periodEnd = new Date(now)
        if (interval === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        await db.from('subscriptions').upsert(
          {
            user_id: userId,
            plan_id: planId,
            status: 'active',
            interval,
            provider: 'razorpay',
            provider_subscription_id: payment?.id,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
            updated_at: now.toISOString(),
          },
          { onConflict: 'user_id' }
        )
      }
      break
    }

    case 'subscription.cancelled': {
      const sub = event.payload.subscription?.entity
      if (sub?.id) {
        const existing = await getSubscriptionByProvider('razorpay', sub.id)
        if (existing) {
          await updateSubscription(existing.id, { status: 'cancelled' })
        }
      }
      break
    }

    case 'subscription.charged': {
      const sub = event.payload.subscription?.entity
      if (sub?.id && sub.current_end) {
        const existing = await getSubscriptionByProvider('razorpay', sub.id)
        if (existing) {
          await updateSubscription(existing.id, {
            status: 'active',
            currentPeriodEnd: new Date(sub.current_end * 1000).toISOString(),
          })
        }
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
