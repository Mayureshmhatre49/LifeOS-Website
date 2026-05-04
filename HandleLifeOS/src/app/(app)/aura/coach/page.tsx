'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircleHeart, ChevronRight, Trash2, Sparkles } from 'lucide-react'
import { COACH_MODES, getCoachModeConfig, type CoachMode } from '@/lib/aura/coach-prompts'
import type { AuraCoachSession } from '@/lib/db/aura-coach-queries'
import type { AuraChildProfile } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { cn } from '@/lib/utils'

export default function AuraCoachPickerPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AuraCoachSession[]>([])
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<CoachMode | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/aura/coach/sessions').then(r => r.json()),
      fetch('/api/family/aura/profiles').then(r => r.json()),
    ])
      .then(([sRes, pRes]) => {
        setSessions(sRes.sessions ?? [])
        const list: AuraChildProfile[] = pRes.profiles ?? []
        setProfiles(list)
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        setSelectedId(valid ? stored : (list[0]?.id ?? null))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelectChild(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  async function startMode(mode: CoachMode) {
    if (creating) return
    setCreating(mode)
    try {
      const res = await fetch('/api/aura/coach/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, child_id: selectedId }),
      })
      if (res.ok) {
        const { session } = await res.json()
        router.push(`/aura/coach/${session.id}`)
      }
    } finally {
      setCreating(null)
    }
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    await fetch(`/api/aura/coach/sessions?id=${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  const selectedChild = profiles.find(c => c.id === selectedId)

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md shadow-fuchsia-200">
            <MessageCircleHeart className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AURA Coach</h1>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        Pick a topic. Conversations stay private to you and can be deleted any time.
        {selectedChild && <> The Coach will reference <span className="font-semibold text-gray-700">{selectedChild.full_name}</span>&apos;s profile context.</>}
      </p>

      {/* Optional child selector */}
      {profiles.length > 0 && (
        <AuraChildSwitcher children={profiles} selectedId={selectedId} onSelect={handleSelectChild} />
      )}

      {/* Modes */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start a new conversation</p>
        {COACH_MODES.map(mode => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => startMode(mode.id)}
              disabled={!!creating}
              className={cn(
                'w-full text-left rounded-2xl border border-white/60 bg-gradient-to-br p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50',
                mode.bgGradient,
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
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-400 px-1">No past conversations yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sessions.map(s => {
              const cfg = getCoachModeConfig(s.mode)
              const Icon = cfg?.icon ?? Sparkles
              const childName = profiles.find(p => p.id === s.child_id)?.full_name
              return (
                <Link
                  key={s.id}
                  href={`/aura/coach/${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br', cfg?.bgGradient)}>
                    <Icon className={cn('h-4 w-4', cfg?.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cfg?.title ?? s.mode}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(s.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {childName && <span className="ml-2 text-fuchsia-500 font-semibold">· {childName}</span>}
                    </p>
                  </div>
                  <button onClick={e => deleteSession(s.id, e)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
        <p className="text-xs text-rose-700 leading-relaxed">
          <strong>AURA Coach is not a replacement for a paediatrician, therapist, or specialist.</strong>{' '}
          For medical concerns, urgent issues, or formal evaluations, please consult a qualified professional.
          For child-safety concerns in India: <strong>Childline 1098 (24/7)</strong>.
        </p>
      </div>
    </div>
  )
}
