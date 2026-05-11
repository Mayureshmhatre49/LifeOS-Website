import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getBudget, getExpenseSummary, getSavingsGoals, getSubscriptions } from '@/lib/db/money-queries'
import { getLiabilities } from '@/lib/db/liabilities-queries'
import { generateSmartAlerts } from '@/lib/money/generateInsights'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import { NetWorthCard } from '@/components/money/NetWorthCard'
import { CashflowChart } from '@/components/money/CashflowChart'
import { InsightPanel } from '@/components/money/InsightPanel'
import { MoneyHome } from '@/components/money/money-home'
import { Wallet, Plus } from 'lucide-react'
import { AddTransactionButton } from '@/components/money/AddTransactionButton'

export const metadata: Metadata = {
  title: 'Money OS — HandleLife',
  description: 'Your AI-powered personal finance operating system.',
}

export default async function MoneyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [budget, expSummary, goals, subscriptions, liabilities] = await Promise.all([
    getBudget(session.user.id, month, year),
    getExpenseSummary(session.user.id, month, year),
    getSavingsGoals(session.user.id),
    getSubscriptions(session.user.id),
    getLiabilities(session.user.id),
  ])

  const alerts = generateSmartAlerts({
    budget,
    expenseSummary: expSummary,
    liabilities,
    goals,
    subscriptions,
    month,
    year,
    currency: budget?.currency ?? 'USD',
  })

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Money OS</h1>
            <p className="text-xs text-gray-400">Your AI financial operating system</p>
          </div>
        </div>
        <AddTransactionButton />
      </div>

      {/* Sub-nav */}
      <MoneyNavBar />

      {/* Net Worth */}
      <NetWorthCard />

      {/* Cash Flow Chart */}
      <CashflowChart />

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Smart Alerts</p>
          <InsightPanel alerts={alerts} />
        </div>
      )}

      {/* Existing MoneyHome — keeps all existing functionality */}
      <MoneyHome />
    </div>
  )
}
