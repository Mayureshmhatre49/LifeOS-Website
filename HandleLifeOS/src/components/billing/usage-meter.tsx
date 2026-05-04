'use client'

import { cn } from '@/lib/utils'
import { isUnlimited } from '@/lib/billing/plans'

interface UsageMeterProps {
  label: string
  used: number
  limit: number
  className?: string
}

export function UsageMeter({ label, used, limit, className }: UsageMeterProps) {
  const unlimited = isUnlimited(limit)
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isHigh = pct >= 80
  const isExceeded = pct >= 100

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between items-baseline text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={cn('font-medium', isExceeded ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-gray-900')}>
          {unlimited ? `${used.toLocaleString()} / ∞` : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isExceeded ? 'bg-red-500' : isHigh ? 'bg-amber-400' : 'bg-indigo-500'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {unlimited && (
        <div className="h-2 bg-indigo-100 rounded-full">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-40" />
        </div>
      )}
    </div>
  )
}
