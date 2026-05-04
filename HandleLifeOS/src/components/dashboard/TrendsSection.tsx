'use client'

import { cn } from '@/lib/utils'
import type { TrendData } from '@/lib/dashboard/getDashboardData'

interface Props {
  trends: TrendData
  currency: string
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full flex items-end h-10">
        <div
          className={cn('w-full rounded-t-md transition-all duration-500', color)}
          style={{ height: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  )
}

interface ChartRowProps {
  label: string
  values: number[]
  days: string[]
  color: string
  formatter: (v: number) => string
  max: number
}

function ChartRow({ label, values, days, color, formatter, max }: ChartRowProps) {
  const total = values.reduce((s, v) => s + v, 0)
  const peak = values.indexOf(Math.max(...values))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-gray-400">
          Total: <span className="font-semibold text-gray-700">{formatter(total)}</span>
          {peak >= 0 && values[peak] > 0 && (
            <> · Peak: <span className="font-semibold text-gray-700">{days[peak]}</span></>
          )}
        </p>
      </div>

      <div className="flex gap-1 items-end">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-12 flex items-end">
              <div
                className={cn('w-full rounded-t-lg transition-all duration-700', color, i === peak && v > 0 ? 'opacity-100' : 'opacity-60')}
                style={{ height: max > 0 ? `${Math.max((v / max) * 100, v > 0 ? 8 : 0)}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">{days[i]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendsSection({ trends, currency }: Props) {
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency

  const maxTasks = Math.max(...trends.tasksCompleted, 1)
  const maxFocus = Math.max(...trends.focusMinutes, 1)
  const maxExpenses = Math.max(...trends.expenses, 1)

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-6">
      <p className="text-sm font-semibold text-gray-700">Last 7 days</p>

      <ChartRow
        label="Tasks completed"
        values={trends.tasksCompleted}
        days={trends.days}
        color="bg-indigo-400"
        formatter={v => `${v}`}
        max={maxTasks}
      />

      <ChartRow
        label="Focus minutes"
        values={trends.focusMinutes}
        days={trends.days}
        color="bg-violet-400"
        formatter={v => `${v}m`}
        max={maxFocus}
      />

      <ChartRow
        label="Daily spend"
        values={trends.expenses}
        days={trends.days}
        color="bg-emerald-400"
        formatter={v => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v)}`}
        max={maxExpenses}
      />
    </div>
  )
}
