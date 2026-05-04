import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { updateSubscription, deleteSubscription } from '@/lib/db/money-queries'

const billingCycles = ['monthly', 'quarterly', 'annual', 'weekly'] as const

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  billing_cycle: z.enum(billingCycles).optional(),
  category: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  next_billing_date: z.string().optional(),
  notes: z.string().max(200).optional(),
})

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

  const subscription = await updateSubscription(session.user.id, id, parsed.data)
  if (!subscription) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ subscription })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteSubscription(session.user.id, id)
  return NextResponse.json({ success: true })
}
