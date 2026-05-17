import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const INCOME_CATS  = ['rent','lease_premium','deposit_received','sale_proceeds','other_income'] as const
const EXPENSE_CATS = ['maintenance_cost','renovation','property_tax','society_charges','insurance_premium','loan_emi','utility','legal_fees','brokerage','registration_charges','other_expense'] as const
const ALL_CATS     = [...INCOME_CATS, ...EXPENSE_CATS] as readonly string[]

async function assertPropertyOwner(propertyId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await getSupabaseAdmin()
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ transactions: [], income: 0, expense: 0, net: 0 })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await getSupabaseAdmin()
    .from('property_transactions')
    .select('*')
    .eq('property_id', id)
    .eq('user_id', session.user.id)
    .order('transaction_date', { ascending: false })

  const transactions = data ?? []
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return NextResponse.json({ transactions, income, expense, net: income - expense })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { type, category, amount, description, transaction_date, notes } = body

  if (!['income','expense'].includes(type))
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  if (!ALL_CATS.includes(category))
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  if (!amount || typeof amount !== 'number' || amount <= 0)
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  if (transaction_date && !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date))
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('property_transactions')
    .insert(stripServerFields({
      user_id: session.user.id,
      property_id: id,
      type,
      category,
      amount,
      description: description ? String(description).slice(0, 500) : null,
      transaction_date: transaction_date || new Date().toISOString().slice(0, 10),
      notes: notes ? String(notes).slice(0, 2000) : null,
    }))
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ transaction: data }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const txnId = new URL(req.url).searchParams.get('txnId')
  if (!txnId) return NextResponse.json({ error: 'Missing txnId' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('property_transactions')
    .delete()
    .eq('id', txnId)
    .eq('property_id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
