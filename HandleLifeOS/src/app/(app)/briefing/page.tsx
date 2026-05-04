'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Sparkles, ArrowRight } from 'lucide-react'
import type { BriefingPayload, BriefingHighlight } from '@/lib/coach/briefing'
import { cn } from '@/lib/utils'

export default function BriefingPage() {
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

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Today&apos;s Briefing</h1>
            <p className="text-[11px] text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          title="Regenerate"
          className="h-9 w-9 rounded-xl bg-white border border-gray-200 hover:bg-violet-50 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 text-gray-500', refreshing && 'animate-spin')} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          {/* Briefing card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border border-violet-100 p-6 shadow-sm">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(data.content_md) }}
            />
            <p className="text-[10px] text-violet-400 mt-4">
              Generated {new Date(data.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>

          {/* Highlights grid */}
          {data.highlights.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">At a glance</p>
              <div className="grid grid-cols-2 gap-2">
                {data.highlights.map((h, i) => <HighlightCard key={i} h={h} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Couldn&apos;t load your briefing.</p>
        </div>
      )}
    </div>
  )
}

function HighlightCard({ h }: { h: BriefingHighlight }) {
  const className = 'flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all'
  const inner = (
    <>
      {h.emoji && <span className="text-lg shrink-0">{h.emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold leading-tight">{h.label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{h.value}</p>
      </div>
      {h.link && <ArrowRight className="h-3 w-3 text-gray-300 shrink-0" />}
    </>
  )
  return h.link
    ? <Link href={h.link} className={className}>{inner}</Link>
    : <div className={className}>{inner}</div>
}

// Tiny markdown subset: **bold**, line breaks. Trusted source (own AI), but escape risky chars.
function simpleMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
