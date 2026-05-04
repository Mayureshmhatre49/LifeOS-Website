import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { decomposeTask, getBodyDoubleMessage, suggestTasksForEnergy } from '@/lib/focus-ai'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { getTasks } from '@/lib/db/planner-queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { z } from 'zod'

const requestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('decompose'),
    task_title: z.string().min(1).max(200),
    notes: z.string().max(1000).optional(),
    estimated_minutes: z.number().int().min(1).max(480).optional(),
  }),
  z.object({
    action: z.literal('body_double'),
    type: z.enum(['start', 'checkin', 'complete', 'restart']),
    task_title: z.string().min(1).max(200),
    minutes_elapsed: z.number().int().min(0).optional(),
    minutes_remaining: z.number().int().min(0).optional(),
  }),
  z.object({
    action: z.literal('energy_suggest'),
    energy: z.enum(['low', 'normal', 'high']),
  }),
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const userId = session.user.id

  if (parsed.data.action === 'decompose') {
    const steps = await decomposeTask(
      parsed.data.task_title,
      parsed.data.notes,
      parsed.data.estimated_minutes
    )
    return NextResponse.json(steps)
  }

  if (parsed.data.action === 'body_double') {
    let userContext: string | undefined
    if (isSupabaseConfigured()) {
      const memCtx = await buildMemoryContext(userId)
      userContext = formatMemoryForPrompt(memCtx) || undefined
    }
    const message = await getBodyDoubleMessage(
      parsed.data.type,
      parsed.data.task_title,
      parsed.data.minutes_elapsed,
      parsed.data.minutes_remaining,
      userContext
    )
    return NextResponse.json(message)
  }

  if (parsed.data.action === 'energy_suggest') {
    const [todo, inProgress] = await Promise.all([
      getTasks(userId, { status: 'todo' }),
      getTasks(userId, { status: 'in_progress' }),
    ])
    const tasks = [...inProgress, ...todo].map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      estimated_minutes: t.estimated_minutes,
    }))

    let userContext: string | undefined
    if (isSupabaseConfigured()) {
      const memCtx = await buildMemoryContext(userId)
      userContext = formatMemoryForPrompt(memCtx) || undefined
    }

    const suggestions = await suggestTasksForEnergy(tasks, parsed.data.energy, userContext)
    return NextResponse.json(suggestions)
  }
}
