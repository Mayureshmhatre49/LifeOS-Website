import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getFamilyEvents, createFamilyEvent, getFamilyMembership } from '@/lib/db/family-queries'

const EVENT_TYPES = ['appointment', 'school', 'birthday', 'travel', 'chore', 'reminder', 'other'] as const

const createSchema = z.object({
  family_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  event_type: z.enum(EVENT_TYPES).optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  all_day: z.boolean().optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const daysAhead = parseInt(req.nextUrl.searchParams.get('days') ?? '30')
  const events = await getFamilyEvents(familyId, daysAhead)
  return NextResponse.json({ events })
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

  const event = await createFamilyEvent(family_id, session.user.id, input)
  return NextResponse.json({ event }, { status: 201 })
}
