import { isSupabaseConfigured } from '@/lib/db/client'
import { getPlan, isUnlimited } from './plans'
import type { PlanId, QuotaStatus } from '@/types/billing'

const CURRENT_MONTH = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

/**
 * Returns the user's current plan ID.
 * Falls back to 'free' if Supabase is not configured or no subscription found.
 */
export async function getUserPlanId(userId: string): Promise<PlanId> {
  if (!isSupabaseConfigured()) return 'free'

  const { getSupabaseAdmin } = await import('@/lib/db/client')
  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // PGRST116 = no rows found — expected for free-tier users
  if (error && error.code !== 'PGRST116') {
    console.warn('[quota] getUserPlanId error:', error.message)
  }

  if (!data) return 'free'
  return (data.plan_id as PlanId) ?? 'free'
}

/**
 * Increments the monthly AI request counter for a user.
 * No-op if Supabase is not configured.
 */
export async function incrementAiUsage(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return

  const { getSupabaseAdmin } = await import('@/lib/db/client')
  const db = getSupabaseAdmin()
  const month = CURRENT_MONTH()

  await db.rpc('increment_ai_usage', { p_user_id: userId, p_month: month })
}

/**
 * Checks whether the user has exceeded their AI request quota this month.
 * Returns true (allowed) if within quota, false if exceeded.
 */
export async function checkAiQuota(
  userId: string
): Promise<{ allowed: boolean; quota: QuotaStatus }> {
  const planId = await getUserPlanId(userId)
  const plan = getPlan(planId)

  const used = await getMonthlyAiUsage(userId)
  const limit = plan.limits.aiRequestsPerMonth
  const exceeded = !isUnlimited(limit) && used >= limit

  return {
    allowed: !exceeded,
    quota: {
      planId,
      aiRequests: { used, limit, exceeded },
      whatsappMessages: { used: 0, limit: plan.limits.whatsappMessages, exceeded: false },
    },
  }
}

export async function getMonthlyAiUsage(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const { getSupabaseAdmin } = await import('@/lib/db/client')
  const db = getSupabaseAdmin()
  const month = CURRENT_MONTH()

  const { data, error } = await db
    .from('usage_records')
    .select('ai_requests')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  // PGRST116 = no usage record yet for this month — treat as zero
  if (error && error.code !== 'PGRST116') {
    console.warn('[quota] getMonthlyAiUsage error:', error.message)
  }

  return (data as { ai_requests: number } | null)?.ai_requests ?? 0
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const planId = await getUserPlanId(userId)
  const plan = getPlan(planId)
  const used = await getMonthlyAiUsage(userId)
  const limit = plan.limits.aiRequestsPerMonth

  return {
    planId,
    aiRequests: { used, limit, exceeded: !isUnlimited(limit) && used >= limit },
    whatsappMessages: { used: 0, limit: plan.limits.whatsappMessages, exceeded: false },
  }
}
