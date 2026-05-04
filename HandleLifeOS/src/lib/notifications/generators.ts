// Notification generators — compute "what should the user see right now" from current OS state.
// Run on-demand when user opens notifications (no background worker needed for v1).
// Each generator uses a dedup_key (date-based) so the same alert isn't created twice per day.

import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'
import { emitNotification } from '@/lib/db/notification-queries'
import { calculateAlerts } from '@/lib/aura-logic'
import type { AuraChildProfile } from '@/types/aura'

const todayKey = () => new Date().toISOString().slice(0, 10)
const isoDaysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/**
 * Run all generators for a user. Best-effort; never throws.
 */
export async function generateNotificationsForUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  const today = todayKey()

  await Promise.all([
    // 1. Overdue tasks
    (async () => {
      try {
        const { data: tasks } = await db
          .from('tasks')
          .select('id, title, due_date, status')
          .eq('user_id', userId)
          .neq('status', 'done')
          .neq('status', 'skipped')
          .lt('due_date', today)
          .limit(5)
        for (const t of (tasks ?? []) as { id: string; title: string; due_date: string }[]) {
          await emitNotification({
            user_id: userId,
            type: 'planner.task_overdue',
            module: 'planner',
            title: 'Task overdue',
            body: t.title,
            link: '/planner',
            severity: 'warning',
            dedup_key: `task:${t.id}:${today}`,
            metadata: { task_id: t.id },
          })
        }
      } catch {}
    })(),

    // 2. AURA urgent alerts
    (async () => {
      try {
        const { data: profiles } = await db.from('aura_profiles').select('*').eq('user_id', userId)
        for (const row of (profiles ?? []) as { id: string; data: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>; created_at: string; updated_at: string }[]) {
          const child: AuraChildProfile = { ...row.data, id: row.id, created_at: row.created_at, updated_at: row.updated_at }
          const alerts = calculateAlerts(child).filter(a => a.severity === 'urgent')
          for (const a of alerts.slice(0, 3)) {
            await emitNotification({
              user_id: userId,
              type: 'aura.alert.urgent',
              module: 'aura',
              title: `Urgent: ${child.full_name}`,
              body: a.message,
              link: '/aura/milestones',
              severity: 'urgent',
              dedup_key: `aura:${child.id}:${a.milestone_id ?? a.message.slice(0, 20)}:${today}`,
              metadata: { child_id: child.id, milestone_id: a.milestone_id },
            })
          }
        }
      } catch {}
    })(),

    // 3. Mind: no journal in 5+ days
    (async () => {
      try {
        const { data: lastJournal } = await db
          .from('journal_entries')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (!lastJournal) return
        const lastTs = new Date(lastJournal.created_at).getTime()
        const daysSince = Math.floor((Date.now() - lastTs) / 86_400_000)
        if (daysSince >= 5 && daysSince % 5 === 0) {
          await emitNotification({
            user_id: userId,
            type: 'mind.journal_lapse',
            module: 'mind',
            title: 'Journaling check-in',
            body: `It's been ${daysSince} days since your last entry. Even 2 minutes can shift the day.`,
            link: '/mind/journal',
            severity: 'info',
            dedup_key: `journal:lapse:${today}`,
          })
        }
      } catch {}
    })(),

    // 4. Mind: mood streak celebration (3+ days mood ≥ 4)
    (async () => {
      try {
        const since = isoDaysAgo(7)
        const { data: moods } = await db
          .from('mood_logs')
          .select('mood, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', since)
          .order('logged_at', { ascending: false })
          .limit(7)
        if (!moods || moods.length < 3) return
        let streak = 0
        const today0 = new Date()
        today0.setHours(0, 0, 0, 0)
        const moodByDate = new Map<string, number>()
        for (const m of moods as { mood: number; logged_at: string }[]) {
          const date = m.logged_at.slice(0, 10)
          if ((moodByDate.get(date) ?? 0) < m.mood) moodByDate.set(date, m.mood)
        }
        for (let i = 0; i < 7; i++) {
          const d = new Date(today0)
          d.setDate(today0.getDate() - i)
          const ds = d.toISOString().slice(0, 10)
          const m = moodByDate.get(ds)
          if (m != null && m >= 4) streak++
          else break
        }
        if (streak >= 3) {
          await emitNotification({
            user_id: userId,
            type: 'mind.streak.positive',
            module: 'mind',
            title: `${streak}-day positive streak 🌱`,
            body: 'Your mood has been ≥ Good for 3+ days. Take note of what is working.',
            link: '/mind/analytics',
            severity: 'success',
            dedup_key: `mind:streak:${streak}:${today}`,
          })
        }
      } catch {}
    })(),

    // 5. Habits: today's pending check-in (any habit not done today, after 6pm local-ish)
    (async () => {
      try {
        const hour = new Date().getHours()
        if (hour < 18) return
        const { data: habits } = await db
          .from('habits')
          .select('id, name, days_of_week, target_per_day')
          .eq('user_id', userId)
          .eq('is_active', true)
        const dayIdx = new Date().getDay()
        const todayHabits = ((habits ?? []) as { id: string; name: string; days_of_week: number[]; target_per_day: number }[])
          .filter(h => h.days_of_week.includes(dayIdx))
        if (todayHabits.length === 0) return
        const { data: logs } = await db
          .from('habit_logs')
          .select('habit_id, count')
          .eq('user_id', userId)
          .eq('date', today)
        const doneToday = new Set(((logs ?? []) as { habit_id: string; count: number }[]).filter(l => l.count > 0).map(l => l.habit_id))
        const pending = todayHabits.filter(h => !doneToday.has(h.id))
        if (pending.length === 0) return
        await emitNotification({
          user_id: userId,
          type: 'habits.evening_check',
          module: 'system',
          title: `${pending.length} ${pending.length === 1 ? 'habit' : 'habits'} pending`,
          body: pending.slice(0, 3).map(h => h.name).join(', ') + (pending.length > 3 ? '…' : ''),
          link: '/habits',
          severity: 'info',
          dedup_key: `habits:evening:${today}`,
        })
      } catch {}
    })(),

    // 6. Vault: documents expiring within 30 days
    (async () => {
      try {
        const horizon = new Date()
        horizon.setDate(horizon.getDate() + 30)
        const horizonKey = horizon.toISOString().slice(0, 10)
        const { data: docs } = await db
          .from('vault_documents')
          .select('id, name, expires_at, category')
          .eq('user_id', userId)
          .not('expires_at', 'is', null)
          .lte('expires_at', horizonKey)
          .order('expires_at', { ascending: true })
          .limit(5)
        for (const d of (docs ?? []) as { id: string; name: string; expires_at: string; category: string }[]) {
          const days = Math.max(0, Math.ceil((new Date(d.expires_at).getTime() - Date.now()) / 86_400_000))
          await emitNotification({
            user_id: userId,
            type: 'vault.expiring',
            module: 'system',
            title: days === 0 ? `Expires today: ${d.name}` : `Expires in ${days}d: ${d.name}`,
            body: `${d.category.toUpperCase()} document`,
            link: '/vault',
            severity: days <= 7 ? 'urgent' : 'warning',
            dedup_key: `vault:${d.id}:${today}`,
            metadata: { doc_id: d.id, days_left: days },
          })
        }
      } catch {}
    })(),

    // 7. Network: contact follow-ups due
    (async () => {
      try {
        const { data: contacts } = await db
          .from('contacts')
          .select('id, name, follow_up_at')
          .eq('user_id', userId)
          .eq('archived', false)
          .not('follow_up_at', 'is', null)
          .lte('follow_up_at', today)
          .limit(5)
        for (const c of (contacts ?? []) as { id: string; name: string; follow_up_at: string }[]) {
          await emitNotification({
            user_id: userId,
            type: 'network.followup_due',
            module: 'system',
            title: `Follow up with ${c.name}`,
            body: 'You set a follow-up reminder for today.',
            link: '/network',
            severity: 'info',
            dedup_key: `contact:${c.id}:${today}`,
            metadata: { contact_id: c.id },
          })
        }
      } catch {}
    })(),

    // 8. Home: overdue maintenance + unpaid utility bills near due
    (async () => {
      try {
        const horizon = new Date()
        horizon.setDate(horizon.getDate() + 7)
        const horizonKey = horizon.toISOString().slice(0, 10)

        const { data: maint } = await db
          .from('home_maintenance')
          .select('id, title, next_due_at')
          .eq('user_id', userId)
          .eq('is_active', true)
          .not('next_due_at', 'is', null)
          .lte('next_due_at', horizonKey)
          .limit(5)
        for (const m of (maint ?? []) as { id: string; title: string; next_due_at: string }[]) {
          const overdue = m.next_due_at < today
          await emitNotification({
            user_id: userId,
            type: 'home.maintenance_due',
            module: 'system',
            title: overdue ? `Overdue: ${m.title}` : `Due soon: ${m.title}`,
            body: `Scheduled for ${m.next_due_at}`,
            link: '/home',
            severity: overdue ? 'warning' : 'info',
            dedup_key: `maint:${m.id}:${today}`,
          })
        }

        const { data: bills } = await db
          .from('utility_bills')
          .select('id, utility, amount, due_date')
          .eq('user_id', userId)
          .eq('is_paid', false)
          .not('due_date', 'is', null)
          .lte('due_date', horizonKey)
          .limit(5)
        for (const b of (bills ?? []) as { id: string; utility: string; amount: number; due_date: string }[]) {
          const overdue = b.due_date < today
          await emitNotification({
            user_id: userId,
            type: 'home.bill_due',
            module: 'money',
            title: overdue ? `Overdue bill: ${b.utility}` : `Bill due: ${b.utility}`,
            body: `₹${b.amount} • ${b.due_date}`,
            link: '/home',
            severity: overdue ? 'urgent' : 'warning',
            dedup_key: `bill:${b.id}:${today}`,
          })
        }
      } catch {}
    })(),

    // 9. Investments: SIP coming up in next 3 days
    (async () => {
      try {
        const horizon = new Date()
        horizon.setDate(horizon.getDate() + 3)
        const horizonKey = horizon.toISOString().slice(0, 10)
        const { data: sips } = await db
          .from('sip_plans')
          .select('id, name, amount, next_date')
          .eq('user_id', userId)
          .eq('is_active', true)
          .lte('next_date', horizonKey)
          .order('next_date', { ascending: true })
          .limit(5)
        for (const s of (sips ?? []) as { id: string; name: string; amount: number; next_date: string }[]) {
          await emitNotification({
            user_id: userId,
            type: 'investments.sip_due',
            module: 'money',
            title: `SIP due: ${s.name}`,
            body: `₹${s.amount} on ${s.next_date}`,
            link: '/investments',
            severity: 'info',
            dedup_key: `sip:${s.id}:${today}`,
          })
        }
      } catch {}
    })(),

    // 10. Legal: tax/legal deadlines within 7 days
    (async () => {
      try {
        const horizon = new Date()
        horizon.setDate(horizon.getDate() + 7)
        const horizonKey = horizon.toISOString().slice(0, 10)
        const { data: deadlines } = await db
          .from('legal_deadlines')
          .select('id, title, type, due_date, amount')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .lte('due_date', horizonKey)
          .order('due_date', { ascending: true })
          .limit(5)
        for (const d of (deadlines ?? []) as { id: string; title: string; type: string; due_date: string; amount: number | null }[]) {
          const overdue = d.due_date < today
          await emitNotification({
            user_id: userId,
            type: 'legal.deadline',
            module: 'system',
            title: overdue ? `Overdue: ${d.title}` : `Due ${d.due_date}: ${d.title}`,
            body: d.amount ? `₹${d.amount.toLocaleString('en-IN')} • ${d.type.replace('_', ' ')}` : d.type.replace('_', ' '),
            link: '/legal',
            severity: overdue ? 'urgent' : 'warning',
            dedup_key: `legal:${d.id}:${today}`,
          })
        }
      } catch {}
    })(),

    // 11. Business: unpaid invoices past due date
    (async () => {
      try {
        const { data: invoices } = await db
          .from('business_invoices')
          .select('id, invoice_no, total, due_at, status')
          .eq('user_id', userId)
          .in('status', ['sent', 'overdue'])
          .not('due_at', 'is', null)
          .lt('due_at', today)
          .limit(5)
        for (const inv of (invoices ?? []) as { id: string; invoice_no: string; total: number; due_at: string }[]) {
          const days = Math.ceil((Date.now() - new Date(inv.due_at).getTime()) / 86_400_000)
          await emitNotification({
            user_id: userId,
            type: 'business.invoice_overdue',
            module: 'money',
            title: `Invoice overdue: ${inv.invoice_no}`,
            body: `₹${inv.total.toLocaleString('en-IN')} • ${days}d past due`,
            link: `/business/invoice/${inv.id}`,
            severity: 'urgent',
            dedup_key: `invoice:${inv.id}:${today}`,
          })
        }
      } catch {}
    })(),
  ])
}
