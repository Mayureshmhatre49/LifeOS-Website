'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Landmark, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/types/money'

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${Math.abs(n).toLocaleString('en-IN')}`
}

export function NetWorthCard() {
  const [data, setData] = useState<NetWorthSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/money/networth')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 animate-pulse h-44" />
    )
  }

  if (!data) return null

  const positive = data.net_worth >= 0

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-200/40 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Net Worth</p>
          <p className={cn('text-3xl font-black', !positive && 'text-rose-200')}>
            {positive ? '' : '-'}{fmt(Math.abs(data.net_worth))}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {positive
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
              : <TrendingDown className="h-3.5 w-3.5 text-rose-200" />
            }
            <span className="text-xs text-white/70">
              {positive ? 'Positive net worth' : 'Net worth negative — focus on debt reduction'}
            </span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <Landmark className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
        <div>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Savings</p>
          <p className="text-sm font-bold text-emerald-100 mt-0.5">{fmt(data.total_savings)}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Debts</p>
          <p className={cn('text-sm font-bold mt-0.5', data.total_liabilities > 0 ? 'text-rose-200' : 'text-white')}>
            {fmt(data.total_liabilities)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Surplus</p>
          <p className="text-sm font-bold text-white mt-0.5">{fmt(data.monthly_surplus)}/mo</p>
        </div>
      </div>
    </div>
  )
}
