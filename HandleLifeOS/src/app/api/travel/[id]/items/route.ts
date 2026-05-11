import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

// Verify that the trip belongs to the requesting user before mutating items.
async function assertTripOwnership(tripId: string, userId: string): Promise<boolean> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('trips').select('id').eq('id', tripId).eq('user_id', userId).maybeSingle()
  return !!data
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id: tripId } = await params
  if (!(await assertTripOwnership(tripId, session.user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body  // kind: 'item' or 'packing'
  const table = kind === 'packing' ? 'packing_items' : 'trip_items'
  const safe = stripServerFields(payload)
  // trip_id is server-controlled (from URL), strip any client attempt to override
  delete (safe as Record<string, unknown>).trip_id

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(table)
    .insert({ ...safe, user_id: session.user.id, trip_id: tripId })
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data }, { status: 201 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id: tripId } = await params
  const body = await req.json().catch(() => ({}))
  const { kind, id, ...patch } = body
  const table = kind === 'packing' ? 'packing_items' : 'trip_items'
  const safe = stripServerFields(patch)
  delete (safe as Record<string, unknown>).trip_id

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(table)
    .update(safe)
    .eq('id', id).eq('trip_id', tripId).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id: tripId } = await params
  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const itemId = url.searchParams.get('item_id')
  if (!kind || !itemId) return NextResponse.json({ error: 'Missing kind or item_id' }, { status: 400 })
  const table = kind === 'packing' ? 'packing_items' : 'trip_items'

  await getSupabaseAdmin().from(table).delete().eq('id', itemId).eq('trip_id', tripId).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
