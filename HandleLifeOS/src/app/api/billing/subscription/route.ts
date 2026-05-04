import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getActiveSubscription, cancelSubscription } from '@/lib/db/billing-queries'
import { getUserPlanId, getQuotaStatus } from '@/lib/billing/quota'
import { getPlan } from '@/lib/billing/plans'
import { isSupabaseConfigured } from '@/lib/db/client'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const planId = await getUserPlanId(userId)
  const plan = getPlan(planId)
  const quota = isSupabaseConfigured() ? await getQuotaStatus(userId) : null

  const subscription = isSupabaseConfigured()
    ? await getActiveSubscription(userId)
    : null

  return NextResponse.json({
    planId,
    plan,
    subscription,
    quota,
  })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  await cancelSubscription(session.user.id)
  return NextResponse.json({ cancelled: true })
}
