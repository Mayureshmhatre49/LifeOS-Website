'use client'

import { Phone, Heart, X, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HELPLINES, type RiskSeverity } from '@/lib/mind/risk-detection'

interface Props {
  severity: RiskSeverity
  message?: string | null
  dismissable?: boolean
  className?: string
}

export function EmergencyBanner({ severity, message, dismissable = false, className }: Props) {
  const [hidden, setHidden] = useState(false)

  if (severity === 'none' || severity === 'mild' || hidden) return null

  const isSevere = severity === 'severe'

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        isSevere
          ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-200/60'
          : 'bg-amber-50 border-amber-200',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
          isSevere ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600',
        )}>
          <Heart className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-bold mb-1',
            isSevere ? 'text-rose-800' : 'text-amber-800',
          )}>
            {isSevere ? 'You are not alone' : 'Support is available'}
          </p>

          <p className={cn(
            'text-xs leading-relaxed mb-3',
            isSevere ? 'text-rose-700' : 'text-amber-700',
          )}>
            {message ?? "If things feel heavy right now, please consider reaching out to someone trained to listen."}
          </p>

          <div className="space-y-1.5">
            {HELPLINES.slice(0, isSevere ? 4 : 2).map(line => (
              <a
                key={line.name}
                href={line.number.startsWith('+') || line.number.match(/^\d/) ? `tel:${line.number.replace(/\s+/g, '')}` : `https://${line.number}`}
                target={line.number.startsWith('+') || line.number.match(/^\d/) ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors',
                  isSevere
                    ? 'bg-white border-rose-200 hover:bg-rose-50 text-rose-800'
                    : 'bg-white border-amber-200 hover:bg-amber-50 text-amber-800',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {line.number.match(/^\+?\d/) ? <Phone className="h-3.5 w-3.5 shrink-0" /> : <ExternalLink className="h-3.5 w-3.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{line.name}</p>
                    <p className="text-[10px] opacity-70 truncate">{line.hours}</p>
                  </div>
                </div>
                <span className="text-xs font-bold whitespace-nowrap">{line.number}</span>
              </a>
            ))}
          </div>

          <p className={cn(
            'text-[10px] mt-2 leading-relaxed',
            isSevere ? 'text-rose-600' : 'text-amber-600',
          )}>
            HandleLife is not a substitute for professional care. If you are in danger, please call your local emergency number.
          </p>
        </div>

        {dismissable && !isSevere && (
          <button
            onClick={() => setHidden(true)}
            className="p-1 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100 shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
