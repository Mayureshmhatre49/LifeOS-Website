import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import {
  createCoachSession, getCoachSessions, deleteCoachSession,
} from '@/lib/db/aura-coach-queries'

const createSchema = z.object({
  mode: z.enum(['general', 'behaviour', 'school', 'medical', 'sleep']),
  child_id: z.string().uuid().nullable().optional(),
  title: z.string().max(120).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sessions = await getCoachSessions(session.user.id)
  return NextResponse.json({ sessions })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const created = await createCoachSession({ user_id: session.user.id, ...parsed.data })
  return NextResponse.json({ session: created }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await deleteCoachSession(id, session.user.id)
  return NextResponse.json({ ok: true })
}
