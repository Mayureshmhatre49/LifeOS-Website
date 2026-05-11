import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ goals: [], skills: [], resources: [] })

  const db = getSupabaseAdmin()
  const [goals, skills, resources] = await Promise.all([
    db.from('career_goals').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
    db.from('skills_tracked').select('*').eq('user_id', session.user.id).eq('is_active', true).order('updated_at', { ascending: false }),
    db.from('learning_resources').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
  ])
  return NextResponse.json({
    goals: goals.data ?? [],
    skills: skills.data ?? [],
    resources: resources.data ?? [],
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body
  const safe = stripServerFields(payload)
  const db = getSupabaseAdmin()

  const tableMap: Record<string, string> = { goal: 'career_goals', skill: 'skills_tracked', resource: 'learning_resources' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const { data, error } = await db.from(table).insert({ ...safe, user_id: session.user.id }).select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  const responseKey = kind === 'goal' ? 'goal' : kind === 'skill' ? 'skill' : 'resource'
  return NextResponse.json({ [responseKey]: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, id, ...patch } = body
  if (!kind || !id) return NextResponse.json({ error: 'Missing kind or id' }, { status: 400 })

  const tableMap: Record<string, string> = { goal: 'career_goals', skill: 'skills_tracked', resource: 'learning_resources' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

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
  const tableMap: Record<string, string> = { goal: 'career_goals', skill: 'skills_tracked', resource: 'learning_resources' }
  const table = tableMap[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from(table).delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
