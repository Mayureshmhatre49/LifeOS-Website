import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { DecisionLog, DecisionMode, DecisionResult, CompareResult } from '@/types/decision'

export interface CreateDecisionInput {
  question: string
  category?: string
  mode: DecisionMode
  options?: string[]
  contextSnapshot?: Record<string, unknown>
  result: DecisionResult | CompareResult
}

export async function saveDecision(
  userId: string,
  input: CreateDecisionInput,
): Promise<DecisionLog | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('decision_logs')
    .insert({
      user_id: userId,
      question: input.question,
      category: input.category ?? null,
      mode: input.mode,
      options: input.options ?? [],
      context_snapshot: input.contextSnapshot ?? {},
      result: input.result,
    })
    .select()
    .single()
  if (error) {
    console.error('[decisions] save error', error.message)
    return null
  }
  return data as DecisionLog
}

export async function getDecisions(
  userId: string,
  limit = 20,
): Promise<DecisionLog[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('decision_logs')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[decisions] fetch error', error.message)
    return []
  }
  return (data ?? []) as DecisionLog[]
}

export async function getDecision(
  id: string,
  userId: string,
): Promise<DecisionLog | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('decision_logs')
    .select()
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as DecisionLog
}

export async function toggleFavorite(
  id: string,
  userId: string,
  favorite: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db
    .from('decision_logs')
    .update({ favorite })
    .eq('id', id)
    .eq('user_id', userId)
}

export async function deleteDecision(
  id: string,
  userId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db
    .from('decision_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

export async function getFavoriteDecisionCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const db = getSupabaseAdmin()
  const { count, error } = await db
    .from('decision_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('favorite', true)
  if (error) return 0
  return count ?? 0
}
