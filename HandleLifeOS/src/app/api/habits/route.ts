import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getHabitsWithStats, createHabit } from '@/lib/db/habit-queries'

const HABIT_COLORS = ['violet','indigo','blue','emerald','amber','rose','pink','purple','sky','teal'] as const
const HABIT_FREQS = ['daily','weekdays','weekends','custom','weekly'] as const

const createSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(40).optional(),
  color: z.enum(HABIT_COLORS).optional(),
  frequency: z.enum(HABIT_FREQS).optional(),
  days_of_week: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  target_per_day: z.number().int().min(1).max(50).optional(),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const habits = await getHabitsWithStats(session.user.id)
  return NextResponse.json({ habits })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const habit = await createHabit({ user_id: session.user.id, ...parsed.data })
  return NextResponse.json({ habit }, { status: 201 })
}
