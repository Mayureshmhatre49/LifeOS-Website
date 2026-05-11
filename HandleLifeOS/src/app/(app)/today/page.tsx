import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getDashboardData } from '@/lib/dashboard/getDashboardData'
import { getProfile } from '@/lib/db/memory-queries'
import { Sun, CalendarDays, Wallet, Brain, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Today — HandleLife OS',
  description: 'Your complete daily briefing.',
}

function fmtTime(time: string | undefined | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const DOT_COLORS = ['bg-indigo-400', 'bg-violet-400', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400']

function fmt(n: number, cur: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
}

export default async function TodayPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [data, profile] = await Promise.all([
    getDashboardData(session.user.id, session.user.name),
    getProfile(session.user.id),
  ])
  const currency = profile?.currency ?? 'USD'

  const date = new Date()
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const totalTasks = data.tasksDueToday + data.tasksCompletedToday
  const pct = totalTasks > 0 ? Math.round((data.tasksCompletedToday / totalTasks) * 100) : 0

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Sun className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Today</h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">{dateStr}</p>
      </div>

      {/* Day progress */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 fade-in fade-in-delay-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Day Progress</p>
          <span className="text-xs font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{data.tasksCompletedToday}</p>
            <p className="text-[11px] text-gray-400">Done</p>
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-600">{data.tasksDueToday}</p>
            <p className="text-[11px] text-gray-400">Remaining</p>
          </div>
          <div>
            <p className={cn('text-lg font-bold', data.tasksOverdue > 0 ? 'text-rose-600' : 'text-gray-400')}>
              {data.tasksOverdue}
            </p>
            <p className="text-[11px] text-gray-400">Overdue</p>
          </div>
        </div>
      </div>

      {/* Urgent tasks */}
      {data.urgentTasks.length > 0 && (
        <div className="fade-in fade-in-delay-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Tasks</p>
            <Link href="/planner" className="text-[11px] text-indigo-500 font-semibold hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.urgentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3">
                <div className={cn('h-2 w-2 rounded-full shrink-0', task.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-500')} />
                <p className="flex-1 text-sm font-medium text-gray-800">{task.title}</p>
                <span className={cn(
                  'text-[10px] font-bold rounded-full px-2 py-0.5',
                  task.priority === 'urgent' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600',
                )}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's schedule */}
      <div className="fade-in fade-in-delay-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</p>
          </div>
          <Link href="/planner" className="text-[11px] text-indigo-500 font-semibold hover:text-indigo-700 flex items-center gap-1">
            Open planner <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {data.timeline.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
            <p className="text-sm text-gray-400">Nothing scheduled — a clear day.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
            {data.timeline.map((item, i) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
                  i < data.timeline.length - 1 && 'border-b border-gray-50',
                )}
              >
                <span className="w-14 text-xs text-gray-400 font-medium shrink-0">{fmtTime(item.time)}</span>
                <span className={cn('h-2 w-2 rounded-full shrink-0', item.done ? 'bg-gray-200' : DOT_COLORS[i % DOT_COLORS.length])} />
                <span className={cn('flex-1 text-sm font-medium truncate', item.done ? 'text-gray-400 line-through' : 'text-gray-800')}>
                  {item.title}
                </span>
                {item.badge && (
                  <span className="text-[10px] text-gray-400 shrink-0">{item.badge}</span>
                )}
                {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Money alerts */}
      <div className="fade-in fade-in-delay-3">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Money Alerts</p>
        </div>
        {data.upcomingBills > 0 ? (
          <Link href="/money" className="flex items-center gap-3 rounded-2xl bg-amber-50/80 border border-amber-100 px-4 py-3 hover:bg-amber-100/60 transition-colors">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {fmt(data.upcomingBills, currency)} in bills upcoming
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Tap to review and plan</p>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-500 shrink-0" />
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-center">
            <p className="text-sm text-gray-400">No payments due soon. 🎉</p>
          </div>
        )}
      </div>

      {/* AI Daily Brief */}
      <div className="fade-in fade-in-delay-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Suggestion</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.tasksOverdue > 0
              ? `You have ${data.tasksOverdue} overdue task${data.tasksOverdue > 1 ? 's' : ''}. Start with the smallest one to build momentum — it takes less than 2 minutes.`
              : data.tasksDueToday > 0
              ? `You have ${data.tasksDueToday} task${data.tasksDueToday > 1 ? 's' : ''} today. A 25-minute focus session right now will clear most of them.`
              : `Clear day ahead! Use this time to work on a goal you've been putting off, or simply recharge.`
            }
          </p>
          <Link
            href="/chat"
            className="mt-3 flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 transition-colors"
          >
            Ask AI for more <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Focus prompt */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 flex items-center gap-4 fade-in fade-in-delay-5">
        <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
          <Clock className="h-6 w-6 text-sky-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Ready to focus?</p>
          <p className="text-xs text-gray-400 mt-0.5">Focus score: {data.focusScore} · {data.focusMinutesThisWeek} min this week</p>
        </div>
        <Link
          href="/focus"
          className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition-colors"
        >
          Start
        </Link>
      </div>
    </div>
  )
}
