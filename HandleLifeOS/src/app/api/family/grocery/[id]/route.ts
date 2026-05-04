import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { toggleGroceryItem, deleteGroceryItem, clearBoughtItems, getFamilyMembership } from '@/lib/db/family-queries'

const toggleSchema = z.object({
  family_id: z.string().uuid(),
  is_bought: z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Special action: clear bought items from a list
  if (id === 'clear') {
    const body = await req.json()
    const parsed = z.object({ family_id: z.string().uuid(), list_id: z.string().uuid() }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    const membership = await getFamilyMembership(session.user.id, parsed.data.family_id)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    await clearBoughtItems(parsed.data.list_id)
    return NextResponse.json({ success: true })
  }

  const body = await req.json()
  const parsed = toggleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, parsed.data.family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const item = await toggleGroceryItem(id, parsed.data.is_bought, session.user.id)
  return NextResponse.json({ item })
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

  await deleteGroceryItem(id)
  return NextResponse.json({ success: true })
}
