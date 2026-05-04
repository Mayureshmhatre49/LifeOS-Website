import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import {
  createCompanionSession, getCompanionSessions, deleteCompanionSession,
} from '@/lib/db/companion-queries'
import { getMindAccess } from '@/lib/mind/premium-gate'

const createSchema = z.object({
  mode: z.enum(['calm_friend', 'therapist', 'founder', 'relationship', 'sleep']),
  title: z.string().max(120).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [sessions, access] = await Promise.all([
    getCompanionSessions(session.user.id),
    getMindAccess(session.user.id),
  ])
  return NextResponse.json({ sessions, access })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const created = await createCompanionSession({
    user_id: session.user.id,
    ...parsed.data,
  })
  return NextResponse.json({ session: created }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await deleteCompanionSession(id, session.user.id)
  return NextResponse.json({ ok: true })
}
