import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200).optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  group_name: z.string().max(60).optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  anniversary: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  how_we_met: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(40)).max(10).optional(),
  follow_up_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  strength: z.number().int().min(1).max(5).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ contacts: [] })

  const db = getSupabaseAdmin()
  const { data } = await db.from('contacts').select('*').eq('user_id', session.user.id).eq('archived', false).order('updated_at', { ascending: false })
  return NextResponse.json({ contacts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Strip empty strings → undefined for date fields
  const normalize = <T extends Record<string, unknown>>(o: T): T => {
    const out: Record<string, unknown> = {}
    for (const k in o) {
      const v = o[k]
      if (v !== '' && v !== undefined) out[k] = v
    }
    return out as T
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db.from('contacts').insert({ user_id: session.user.id, ...normalize(parsed.data) }).select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ contact: data }, { status: 201 })
}
