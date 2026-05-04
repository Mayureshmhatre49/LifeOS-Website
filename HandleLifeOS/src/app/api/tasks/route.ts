import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getTasks, createTask } from '@/lib/db/planner-queries'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  notes: z.string().max(2000).trim().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'family', 'learning', 'errands', 'other']).optional(),
  estimated_minutes: z.number().int().min(1).max(480).optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'skipped']).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const due_date = searchParams.get('due_date') ?? undefined

  const tasks = await getTasks(session.user.id, { status, due_date })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const task = await createTask(session.user.id, parsed.data)
  return NextResponse.json(task, { status: 201 })
}
