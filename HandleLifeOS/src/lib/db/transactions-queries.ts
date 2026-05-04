import { getSupabaseAdmin } from './client'
import type {
  Transaction,
  CreateTransactionInput,
  TransactionType,
} from '@/types/money'

async function withUser(userId: string) {
  const supabase = getSupabaseAdmin()
  await supabase.rpc('set_app_user_id', { uid: userId })
  return supabase
}

export async function getTransactions(
  userId: string,
  opts: { month?: number; year?: number; type?: TransactionType; limit?: number } = {}
): Promise<Transaction[]> {
  const supabase = await withUser(userId)
  let q = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('txn_date', { ascending: false })

  if (opts.month !== undefined && opts.year !== undefined) {
    const start = `${opts.year}-${String(opts.month).padStart(2, '0')}-01`
    const end = new Date(opts.year, opts.month, 0).toISOString().split('T')[0]
    q = q.gte('txn_date', start).lte('txn_date', end)
  }
  if (opts.type) q = q.eq('type', opts.type)
  if (opts.limit) q = q.limit(opts.limit)

  const { data } = await q
  return data ?? []
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<Transaction | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      ...input,
      txn_date: input.txn_date ?? new Date().toISOString().split('T')[0],
      metadata: input.metadata ?? {},
    })
    .select()
    .single()
  return data
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
}

// Monthly income total from transactions
export async function getMonthlyIncome(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const supabase = await withUser(userId)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]
  const { data } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('txn_date', start)
    .lte('txn_date', end)
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0)
}

// Category breakdown for expense transactions in a month
export async function getTransactionCategoryBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<Record<string, number>> {
  const supabase = await withUser(userId)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]
  const { data } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('txn_date', start)
    .lte('txn_date', end)

  const breakdown: Record<string, number> = {}
  for (const row of data ?? []) {
    breakdown[row.category] = (breakdown[row.category] ?? 0) + Number(row.amount)
  }
  return breakdown
}

// Last N months totals for cashflow chart
export async function getCashflowTrend(
  userId: string,
  months = 6
): Promise<Array<{ month: string; income: number; expenses: number; savings: number }>> {
  const supabase = await withUser(userId)
  const now = new Date()
  const results: Array<{ month: string; income: number; expenses: number; savings: number }> = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const yr = d.getFullYear()
    const mo = d.getMonth() + 1
    const start = `${yr}-${String(mo).padStart(2, '0')}-01`
    const end = new Date(yr, mo, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('txn_date', start)
      .lte('txn_date', end)

    const income   = (data ?? []).filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
    const expenses = (data ?? []).filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
    results.push({
      month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      income,
      expenses,
      savings: Math.max(0, income - expenses),
    })
  }
  return results
}
