import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createFocusSession, getRecentSessions } from '@/lib/db/focus-queries'
import { z } from 'zod'

const createSchema = z.object({
  task_id: z.string().uuid().optional(),
  task_title: z.string().min(1).max(200).trim().optional(),
  mode: z.enum(['quick', 'pomodoro', 'deep', 'custom']),
  planned_minutes: z.number().int().min(1).max(300),
  body_doubling_enabled: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await getRecentSessions(session.user.id, 20)
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const focusSession = await createFocusSession(session.user.id, parsed.data)
  return NextResponse.json(focusSession, { status: 201 })
}
