import { getSupabaseAdmin } from './client'
import type { AuraChildProfile } from '@/types/aura'

type AuraRow = {
  id: string
  user_id: string
  data: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>
  created_at: string
  updated_at: string
}

function rowToProfile(row: AuraRow): AuraChildProfile {
  return { ...row.data, id: row.id, created_at: row.created_at, updated_at: row.updated_at }
}

export async function getAuraProfiles(userId: string): Promise<AuraChildProfile[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('aura_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToProfile)
}

export async function createAuraProfile(
  userId: string,
  profile: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<AuraChildProfile> {
  const { data, error } = await getSupabaseAdmin()
    .from('aura_profiles')
    .insert({ user_id: userId, data: profile })
    .select()
    .single()
  if (error) throw error
  return rowToProfile(data as AuraRow)
}

export async function updateAuraProfile(
  id: string,
  userId: string,
  profile: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<AuraChildProfile> {
  const { data, error } = await getSupabaseAdmin()
    .from('aura_profiles')
    .update({ data: profile })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return rowToProfile(data as AuraRow)
}

export async function deleteAuraProfile(id: string, userId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('aura_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}
