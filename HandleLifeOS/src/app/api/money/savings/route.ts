import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getSavingsGoals, createSavingsGoal } from '@/lib/db/money-queries'

const savingsCategories = [
  'emergency_fund', 'travel', 'home', 'education',
  'vehicle', 'gadget', 'retirement', 'other',
] as const

const createSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.enum(savingsCategories).optional(),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).optional(),
  currency: z.string().max(10).optional(),
  target_date: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goals = await getSavingsGoals(session.user.id)
  return NextResponse.json({ goals })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const goal = await createSavingsGoal(session.user.id, parsed.data)
  return NextResponse.json({ goal }, { status: 201 })
}
