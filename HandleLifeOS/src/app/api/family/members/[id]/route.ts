import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getFamilyMembership, updateMemberRole, removeMember, getFamilyMembers } from '@/lib/db/family-queries'
import { getSupabaseAdmin } from '@/lib/db/client'

const ROLES = ['owner', 'partner', 'adult', 'teen', 'child', 'elder'] as const

const patchSchema = z.object({
  family_id: z.string().uuid(),
  role: z.enum(ROLES),
})

async function getMemberFamilyId(memberId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from('family_members')
    .select('family_id')
    .eq('id', memberId)
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

  const membership = await getFamilyMembership(session.user.id, parsed.data.family_id)
  if (!membership || !['owner', 'partner'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const updated = await updateMemberRole(id, parsed.data.role)
  return NextResponse.json({ member: updated })
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
  if (!membership || !['owner', 'partner'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  await removeMember(id)
  return NextResponse.json({ success: true })
}
