import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { upsertSleepLog, getSleepLogs } from '@/lib/db/mind-queries'

const upsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bedtime: z.string().max(20).optional(),
  wake_time: z.string().max(20).optional(),
  duration_hours: z.number().min(0).max(24).optional(),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '14'), 30)
  const logs = await getSleepLogs(session.user.id, limit)
  return NextResponse.json({ logs })
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
  const log = await upsertSleepLog({
    user_id: session.user.id,
    date: parsed.data.date ?? today,
    ...parsed.data,
  })
  return NextResponse.json({ log }, { status: 201 })
}
