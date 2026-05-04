import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import {
  getOrCreateActiveList,
  getGroceryItems,
  addGroceryItem,
  getFamilyMembership,
} from '@/lib/db/family-queries'

const addSchema = z.object({
  family_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const familyId = req.nextUrl.searchParams.get('family_id')
  if (!familyId) return NextResponse.json({ error: 'family_id required' }, { status: 400 })

  const membership = await getFamilyMembership(session.user.id, familyId)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const list = await getOrCreateActiveList(familyId, session.user.id)
  const items = await getGroceryItems(list.id)
  return NextResponse.json({ list, items })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { family_id, ...input } = parsed.data
  const membership = await getFamilyMembership(session.user.id, family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const list = await getOrCreateActiveList(family_id, session.user.id)
  const item = await addGroceryItem(list.id, family_id, session.user.id, input)
  return NextResponse.json({ item }, { status: 201 })
}
