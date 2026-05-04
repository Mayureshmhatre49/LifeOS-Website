import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getTransactions, createTransaction } from '@/lib/db/transactions-queries'

const CreateSchema = z.object({
  amount:       z.number().positive(),
  type:         z.enum(['income', 'expense', 'transfer']),
  category:     z.string().min(1),
  subcategory:  z.string().optional(),
  merchant:     z.string().optional(),
  payment_mode: z.enum(['cash', 'upi', 'card', 'netbanking', 'wallet', 'cheque', 'other']).optional(),
  txn_date:     z.string().optional(),
  notes:        z.string().optional(),
  metadata:     z.record(z.string(), z.unknown()).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined
  const year  = searchParams.get('year')  ? Number(searchParams.get('year'))  : undefined
  const type  = searchParams.get('type') as 'income' | 'expense' | 'transfer' | undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

  const data = await getTransactions(session.user.id, { month, year, type, limit })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = await createTransaction(session.user.id, parsed.data)
  return NextResponse.json(data, { status: 201 })
}
