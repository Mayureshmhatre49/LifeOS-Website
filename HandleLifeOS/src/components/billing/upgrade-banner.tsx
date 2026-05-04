'use client'

import Link from 'next/link'
import { Zap, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface UpgradeBannerProps {
  message?: string
  className?: string
  compact?: boolean
}

export function UpgradeBanner({
  message = 'You\'ve reached your free plan limit.',
  className,
  compact = false,
}: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm', className)}>
        <Zap className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-amber-800 flex-1">{message}</span>
        <Link href="/billing/plans" className="font-semibold text-indigo-600 hover:text-indigo-700 shrink-0">
          Upgrade
        </Link>
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 space-y-3', className)}>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Zap className="h-4.5 w-4.5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{message}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Upgrade to Pro for unlimited AI requests, personal memory, WhatsApp access, and more.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-300 hover:text-gray-500">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/billing/plans"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 transition-colors"
        >
          <Zap className="h-4 w-4" />
          See Pro plans — from ₹299/mo
        </Link>
      </div>
    </div>
  )
}
