// Mind module premium gating: tier checks + per-feature limits.
// Free tier has narrower access; Pro/Family unlock unlimited use + analytics.

import { getUserPlanId } from '@/lib/billing/quota'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'
import type { PlanId } from '@/types/billing'

export const MIND_FREE_DAILY_COMPANION_LIMIT = 5

export interface MindAccess {
  planId: PlanId
  isPremium: boolean
  companion: {
    used_today: number
    daily_limit: number | null // null = unlimited
    remaining: number | null
  }
  unlocks: {
    analytics: boolean
    unlimitedCompanion: boolean
    fullHistory: boolean
  }
}

// Counts user-role companion messages sent today (UTC day, simple and consistent)
export async function getMindCompanionDailyCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const db = getSupabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await db
    .from('mind_companion_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', todayStart.toISOString())

  return count ?? 0
}

export async function getMindAccess(userId: string): Promise<MindAccess> {
  const planId = await getUserPlanId(userId)
  const isPremium = planId === 'pro' || planId === 'family'

  const used = isPremium ? 0 : await getMindCompanionDailyCount(userId)
  const limit = isPremium ? null : MIND_FREE_DAILY_COMPANION_LIMIT
  const remaining = limit == null ? null : Math.max(0, limit - used)

  return {
    planId,
    isPremium,
    companion: { used_today: used, daily_limit: limit, remaining },
    unlocks: {
      analytics: isPremium,
      unlimitedCompanion: isPremium,
      fullHistory: isPremium,
    },
  }
}
