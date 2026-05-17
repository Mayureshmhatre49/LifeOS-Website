import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'
import { emitNotification } from '@/lib/db/notification-queries'

const CATEGORIES = [
  'financial','identity','vehicle','property','health','education','digital','family','business','other',
] as const

const RISK_LEVELS   = ['low','medium','high','critical'] as const
const STATUSES      = ['active','renewed','expired','cancelled','archived'] as const
const FREQUENCIES   = ['monthly','quarterly','half_yearly','yearly','custom'] as const
const SOURCE_TYPES  = ['manual','document','ocr','email','ai','import'] as const

function calcDaysUntilExpiry(expiryDate: string): number {
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000)
}

function calcUrgencyLevel(days: number): 'overdue' | 'critical' | 'high' | 'medium' | 'low' {
  if (days < 0)   return 'overdue'
  if (days <= 7)  return 'critical'
  if (days <= 30) return 'high'
  if (days <= 90) return 'medium'
  return 'low'
}

// Emit cross-urgency-threshold notifications (idempotent via dedup_key)
async function maybeEmitUrgencyNotifications(
  userId: string,
  items: Array<{ id: string; title: string; expiry_date: string }>,
) {
  const today = new Date().toISOString().slice(0, 10)
  for (const item of items) {
    const days = calcDaysUntilExpiry(item.expiry_date)
    if (days < 0) {
      await emitNotification({
        user_id: userId, type: 'renewals.overdue', module: 'renewals',
        title: `Overdue: ${item.title}`,
        body: `This renewal is ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue.`,
        link: '/renewals', severity: 'urgent',
        dedup_key: `renewal:overdue:${item.id}:${today}`,
      })
    } else if (days <= 7) {
      await emitNotification({
        user_id: userId, type: 'renewals.critical', module: 'renewals',
        title: `Renewal due in ${days} day${days !== 1 ? 's' : ''}: ${item.title}`,
        body: 'Act now to avoid lapse, penalties, or service interruption.',
        link: '/renewals', severity: 'urgent',
        dedup_key: `renewal:critical:${item.id}:${today}`,
      })
    } else if (days <= 30) {
      await emitNotification({
        user_id: userId, type: 'renewals.due_soon', module: 'renewals',
        title: `Renewal due in ${days} days: ${item.title}`,
        link: '/renewals', severity: 'warning',
        dedup_key: `renewal:soon:${item.id}:${today}`,
      })
    }
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ items: [] })

  const url      = new URL(req.url)
  const status   = url.searchParams.get('status') || 'active'
  const category = url.searchParams.get('category')
  const days     = url.searchParams.get('days')    // max days until expiry
  const notify   = url.searchParams.get('notify') === '1'

  const db = getSupabaseAdmin()
  let query = db
    .from('renewal_items')
    .select('*')
    .eq('user_id', session.user.id)
    .is('deleted_at', null)
    .order('expiry_date', { ascending: true })

  if (status !== 'all') query = query.eq('status', status)
  if (category)         query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  let items = (data ?? []).map(item => ({
    ...item,
    days_until_expiry: calcDaysUntilExpiry(item.expiry_date),
    urgency_level:     calcUrgencyLevel(calcDaysUntilExpiry(item.expiry_date)),
  }))

  if (days) {
    const maxDays = parseInt(days, 10)
    items = items.filter(i => i.days_until_expiry <= maxDays)
  }

  // Best-effort: emit urgency notifications for active items crossing thresholds
  if (notify && status === 'active') {
    maybeEmitUrgencyNotifications(session.user.id, items).catch(() => {})
  }

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const {
    title, category, subcategory, description, provider, reference_no,
    start_date, expiry_date, recurring_frequency, recurring_months,
    renewal_window_days, reminder_days, estimated_cost, actual_cost, currency,
    risk_level, status, auto_detected, source_type, source_document_id,
    confidence_score, ai_summary, ai_risk_notes, linked_modules, tags, notes,
  } = body

  if (!title?.trim())   return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!expiry_date || !/^\d{4}-\d{2}-\d{2}$/.test(expiry_date))
    return NextResponse.json({ error: 'Valid expiry_date required (YYYY-MM-DD)' }, { status: 400 })
  if (category && !CATEGORIES.includes(category))
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

  const uid = session.user.id
  const db  = getSupabaseAdmin()

  const { data: item, error } = await db
    .from('renewal_items')
    .insert(stripServerFields({
      user_id:             uid,
      title:               String(title).trim().slice(0, 300),
      category:            CATEGORIES.includes(category) ? category : 'other',
      subcategory:         subcategory ? String(subcategory).slice(0, 100) : null,
      description:         description ? String(description).slice(0, 2000) : null,
      provider:            provider    ? String(provider).slice(0, 200)    : null,
      reference_no:        reference_no ? String(reference_no).slice(0, 100) : null,
      start_date:          start_date && /^\d{4}-\d{2}-\d{2}$/.test(start_date) ? start_date : null,
      expiry_date,
      recurring_frequency: FREQUENCIES.includes(recurring_frequency) ? recurring_frequency : null,
      recurring_months:    recurring_months ? Math.max(1, parseInt(recurring_months, 10)) : null,
      renewal_window_days: renewal_window_days ? Math.max(1, parseInt(renewal_window_days, 10)) : 30,
      reminder_days:       Array.isArray(reminder_days)
        ? reminder_days.filter((d: unknown) => typeof d === 'number' && d > 0)
        : [90, 30, 7, 1],
      estimated_cost:      estimated_cost != null ? Number(estimated_cost) : null,
      actual_cost:         actual_cost    != null ? Number(actual_cost)    : null,
      currency:            currency ? String(currency).slice(0, 10) : 'INR',
      risk_level:          RISK_LEVELS.includes(risk_level) ? risk_level : 'medium',
      status:              STATUSES.includes(status) ? status : 'active',
      auto_detected:       Boolean(auto_detected),
      source_type:         SOURCE_TYPES.includes(source_type) ? source_type : 'manual',
      source_document_id:  source_document_id || null,
      confidence_score:    confidence_score != null ? Math.min(1, Math.max(0, Number(confidence_score))) : null,
      ai_summary:          ai_summary    ? String(ai_summary).slice(0, 1000)    : null,
      ai_risk_notes:       ai_risk_notes ? String(ai_risk_notes).slice(0, 500) : null,
      linked_modules:      linked_modules && typeof linked_modules === 'object' ? linked_modules : null,
      tags:                Array.isArray(tags) ? tags.map((t: unknown) => String(t).slice(0, 50)).slice(0, 20) : [],
      notes:               notes ? String(notes).slice(0, 2000) : null,
    }))
    .select()
    .single()

  if (error || !item) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })

  // Write history record
  await db.from('renewal_history').insert({
    user_id: uid, renewal_item_id: item.id, action: 'created',
    new_expiry: expiry_date, cost: estimated_cost ? Number(estimated_cost) : null,
  })

  const days = calcDaysUntilExpiry(expiry_date)
  if (days <= 30) {
    emitNotification({
      user_id: uid, type: 'renewals.new_urgent', module: 'renewals',
      title: `New renewal added: ${item.title}`,
      body: `Expires ${days < 0 ? 'overdue' : `in ${days} days`}. Review it now.`,
      link: '/renewals', severity: days <= 7 ? 'urgent' : 'warning',
    }).catch(() => {})
  }

  return NextResponse.json({
    item: { ...item, days_until_expiry: days, urgency_level: calcUrgencyLevel(days) },
  }, { status: 201 })
}
