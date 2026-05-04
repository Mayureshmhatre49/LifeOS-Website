import { isSupabaseConfigured } from '@/lib/db/client'

// Lazily imported to avoid circular deps and edge-runtime issues
async function getAdmin() {
  if (!isSupabaseConfigured()) return null
  const { getSupabaseAdmin } = await import('@/lib/db/client')
  try { return getSupabaseAdmin() } catch { return null }
}

// ── Action catalogue ──────────────────────────────────────────────────────────
export type AuditAction =
  | 'user.signup'
  | 'user.login'
  | 'user.login_failed'
  | 'user.logout'
  | 'user.password_reset_requested'
  | 'user.password_changed'
  | 'user.account_locked'
  | 'user.account_deleted'
  | 'user.data_exported'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'billing.plan_changed'
  | 'billing.subscription_cancelled'
  | 'billing.payment_failed'
  | 'whatsapp.linked'
  | 'whatsapp.unlinked'
  | 'security.prompt_injection_detected'
  | 'security.brute_force_detected'
  | 'security.rate_limit_exceeded'
  | 'user.email_verified'
  | 'admin.role_changed'
  | 'mind.data_deleted'
  | 'mind.data_exported'
  | 'aura.data_deleted'
  | 'aura.data_exported'

export type AuditSeverity = 'info' | 'warning' | 'critical'

export interface AuditEntry {
  action: AuditAction
  user_id?: string
  resource_type?: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
  severity?: AuditSeverity
}

// Fire-and-forget — must never throw or block a response
export function writeAuditLog(entry: AuditEntry): void {
  getAdmin().then((db) => {
    if (!db) return
    return db.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.user_id ?? null,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
      metadata: entry.metadata ?? {},
      severity: entry.severity ?? 'info',
    })
  }).catch(() => {
    // Audit failure must never break the caller
    console.error('[audit] failed to write:', entry.action)
  })
}

// ── Login attempts ────────────────────────────────────────────────────────────
export function recordLoginAttempt(params: {
  email: string
  ip_address: string
  success: boolean
  failure_reason?: string
  user_agent?: string
}): void {
  getAdmin().then((db) => {
    if (!db) return
    return db.from('login_attempts').insert({
      email: params.email.toLowerCase(),
      ip_address: params.ip_address,
      success: params.success,
      failure_reason: params.failure_reason ?? null,
      user_agent: params.user_agent ?? null,
    })
  }).catch(() => {
    console.error('[audit] failed to record login attempt for:', params.email)
  })
}

// ── Security events ───────────────────────────────────────────────────────────
export function writeSecurityEvent(params: {
  type: 'brute_force' | 'prompt_injection' | 'api_abuse' | 'unusual_activity' | 'rate_limit_exceeded'
  severity?: AuditSeverity
  details: Record<string, unknown>
  ip_address?: string
  user_id?: string
}): void {
  getAdmin().then((db) => {
    if (!db) return
    return db.from('security_events').insert({
      type: params.type,
      severity: params.severity ?? 'warning',
      details: params.details,
      ip_address: params.ip_address ?? null,
      user_id: params.user_id ?? null,
    })
  }).catch(() => {
    console.error('[audit] failed to write security event:', params.type)
  })
}
