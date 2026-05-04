import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { toggleHabitLog } from '@/lib/db/habit-queries'

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const date = parsed.data.date ?? new Date().toISOString().slice(0, 10)

  // Look up target_per_day
  const db = getSupabaseAdmin()
  const { data: habit } = await db
    .from('habits')
    .select('target_per_day')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await toggleHabitLog(id, session.user.id, date, habit.target_per_day)
  return NextResponse.json(result)
}
