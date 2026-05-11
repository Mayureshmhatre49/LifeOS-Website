import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { Conversation, Message } from '@/types'

export async function getUserByEmail(email: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('users').select('*').eq('email', email).maybeSingle()
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

export async function updateConversationTitle(id: string, userId: string, title: string) {
  const db = getSupabaseAdmin()
  await db.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
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

// ── Password reset tokens ─────────────────────────────────────────────────────

export async function createPasswordResetToken(userId: string, tokenHash: string) {
  const db = getSupabaseAdmin()
  // Invalidate any existing tokens for this user first
  await db.from('password_reset_tokens').delete().eq('user_id', userId)
  const { data, error } = await db
    .from('password_reset_tokens')
    .insert({ user_id: userId, token_hash: tokenHash })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPasswordResetToken(tokenHash: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('password_reset_tokens')
    .select('*, users(id, email, name)')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  return data
}

export async function markPasswordResetTokenUsed(id: string) {
  const db = getSupabaseAdmin()
  await db.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('id', id)
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const db = getSupabaseAdmin()
  const { error } = await db.from('users').update({ password_hash: passwordHash }).eq('id', userId)
  if (error) throw error
}

// ── Email verification tokens ─────────────────────────────────────────────────

export async function createEmailVerificationToken(userId: string, tokenHash: string) {
  const db = getSupabaseAdmin()
  await db.from('email_verification_tokens').delete().eq('user_id', userId)
  const { data, error } = await db
    .from('email_verification_tokens')
    .insert({ user_id: userId, token_hash: tokenHash })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getEmailVerificationToken(tokenHash: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('email_verification_tokens')
    .select('*, users(id, email, name)')
    .eq('token_hash', tokenHash)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  return data
}

export async function markEmailVerified(userId: string, tokenId: string) {
  const db = getSupabaseAdmin()
  await Promise.all([
    db.from('email_verification_tokens').update({ verified_at: new Date().toISOString() }).eq('id', tokenId),
    db.from('users').update({ email_verified: true }).eq('id', userId),
  ])
}

export async function getUserById(userId: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('users').select('*').eq('id', userId).maybeSingle()
  return data
}

export async function deleteUserAccount(userId: string) {
  const db = getSupabaseAdmin()
  // CASCADE on foreign keys handles all related data
  const { error } = await db.from('users').delete().eq('id', userId)
  if (error) throw error
}

export async function exportUserData(userId: string) {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const [
    { data: user },
    { data: conversations },
    { data: messages },
    { data: profile },
  ] = await Promise.all([
    db.from('users').select('id, email, name, created_at').eq('id', userId).single(),
    db.from('conversations').select('*').eq('user_id', userId),
    db.from('messages').select('*').in(
      'conversation_id',
      (await db.from('conversations').select('id').eq('user_id', userId)).data?.map((c: { id: string }) => c.id) ?? []
    ),
    db.from('user_profiles').select('*').eq('user_id', userId).single(),
  ])
  return { user, profile, conversations: conversations ?? [], messages: messages ?? [] }
}
