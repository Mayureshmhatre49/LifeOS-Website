import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { updateFamilyEvent, deleteFamilyEvent, getFamilyMembership } from '@/lib/db/family-queries'

const EVENT_TYPES = ['appointment', 'school', 'birthday', 'travel', 'chore', 'reminder', 'other'] as const

const patchSchema = z.object({
  family_id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  event_type: z.enum(EVENT_TYPES).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().max(500).optional(),
})

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

  const event = await updateFamilyEvent(id, input)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ event })
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

  await deleteFamilyEvent(id)
  return NextResponse.json({ success: true })
}
