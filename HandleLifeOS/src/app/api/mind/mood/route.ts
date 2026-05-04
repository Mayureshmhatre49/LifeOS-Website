import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { createMoodLog, getMoodLogs, getTodayMoodLog } from '@/lib/db/mind-queries'

const createSchema = z.object({
  mood: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  emotions: z.array(z.string().max(30)).max(10).optional(),
  stress_categories: z.array(z.enum(['work', 'health', 'social', 'personal', 'environment'])).max(5).optional(),
  note: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
  const todayOnly = searchParams.get('today') === 'true'

  if (todayOnly) {
    const entry = await getTodayMoodLog(session.user.id)
    return NextResponse.json({ entry })
  }

  const logs = await getMoodLogs(session.user.id, days)
  return NextResponse.json({ logs })
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

  const log = await createMoodLog({ user_id: session.user.id, ...parsed.data })
  return NextResponse.json({ log }, { status: 201 })
}
