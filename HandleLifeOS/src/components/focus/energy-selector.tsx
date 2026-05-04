'use client'

import { cn } from '@/lib/utils'
import type { EnergyState } from '@/types/focus'

const OPTIONS: Array<{ value: EnergyState; label: string; icon: string; desc: string }> = [
  { value: 'low', label: 'Low', icon: '🌙', desc: 'Easy wins' },
  { value: 'normal', label: 'Normal', icon: '☀️', desc: 'Balanced' },
  { value: 'high', label: 'High', icon: '⚡', desc: 'Deep work' },
]

interface EnergySelectorProps {
  value: EnergyState
  onChange: (e: EnergyState) => void
}

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 rounded-xl border py-3 px-2 transition-all',
            value === opt.value
              ? 'border-indigo-500 bg-indigo-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <span className="text-xl">{opt.icon}</span>
          <span className={cn('text-xs font-semibold', value === opt.value ? 'text-indigo-700' : 'text-gray-700')}>
            {opt.label}
          </span>
          <span className="text-xs text-gray-400">{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}
