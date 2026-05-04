import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getQuotaStatus } from '@/lib/billing/quota'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getPlan } from '@/lib/billing/plans'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    const plan = getPlan('free')
    return NextResponse.json({
      planId: 'free',
      plan,
      quota: {
        planId: 'free',
        aiRequests: { used: 0, limit: plan.limits.aiRequestsPerMonth, exceeded: false },
        whatsappMessages: { used: 0, limit: plan.limits.whatsappMessages, exceeded: false },
      },
    })
  }

  const quota = await getQuotaStatus(session.user.id)
  const plan = getPlan(quota.planId)
  return NextResponse.json({ planId: quota.planId, plan, quota })
}
