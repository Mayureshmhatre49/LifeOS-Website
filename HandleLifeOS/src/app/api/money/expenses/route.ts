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
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  is_recurring: z.boolean().optional(),
})

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse({
    month: searchParams.get('month') ?? String(new Date().getMonth() + 1),
    year: searchParams.get('year') ?? String(new Date().getFullYear()),
  })
  if (!parsed.success) return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 })

  const expenses = await getExpenses(session.user.id, parsed.data.month, parsed.data.year)
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
