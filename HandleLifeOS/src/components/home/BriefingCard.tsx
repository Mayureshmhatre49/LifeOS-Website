'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BriefingPayload, BriefingHighlight } from '@/lib/coach/briefing'

export function BriefingCard() {
  const [data, setData] = useState<BriefingPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load(force = false) {
    if (force) setRefreshing(true)
    try {
      const res = await fetch(`/api/briefing/today${force ? '?refresh=true' : ''}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  useEffect(() => { load(false) }, [])

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-[14px] w-[14px] text-[var(--color-brand-600)]" strokeWidth={1.75} />
          <p className="eyebrow">Today's briefing</p>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-[var(--color-gray-100)] rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-[var(--color-gray-100)] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-[14px] w-[14px] text-[var(--color-brand-600)]" strokeWidth={1.75} />
          <p className="eyebrow">Today's briefing</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            title="Regenerate"
            className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-100)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-[13px] w-[13px]', refreshing && 'animate-spin')} strokeWidth={1.75} />
          </button>
          <Link
            href="/briefing"
            className="inline-flex items-center gap-1 px-2 h-7 rounded-md text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-100)] transition-colors"
          >
            Open
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div
        className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: simpleMarkdown(data.content_md) }}
      />

      {data.highlights.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-3 border-t border-[var(--color-border-soft)]">
          {data.highlights.slice(0, 6).map((h, i) => <Highlight key={i} h={h} />)}
        </div>
      )}
    </div>
  )
}

function Highlight({ h }: { h: BriefingHighlight }) {
  const className = 'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--color-gray-50)] transition-colors min-w-0'
  const inner = (
    <>
      {h.emoji && <span className="text-[14px] shrink-0 leading-none">{h.emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider leading-tight">{h.label}</p>
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate mt-0.5">{h.value}</p>
      </div>
    </>
  )
  return h.link
    ? <Link href={h.link} className={className}>{inner}</Link>
    : <div className={className}>{inner}</div>
}

function simpleMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--color-text-primary)] font-semibold">$1</strong>')
    .replace(/\n/g, '<br/>')
}
