import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TENANT_STATUSES  = ['active','notice','vacated'] as const
const DEPOSIT_STATUSES = ['held','refunded','partial'] as const
const ID_TYPES         = ['aadhaar','pan','passport','voter_id','driving_license','other'] as const

async function assertPropertyOwner(propertyId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await getSupabaseAdmin()
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ tenants: [], payments: [] })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = getSupabaseAdmin()
  const [tenantsRes, paymentsRes] = await Promise.all([
    db.from('property_tenants')
      .select('*')
      .eq('property_id', id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
    db.from('property_rent_payments')
      .select('*')
      .eq('property_id', id)
      .eq('user_id', session.user.id)
      .order('month', { ascending: false }),
  ])

  return NextResponse.json({ tenants: tenantsRes.data ?? [], payments: paymentsRes.data ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body

  if (kind === 'tenant') {
    if (!payload.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const { data, error } = await getSupabaseAdmin()
      .from('property_tenants')
      .insert(stripServerFields({
        user_id: session.user.id,
        property_id: id,
        name: String(payload.name).trim().slice(0, 200),
        phone: payload.phone ? String(payload.phone).slice(0, 30) : null,
        email: payload.email ? String(payload.email).slice(0, 200) : null,
        id_type: ID_TYPES.includes(payload.id_type) ? payload.id_type : null,
        id_number: payload.id_number ? String(payload.id_number).slice(0, 50) : null,
        lease_start: payload.lease_start && /^\d{4}-\d{2}-\d{2}$/.test(payload.lease_start) ? payload.lease_start : null,
        lease_end:   payload.lease_end   && /^\d{4}-\d{2}-\d{2}$/.test(payload.lease_end)   ? payload.lease_end   : null,
        monthly_rent:   payload.monthly_rent   ? Number(payload.monthly_rent)   : null,
        deposit_amount: payload.deposit_amount ? Number(payload.deposit_amount) : null,
        deposit_status: DEPOSIT_STATUSES.includes(payload.deposit_status) ? payload.deposit_status : 'held',
        status: TENANT_STATUSES.includes(payload.status) ? payload.status : 'active',
        notes: payload.notes ? String(payload.notes).slice(0, 2000) : null,
      }))
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    return NextResponse.json({ record: data }, { status: 201 })
  }

  if (kind === 'payment') {
    const { tenant_id, amount, month, paid_on, notes } = payload
    if (!tenant_id || !month || !(/^\d{4}-\d{2}$/.test(month)))
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 })

    // Verify the tenant belongs to this property and user
    const { data: tenant } = await getSupabaseAdmin()
      .from('property_tenants')
      .select('id')
      .eq('id', tenant_id)
      .eq('property_id', id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const { data, error } = await getSupabaseAdmin()
      .from('property_rent_payments')
      .upsert({
        user_id: session.user.id,
        property_id: id,
        tenant_id,
        amount: amount ? Number(amount) : 0,
        month,
        paid_on: paid_on && /^\d{4}-\d{2}-\d{2}$/.test(paid_on) ? paid_on : new Date().toISOString().slice(0, 10),
        notes: notes ? String(notes).slice(0, 500) : null,
      }, { onConflict: 'tenant_id,month' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    return NextResponse.json({ record: data }, { status: 201 })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { tenantId, ...patch } = body
  if (!tenantId) return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })

  const safeFields: Record<string, unknown> = {}
  if (TENANT_STATUSES.includes(patch.status))            safeFields.status         = patch.status
  if (DEPOSIT_STATUSES.includes(patch.deposit_status))   safeFields.deposit_status = patch.deposit_status
  if (typeof patch.notes === 'string')                    safeFields.notes          = patch.notes.slice(0, 2000)
  if (patch.monthly_rent !== undefined)                   safeFields.monthly_rent   = patch.monthly_rent ? Number(patch.monthly_rent) : null
  if (patch.deposit_amount !== undefined)                 safeFields.deposit_amount = patch.deposit_amount ? Number(patch.deposit_amount) : null
  if (patch.lease_end && /^\d{4}-\d{2}-\d{2}$/.test(patch.lease_end)) safeFields.lease_end = patch.lease_end

  const { data, error } = await getSupabaseAdmin()
    .from('property_tenants')
    .update(safeFields)
    .eq('id', tenantId)
    .eq('property_id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const url       = new URL(req.url)
  const kind      = url.searchParams.get('kind')
  const recordId  = url.searchParams.get('recordId')
  if (!recordId) return NextResponse.json({ error: 'Missing recordId' }, { status: 400 })

  const db = getSupabaseAdmin()

  if (kind === 'payment') {
    const { error } = await db
      .from('property_rent_payments')
      .delete()
      .eq('id', recordId)
      .eq('property_id', id)
      .eq('user_id', session.user.id)
    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (kind === 'tenant') {
    const { error } = await db
      .from('property_tenants')
      .delete()
      .eq('id', recordId)
      .eq('property_id', id)
      .eq('user_id', session.user.id)
    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}
