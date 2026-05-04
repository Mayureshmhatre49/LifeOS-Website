import { getTasks, getRoutines } from '@/lib/db/planner-queries'
import { getExpenses, getBudget } from '@/lib/db/money-queries'
import { getRecentSessions } from '@/lib/db/focus-queries'
import { getUserFamilies, getSharedTasks } from '@/lib/db/family-queries'
import type { Task, Routine } from '@/types/planner'
import type { Expense } from '@/types/money'
import type { FocusSession } from '@/types/focus'
import type { SharedTask } from '@/types/family'

// ── Public types ──────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string
  title: string
  time?: string
  type: 'task' | 'routine' | 'focus'
  badge?: string
  href: string
  done: boolean
  priority?: string
}

export interface TrendData {
  days: string[]
  tasksCompleted: number[]
  focusMinutes: number[]
  expenses: number[]
}

export interface DashboardInsight {
  id: string
  message: string
  type: 'positive' | 'warning' | 'info'
  emoji: string
  href?: string
}

export interface DashboardData {
  userName: string

  // Tasks
  tasksDueToday: number
  tasksOverdue: number
  tasksCompletedToday: number
  taskStreak: number
  urgentTasks: { id: string; title: string; priority: string; category: string }[]

  // Money
  monthlySpend: number
  monthlyBudget: number
  monthlyIncome: number
  currency: string

  // Money — right panel specifics
  totalBalance: number
  upcomingBills: number
  emisDue: number
  monthlySavings: number

  // Focus
  focusMinutesThisWeek: number
  focusSessionsThisWeek: number
  focusScore: number

  // Routines
  activeRoutinesCount: number

  // Family
  hasFamilyMode: boolean
  familyPendingTasks: number

  // Timeline
  timeline: TimelineItem[]

  // Trends (last 7 days)
  trends: TrendData

  // Insights
  insights: DashboardInsight[]

  isNewUser: boolean
}

// ── Mock data (shown to new / empty accounts to demo the full UI) ─────────────

function buildMockData(firstName: string): DashboardData {
  // Persona: Nishant — Senior Product Manager, family of 4, Premium user
  const name = firstName === 'there' ? 'Nishant' : firstName

  return {
    userName: name,

    // Tasks — 3 due today, 2 overdue → 5 priorities; 4 done → progress 4/(4+3) ≈ 57%
    tasksDueToday: 3,
    tasksOverdue: 2,
    tasksCompletedToday: 4,
    taskStreak: 7,             // 7-day streak → 🔥 insight fires
    urgentTasks: [
      { id: 'mt1', title: 'Submit Q2 product roadmap',        priority: 'urgent', category: 'work' },
      { id: 'mt2', title: 'Renew car insurance — expires Fri', priority: 'high',   category: 'finance' },
      { id: 'mt3', title: "Book Tanish's dentist appointment", priority: 'high',   category: 'health' },
    ],

    // Money — income ₹2,80,000; budget ₹1,60,000; spent ₹52,000; headroom ₹1,08,000 → "Save ₹1.1L"
    monthlySpend: 52000,
    monthlyBudget: 160000,
    monthlyIncome: 280000,
    currency: 'INR',

    totalBalance: 228000,      // income − spend
    upcomingBills: 31500,      // rent + utilities + subscriptions
    emisDue: 24500,            // home loan EMI
    monthlySavings: 48000,     // committed SIP + RD

    // Focus — 4 sessions, 185 min this week → suggest ~19 min more today; score 78
    focusMinutesThisWeek: 185,
    focusSessionsThisWeek: 4,
    focusScore: 78,

    activeRoutinesCount: 4,    // morning workout, standup, evening walk, reading

    hasFamilyMode: true,
    familyPendingTasks: 2,

    timeline: [
      { id: 'mt1', title: 'Morning Workout',          time: '06:30', type: 'routine', badge: '45 min',    href: '/planner/routines', done: true  },
      { id: 'mt2', title: 'Team Standup',             time: '09:30', type: 'routine', badge: '30 min',    href: '/planner/routines', done: false },
      { id: 'mt3', title: 'Client Proposal Review',   time: '11:00', type: 'task',    badge: 'Urgent',    href: '/planner',          done: false, priority: 'urgent' },
      { id: 'mt4', title: 'Deep Work — Roadmap',      time: '13:00', type: 'focus',   badge: 'Focus time', href: '/focus',           done: false },
      { id: 'mt5', title: "Tanish's school pickup",   time: '15:30', type: 'task',    badge: 'High',      href: '/planner',          done: false, priority: 'high' },
      { id: 'mt6', title: 'Evening Walk',              time: '19:00', type: 'routine', badge: '30 min',    href: '/planner/routines', done: false },
    ],

    trends: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      tasksCompleted: [4, 6, 3,  7,  5, 2, 4],
      focusMinutes:   [45, 90, 0, 75, 60, 0, 0],  // weekends light
      // Trending up with a weekend dining spike → +8.5% badge
      expenses: [3200, 5800, 2100, 4500, 8200, 12000, 6800],
    },

    insights: [
      {
        id: 'streak',
        message: '7-day productivity streak — you\'re on fire this week!',
        type: 'positive', emoji: '🔥', href: '/planner',
      },
      {
        id: 'focus_week',
        message: '4 focus sessions this week — deep work habit forming nicely.',
        type: 'positive', emoji: '🎯', href: '/focus',
      },
      {
        id: 'family_tasks',
        message: '2 family tasks need your attention on the shared board.',
        type: 'info', emoji: '👨‍👩‍👧', href: '/family',
      },
      {
        id: 'budget_tip',
        message: 'Dining & subscriptions are your top spending categories this month.',
        type: 'info', emoji: '📊', href: '/money',
      },
    ],

    isNewUser: true,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function dayLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })
}

function safeSettle<T>(p: Promise<T>, fallback: T): Promise<T> {
  return p.catch(() => fallback)
}

// ── Streak computation ────────────────────────────────────────────────────────

function computeTaskStreak(tasks: Task[]): number {
  const doneTasks = tasks.filter(t => t.status === 'done')
  if (doneTasks.length === 0) return 0

  const doneDays = new Set(
    doneTasks
      .map(t => t.updated_at?.split('T')[0])
      .filter(Boolean) as string[],
  )

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    if (doneDays.has(iso)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

// ── Timeline builder ──────────────────────────────────────────────────────────

function buildTimeline(tasks: Task[], routines: Routine[]): TimelineItem[] {
  const today = todayStr()
  const items: TimelineItem[] = []

  for (const t of tasks) {
    if (t.due_date !== today) continue
    items.push({
      id: t.id,
      title: t.title,
      type: 'task',
      badge: t.priority === 'urgent' ? 'Urgent' : t.priority === 'high' ? 'High' : undefined,
      href: '/planner',
      done: t.status === 'done' || t.status === 'skipped',
      priority: t.priority,
    })
  }

  const dayOfWeek = new Date().getDay()
  for (const r of routines) {
    if (!r.is_active) continue
    if (r.days_of_week && !r.days_of_week.includes(dayOfWeek)) continue
    items.push({
      id: r.id,
      title: r.name,
      time: r.start_time ?? undefined,
      type: 'routine',
      href: '/planner/routines',
      done: false,
    })
  }

  items.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })

  return items.slice(0, 10)
}

// ── Trends builder ────────────────────────────────────────────────────────────

function buildTrends(tasks: Task[], sessions: FocusSession[], expenses: Expense[]): TrendData {
  const days = last7Days()

  const tasksCompleted = days.map(day =>
    tasks.filter(t => t.status === 'done' && t.updated_at?.startsWith(day)).length,
  )
  const focusMinutes = days.map(day =>
    sessions
      .filter(s => s.started_at?.startsWith(day) && s.completed)
      .reduce((sum, s) => sum + (s.actual_minutes ?? s.planned_minutes ?? 0), 0),
  )
  const expensesByDay = days.map(day =>
    expenses.filter(e => e.expense_date === day).reduce((sum, e) => sum + e.amount, 0),
  )

  return { days: days.map(dayLabel), tasksCompleted, focusMinutes, expenses: expensesByDay }
}

// ── Insights builder ──────────────────────────────────────────────────────────

function buildInsights(data: {
  tasksOverdue: number
  tasksDueToday: number
  tasksCompletedToday: number
  monthlySpend: number
  monthlyBudget: number
  focusSessionsThisWeek: number
  taskStreak: number
  activeRoutinesCount: number
  familyPendingTasks: number
}): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  if (data.taskStreak >= 3) {
    insights.push({
      id: 'streak',
      message: `${data.taskStreak}-day productivity streak — keep it going!`,
      type: 'positive', emoji: '🔥', href: '/planner',
    })
  }
  if (data.tasksOverdue > 0) {
    insights.push({
      id: 'overdue',
      message: `${data.tasksOverdue} task${data.tasksOverdue > 1 ? 's' : ''} overdue — a quick win clears the backlog.`,
      type: 'warning', emoji: '⏰', href: '/planner/tasks',
    })
  }
  if (data.monthlyBudget > 0) {
    const pct = Math.round((data.monthlySpend / data.monthlyBudget) * 100)
    if (pct >= 90) {
      insights.push({
        id: 'budget_critical',
        message: `Budget at ${pct}% — you're nearly at your monthly limit.`,
        type: 'warning', emoji: '💸', href: '/money',
      })
    } else if (pct >= 75) {
      insights.push({
        id: 'budget_high',
        message: `${pct}% of budget used this month — watch weekend spending.`,
        type: 'info', emoji: '📊', href: '/money',
      })
    }
  }
  if (data.focusSessionsThisWeek >= 5) {
    insights.push({
      id: 'focus_great',
      message: `${data.focusSessionsThisWeek} focus sessions this week — excellent deep work.`,
      type: 'positive', emoji: '🎯', href: '/focus/insights',
    })
  } else if (data.focusSessionsThisWeek === 0) {
    insights.push({
      id: 'focus_none',
      message: 'No focus sessions yet this week — even 25 minutes makes a difference.',
      type: 'info', emoji: '⏱', href: '/focus',
    })
  }
  if (data.familyPendingTasks > 0) {
    insights.push({
      id: 'family_tasks',
      message: `${data.familyPendingTasks} family task${data.familyPendingTasks > 1 ? 's' : ''} waiting — check the family board.`,
      type: 'info', emoji: '👨‍👩‍👧', href: '/family',
    })
  }
  if (data.tasksDueToday === 0 && data.tasksOverdue === 0) {
    insights.push({
      id: 'clear_day',
      message: 'No tasks today — a good time to plan ahead or tackle something new.',
      type: 'info', emoji: '✨', href: '/planner',
    })
  }

  return insights.slice(0, 4)
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function getDashboardData(
  userId: string,
  userName: string | null | undefined,
): Promise<DashboardData> {
  const firstName = userName?.split(' ')[0] ?? 'there'
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const today = todayStr()

  const [tasks, routines, expenses, budget, sessions, families] = await Promise.all([
    safeSettle(getTasks(userId), []),
    safeSettle(getRoutines(userId), []),
    safeSettle(getExpenses(userId, month, year), []),
    safeSettle(getBudget(userId, month, year), null),
    safeSettle(getRecentSessions(userId, 50), []),
    safeSettle(getUserFamilies(userId), []),
  ])

  let familyTasks: SharedTask[] = []
  if (families.length > 0) {
    familyTasks = await safeSettle(getSharedTasks(families[0].id), [])
  }

  // ── Task metrics ───────────────────────────────────────────────────────────

  const tasksDueToday = tasks.filter(
    t => t.due_date === today && t.status !== 'done' && t.status !== 'skipped',
  ).length
  const tasksOverdue = tasks.filter(
    t => t.due_date && t.due_date < today && t.status !== 'done' && t.status !== 'skipped',
  ).length
  const tasksCompletedToday = tasks.filter(
    t => t.status === 'done' && t.updated_at?.startsWith(today),
  ).length
  const taskStreak = computeTaskStreak(tasks)
  const urgentTasks = tasks
    .filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done')
    .slice(0, 3)
    .map(t => ({ id: t.id, title: t.title, priority: t.priority, category: t.category }))

  // ── Money metrics ──────────────────────────────────────────────────────────

  const monthlySpend = expenses.reduce((s, e) => s + e.amount, 0)
  const monthlyIncome = budget?.monthly_income ?? 0
  const savingsTarget = budget?.savings_target ?? 0
  const monthlyBudget = monthlyIncome > 0 ? monthlyIncome - savingsTarget : 0
  const currency = budget?.currency ?? expenses[0]?.currency ?? 'INR'

  const totalBalance = monthlyIncome > 0 ? monthlyIncome - monthlySpend : 0
  const upcomingBills = Math.round(monthlyBudget * 0.4) || monthlySpend
  const emisDue = Math.round(monthlySpend * 0.35)
  const monthlySavings = Math.max(0, monthlyIncome - monthlySpend - emisDue)

  // ── Focus metrics ──────────────────────────────────────────────────────────

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const thisWeekSessions = sessions.filter(s => s.started_at >= weekStartStr && s.completed)
  const focusMinutesThisWeek = thisWeekSessions.reduce(
    (sum, s) => sum + (s.actual_minutes ?? s.planned_minutes ?? 0), 0,
  )
  const focusSessionsThisWeek = thisWeekSessions.length
  const last7 = last7Days()
  const daysWithFocus = last7.filter(
    day => sessions.some(s => s.started_at?.startsWith(day) && s.completed),
  ).length
  const focusScore = Math.round((daysWithFocus / 7) * 100)

  // ── Other metrics ──────────────────────────────────────────────────────────

  const activeRoutinesCount = routines.filter(r => r.is_active).length
  const hasFamilyMode = families.length > 0
  const familyPendingTasks = familyTasks.filter(
    t => t.status === 'pending' || t.status === 'in_progress',
  ).length

  const timeline = buildTimeline(tasks, routines)
  const trends = buildTrends(tasks, sessions, expenses)
  const isNewUser = tasks.length === 0 && expenses.length === 0 && sessions.length === 0

  // ── Return mock data for new / empty accounts ──────────────────────────────

  if (isNewUser) return buildMockData(firstName)

  // ── Real data ──────────────────────────────────────────────────────────────

  const insights = buildInsights({
    tasksOverdue, tasksDueToday, tasksCompletedToday,
    monthlySpend, monthlyBudget, focusSessionsThisWeek,
    taskStreak, activeRoutinesCount, familyPendingTasks,
  })

  return {
    userName: firstName,
    tasksDueToday,
    tasksOverdue,
    tasksCompletedToday,
    taskStreak,
    urgentTasks,
    monthlySpend,
    monthlyBudget,
    monthlyIncome,
    currency,
    totalBalance,
    upcomingBills,
    emisDue,
    monthlySavings,
    focusMinutesThisWeek,
    focusSessionsThisWeek,
    focusScore,
    activeRoutinesCount,
    hasFamilyMode,
    familyPendingTasks,
    timeline,
    trends,
    insights,
    isNewUser,
  }
}
