'use client'

import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types/decision'

interface RiskMeterProps {
  riskScore: number
  riskLevel: RiskLevel
  confidenceScore: number
  className?: string
}

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; trackColor: string; textColor: string }> = {
  low:    { label: 'Low Risk',    color: '#10b981', trackColor: '#d1fae5', textColor: 'text-emerald-600' },
  medium: { label: 'Medium Risk', color: '#f59e0b', trackColor: '#fef3c7', textColor: 'text-amber-600'   },
  high:   { label: 'High Risk',   color: '#f43f5e', trackColor: '#ffe4e6', textColor: 'text-rose-600'    },
}

function ArcGauge({
  value,
  color,
  trackColor,
  size = 96,
}: {
  value: number
  color: string
  trackColor: string
  size?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const strokeWidth = size * 0.09
  // Half-arc from 180° to 0° (left to right across the top)
  const startAngle = Math.PI
  const endAngle = 0
  const totalArc = Math.PI // 180°

  const clampedValue = Math.min(100, Math.max(0, value))
  const filledArc = (clampedValue / 100) * totalArc

  function polarToXY(angle: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    }
  }

  // Track path (full 180°)
  const trackStart = polarToXY(startAngle)
  const trackEnd = polarToXY(endAngle)
  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 0 1 ${trackEnd.x} ${trackEnd.y}`

  // Fill path
  const fillEndAngle = startAngle - filledArc
  const fillEnd = polarToXY(fillEndAngle)
  const largeArc = filledArc > Math.PI / 2 ? 1 : 0
  const fillPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`

  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      <path d={trackPath} fill="none" stroke={trackColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      {clampedValue > 0 && (
        <path d={fillPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      )}
    </svg>
  )
}

export function RiskMeter({ riskScore, riskLevel, confidenceScore, className }: RiskMeterProps) {
  const cfg = LEVEL_CONFIG[riskLevel]

  return (
    <div className={cn('rounded-2xl bg-white/80 backdrop-blur border border-white/60 p-4 shadow-sm', className)}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Risk & Confidence</p>

      <div className="flex gap-4 items-start">
        {/* Risk gauge */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative">
            <ArcGauge value={riskScore} color={cfg.color} trackColor={cfg.trackColor} size={100} />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <span className={cn('text-xl font-bold leading-none', cfg.textColor)}>{riskScore}</span>
            </div>
          </div>
          <span className={cn('text-[11px] font-bold mt-1', cfg.textColor)}>{cfg.label}</span>
        </div>

        <div className="w-px self-stretch bg-gray-100 shrink-0" />

        {/* Confidence bar */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Confidence</span>
            <span className="text-sm font-bold text-gray-800">{confidenceScore}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {confidenceScore >= 75
              ? 'High — analysis well-supported'
              : confidenceScore >= 50
              ? 'Moderate — some assumptions made'
              : 'Low — limited data available'}
          </p>
        </div>
      </div>
    </div>
  )
}
