import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getSharedTasks, createSharedTask, getFamilyMembership } from '@/lib/db/family-queries'

const TASK_CATEGORIES = ['groceries', 'cleaning', 'repairs', 'school', 'health', 'errands', 'bills', 'cooking', 'childcare', 'misc'] as const

const createSchema = z.object({
  family_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  category: z.enum(TASK_CATEGORIES).optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const familyId = searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const tasks = await getSharedTasks(familyId, searchParams.get('status') ?? undefined)
  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { family_id, ...input } = parsed.data
  const membership = await getFamilyMembership(session.user.id, family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const task = await createSharedTask(family_id, session.user.id, input)
  return NextResponse.json({ task }, { status: 201 })
}
