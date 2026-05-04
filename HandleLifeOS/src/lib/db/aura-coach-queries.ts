import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { CoachMode } from '@/lib/aura/coach-prompts'

export interface AuraCoachSession {
  id: string
  user_id: string
  child_id: string | null
  mode: CoachMode
  title: string | null
  created_at: string
  updated_at: string
}

export interface AuraCoachMessage {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function createCoachSession(params: {
  user_id: string
  mode: CoachMode
  child_id?: string | null
  title?: string
}): Promise<AuraCoachSession> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('aura_coach_sessions')
    .insert(params)
    .select()
    .single()
  if (error) throw error
  return data as AuraCoachSession
}

export async function getCoachSessions(userId: string, limit = 30): Promise<AuraCoachSession[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('aura_coach_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as AuraCoachSession[]
}

export async function getCoachSession(id: string, userId: string): Promise<AuraCoachSession | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('aura_coach_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return (data ?? null) as AuraCoachSession | null
}

export async function deleteCoachSession(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('aura_coach_sessions').delete().eq('id', id).eq('user_id', userId)
}

export async function getCoachMessages(sessionId: string, userId: string): Promise<AuraCoachMessage[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('aura_coach_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return (data ?? []) as AuraCoachMessage[]
}

export async function saveCoachMessage(params: {
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
}): Promise<AuraCoachMessage> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('aura_coach_messages')
    .insert(params)
    .select()
    .single()
  if (error) throw error
  await db
    .from('aura_coach_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.session_id)
  return data as AuraCoachMessage
}
