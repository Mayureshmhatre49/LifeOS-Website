'use client'

import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { DevelopmentalAlert, AlertSeverity } from '@/types/aura'
import { DOMAIN_LABELS } from '@/types/aura'
import { cn } from '@/lib/utils'

interface Props {
  alerts: DevelopmentalAlert[]
  onMarkMilestone?: (childId: string, milestoneId: string) => void
}

const SEVERITY_CONFIG: Record<AlertSeverity, {
  icon: React.ReactNode
  bg: string
  border: string
  text: string
  badge: string
  label: string
}> = {
  urgent: {
    icon: <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-600',
    label: 'Urgent',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-600',
    label: 'Action needed',
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-500',
    label: 'Check in',
  },
}

function AlertCard({ alert, onMarkMilestone }: { alert: DevelopmentalAlert; onMarkMilestone?: Props['onMarkMilestone'] }) {
  const cfg = SEVERITY_CONFIG[alert.severity]

  return (
    <div className={cn('rounded-2xl border p-3.5 space-y-2', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-2.5">
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', cfg.badge)}>
              {cfg.label}
            </span>
            {alert.domain && (
              <span className="text-xs text-gray-400">{DOMAIN_LABELS[alert.domain]}</span>
            )}
          </div>
          <p className={cn('text-sm leading-snug font-medium', cfg.text)}>
            {alert.child_name}: {alert.message}
          </p>
        </div>
      </div>

      {alert.action && (
        <div className="rounded-xl bg-white/70 border border-white px-3 py-2">
          <p className="text-xs text-gray-600">
            <span className="font-medium">What to do: </span>
            {alert.action}
          </p>
        </div>
      )}

      {alert.milestone_id && onMarkMilestone && (
        <button
          onClick={() => onMarkMilestone(alert.child_id, alert.milestone_id!)}
          className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark as achieved
        </button>
      )}
    </div>
  )
}

export function AlertsPanel({ alerts, onMarkMilestone }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
        <p className="text-sm font-medium text-green-700">All clear</p>
        <p className="text-xs text-green-500">No developmental alerts right now. Keep tracking milestones to stay on top of your child's progress.</p>
      </div>
    )
  }

  const urgent  = alerts.filter(a => a.severity === 'urgent')
  const warning = alerts.filter(a => a.severity === 'warning')
  const info    = alerts.filter(a => a.severity === 'info')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {alerts.length} alert{alerts.length > 1 ? 's' : ''}
        </p>
        {urgent.length > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
            {urgent.length} urgent
          </span>
        )}
      </div>

      {urgent.length > 0 && (
        <div className="space-y-2">
          {urgent.map((a, i) => (
            <AlertCard key={i} alert={a} onMarkMilestone={onMarkMilestone} />
          ))}
        </div>
      )}

      {warning.length > 0 && (
        <div className="space-y-2">
          {warning.map((a, i) => (
            <AlertCard key={i} alert={a} onMarkMilestone={onMarkMilestone} />
          ))}
        </div>
      )}

      {info.length > 0 && (
        <div className="space-y-2">
          {info.map((a, i) => (
            <AlertCard key={i} alert={a} onMarkMilestone={onMarkMilestone} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 pt-1">
        Alerts are generated locally using CDC/AAP 75th-percentile thresholds. Always verify with your paediatrician.
      </p>
    </div>
  )
}
