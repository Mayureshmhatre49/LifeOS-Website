import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { updateExpense, deleteExpense } from '@/lib/db/money-queries'

const expenseCategories = [
  'food', 'rent', 'travel', 'bills', 'shopping',
  'health', 'kids', 'entertainment', 'education', 'misc',
] as const

const patchSchema = z.object({
  category: z.enum(expenseCategories).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(200).optional(),
  expense_date: z.string().optional(),
  is_recurring: z.boolean().optional(),
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

  const expense = await updateExpense(session.user.id, id, parsed.data)
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ expense })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteExpense(session.user.id, id)
  return NextResponse.json({ success: true })
}
