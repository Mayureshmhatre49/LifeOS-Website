import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { Conversation, Message } from '@/types'

export async function getUserByEmail(email: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('users').select('*').eq('email', email).single()
  return data
}

export async function createUser(params: { email: string; name: string; password_hash: string }) {
  const db = getSupabaseAdmin()
  const { data, error } = await db.from('users').insert(params).select().single()
  if (error) throw error
  return data
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('conversations')
    .select('*, messages(count)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50)
  return (data ?? []) as Conversation[]
}

export async function createConversation(params: { user_id: string; title: string }): Promise<Conversation> {
  const db = getSupabaseAdmin()
  const { data, error } = await db.from('conversations').insert(params).select().single()
  if (error) throw error
  return data as Conversation
}

export async function updateConversationTitle(id: string, title: string) {
  const db = getSupabaseAdmin()
  await db.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return (data ?? []) as Message[]
}

export async function saveMessage(params: {
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
}): Promise<Message> {
  const db = getSupabaseAdmin()
  const { data, error } = await db.from('messages').insert(params).select().single()
  if (error) throw error
  await db
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.conversation_id)
  return data as Message
}

export async function deleteConversation(id: string, userId: string) {
  const db = getSupabaseAdmin()
  await db.from('conversations').delete().eq('id', id).eq('user_id', userId)
}
