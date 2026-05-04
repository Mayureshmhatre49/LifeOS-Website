import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type {
  RiskCheck,
  SavedQuote,
  NegotiationTemplate,
  RiskLevel,
  ProtectionCheckType,
  NegotiationTone,
} from '@/types/protection'

// ── Risk Checks ────────────────────────────────────────────────────────────

export async function saveRiskCheck(
  userId: string,
  input: {
    type: ProtectionCheckType
    title: string
    input_hash: string
    risk_level: RiskLevel
    result_summary: string
    red_flags?: string[]
    safe_next_step?: string
  }
): Promise<RiskCheck> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('risk_checks')
    .insert({ user_id: userId, red_flags: [], ...input })
    .select()
    .single()
  if (error) throw error
  return data as RiskCheck
}

export async function getRiskChecks(
  userId: string,
  type?: ProtectionCheckType,
  limit = 20
): Promise<RiskCheck[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let q = db
    .from('risk_checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (type) q = q.eq('type', type)
  const { data } = await q
  return (data ?? []) as RiskCheck[]
}

export async function deleteRiskCheck(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('risk_checks').delete().eq('id', id).eq('user_id', userId)
}

// ── Saved Quotes ───────────────────────────────────────────────────────────

export async function saveQuote(
  userId: string,
  input: {
    title: string
    amount?: number
    currency?: string
    category?: string
    region?: string
    result_summary?: string
    risk_level?: RiskLevel
    negotiation_script?: string
  }
): Promise<SavedQuote> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('saved_quotes')
    .insert({ user_id: userId, currency: 'INR', category: 'other', risk_level: 'unknown', ...input })
    .select()
    .single()
  if (error) throw error
  return data as SavedQuote
}

export async function getSavedQuotes(userId: string): Promise<SavedQuote[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('saved_quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as SavedQuote[]
}

export async function deleteQuote(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('saved_quotes').delete().eq('id', id).eq('user_id', userId)
}

// ── Negotiation Templates ──────────────────────────────────────────────────

export async function saveNegotiationTemplate(
  userId: string,
  input: { type: string; context: string; script: string; tone: NegotiationTone }
): Promise<NegotiationTemplate> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('negotiation_templates')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  if (error) throw error
  return data as NegotiationTemplate
}

export async function getNegotiationTemplates(userId: string): Promise<NegotiationTemplate[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('negotiation_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as NegotiationTemplate[]
}

export async function deleteNegotiationTemplate(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('negotiation_templates').delete().eq('id', id).eq('user_id', userId)
}
