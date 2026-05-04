'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Trash2, RotateCcw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DecisionLog } from '@/types/decision'

interface Props {
  onRerun: (log: DecisionLog) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  financial:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  career:     'bg-blue-50 text-blue-700 border-blue-100',
  relocation: 'bg-violet-50 text-violet-700 border-violet-100',
  education:  'bg-amber-50 text-amber-700 border-amber-100',
  family:     'bg-orange-50 text-orange-700 border-orange-100',
  business:   'bg-indigo-50 text-indigo-700 border-indigo-100',
  investment: 'bg-teal-50 text-teal-700 border-teal-100',
  lifestyle:  'bg-pink-50 text-pink-700 border-pink-100',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function DecisionHistory({ onRerun }: Props) {
  const [logs, setLogs] = useState<DecisionLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/decisions?limit=20')
      const json = await res.json()
      setLogs(json.decisions ?? [])
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleFavorite(log: DecisionLog) {
    const next = !log.favorite
    setLogs(prev => prev.map(l => l.id === log.id ? { ...l, favorite: next } : l))
    await fetch(`/api/decisions/${log.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: next }),
    })
  }

  async function handleDelete(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/decisions/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl bg-white/80 border border-white/60 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center">
        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-500">No past decisions yet</p>
        <p className="text-xs text-gray-400 mt-1">Your saved analyses will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map(log => {
        const catStyle = CATEGORY_COLORS[log.category ?? ''] ?? 'bg-gray-50 text-gray-600 border-gray-100'
        const result = log.result as { recommendation?: string; winner?: string } | undefined
        const preview = result?.recommendation
          ? result.recommendation.slice(0, 100)
          : result?.winner
          ? `Winner: ${result.winner}`
          : null

        return (
          <div
            key={log.id}
            className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {log.category && (
                    <span className={cn('rounded-full border text-[10px] font-semibold px-2 py-0.5', catStyle)}>
                      {log.category}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 font-medium">{timeAgo(log.created_at)}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">{log.mode}</span>
                </div>

                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                  {log.question}
                </p>

                {preview && (
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 leading-snug">{preview}</p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onRerun(log)}
                  title="Re-run analysis"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleFavorite(log)}
                  title={log.favorite ? 'Unfavorite' : 'Favorite'}
                  className={cn(
                    'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                    log.favorite
                      ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
                  )}
                >
                  <Star className="h-3.5 w-3.5" fill={log.favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleDelete(log.id)}
                  title="Delete"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
