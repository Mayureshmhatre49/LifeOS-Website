'use client'

import { cn } from '@/lib/utils'
import type { SmartAlert } from '@/types/money'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  alerts: SmartAlert[]
}

const SEVERITY_STYLES: Record<SmartAlert['severity'], string> = {
  danger:  'bg-rose-50 border-rose-100',
  warning: 'bg-amber-50 border-amber-100',
  info:    'bg-indigo-50 border-indigo-100',
}

const SEVERITY_TEXT: Record<SmartAlert['severity'], string> = {
  danger:  'text-rose-700',
  warning: 'text-amber-700',
  info:    'text-indigo-700',
}

export function InsightPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5 text-center">
        <p className="text-2xl mb-1">✅</p>
        <p className="text-sm font-semibold text-gray-700">All clear</p>
        <p className="text-xs text-gray-400 mt-0.5">No urgent money alerts right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={cn(
            'rounded-2xl border px-4 py-3 flex items-start gap-3',
            SEVERITY_STYLES[alert.severity],
          )}
        >
          <span className="text-xl shrink-0 mt-0.5">{alert.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold leading-tight', SEVERITY_TEXT[alert.severity])}>
              {alert.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.body}</p>
          </div>
          {alert.href && (
            <Link href={alert.href} className="shrink-0 mt-0.5">
              <ArrowRight className={cn('h-4 w-4', SEVERITY_TEXT[alert.severity])} />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
