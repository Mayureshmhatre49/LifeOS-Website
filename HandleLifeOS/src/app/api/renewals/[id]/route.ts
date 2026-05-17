import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { emitNotification } from '@/lib/db/notification-queries'

const RISK_LEVELS  = ['low','medium','high','critical'] as const
const STATUSES     = ['active','renewed','expired','cancelled','archived'] as const
const FREQUENCIES  = ['monthly','quarterly','half_yearly','yearly','custom'] as const

function calcDaysUntilExpiry(expiryDate: string): number {
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000)
}
function calcUrgency(days: number) {
  if (days < 0)   return 'overdue'
  if (days <= 7)  return 'critical'
  if (days <= 30) return 'high'
  if (days <= 90) return 'medium'
  return 'low'
}

/** Compute new expiry_date after renewal based on recurring_frequency */
function computeNextExpiry(currentExpiry: string, frequency: string | null, months: number | null): string {
  const base = new Date(currentExpiry)
  const m = months ?? (frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 :
    frequency === 'half_yearly' ? 6 : 12)
  base.setMonth(base.getMonth() + m)
  return base.toISOString().slice(0, 10)
}

async function assertOwner(id: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await getSupabaseAdmin()
    .from('renewal_items')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()
  return !!data
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = getSupabaseAdmin()
  const [itemRes, historyRes] = await Promise.all([
    db.from('renewal_items').select('*').eq('id', id).single(),
    db.from('renewal_history').select('*').eq('renewal_item_id', id).order('created_at', { ascending: false }).limit(20),
  ])

  if (!itemRes.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const item = itemRes.data
  const days = calcDaysUntilExpiry(item.expiry_date)

  return NextResponse.json({
    item: { ...item, days_until_expiry: days, urgency_level: calcUrgency(days) },
    history: historyRes.data ?? [],
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { action, ...patch } = body
  const db  = getSupabaseAdmin()
  const uid = session.user.id

  // ── Special action: mark renewed ─────────────────────────────────────────────
  if (action === 'renew') {
    const { data: current } = await db.from('renewal_items').select('*').eq('id', id).single()
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const today        = new Date().toISOString().slice(0, 10)
    const newExpiry    = patch.new_expiry_date
      || computeNextExpiry(current.expiry_date, current.recurring_frequency, current.recurring_months)
    const actualCost   = patch.actual_cost != null ? Number(patch.actual_cost) : current.actual_cost

    const { data: updated, error } = await db
      .from('renewal_items')
      .update({
        status:           'active',
        last_renewed_at:  today,
        expiry_date:      newExpiry,
        actual_cost:      actualCost,
        notes:            patch.notes ? String(patch.notes).slice(0, 2000) : current.notes,
      })
      .eq('id', id)
      .eq('user_id', uid)
      .select()
      .single()

    if (error || !updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    await db.from('renewal_history').insert({
      user_id: uid, renewal_item_id: id, action: 'renewed',
      previous_expiry: current.expiry_date, new_expiry: newExpiry,
      cost: actualCost, notes: patch.notes || null,
    })

    emitNotification({
      user_id: uid, type: 'renewals.renewed', module: 'renewals',
      title: `Renewed: ${updated.title}`,
      body: `Next expiry: ${newExpiry}. Well done keeping up to date.`,
      link: '/renewals', severity: 'success',
    }).catch(() => {})

    const days = calcDaysUntilExpiry(newExpiry)
    return NextResponse.json({ item: { ...updated, days_until_expiry: days, urgency_level: calcUrgency(days) } })
  }

  // ── Regular field update ──────────────────────────────────────────────────────
  const safeFields: Record<string, unknown> = {}

  if (typeof patch.title === 'string' && patch.title.trim())
    safeFields.title = patch.title.trim().slice(0, 300)
  if (patch.category && ['financial','identity','vehicle','property','health','education','digital','family','business','other'].includes(patch.category))
    safeFields.category = patch.category
  if (typeof patch.subcategory === 'string') safeFields.subcategory = patch.subcategory.slice(0, 100)
  if (typeof patch.provider    === 'string') safeFields.provider    = patch.provider.slice(0, 200)
  if (typeof patch.reference_no === 'string') safeFields.reference_no = patch.reference_no.slice(0, 100)
  if (typeof patch.description === 'string') safeFields.description = patch.description.slice(0, 2000)
  if (patch.expiry_date && /^\d{4}-\d{2}-\d{2}$/.test(patch.expiry_date))
    safeFields.expiry_date = patch.expiry_date
  if (patch.start_date && /^\d{4}-\d{2}-\d{2}$/.test(patch.start_date))
    safeFields.start_date = patch.start_date
  if (FREQUENCIES.includes(patch.recurring_frequency))
    safeFields.recurring_frequency = patch.recurring_frequency
  if (patch.recurring_months != null)
    safeFields.recurring_months = Math.max(1, parseInt(patch.recurring_months, 10))
  if (patch.renewal_window_days != null)
    safeFields.renewal_window_days = Math.max(1, parseInt(patch.renewal_window_days, 10))
  if (Array.isArray(patch.reminder_days))
    safeFields.reminder_days = patch.reminder_days.filter((d: unknown) => typeof d === 'number' && d > 0)
  if (patch.estimated_cost != null) safeFields.estimated_cost = Number(patch.estimated_cost)
  if (patch.actual_cost    != null) safeFields.actual_cost    = Number(patch.actual_cost)
  if (typeof patch.currency === 'string') safeFields.currency = patch.currency.slice(0, 10)
  if (RISK_LEVELS.includes(patch.risk_level))  safeFields.risk_level = patch.risk_level
  if (STATUSES.includes(patch.status))         safeFields.status     = patch.status
  if (typeof patch.notes === 'string')         safeFields.notes      = patch.notes.slice(0, 2000)
  if (typeof patch.ai_summary    === 'string') safeFields.ai_summary    = patch.ai_summary.slice(0, 1000)
  if (typeof patch.ai_risk_notes === 'string') safeFields.ai_risk_notes = patch.ai_risk_notes.slice(0, 500)
  if (patch.linked_modules && typeof patch.linked_modules === 'object')
    safeFields.linked_modules = patch.linked_modules
  if (Array.isArray(patch.tags))
    safeFields.tags = patch.tags.map((t: unknown) => String(t).slice(0, 50)).slice(0, 20)

  if (Object.keys(safeFields).length === 0)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const prevExpiry = safeFields.expiry_date
  const { data: current } = await db.from('renewal_items').select('expiry_date').eq('id', id).single()

  const { data: updated, error } = await db
    .from('renewal_items')
    .update(safeFields)
    .eq('id', id)
    .eq('user_id', uid)
    .select()
    .single()

  if (error || !updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Write history for date or cost changes
  const histAction = prevExpiry ? 'date_updated' : safeFields.estimated_cost != null ? 'cost_updated' : null
  if (histAction) {
    await db.from('renewal_history').insert({
      user_id: uid, renewal_item_id: id, action: histAction,
      previous_expiry: current?.expiry_date || null,
      new_expiry: updated.expiry_date,
      cost: safeFields.estimated_cost ? Number(safeFields.estimated_cost) : null,
    })
  }

  const days = calcDaysUntilExpiry(updated.expiry_date)
  return NextResponse.json({ item: { ...updated, days_until_expiry: days, urgency_level: calcUrgency(days) } })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const permanent = new URL(req.url).searchParams.get('permanent') === '1'
  const db = getSupabaseAdmin()

  if (permanent) {
    const { error } = await db.from('renewal_items').delete().eq('id', id).eq('user_id', session.user.id)
    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  } else {
    const { error } = await db.from('renewal_items')
      .update({ deleted_at: new Date().toISOString(), status: 'archived' })
      .eq('id', id).eq('user_id', session.user.id)
    if (error) return NextResponse.json({ error: 'Archive failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
