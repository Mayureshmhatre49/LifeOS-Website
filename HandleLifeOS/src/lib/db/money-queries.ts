import { getSupabaseAdmin } from './client'
import type {
  Budget,
  Expense,
  SavingsGoal,
  MoneySubscription,
  LoanScenario,
  CreateBudgetInput,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateSubscriptionInput,
  CreateLoanInput,
  ExpenseSummary,
  ExpenseCategory,
} from '@/types/money'

async function withUser(userId: string) {
  const supabase = getSupabaseAdmin()
  await supabase.rpc('set_app_user_id', { uid: userId })
  return supabase
}

// ── Budget ────────────────────────────────────────────────────────────────────

export async function getBudget(userId: string, month: number, year: number): Promise<Budget | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()
  return data
}

export async function upsertBudget(userId: string, input: CreateBudgetInput): Promise<Budget | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('budgets')
    .upsert({ user_id: userId, ...input }, { onConflict: 'user_id,month,year' })
    .select()
    .single()
  return data
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses(
  userId: string,
  month: number,
  year: number
): Promise<Expense[]> {
  const supabase = await withUser(userId)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0] // last day of month
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('expense_date', start)
    .lte('expense_date', end)
    .order('expense_date', { ascending: false })
  return data ?? []
}

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<Expense | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('expenses')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  return data
}

export async function updateExpense(
  userId: string,
  id: string,
  input: UpdateExpenseInput
): Promise<Expense | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  return data
}

export async function deleteExpense(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
}

export async function getExpenseSummary(
  userId: string,
  month: number,
  year: number
): Promise<ExpenseSummary> {
  const expenses = await getExpenses(userId, month, year)
  const by_category = {} as Record<ExpenseCategory, number>
  let total = 0
  for (const e of expenses) {
    total += e.amount
    by_category[e.category] = (by_category[e.category] ?? 0) + e.amount
  }
  return { total, by_category, currency: expenses[0]?.currency ?? 'USD', month, year }
}

// ── Savings Goals ─────────────────────────────────────────────────────────────

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createSavingsGoal(
  userId: string,
  input: CreateSavingsGoalInput
): Promise<SavingsGoal | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('savings_goals')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  return data
}

export async function updateSavingsGoal(
  userId: string,
  id: string,
  input: UpdateSavingsGoalInput
): Promise<SavingsGoal | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('savings_goals')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  return data
}

export async function deleteSavingsGoal(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', userId)
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getSubscriptions(userId: string): Promise<MoneySubscription[]> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('money_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('amount', { ascending: false })
  return data ?? []
}

export async function createSubscription(
  userId: string,
  input: CreateSubscriptionInput
): Promise<MoneySubscription | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('money_subscriptions')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  return data
}

export async function updateSubscription(
  userId: string,
  id: string,
  patch: Partial<CreateSubscriptionInput>
): Promise<MoneySubscription | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('money_subscriptions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  return data
}

export async function deleteSubscription(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('money_subscriptions').delete().eq('id', id).eq('user_id', userId)
}

// ── Loan Scenarios ────────────────────────────────────────────────────────────

export async function getLoanScenarios(userId: string): Promise<LoanScenario[]> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('loan_scenarios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function createLoanScenario(
  userId: string,
  input: CreateLoanInput & { emi_amount?: number; total_interest?: number; total_cost?: number }
): Promise<LoanScenario | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('loan_scenarios')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  return data
}

export async function deleteLoanScenario(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('loan_scenarios').delete().eq('id', id).eq('user_id', userId)
}
