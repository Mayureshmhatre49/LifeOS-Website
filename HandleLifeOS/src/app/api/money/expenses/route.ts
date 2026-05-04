import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getExpenses, createExpense } from '@/lib/db/money-queries'

const expenseCategories = [
  'food', 'rent', 'travel', 'bills', 'shopping',
  'health', 'kids', 'entertainment', 'education', 'misc',
] as const

const createSchema = z.object({
  category: z.enum(expenseCategories).default('misc'),
  amount: z.number().positive(),
  currency: z.string().max(10).optional(),
  description: z.string().max(200).optional(),
  expense_date: z.string().optional(),
  is_recurring: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

  const expenses = await getExpenses(session.user.id, month, year)
  return NextResponse.json({ expenses })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const expense = await createExpense(session.user.id, parsed.data)
  return NextResponse.json({ expense }, { status: 201 })
}
