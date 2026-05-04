import { NextRequest, NextResponse } from 'next/server'
import { extractBearerToken, hashApiKey } from '@/lib/enterprise/api-keys'
import { resolveApiKey } from '@/lib/db/enterprise-queries'
import { getQuotaStatus } from '@/lib/billing/quota'
import { getUserPlanId } from '@/lib/billing/quota'

export async function GET(req: NextRequest) {
  const raw = extractBearerToken(req.headers.get('authorization'))
  if (!raw) {
    return NextResponse.json({ error: 'Missing Authorization header.' }, { status: 401 })
  }

  const keyHash = await hashApiKey(raw)
  const resolved = await resolveApiKey(keyHash)
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid or revoked API key.' }, { status: 401 })
  }

  const [quota, planId] = await Promise.all([
    getQuotaStatus(resolved.userId),
    getUserPlanId(resolved.userId),
  ])

  const month = new Date().toISOString().slice(0, 7)

  return NextResponse.json({
    month,
    plan: planId,
    aiRequests: quota.aiRequests,
    whatsappMessages: quota.whatsappMessages,
  })
}
