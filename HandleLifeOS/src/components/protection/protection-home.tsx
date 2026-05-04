'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskCheck } from '@/types/protection'

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-red-600 bg-red-50',
  unknown: 'text-gray-500 bg-gray-50',
}

const TOOLS = [
  { href: '/protection/scam', icon: '🛡️', label: 'Scam Check', desc: 'Analyze suspicious messages', color: 'border-red-100 hover:border-red-200' },
  { href: '/protection/quote', icon: '💰', label: 'Quote Checker', desc: 'Is this price fair?', color: 'border-blue-100 hover:border-blue-200' },
  { href: '/protection/contract', icon: '📄', label: 'Contract Simplifier', desc: 'Understand what you\'re signing', color: 'border-purple-100 hover:border-purple-200' },
  { href: '/protection/negotiate', icon: '🤝', label: 'Negotiation Coach', desc: 'Get the right script', color: 'border-green-100 hover:border-green-200' },
  { href: '/protection/subscriptions', icon: '💸', label: 'Subscription Audit', desc: 'Find wasteful spending', color: 'border-orange-100 hover:border-orange-200' },
  { href: '/protection/decision', icon: '🤔', label: 'Decision Checker', desc: 'Should I do this?', color: 'border-indigo-100 hover:border-indigo-200' },
]

export function ProtectionHome() {
  const [recentChecks, setRecentChecks] = useState<RiskCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/protection/checks')
      .then((r) => r.ok ? r.json() : [])
      .then(setRecentChecks)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/protection/checks/${id}`, { method: 'DELETE' })
    setRecentChecks((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Protection</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your trusted advisor before risky decisions</p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={cn('flex flex-col gap-2 rounded-2xl border bg-white p-4 transition-all hover:shadow-sm', tool.color)}
          >
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{tool.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent checks */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">Recent checks</h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : recentChecks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
            <p className="text-sm text-gray-400">No checks yet — start by analyzing something</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChecks.map((check) => (
              <div key={check.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">{check.title}</span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', RISK_COLORS[check.risk_level])}>
                      {check.risk_level}
                    </span>
                    <span className="text-xs text-gray-400">{check.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{check.result_summary}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(check.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(check.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
