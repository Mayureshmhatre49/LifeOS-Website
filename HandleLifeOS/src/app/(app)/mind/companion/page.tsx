'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircleHeart, ChevronRight, Trash2, Sparkles, Crown, Zap } from 'lucide-react'
import { COMPANION_MODES, getModeConfig, type CompanionMode } from '@/lib/mind/companion-prompts'
import type { CompanionSession } from '@/lib/db/companion-queries'
import { cn } from '@/lib/utils'

interface AccessInfo {
  planId: string
  isPremium: boolean
  companion: { used_today: number; daily_limit: number | null; remaining: number | null }
}

export default function CompanionPickerPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<CompanionSession[]>([])
  const [access, setAccess] = useState<AccessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<CompanionMode | null>(null)

  useEffect(() => {
    fetch('/api/mind/companion/sessions')
      .then(r => r.json())
      .then(({ sessions, access }) => {
        setSessions(sessions ?? [])
        setAccess(access ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function startMode(mode: CompanionMode) {
    if (creating) return
    setCreating(mode)
    try {
      const res = await fetch('/api/mind/companion/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      if (res.ok) {
        const { session } = await res.json()
        router.push(`/mind/companion/${session.id}`)
      }
    } finally {
      setCreating(null)
    }
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    await fetch(`/api/mind/companion/sessions?id=${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <MessageCircleHeart className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AI Companion</h1>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        Pick a companion that matches what you need. Conversations are private to you and can be deleted any time.
      </p>

      {/* Plan access indicator */}
      {access && !access.isPremium && access.companion.daily_limit != null && (
        <Link
          href="/premium"
          className={cn(
            'block rounded-2xl border p-3 transition-all hover:shadow-md',
            access.companion.remaining === 0
              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100'
              : 'bg-amber-50 border-amber-200 hover:bg-amber-100',
          )}
        >
          <div className="flex items-center gap-2">
            <Zap className={cn('h-4 w-4 shrink-0', access.companion.remaining === 0 ? 'text-rose-600' : 'text-amber-600')} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold', access.companion.remaining === 0 ? 'text-rose-800' : 'text-amber-800')}>
                {access.companion.remaining === 0
                  ? `Daily limit reached (${access.companion.used_today}/${access.companion.daily_limit})`
                  : `${access.companion.used_today}/${access.companion.daily_limit} free messages used today`}
              </p>
              <p className={cn('text-[11px]', access.companion.remaining === 0 ? 'text-rose-600' : 'text-amber-600')}>
                Upgrade to Pro for unlimited companion conversations
              </p>
            </div>
            <Crown className={cn('h-4 w-4 shrink-0', access.companion.remaining === 0 ? 'text-rose-500' : 'text-amber-500')} />
          </div>
        </Link>
      )}
      {access && access.isPremium && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-800">Premium · unlimited companion conversations</p>
          </div>
        </div>
      )}

      {/* Modes */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start a new conversation</p>
        {COMPANION_MODES.map(mode => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => startMode(mode.id)}
              disabled={!!creating}
              className={cn(
                'w-full text-left rounded-2xl border border-white/60 bg-gradient-to-br p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50',
                mode.bgGradient
              )}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center shrink-0">
                  <Icon className={cn('h-5 w-5', mode.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold leading-tight', mode.color)}>
                    {mode.title}
                    {creating === mode.id && <span className="ml-2 text-xs font-normal text-gray-400">starting…</span>}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{mode.tagline}</p>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{mode.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Past sessions */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your past conversations</p>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-gray-400 px-1">No past conversations yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sessions.map(s => {
              const cfg = getModeConfig(s.mode)
              const Icon = cfg?.icon ?? Sparkles
              return (
                <Link
                  key={s.id}
                  href={`/mind/companion/${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', cfg?.bgGradient && `bg-gradient-to-br ${cfg.bgGradient}`)}>
                    <Icon className={cn('h-4 w-4', cfg?.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cfg?.title ?? s.mode}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(s.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {s.risk_flags?.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 uppercase">
                          flagged
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={e => deleteSession(s.id, e)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Safety footer */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
        <p className="text-xs text-rose-700 leading-relaxed">
          <strong>The Companion is not a replacement for therapy.</strong> If you&apos;re in crisis,
          please call <strong>1860 2662 345</strong> (Vandrevala, 24/7) or your local emergency line.
          Conversations stay private to your account.
        </p>
      </div>
    </div>
  )
}
