import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { CompanionMode } from '@/lib/mind/companion-prompts'
import type { RiskSeverity } from '@/lib/mind/risk-detection'

export interface CompanionSession {
  id: string
  user_id: string
  mode: CompanionMode
  title: string | null
  risk_flags: string[]
  created_at: string
  updated_at: string
}

export interface CompanionMessage {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  risk_level: RiskSeverity | null
  created_at: string
}

export async function createCompanionSession(params: {
  user_id: string
  mode: CompanionMode
  title?: string
}): Promise<CompanionSession> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('mind_companion_sessions')
    .insert(params)
    .select()
    .single()
  if (error) throw error
  return data as CompanionSession
}

export async function getCompanionSessions(userId: string, limit = 30): Promise<CompanionSession[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('mind_companion_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as CompanionSession[]
}

export async function getCompanionSession(id: string, userId: string): Promise<CompanionSession | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('mind_companion_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return (data ?? null) as CompanionSession | null
}

export async function deleteCompanionSession(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('mind_companion_sessions').delete().eq('id', id).eq('user_id', userId)
}

export async function getCompanionMessages(sessionId: string, userId: string): Promise<CompanionMessage[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('mind_companion_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return (data ?? []) as CompanionMessage[]
}

export async function saveCompanionMessage(params: {
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  risk_level?: RiskSeverity
}): Promise<CompanionMessage> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('mind_companion_messages')
    .insert(params)
    .select()
    .single()
  if (error) throw error
  // Touch the session updated_at
  await db
    .from('mind_companion_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.session_id)
  return data as CompanionMessage
}

export async function flagSessionRisk(sessionId: string, userId: string, flags: string[]): Promise<void> {
  const db = getSupabaseAdmin()
  await db
    .from('mind_companion_sessions')
    .update({ risk_flags: flags })
    .eq('id', sessionId)
    .eq('user_id', userId)
}
