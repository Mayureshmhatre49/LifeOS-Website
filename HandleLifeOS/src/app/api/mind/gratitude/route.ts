import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import {
  upsertGratitudeEntry, getGratitudeEntries,
  getTodayGratitudeEntry, getGratitudeStreak,
} from '@/lib/db/mind-queries'

const upsertSchema = z.object({
  items: z.array(z.string().min(1).max(300)).min(1).max(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const todayOnly = searchParams.get('today') === 'true'

  if (todayOnly) {
    const [entry, streak] = await Promise.all([
      getTodayGratitudeEntry(session.user.id),
      getGratitudeStreak(session.user.id),
    ])
    return NextResponse.json({ entry, streak })
  }

  const [entries, streak] = await Promise.all([
    getGratitudeEntries(session.user.id),
    getGratitudeStreak(session.user.id),
  ])
  return NextResponse.json({ entries, streak })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const today = new Date().toISOString().split('T')[0]
  const entry = await upsertGratitudeEntry({
    user_id: session.user.id,
    items: parsed.data.items,
    date: parsed.data.date ?? today,
  })
  return NextResponse.json({ entry }, { status: 201 })
}
