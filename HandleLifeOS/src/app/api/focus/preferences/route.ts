import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getFocusPreferences, upsertFocusPreferences } from '@/lib/db/focus-queries'
import { z } from 'zod'

const prefsSchema = z.object({
  default_mode: z.enum(['quick', 'pomodoro', 'deep', 'custom']).optional(),
  break_interval_minutes: z.number().int().min(1).max(30).optional(),
  long_break_minutes: z.number().int().min(5).max(60).optional(),
  sessions_before_long_break: z.number().int().min(1).max(10).optional(),
  body_doubling_default: z.boolean().optional(),
  daily_focus_goal_minutes: z.number().int().min(15).max(720).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prefs = await getFocusPreferences(session.user.id)
  return NextResponse.json(prefs)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = prefsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const prefs = await upsertFocusPreferences(session.user.id, parsed.data)
  return NextResponse.json(prefs)
}
