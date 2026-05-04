import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { updateSharedTask, deleteSharedTask, getFamilyMembership } from '@/lib/db/family-queries'
import { getSupabaseAdmin } from '@/lib/db/client'

const TASK_CATEGORIES = ['groceries', 'cleaning', 'repairs', 'school', 'health', 'errands', 'bills', 'cooking', 'childcare', 'misc'] as const
const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

const patchSchema = z.object({
  family_id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  notes: z.string().max(500).optional(),
})

async function getTaskFamilyId(taskId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from('shared_tasks')
    .select('family_id')
    .eq('id', taskId)
    .maybeSingle()
  return data?.family_id ?? null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { family_id, ...input } = parsed.data
  const membership = await getFamilyMembership(session.user.id, family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const task = await updateSharedTask(id, input)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  await deleteSharedTask(id)
  return NextResponse.json({ success: true })
}
