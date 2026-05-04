import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getFamilyMembers, getFamilyMembership, inviteMember } from '@/lib/db/family-queries'

const ROLES = ['owner', 'partner', 'adult', 'teen', 'child', 'elder'] as const

const inviteSchema = z.object({
  family_id: z.string().uuid(),
  invited_email: z.string().email(),
  role: z.enum(ROLES).optional(),
  display_name: z.string().max(60).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const members = await getFamilyMembers(familyId)
  return NextResponse.json({ members })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { family_id, ...input } = parsed.data
  const membership = await getFamilyMembership(session.user.id, family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  if (!['owner', 'partner'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const member = await inviteMember(family_id, session.user.id, input)
  if (!member) return NextResponse.json({ error: 'Already a member or invite exists' }, { status: 409 })
  return NextResponse.json({ member }, { status: 201 })
}
