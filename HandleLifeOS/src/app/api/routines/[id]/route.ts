import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateRoutine, deleteRoutine } from '@/lib/db/planner-queries'
import { z } from 'zod'

const stepSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().optional(),
  duration_minutes: z.number().int().min(1).optional(),
  order_index: z.number().int().min(0),
})

const updateRoutineSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(['morning', 'evening', 'work', 'study', 'weekend', 'custom']).optional(),
  days_of_week: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimated_minutes: z.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
  steps: z.array(stepSchema).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateRoutineSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const routine = await updateRoutine(id, session.user.id, parsed.data)
    return NextResponse.json(routine)
  } catch {
    return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteRoutine(id, session.user.id)
  return NextResponse.json({ success: true })
}
