import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

async function getPropertyOwner(propertyId: string, userId: string) {
  const { data } = await getSupabaseAdmin()
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ issues: [], contacts: [] })

  const { id } = await params
  if (!await getPropertyOwner(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = getSupabaseAdmin()
  const [issuesRes, contactsRes] = await Promise.all([
    db.from('property_issues').select('*').eq('property_id', id).eq('user_id', session.user.id).order('created_at', { ascending: false }),
    db.from('property_emergency_contacts').select('*').eq('property_id', id).eq('user_id', session.user.id).order('category'),
  ])

  return NextResponse.json({ issues: issuesRes.data ?? [], contacts: contactsRes.data ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  if (!await getPropertyOwner(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body

  const tableMap: Record<string, string> = {
    issue:   'property_issues',
    contact: 'property_emergency_contacts',
  }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from(table)
    .insert({ ...stripServerFields(payload), user_id: session.user.id, property_id: id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data }, { status: 201 })
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
  const { kind, recordId, ...patch } = body

  const tableMap: Record<string, string> = {
    issue:   'property_issues',
    contact: 'property_emergency_contacts',
  }
  const table = tableMap[kind]
  if (!table || !recordId) return NextResponse.json({ error: 'Missing kind or recordId' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from(table)
    .update(stripServerFields(patch))
    .eq('id', recordId)
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
  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const recordId = url.searchParams.get('recordId')

  const tableMap: Record<string, string> = {
    issue:   'property_issues',
    contact: 'property_emergency_contacts',
  }
  const table = kind ? tableMap[kind] : null
  if (!table || !recordId) return NextResponse.json({ error: 'Missing kind or recordId' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from(table)
    .delete()
    .eq('id', recordId)
    .eq('property_id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
