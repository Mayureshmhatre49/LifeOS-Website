/**
 * Strips fields from an untrusted client payload that should never be settable
 * by users (server-controlled identity, audit, and ownership fields).
 *
 * Used at the boundary of every API route that spreads request bodies into
 * Supabase inserts/updates. Defense-in-depth against mass-assignment / IDOR.
 *
 *   const safe = stripServerFields(body)
 *   db.from('x').insert({ user_id: session.user.id, ...safe })
 *
 * Always pass the user_id from the session AFTER spreading the safe payload.
 */

const FORBIDDEN_FIELDS: ReadonlySet<string> = new Set([
  // Identity / ownership — must come from session, never the client
  'user_id',
  'owner_id',
  'created_by',
  'updated_by',
  // Server-controlled timestamps + ids
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'last_synced_at',
  // Privilege / role flags
  'role',
  'is_admin',
  'is_staff',
  'is_superuser',
  'admin',
  // Auth / security state
  'password_hash',
  'email_verified',
  'verified_at',
  'mfa_enabled',
  'lockout_until',
  // Family / sharing — must be set via dedicated endpoints with auth
  'family_id',
  'shared_with',
  'is_public',
  'is_shared',
  'visibility',
])

export function stripServerFields<T extends Record<string, unknown>>(
  payload: T | null | undefined,
): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload)) {
    if (FORBIDDEN_FIELDS.has(k)) continue
    // Reject prototype-pollution vectors
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue
    out[k] = v
  }
  return out as Partial<T>
}

/**
 * Allowlist variant: keeps only the listed fields. Use this when you know
 * exactly which fields a route should accept (preferred over deny-list).
 */
export function pickFields<T extends Record<string, unknown>, K extends keyof T>(
  payload: T | null | undefined,
  allowed: readonly K[],
): Pick<T, K> {
  const out = {} as Pick<T, K>
  if (!payload || typeof payload !== 'object') return out
  for (const k of allowed) {
    if (k in payload) (out as Record<string, unknown>)[k as string] = payload[k]
  }
  return out
}
