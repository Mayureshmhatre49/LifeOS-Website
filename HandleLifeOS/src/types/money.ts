export type ExpenseCategory =
  | 'food' | 'rent' | 'travel' | 'bills' | 'shopping'
  | 'health' | 'kids' | 'entertainment' | 'education' | 'misc'

export type BillingCycle = 'monthly' | 'quarterly' | 'annual' | 'weekly'

export type SavingsCategory =
  | 'emergency_fund' | 'travel' | 'home' | 'education'
  | 'vehicle' | 'gadget' | 'retirement' | 'other'

export type MoneyInsightType =
  | 'spending' | 'affordability' | 'savings' | 'loan' | 'bill' | 'calm' | 'subscriptions'

export interface Budget {
  id: string
  user_id: string
  month: number
  year: number
  monthly_income: number
  savings_target: number
  currency: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category: ExpenseCategory
  amount: number
  currency: string
  description?: string
  expense_date: string
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  title: string
  category: SavingsCategory
  target_amount: number
  current_amount: number
  currency: string
  target_date?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface MoneySubscription {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: BillingCycle
  category?: string
  is_active: boolean
  next_billing_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LoanScenario {
  id: string
  user_id: string
  name: string
  principal: number
  annual_rate: number
  tenure_months: number
  emi_amount?: number
  total_interest?: number
  total_cost?: number
  currency: string
  notes?: string
  created_at: string
}

export interface MoneyInsight {
  id: string
  user_id: string
  insight_type: MoneyInsightType
  content: string
  metadata?: Record<string, unknown>
  created_at: string
}

// Input types
export interface CreateBudgetInput {
  month: number
  year: number
  monthly_income: number
  savings_target: number
  currency?: string
  notes?: string
}

export interface CreateExpenseInput {
  category: ExpenseCategory
  amount: number
  currency?: string
  description?: string
  expense_date?: string
  is_recurring?: boolean
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory
  amount?: number
  description?: string
  expense_date?: string
  is_recurring?: boolean
}

export interface CreateSavingsGoalInput {
  title: string
  category?: SavingsCategory
  target_amount: number
  current_amount?: number
  currency?: string
  target_date?: string
}

export interface UpdateSavingsGoalInput {
  title?: string
  target_amount?: number
  current_amount?: number
  target_date?: string
  is_completed?: boolean
}

export interface CreateSubscriptionInput {
  name: string
  amount: number
  currency?: string
  billing_cycle?: BillingCycle
  category?: string
  is_active?: boolean
  next_billing_date?: string
  notes?: string
}

export interface CreateLoanInput {
  name: string
  principal: number
  annual_rate: number
  tenure_months: number
  currency?: string
  notes?: string
}

// Computed/aggregate types
export interface ExpenseSummary {
  total: number
  by_category: Record<ExpenseCategory, number>
  currency: string
  month: number
  year: number
}

export interface MonthlySnapshot {
  budget: Budget | null
  total_expenses: number
  money_left: number
  savings_progress: number
  biggest_category: ExpenseCategory | null
  expense_summary: ExpenseSummary | null
}

// AI result types
export interface SpendingInsightResult {
  summary: string
  highlights: string[]
  suggestions: string[]
  disclaimer: string
}

export interface AffordabilityResult {
  verdict: 'yes' | 'stretch' | 'no' | 'needs_context'
  reasoning: string
  monthly_impact: string
  alternatives: string[]
  disclaimer: string
}

export interface SavingsSuggestionResult {
  monthly_savings_suggestion: number
  emergency_fund_target: number
  next_steps: string[]
  motivational_note: string
  disclaimer: string
}

export interface LoanComparisonResult {
  recommendation: string
  loan_a_summary: string
  loan_b_summary: string
  key_differences: string[]
  disclaimer: string
}

export interface BillExplainerResult {
  plain_language: string
  key_charges: { label: string; amount: string }[]
  red_flags: string[]
  questions_to_ask: string[]
  disclaimer: string
}

export interface FinancialCalmResult {
  acknowledgment: string
  immediate_steps: string[]
  priority_order: string[]
  calming_note: string
  disclaimer: string
}

export interface SubscriptionOptimizationResult {
  monthly_total: number
  annual_total: number
  potential_savings: number
  waste_flags: { name: string; reason: string }[]
  suggestions: string[]
  disclaimer: string
}

// Discriminated union for AI endpoint
export type MoneyAIAction =
  | { action: 'spending_insight'; month: number; year: number }
  | { action: 'affordability'; question: string }
  | { action: 'savings_suggestion' }
  | { action: 'compare_loans'; loan_a: CreateLoanInput; loan_b: CreateLoanInput }
  | { action: 'explain_bill'; bill_text: string }
  | { action: 'financial_calm'; message: string }
  | { action: 'optimize_subscriptions' }

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  rent: 'Rent & Housing',
  travel: 'Travel & Transport',
  bills: 'Bills & Utilities',
  shopping: 'Shopping',
  health: 'Health & Medical',
  kids: 'Kids & Family',
  entertainment: 'Entertainment',
  education: 'Education',
  misc: 'Miscellaneous',
}

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#f97316',
  rent: '#6366f1',
  travel: '#0ea5e9',
  bills: '#eab308',
  shopping: '#ec4899',
  health: '#22c55e',
  kids: '#a855f7',
  entertainment: '#f43f5e',
  education: '#14b8a6',
  misc: '#94a3b8',
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  weekly: 0.25,
  monthly: 1,
  quarterly: 3,
  annual: 12,
}

// ── Phase 14: Money OS Advanced ───────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer'
export type PaymentMode = 'cash' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cheque' | 'other'
export type LiabilityType =
  | 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card'
  | 'education_loan' | 'business_loan' | 'other'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category: string
  subcategory?: string
  merchant?: string
  payment_mode?: PaymentMode
  txn_date: string
  notes?: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface Liability {
  id: string
  user_id: string
  name: string
  type: LiabilityType
  principal: number
  outstanding: number
  emi?: number
  interest_rate?: number
  due_day?: number
  start_date?: string
  end_date?: string
  lender?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CategoryBudget {
  id: string
  user_id: string
  category: string
  monthly_limit: number
  created_at: string
  updated_at: string
}

export interface CreateTransactionInput {
  amount: number
  type: TransactionType
  category: string
  subcategory?: string
  merchant?: string
  payment_mode?: PaymentMode
  txn_date?: string
  notes?: string
  metadata?: Record<string, unknown>
}

export interface CreateLiabilityInput {
  name: string
  type?: LiabilityType
  principal: number
  outstanding: number
  emi?: number
  interest_rate?: number
  due_day?: number
  start_date?: string
  end_date?: string
  lender?: string
  notes?: string
}

export interface UpdateLiabilityInput {
  name?: string
  outstanding?: number
  emi?: number
  interest_rate?: number
  due_day?: number
  lender?: string
  notes?: string
}

export interface CreateCategoryBudgetInput {
  category: string
  monthly_limit: number
}

// Computed net worth snapshot
export interface NetWorthSnapshot {
  total_savings: number
  total_liabilities: number
  net_worth: number
  monthly_income: number
  monthly_expenses: number
  monthly_surplus: number
  currency: string
}

// Smart alert types
export type AlertSeverity = 'info' | 'warning' | 'danger'
export interface SmartAlert {
  id: string
  severity: AlertSeverity
  title: string
  body: string
  href?: string
  icon: string
}

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  home_loan:      'Home Loan',
  car_loan:       'Car / Vehicle Loan',
  personal_loan:  'Personal Loan',
  credit_card:    'Credit Card',
  education_loan: 'Education Loan',
  business_loan:  'Business Loan',
  other:          'Other',
}

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash:       'Cash',
  upi:        'UPI',
  card:       'Card',
  netbanking: 'Net Banking',
  wallet:     'Wallet',
  cheque:     'Cheque',
  other:      'Other',
}

export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salary:     'Salary',
  freelance:  'Freelance',
  rental:     'Rental Income',
  investment: 'Investment Returns',
  business:   'Business Income',
  gift:       'Gift / Bonus',
  other:      'Other Income',
}
