import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getChildProfiles, createChildProfile, getFamilyMembership } from '@/lib/db/family-queries'

const createSchema = z.object({
  family_id: z.string().uuid(),
  full_name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(17).optional(),
  school_name: z.string().max(150).optional(),
  class_grade: z.string().max(50).optional(),
  notes: z.string().max(300).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const children = await getChildProfiles(familyId)
  return NextResponse.json({ children })
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

  const child = await createChildProfile(family_id, session.user.id, input)
  return NextResponse.json({ child }, { status: 201 })
}
