import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getTasks, getPlannerPreferences, bulkUpdateTaskScores } from '@/lib/db/planner-queries'
import { extractTasksFromText, prioritizeTasks, generateDayPlan } from '@/lib/planner-ai'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import { z } from 'zod'

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('extract'), text: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('prioritize') }),
  z.object({ action: z.literal('day_plan') }),
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
  const [prefs, memCtx] = await Promise.all([
    getPlannerPreferences(userId),
    isSupabaseConfigured() ? buildMemoryContext(userId) : null,
  ])
  const userContext = memCtx ? formatMemoryForPrompt(memCtx) : undefined

  if (parsed.data.action === 'extract') {
    const plan = await extractTasksFromText(parsed.data.text, prefs)
    return NextResponse.json(plan)
  }

  if (parsed.data.action === 'prioritize') {
    const tasks = await getTasks(userId, { status: 'todo' })
    const inProgress = await getTasks(userId, { status: 'in_progress' })
    const allActive = [...tasks, ...inProgress]

    if (!allActive.length) return NextResponse.json([])

    const scores = await prioritizeTasks(allActive, prefs, userContext ?? undefined)
    await bulkUpdateTaskScores(userId, scores)
    return NextResponse.json(scores)
  }

  if (parsed.data.action === 'day_plan') {
    const [todo, inProgress] = await Promise.all([
      getTasks(userId, { status: 'todo' }),
      getTasks(userId, { status: 'in_progress' }),
    ])
    const plan = await generateDayPlan([...inProgress, ...todo], prefs, userContext ?? undefined)
    return NextResponse.json(plan)
  }
}
