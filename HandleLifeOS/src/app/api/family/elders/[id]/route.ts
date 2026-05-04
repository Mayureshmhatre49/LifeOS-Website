import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteElderProfile, getFamilyMembership } from '@/lib/db/family-queries'
import { getSupabaseAdmin } from '@/lib/db/client'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify family membership via elder's family_id
  const { data } = await getSupabaseAdmin().from('elder_profiles').select('family_id').eq('id', id).maybeSingle()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const membership = await getFamilyMembership(session.user.id, data.family_id)
  if (!membership || !['owner', 'partner'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  await deleteElderProfile(id)
  return NextResponse.json({ success: true })
}
