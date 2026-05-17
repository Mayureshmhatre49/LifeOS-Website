import { getSupabaseAdmin, isSupabaseConfigured } from './client'

export type NotificationModule = 'planner' | 'aura' | 'mind' | 'money' | 'family' | 'protection' | 'system' | 'renewals'
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  type: string
  module: NotificationModule
  title: string
  body: string | null
  link: string | null
  severity: NotificationSeverity
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface EmitNotificationParams {
  user_id: string
  type: string                     // dotted: 'planner.task_overdue', 'aura.alert.urgent', 'mind.streak.7'
  module: NotificationModule
  title: string
  body?: string
  link?: string
  severity?: NotificationSeverity
  metadata?: Record<string, unknown>
  dedup_key?: string               // optional — prevents duplicate notifications (uniqueness across user+type+dedup_key)
}

/**
 * Emit a notification. Best-effort: silently swallows DB errors so callers never break their main flow.
 * If dedup_key is provided, an existing notification with the same (user, type, dedup_key) blocks insertion.
 */
export async function emitNotification(params: EmitNotificationParams): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const db = getSupabaseAdmin()
    const metadata = { ...(params.metadata ?? {}), ...(params.dedup_key ? { dedup_key: params.dedup_key } : {}) }
    await db.from('notifications').insert({
      user_id: params.user_id,
      type: params.type,
      module: params.module,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      severity: params.severity ?? 'info',
      metadata,
    })
  } catch {
    // best-effort; never break the calling flow
  }
}

export async function getNotifications(
  userId: string,
  opts: { limit?: number; unreadOnly?: boolean; module?: NotificationModule } = {},
): Promise<Notification[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let q = db.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (opts.unreadOnly) q = q.is('read_at', null)
  if (opts.module) q = q.eq('module', opts.module)
  if (opts.limit) q = q.limit(opts.limit)
  const { data } = await q
  return (data ?? []) as Notification[]
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const db = getSupabaseAdmin()
  const { count } = await db
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)
  return count ?? 0
}

export async function markRead(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
}

export async function markAllRead(userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('notifications').delete().eq('id', id).eq('user_id', userId)
}
