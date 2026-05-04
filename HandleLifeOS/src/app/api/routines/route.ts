import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getRoutines, createRoutine } from '@/lib/db/planner-queries'
import { z } from 'zod'

const stepSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().optional(),
  duration_minutes: z.number().int().min(1).optional(),
  order_index: z.number().int().min(0),
})

const createRoutineSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(['morning', 'evening', 'work', 'study', 'weekend', 'custom']).optional(),
  days_of_week: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimated_minutes: z.number().int().min(1).optional(),
  steps: z.array(stepSchema).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const routines = await getRoutines(session.user.id)
  return NextResponse.json(routines)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createRoutineSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const routine = await createRoutine(session.user.id, parsed.data)
  return NextResponse.json(routine, { status: 201 })
}
