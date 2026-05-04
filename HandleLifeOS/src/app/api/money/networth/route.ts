import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getSavingsGoals, getBudget, getExpenseSummary } from '@/lib/db/money-queries'
import { getLiabilities } from '@/lib/db/liabilities-queries'
import type { NetWorthSnapshot } from '@/types/money'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [goals, liabilities, budget, expSummary] = await Promise.all([
    getSavingsGoals(session.user.id),
    getLiabilities(session.user.id),
    getBudget(session.user.id, month, year),
    getExpenseSummary(session.user.id, month, year),
  ])

  const totalSavings = goals.reduce((s, g) => s + Number(g.current_amount), 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.outstanding), 0)
  const monthlyIncome = Number(budget?.monthly_income ?? 0)
  const monthlyExpenses = Number(expSummary?.total ?? 0)
  const savingsTarget = Number(budget?.savings_target ?? 0)

  // Surplus = income − expenses − savings already committed to goals.
  // Previous version ignored savings_target and overstated free cash flow.
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses - savingsTarget)

  const snapshot: NetWorthSnapshot = {
    total_savings: totalSavings,
    total_liabilities: totalLiabilities,
    net_worth: totalSavings - totalLiabilities,
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    monthly_surplus: monthlySurplus,
    currency: budget?.currency ?? 'INR',
  }

  return NextResponse.json(snapshot)
}
