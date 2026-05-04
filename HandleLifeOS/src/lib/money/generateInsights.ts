import type { SmartAlert, Expense, SavingsGoal, MoneySubscription, Liability } from '@/types/money'
import type { ExpenseSummary } from '@/types/money'

interface InsightInput {
  budget: { monthly_income: number; savings_target: number } | null
  expenseSummary: ExpenseSummary | null
  liabilities: Liability[]
  goals: SavingsGoal[]
  subscriptions: MoneySubscription[]
  month: number
  year: number
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

function daysUntil(day: number): number {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), day)
  if (target <= now) target.setMonth(target.getMonth() + 1)
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}

export function generateSmartAlerts(input: InsightInput): SmartAlert[] {
  const alerts: SmartAlert[] = []
  const { budget, expenseSummary, liabilities, goals, subscriptions } = input

  // ── Budget alerts ──────────────────────────────────────────────────────────
  if (budget && expenseSummary) {
    const usable = budget.monthly_income - budget.savings_target
    const spent = expenseSummary.total
    const spentPct = pct(spent, usable)

    if (spentPct >= 90) {
      alerts.push({
        id: 'budget-critical',
        severity: 'danger',
        icon: '🔴',
        title: `${spentPct}% of monthly budget used`,
        body: `You've spent ₹${spent.toLocaleString('en-IN')} of ₹${usable.toLocaleString('en-IN')} spendable budget.`,
        href: '/money/budgets',
      })
    } else if (spentPct >= 75) {
      alerts.push({
        id: 'budget-warning',
        severity: 'warning',
        icon: '⚠️',
        title: `${spentPct}% of monthly budget used`,
        body: 'Slowing down now avoids an overshoot by month-end.',
        href: '/money/budgets',
      })
    }

    // High single-category spend
    if (expenseSummary.by_category) {
      for (const [cat, amount] of Object.entries(expenseSummary.by_category)) {
        const catPct = pct(amount as number, usable)
        if (catPct > 30 && cat !== 'rent') {
          alerts.push({
            id: `cat-high-${cat}`,
            severity: 'warning',
            icon: '📊',
            title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} spend is ${catPct}% of budget`,
            body: `₹${(amount as number).toLocaleString('en-IN')} on ${cat} this month — consider a review.`,
            href: '/money/transactions',
          })
          break // one category alert max
        }
      }
    }
  }

  // ── EMI due alerts ─────────────────────────────────────────────────────────
  for (const lib of liabilities) {
    if (lib.due_day && lib.emi) {
      const days = daysUntil(lib.due_day)
      if (days <= 5) {
        alerts.push({
          id: `emi-due-${lib.id}`,
          severity: days <= 2 ? 'danger' : 'warning',
          icon: '💳',
          title: `${lib.name} EMI due in ${days} day${days === 1 ? '' : 's'}`,
          body: `₹${lib.emi.toLocaleString('en-IN')} due on the ${lib.due_day}${ordinal(lib.due_day)}.`,
          href: '/money/liabilities',
        })
      }
    }
  }

  // ── Subscription renewal alerts ────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  for (const sub of subscriptions) {
    if (sub.is_active && sub.next_billing_date) {
      const days = Math.ceil(
        (new Date(sub.next_billing_date).getTime() - Date.now()) / 86_400_000
      )
      if (days >= 0 && days <= 3) {
        alerts.push({
          id: `sub-renewal-${sub.id}`,
          severity: 'info',
          icon: '🔄',
          title: `${sub.name} renews in ${days === 0 ? 'today' : `${days}d`}`,
          body: `₹${sub.amount.toLocaleString('en-IN')} will be charged.`,
          href: '/money',
        })
      }
    }
  }

  // ── Savings goal at-risk alerts ────────────────────────────────────────────
  for (const goal of goals) {
    if (goal.is_completed || !goal.target_date) continue
    const daysLeft = Math.ceil(
      (new Date(goal.target_date).getTime() - Date.now()) / 86_400_000
    )
    if (daysLeft > 0 && daysLeft <= 30) {
      const remaining = goal.target_amount - goal.current_amount
      if (remaining > 0) {
        alerts.push({
          id: `goal-deadline-${goal.id}`,
          severity: 'warning',
          icon: '🎯',
          title: `"${goal.title}" deadline in ${daysLeft} days`,
          body: `₹${remaining.toLocaleString('en-IN')} still needed.`,
          href: '/money/goals',
        })
      }
    }
  }

  // ── Positive alert: savings on track ──────────────────────────────────────
  if (budget && expenseSummary) {
    const surplus = budget.monthly_income - expenseSummary.total
    if (surplus >= budget.savings_target && budget.savings_target > 0) {
      alerts.push({
        id: 'savings-on-track',
        severity: 'info',
        icon: '✅',
        title: "You're on track to hit your savings target",
        body: `₹${surplus.toLocaleString('en-IN')} surplus — great discipline this month!`,
        href: '/money/goals',
      })
    }
  }

  return alerts.slice(0, 5) // cap at 5 alerts
}

// Pattern-based leak detection
export function detectLeaks(
  expenses: Expense[],
  prevMonthExpenses: Expense[]
): Array<{ category: string; thisMonth: number; lastMonth: number; changePct: number }> {
  const sum = (arr: Expense[], cat: string) =>
    arr.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)

  const categories = [...new Set([...expenses, ...prevMonthExpenses].map(e => e.category))]
  const leaks: Array<{ category: string; thisMonth: number; lastMonth: number; changePct: number }> = []

  for (const cat of categories) {
    const thisMonth = sum(expenses, cat)
    const lastMonth = sum(prevMonthExpenses, cat)
    if (lastMonth > 0 && thisMonth > 0) {
      const changePct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
      if (changePct >= 25 && thisMonth > 1000) {
        leaks.push({ category: cat, thisMonth, lastMonth, changePct })
      }
    }
  }

  return leaks.sort((a, b) => b.changePct - a.changePct).slice(0, 3)
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}
