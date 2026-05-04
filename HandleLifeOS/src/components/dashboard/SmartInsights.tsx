import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardInsight } from '@/lib/dashboard/getDashboardData'

interface Props {
  insights: DashboardInsight[]
}

const TYPE_STYLES: Record<DashboardInsight['type'], string> = {
  positive: 'bg-green-50 border-green-100',
  warning:  'bg-orange-50 border-orange-100',
  info:     'bg-indigo-50 border-indigo-100',
}

const TYPE_TEXT: Record<DashboardInsight['type'], string> = {
  positive: 'text-green-800',
  warning:  'text-orange-800',
  info:     'text-indigo-800',
}

const TYPE_LINK: Record<DashboardInsight['type'], string> = {
  positive: 'text-green-600 hover:text-green-700',
  warning:  'text-orange-600 hover:text-orange-700',
  info:     'text-indigo-600 hover:text-indigo-700',
}

export function SmartInsights({ insights }: Props) {
  if (insights.length === 0) return null

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Smart insights</p>

      <div className="space-y-2">
        {insights.map(insight => (
          <div
            key={insight.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 transition-colors',
              TYPE_STYLES[insight.type],
            )}
          >
            <span className="text-base leading-none mt-0.5 shrink-0">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm leading-snug', TYPE_TEXT[insight.type])}>
                {insight.message}
              </p>
            </div>
            {insight.href && (
              <Link
                href={insight.href}
                className={cn('flex items-center gap-0.5 text-xs font-medium shrink-0 mt-0.5 transition-colors', TYPE_LINK[insight.type])}
              >
                Go <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
