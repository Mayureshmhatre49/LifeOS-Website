import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getElderProfiles, createElderProfile, getFamilyMembership } from '@/lib/db/family-queries'

const createSchema = z.object({
  family_id: z.string().uuid(),
  full_name: z.string().min(1).max(100),
  medicines: z.array(z.string().max(100)).optional(),
  conditions: z.string().max(300).optional(),
  doctor_name: z.string().max(100).optional(),
  doctor_contact: z.string().max(100).optional(),
  emergency_contact: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const elders = await getElderProfiles(familyId)
  return NextResponse.json({ elders })
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

  const elder = await createElderProfile(family_id, session.user.id, input)
  return NextResponse.json({ elder }, { status: 201 })
}
