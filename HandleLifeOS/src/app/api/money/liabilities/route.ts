import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getLiabilities, createLiability } from '@/lib/db/liabilities-queries'

const CreateSchema = z.object({
  name:          z.string().min(1),
  type:          z.enum(['home_loan', 'car_loan', 'personal_loan', 'credit_card', 'education_loan', 'business_loan', 'other']).optional(),
  principal:     z.number().positive(),
  outstanding:   z.number().min(0),
  emi:           z.number().positive().optional(),
  interest_rate: z.number().min(0).optional(),
  due_day:       z.number().int().min(1).max(31).optional(),
  start_date:    z.string().optional(),
  end_date:      z.string().optional(),
  lender:        z.string().optional(),
  notes:         z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await getLiabilities(session.user.id)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = await createLiability(session.user.id, parsed.data)
  return NextResponse.json(data, { status: 201 })
}
