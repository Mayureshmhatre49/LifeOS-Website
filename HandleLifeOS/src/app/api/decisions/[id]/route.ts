import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { deleteDecision, toggleFavorite } from '@/lib/db/decision-queries'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await deleteDecision(id, session.user.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ favorite: z.boolean() }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  await toggleFavorite(id, session.user.id, parsed.data.favorite)
  return NextResponse.json({ success: true })
}
