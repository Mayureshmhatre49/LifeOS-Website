import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ assets: [], maintenance: [], bills: [] })

  const db = getSupabaseAdmin()
  const [assets, maint, bills] = await Promise.all([
    db.from('home_assets').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
    db.from('home_maintenance').select('*').eq('user_id', session.user.id).eq('is_active', true).order('next_due_at', { ascending: true, nullsFirst: false }),
    db.from('utility_bills').select('*').eq('user_id', session.user.id).order('bill_date', { ascending: false }).limit(100),
  ])
  return NextResponse.json({ assets: assets.data ?? [], maintenance: maint.data ?? [], bills: bills.data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body
  const tableMap: Record<string, string> = { asset: 'home_assets', maintenance: 'home_maintenance', bill: 'utility_bills' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const db = getSupabaseAdmin()

  if (kind === 'maintenance' && payload.asset_id) {
    const { data: asset } = await db
      .from('home_assets')
      .select('id')
      .eq('id', payload.asset_id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  if (payload.property_id) {
    const { data: prop } = await db
      .from('properties')
      .select('id')
      .eq('id', payload.property_id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!prop) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from(table)
    .insert({ ...stripServerFields(payload), user_id: session.user.id })
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, id, ...patch } = body
  const tableMap: Record<string, string> = { asset: 'home_assets', maintenance: 'home_maintenance', bill: 'utility_bills' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const db = getSupabaseAdmin()
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  if (kind === 'maintenance' && patch.asset_id) {
    const { data: asset } = await db
      .from('home_assets')
      .select('id')
      .eq('id', patch.asset_id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  if (patch.property_id) {
    const { data: prop } = await db
      .from('properties')
      .select('id')
      .eq('id', patch.property_id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!prop) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from(table)
    .update(stripServerFields(patch))
    .eq('id', id).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const id = url.searchParams.get('id')
  if (!kind || !id) return NextResponse.json({ error: 'Missing kind or id' }, { status: 400 })
  const tableMap: Record<string, string> = { asset: 'home_assets', maintenance: 'home_maintenance', bill: 'utility_bills' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  await getSupabaseAdmin().from(table).delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
