import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateTask, deleteTask } from '@/lib/db/planner-queries'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  notes: z.string().max(2000).trim().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'family', 'learning', 'errands', 'other']).optional(),
  estimated_minutes: z.number().int().min(1).max(480).optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'skipped']).optional(),
  order_index: z.number().int().min(0).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const task = await updateTask(id, session.user.id, parsed.data)
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteTask(id, session.user.id)
  return NextResponse.json({ success: true })
}
