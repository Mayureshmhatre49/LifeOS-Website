import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { WhatsAppSession, WhatsAppMessage } from '@/types/whatsapp'

export async function findSessionByPhone(phoneNumber: string): Promise<WhatsAppSession | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('is_active', true)
    .single()
  return (data as WhatsAppSession) ?? null
}

export async function findSessionByUserId(userId: string): Promise<WhatsAppSession | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  return (data as WhatsAppSession) ?? null
}

export async function createSession(
  userId: string,
  phoneNumber: string,
  waId: string,
  displayName?: string
): Promise<WhatsAppSession> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('whatsapp_sessions')
    .upsert(
      { user_id: userId, phone_number: phoneNumber, wa_id: waId, display_name: displayName, is_active: true },
      { onConflict: 'phone_number' }
    )
    .select()
    .single()

  if (error) throw error
  return data as WhatsAppSession
}

export async function linkOrUpdateSession(
  userId: string,
  phoneNumber: string,
  displayName?: string
): Promise<WhatsAppSession> {
  const db = getSupabaseAdmin()
  const waId = phoneNumber.replace(/^\+/, '')
  const { data, error } = await db
    .from('whatsapp_sessions')
    .upsert(
      { user_id: userId, phone_number: phoneNumber, wa_id: waId, display_name: displayName, is_active: true, updated_at: new Date().toISOString() },
      { onConflict: 'phone_number' }
    )
    .select()
    .single()

  if (error) throw error
  return data as WhatsAppSession
}

export async function unlinkSession(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db
    .from('whatsapp_sessions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

export async function getRecentMessages(sessionId: string, limit = 10): Promise<WhatsAppMessage[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('whatsapp_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return ((data ?? []) as WhatsAppMessage[]).reverse()
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db.from('whatsapp_messages').insert({ session_id: sessionId, role, content })
}
