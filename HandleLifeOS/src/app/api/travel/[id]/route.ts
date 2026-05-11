import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TripPatch = z.object({
  destination: z.string().min(1).max(160).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(['planning', 'booked', 'active', 'completed', 'cancelled']).optional(),
  budget_total: z.number().nonnegative().nullable().optional(),
  spent_total: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  travellers: z.number().int().min(1).max(20).optional(),
  notes: z.string().max(5000).nullable().optional(),
  cover_emoji: z.string().max(8).nullable().optional(),
}).strict()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ trip: null, items: [], packing: [] })
  const { id } = await params
  const db = getSupabaseAdmin()
  const [trip, items, packing] = await Promise.all([
    db.from('trips').select('*').eq('id', id).eq('user_id', session.user.id).maybeSingle(),
    db.from('trip_items').select('*').eq('trip_id', id).eq('user_id', session.user.id).order('starts_at', { ascending: true, nullsFirst: false }).order('order_index'),
    db.from('packing_items').select('*').eq('trip_id', id).eq('user_id', session.user.id).order('created_at'),
  ])
  return NextResponse.json({ trip: trip.data, items: items.data ?? [], packing: packing.data ?? [] })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = TripPatch.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('trips')
    .update(stripServerFields(parsed.data))
    .eq('id', id).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ trip: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { id } = await params
  await getSupabaseAdmin().from('trips').delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
