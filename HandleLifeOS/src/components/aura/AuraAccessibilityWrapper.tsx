'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PublicSettings {
  reduced_motion?: boolean
  text_size?: 'sm' | 'base' | 'lg' | 'xl'
  high_contrast?: boolean
}

const TEXT_SCALE_CLASSES: Record<NonNullable<PublicSettings['text_size']>, string> = {
  sm: 'text-[14px]',
  base: '',
  lg: 'text-[17px]',
  xl: 'text-[19px]',
}

export function AuraAccessibilityWrapper({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>({})

  useEffect(() => {
    fetch('/api/aura/settings')
      .then(r => r.json())
      .then(({ settings }) => setSettings(settings ?? {}))
      .catch(() => {})
  }, [])

  return (
    <div className={cn(
      'aura-accessibility',
      settings.text_size && TEXT_SCALE_CLASSES[settings.text_size],
      settings.reduced_motion && 'aura-reduced-motion',
      settings.high_contrast && 'aura-high-contrast',
    )}>
      {children}
      <style jsx global>{`
        .aura-reduced-motion *, .aura-reduced-motion *::before, .aura-reduced-motion *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
        .aura-high-contrast {
          --tw-bg-opacity: 1;
        }
        .aura-high-contrast .text-gray-400 { color: #4b5563; }
        .aura-high-contrast .text-gray-500 { color: #1f2937; }
        .aura-high-contrast .border-gray-100 { border-color: #6b7280; }
        .aura-high-contrast .border-gray-200 { border-color: #4b5563; }
      `}</style>
    </div>
  )
}
