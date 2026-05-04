import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { ApiKey } from '@/types/enterprise'

export async function getApiKeysByUser(userId: string): Promise<ApiKey[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('api_keys')
    .select('id, user_id, name, key_prefix, request_count, is_active, last_used_at, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapRow)
}

export async function createApiKey(params: {
  userId: string
  name: string
  keyPrefix: string
  keyHash: string
}): Promise<ApiKey> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('api_keys')
    .insert({
      user_id: params.userId,
      name: params.name,
      key_prefix: params.keyPrefix,
      key_hash: params.keyHash,
    })
    .select('id, user_id, name, key_prefix, request_count, is_active, last_used_at, created_at')
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function revokeApiKey(id: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', userId)
}

/**
 * Looks up a key by its SHA-256 hash. Returns user_id if found and active.
 */
export async function resolveApiKey(
  keyHash: string
): Promise<{ userId: string; keyId: string } | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()
  if (!data) return null
  return { userId: (data as { id: string; user_id: string }).user_id, keyId: (data as { id: string; user_id: string }).id }
}

export async function incrementApiKeyUsage(keyId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db.rpc('increment_api_key_usage', { p_key_id: keyId })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ApiKey {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    keyPrefix: row.key_prefix,
    keyHash: '',   // never returned from queries
    lastUsedAt: row.last_used_at,
    requestCount: row.request_count ?? 0,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}
