import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { updateHabit, deleteHabit, getHabitLogs } from '@/lib/db/habit-queries'

const HABIT_COLORS = ['violet','indigo','blue','emerald','amber','rose','pink','purple','sky','teal'] as const
const HABIT_FREQS = ['daily','weekdays','weekends','custom','weekly'] as const

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  icon: z.string().max(40).optional(),
  color: z.enum(HABIT_COLORS).optional(),
  frequency: z.enum(HABIT_FREQS).optional(),
  days_of_week: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  target_per_day: z.number().int().min(1).max(50).optional(),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const logs = await getHabitLogs(id, session.user.id, 90)
  return NextResponse.json({ logs })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Map nullable reminder_time to undefined for DB
  const patchData: Record<string, unknown> = { ...parsed.data }
  const habit = await updateHabit(id, session.user.id, patchData)
  return NextResponse.json({ habit })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteHabit(id, session.user.id)
  return NextResponse.json({ ok: true })
}
