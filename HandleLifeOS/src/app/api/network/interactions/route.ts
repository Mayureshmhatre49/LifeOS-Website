import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const createSchema = z.object({
  contact_id:  z.string().uuid(),
  type:        z.enum(['call', 'message', 'meeting', 'email', 'event', 'other']),
  occurred_at: z.string().datetime().optional(),
  notes:       z.string().max(2000).optional(),
  sentiment:   z.enum(['positive', 'neutral', 'negative']).optional(),
})

// GET /api/network/interactions?contact_id=<uuid>
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ interactions: [] })

  const contactId = req.nextUrl.searchParams.get('contact_id')
  if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Verify the contact belongs to this user before returning interactions
  const { data: contact } = await db
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await db
    .from('contact_interactions')
    .select('*')
    .eq('contact_id', contactId)
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ interactions: data ?? [] })
}

// POST /api/network/interactions
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Verify the contact belongs to this user
  const { data: contact } = await db
    .from('contacts')
    .select('id')
    .eq('id', parsed.data.contact_id)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  const { data, error } = await db
    .from('contact_interactions')
    .insert({
      user_id:     session.user.id,
      contact_id:  parsed.data.contact_id,
      type:        parsed.data.type,
      occurred_at: parsed.data.occurred_at ?? new Date().toISOString(),
      notes:       parsed.data.notes,
      sentiment:   parsed.data.sentiment,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })

  // Update last_contact_at on the parent contact
  await db
    .from('contacts')
    .update({ last_contact_at: parsed.data.occurred_at ?? new Date().toISOString() })
    .eq('id', parsed.data.contact_id)
    .eq('user_id', session.user.id)

  return NextResponse.json({ interaction: data }, { status: 201 })
}
