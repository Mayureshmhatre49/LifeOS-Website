import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updateLiability, deleteLiability } from '@/lib/db/liabilities-queries'

const PatchSchema = z.object({
  name:          z.string().optional(),
  outstanding:   z.number().min(0).optional(),
  emi:           z.number().positive().optional(),
  interest_rate: z.number().min(0).optional(),
  due_day:       z.number().int().min(1).max(31).optional(),
  lender:        z.string().optional(),
  notes:         z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = await updateLiability(session.user.id, id, parsed.data)
  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteLiability(session.user.id, id)
  return NextResponse.json({ success: true })
}
