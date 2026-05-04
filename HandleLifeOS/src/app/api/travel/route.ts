import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TripCreate = z.object({
  destination: z.string().min(1).max(160),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(['planning', 'booked', 'active', 'completed', 'cancelled']).optional(),
  budget_total: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
  travellers: z.number().int().min(1).max(20).optional(),
  notes: z.string().max(5000).nullable().optional(),
  cover_emoji: z.string().max(8).nullable().optional(),
}).strict()

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ trips: [] })

  const db = getSupabaseAdmin()
  const { data } = await db.from('trips').select('*').eq('user_id', session.user.id).order('start_date', { ascending: false, nullsFirst: false })
  return NextResponse.json({ trips: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = TripCreate.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('trips')
    .insert({ ...stripServerFields(parsed.data), user_id: session.user.id })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trip: data }, { status: 201 })
}
