import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getLoanScenarios, createLoanScenario, deleteLoanScenario } from '@/lib/db/money-queries'
import { calculateLoanTotals } from '@/lib/money-ai'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  principal: z.number().positive(),
  annual_rate: z.number().min(0).max(100),
  tenure_months: z.number().int().positive(),
  currency: z.string().max(10).optional(),
  notes: z.string().max(200).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const scenarios = await getLoanScenarios(session.user.id)
  return NextResponse.json({ scenarios })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { emi, totalInterest, totalCost } = calculateLoanTotals(
    parsed.data.principal,
    parsed.data.annual_rate,
    parsed.data.tenure_months
  )

  const scenario = await createLoanScenario(session.user.id, {
    ...parsed.data,
    emi_amount: emi,
    total_interest: totalInterest,
    total_cost: totalCost,
  })
  return NextResponse.json({ scenario }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await deleteLoanScenario(session.user.id, id)
  return NextResponse.json({ success: true })
}
