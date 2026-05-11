import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TABLE_MAP: Record<string, string> = {
  deadline: 'legal_deadlines',
  document: 'legal_documents',
  compliance: 'legal_compliances',
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ deadlines: [], documents: [], compliances: [] })

  const db = getSupabaseAdmin()
  const [deadlines, documents, compliances] = await Promise.all([
    db.from('legal_deadlines').select('*').eq('user_id', session.user.id).order('due_date', { ascending: true }),
    db.from('legal_documents').select('id, name, doc_type, summary_md, key_points, red_flags, expires_at, created_at')
      .eq('user_id', session.user.id).order('created_at', { ascending: false }),
    db.from('legal_compliances').select('*').eq('user_id', session.user.id).eq('applicable', true)
      .order('next_due_at', { ascending: true, nullsFirst: false }),
  ])

  return NextResponse.json({
    deadlines: deadlines.data ?? [],
    documents: documents.data ?? [],
    compliances: compliances.data ?? [],
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const db = getSupabaseAdmin()
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
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const db = getSupabaseAdmin()
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
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  await getSupabaseAdmin().from(table).delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
