import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getBudget, getExpenses, getExpenseSummary, getSavingsGoals } from '@/lib/db/money-queries'
import { getLiabilities } from '@/lib/db/liabilities-queries'
import { detectLeaks } from '@/lib/money/generateInsights'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from '@/types/money'
import { Receipt, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${Math.round(n)}`
}

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const [budget, expSummary, goals, liabilities, expenses, prevExpenses] = await Promise.all([
    getBudget(session.user.id, month, year),
    getExpenseSummary(session.user.id, month, year),
    getSavingsGoals(session.user.id),
    getLiabilities(session.user.id),
    getExpenses(session.user.id, month, year),
    getExpenses(session.user.id, prevMonth, prevYear),
  ])

  const leaks = detectLeaks(expenses, prevExpenses)

  const income   = budget?.monthly_income ?? 0
  const savings  = budget?.savings_target ?? 0
  const spent    = expSummary?.total ?? 0
  const surplus  = income - spent
  const savingRate = income > 0 ? Math.round((Math.max(0, surplus) / income) * 100) : 0
  const totalLiabilities = liabilities.reduce((s, l) => s + l.outstanding, 0)
  const totalGoalsSaved  = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalGoalsTarget = goals.filter(g => !g.is_completed).reduce((s, g) => s + g.target_amount, 0)
  const debtToIncome = income > 0 && totalLiabilities > 0
    ? Math.round((totalLiabilities / (income * 12)) * 100) : 0

  const categoryEntries = Object.entries(expSummary?.by_category ?? {})
    .filter(([, v]) => (v as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
  const maxCat = categoryEntries[0]?.[1] as number ?? 1

  const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
          <Receipt className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-400">{monthName}</p>
        </div>
      </div>

      <MoneyNavBar />

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Saving Rate', value: `${savingRate}%`, sub: savingRate >= 20 ? 'Excellent' : savingRate >= 10 ? 'Good' : 'Needs work', good: savingRate >= 20, icon: TrendingUp },
          { label: 'Surplus', value: fmt(Math.max(0, surplus)), sub: surplus < 0 ? 'Overspent!' : 'Available', good: surplus >= 0, icon: surplus >= 0 ? TrendingUp : TrendingDown },
          { label: 'Debt/Income', value: `${debtToIncome}%`, sub: debtToIncome < 36 ? 'Healthy' : 'High debt', good: debtToIncome < 36, icon: debtToIncome < 36 ? TrendingUp : TrendingDown },
          { label: 'Goals Progress', value: totalGoalsTarget > 0 ? `${Math.round((totalGoalsSaved / totalGoalsTarget) * 100)}%` : 'N/A', sub: `${goals.filter(g => !g.is_completed).length} active`, good: true, icon: TrendingUp },
        ].map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
                <Icon className={cn('h-3.5 w-3.5', m.good ? 'text-emerald-500' : 'text-rose-500')} />
              </div>
              <p className={cn('text-xl font-black', m.good ? 'text-gray-900' : 'text-rose-600')}>{m.value}</p>
              <p className={cn('text-[10px] mt-0.5', m.good ? 'text-gray-400' : 'text-rose-400')}>{m.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Category breakdown horizontal bars */}
      {categoryEntries.length > 0 && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Spending by Category</p>
          <div className="space-y-2.5">
            {categoryEntries.map(([cat, amount]) => {
              const barPct = Math.round(((amount as number) / (maxCat as number)) * 100)
              const color  = EXPENSE_CATEGORY_COLORS[cat as keyof typeof EXPENSE_CATEGORY_COLORS] ?? '#94a3b8'
              const label  = EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-700">{label}</span>
                    <span className="text-[11px] font-bold text-gray-600">{fmt(amount as number)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Spending leaks */}
      {leaks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spending Leaks Detected</p>
          </div>
          <div className="space-y-2">
            {leaks.map(leak => (
              <div key={leak.category} className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800 capitalize">{leak.category}</p>
                  <span className="text-xs font-black text-rose-600">+{leak.changePct}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmt(leak.thisMonth)} this month vs {fmt(leak.lastMonth)} last month
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Money Analysis</p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Get a personalised spending analysis, savings recommendation, or affordability check from your AI Money Coach.
        </p>
        <Link
          href="/chat?prompt=Analyze my finances this month and give me a savings plan"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" /> Ask AI Money Coach
        </Link>
      </div>
    </div>
  )
}
