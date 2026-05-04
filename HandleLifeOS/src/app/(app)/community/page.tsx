'use client'

import { useState, useEffect } from 'react'
import { Users, Trophy, Flag, RefreshCw, Loader2, Copy, Check, X, Plus, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Challenge, ChallengeParticipant, AccountabilityPartner, Achievement } from '@/lib/community/types'

type Tab = 'challenges' | 'partners' | 'achievements'

interface JoinedRow extends ChallengeParticipant {
  challenges: Challenge | null
}

interface Partners {
  sent: (AccountabilityPartner & { partner: { id: string; name: string | null; email: string } | null })[]
  received: (AccountabilityPartner & { partner: { id: string; name: string | null; email: string } | null })[]
  active: (AccountabilityPartner & { partner: { id: string; name: string | null; email: string } | null })[]
  ended: (AccountabilityPartner & { partner: { id: string; name: string | null; email: string } | null })[]
}

const CATEGORY_COLOR: Record<string, string> = {
  health: 'text-emerald-700 bg-emerald-50',
  money: 'text-amber-700 bg-amber-50',
  mind: 'text-violet-700 bg-violet-50',
  focus: 'text-sky-700 bg-sky-50',
  habits: 'text-pink-700 bg-pink-50',
  learning: 'text-indigo-700 bg-indigo-50',
  relationships: 'text-rose-700 bg-rose-50',
  career: 'text-blue-700 bg-blue-50',
}

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('challenges')

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 sm:py-8 max-w-[760px] mx-auto space-y-6">
      <header>
        <p className="eyebrow mb-1">Community</p>
        <h1>People · challenges · achievements</h1>
        <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)]">
          Curated challenges that move the needle, accountability partners you choose, and milestones the OS notices on your behalf.
        </p>
      </header>

      <div className="flex rounded-lg bg-[var(--color-gray-100)] p-0.5">
        <TabButton active={tab === 'challenges'} onClick={() => setTab('challenges')} icon={Flag} label="Challenges" />
        <TabButton active={tab === 'partners'} onClick={() => setTab('partners')} icon={Users} label="Partners" />
        <TabButton active={tab === 'achievements'} onClick={() => setTab('achievements')} icon={Trophy} label="Achievements" />
      </div>

      {tab === 'challenges'   && <ChallengesPanel />}
      {tab === 'partners'     && <PartnersPanel />}
      {tab === 'achievements' && <AchievementsPanel />}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Flag; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-medium transition-colors',
        active ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
      )}
    >
      <Icon className="h-[14px] w-[14px]" strokeWidth={1.75} />
      {label}
    </button>
  )
}

// ─── Challenges panel ─────────────────────────────────────────────────────────

function ChallengesPanel() {
  const [catalog, setCatalog] = useState<Challenge[]>([])
  const [joined, setJoined] = useState<JoinedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    const r = await fetch(`/api/community/challenges${refresh ? '?refresh=true' : ''}`).then(r => r.json())
    setCatalog(r.catalog ?? [])
    setJoined(r.joined ?? [])
    setLoading(false); setRefreshing(false)
  }
  useEffect(() => { load(true) }, [])

  async function join(challenge_id: string) {
    setJoining(challenge_id)
    try {
      const res = await fetch('/api/community/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challenge_id }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast({ kind: 'error', message: 'Could not join challenge', description: j.error })
      } else {
        toast({ kind: 'success', message: 'Joined — progress will track automatically' })
        await load(true)
      }
    } catch {
      toast({ kind: 'error', message: 'Network error — could not join' })
    } finally {
      setJoining(null)
    }
  }

  async function leave(participant_id: string) {
    if (!confirm('Abandon this challenge? Your progress will be lost.')) return
    try {
      const res = await fetch('/api/community/challenges', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_id, status: 'abandoned' }) })
      if (res.ok) {
        toast({ kind: 'info', message: 'Challenge abandoned' })
        load(true)
      } else {
        toast({ kind: 'error', message: 'Could not leave the challenge' })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  if (loading) return <Centered><Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-tertiary)]" /></Centered>

  const joinedIds = new Set(joined.map(j => j.challenge_id))
  const activeJoined = joined.filter(j => j.status === 'active')
  const browseable = catalog.filter(c => !joinedIds.has(c.id) || joined.find(j => j.challenge_id === c.id)?.status !== 'active')

  return (
    <div className="space-y-6">
      {activeJoined.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Your challenges</p>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <RefreshCw className={cn('h-[12px] w-[12px]', refreshing && 'animate-spin')} strokeWidth={1.75} />
              Refresh progress
            </button>
          </div>
          <div className="space-y-2">
            {activeJoined.map(j => <JoinedChallengeCard key={j.id} row={j} onLeave={() => leave(j.id)} />)}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <p className="eyebrow">Browse challenges</p>
        <div className="space-y-2">
          {browseable.map(c => (
            <CatalogCard key={c.id} challenge={c} joining={joining === c.id} onJoin={() => join(c.id)} />
          ))}
        </div>
      </section>
    </div>
  )
}

function JoinedChallengeCard({ row, onLeave }: { row: JoinedRow; onLeave: () => void }) {
  const c = row.challenges
  if (!c) return null
  const daysLeft = Math.max(0, Math.ceil((new Date(row.ends_at).getTime() - Date.now()) / 86_400_000))

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{c.emoji ?? '🏁'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{c.title}</p>
            <button onClick={onLeave} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-700)] transition-colors" title="Abandon">
              <X className="h-[14px] w-[14px]" strokeWidth={1.75} />
            </button>
          </div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
            {row.progress_pct}% · {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </p>

          <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--color-gray-100)] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                row.progress_pct >= 100 ? 'bg-[var(--color-success-500)]' : 'bg-[var(--color-text-primary)]',
              )}
              style={{ width: `${row.progress_pct}%` }}
            />
          </div>

          {row.progress_pct >= 100 && (
            <p className="text-[12px] text-[var(--color-success-700)] mt-2 font-medium">
              ✓ Completed — well done.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function CatalogCard({ challenge, joining, onJoin }: { challenge: Challenge; joining: boolean; onJoin: () => void }) {
  const cat = CATEGORY_COLOR[challenge.category] ?? 'text-gray-700 bg-gray-50'
  return (
    <div className="card-interactive p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{challenge.emoji ?? '🏁'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{challenge.title}</p>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold', cat)}>{challenge.category}</span>
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">{challenge.duration_days}d · {challenge.difficulty}</span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mt-1">{challenge.description}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {challenge.participant_count.toLocaleString()} joined · {challenge.completion_count.toLocaleString()} finished
            </p>
            <button
              onClick={onJoin}
              disabled={joining}
              className="inline-flex items-center gap-1 px-3 h-7 rounded-md bg-[var(--color-gray-900)] text-white text-[12px] font-medium hover:bg-[var(--color-gray-800)] transition-colors disabled:opacity-50"
            >
              {joining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" strokeWidth={2} />}
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Partners panel ────────────────────────────────────────────────────────────

function PartnersPanel() {
  const [data, setData] = useState<Partners>({ sent: [], received: [], active: [], ended: [] })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  async function load() {
    const r = await fetch('/api/community/partners').then(r => r.json())
    setData(r)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function generateInvite() {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/community/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (res.ok) {
        toast({ kind: 'success', message: 'Invite code created — copy and share it' })
        await load()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? 'Failed to generate invite')
        toast({ kind: 'error', message: 'Could not generate invite' })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    } finally {
      setBusy(false)
    }
  }

  async function redeem() {
    if (!/^[A-Z0-9]{8}$/.test(redeemCode)) {
      setError('Code is 8 alphanumeric characters'); return
    }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/community/partners/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invite_code: redeemCode }) })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setRedeemCode('')
        toast({ kind: 'success', message: 'Partnership active — you can now share progress' })
        await load()
      } else {
        setError(json.error ?? 'Failed')
      }
    } catch {
      toast({ kind: 'error', message: 'Network error — try again' })
    } finally {
      setBusy(false)
    }
  }

  async function endPartnership(id: string) {
    // Different messages for active vs. pending invite
    const target = data.active.find(p => p.id === id) ?? data.sent.find(p => p.id === id)
    const isActive = target?.status === 'active'
    const message = isActive
      ? 'End this partnership? They will no longer see your shared progress.'
      : 'Cancel this invite code? It will no longer work for redemption.'
    if (!confirm(message)) return
    try {
      const res = await fetch(`/api/community/partners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ kind: 'info', message: isActive ? 'Partnership ended' : 'Invite cancelled' })
        load()
      } else {
        toast({ kind: 'error', message: 'Could not end partnership' })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1800)
  }

  if (loading) return <Centered><Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-tertiary)]" /></Centered>

  return (
    <div className="space-y-6">
      {/* Active partners */}
      {data.active.length > 0 ? (
        <section className="space-y-3">
          <p className="eyebrow">Active partners</p>
          <div className="space-y-2">
            {data.active.map(p => (
              <div key={p.id} className="card p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.partner?.name ?? p.partner?.email ?? 'Unknown'}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                    Sharing: {[
                      p.share_habits && 'habits',
                      p.share_goals && 'goals',
                      p.share_challenges && 'challenges',
                      p.share_achievements && 'achievements',
                    ].filter(Boolean).join(' · ') || 'nothing'}
                  </p>
                </div>
                <button
                  onClick={() => endPartnership(p.id)}
                  className="text-[12px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-700)] transition-colors shrink-0"
                >
                  End
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Pending you sent */}
      {data.sent.length > 0 && (
        <section className="space-y-3">
          <p className="eyebrow">Your invites</p>
          <div className="space-y-2">
            {data.sent.map(p => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Pending invite code</p>
                    <p className="font-mono text-[18px] font-semibold tracking-[0.15em] text-[var(--color-text-primary)] mt-1">{p.invite_code}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">Share this code with the person you want to keep accountable with.</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => p.invite_code && copyCode(p.invite_code)}
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {copiedCode === p.invite_code
                        ? <><Check className="h-3 w-3" strokeWidth={2} />Copied</>
                        : <><Copy className="h-3 w-3" strokeWidth={1.75} />Copy</>}
                    </button>
                    <button
                      onClick={() => endPartnership(p.id)}
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-[12px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-700)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Generate / redeem */}
      <section className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">Invite a partner</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
            Generate a one-time code. They redeem it on their Life OS to pair with you.
          </p>
          <button
            onClick={generateInvite}
            disabled={busy}
            className="btn btn-primary mt-3 w-full"
          >
            {busy ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : <Plus className="h-[14px] w-[14px]" strokeWidth={2} />}
            Generate invite code
          </button>
        </div>

        <div className="card p-4">
          <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">Redeem a code</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
            Got a code from someone else? Paste it here.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={redeemCode}
              onChange={e => setRedeemCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              placeholder="ABCD2345"
              className="input font-mono tracking-[0.15em] text-center"
              maxLength={8}
            />
            <button
              onClick={redeem}
              disabled={busy || redeemCode.length !== 8}
              className="btn btn-secondary"
            >
              Redeem
            </button>
          </div>
        </div>
      </section>

      {error && <p className="text-[12px] text-[var(--color-danger-700)]">{error}</p>}

      {data.active.length === 0 && data.sent.length === 0 && data.received.length === 0 && (
        <div className="card p-6 text-center">
          <Users className="h-6 w-6 mx-auto text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.5} />
          <p className="text-[13px] text-[var(--color-text-secondary)] font-medium">No partners yet</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">Generate an invite code above to pair with someone you trust to keep you accountable.</p>
        </div>
      )}
    </div>
  )
}

// ─── Achievements panel ────────────────────────────────────────────────────────

function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    const r = await fetch(`/api/community/achievements${refresh ? '?refresh=true' : ''}`).then(r => r.json())
    setAchievements(r.achievements ?? [])
    setLoading(false); setRefreshing(false)
  }
  useEffect(() => { load(true) }, [])

  async function share(id: string) {
    try {
      const res = await fetch(`/api/community/achievements?id=${id}`, { method: 'POST' })
      if (res.ok) {
        toast({ kind: 'success', message: 'Achievement shared with active partners' })
        load()
      } else {
        toast({ kind: 'error', message: 'Could not share achievement' })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  if (loading) return <Centered><Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-tertiary)]" /></Centered>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Earned milestones</p>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <RefreshCw className={cn('h-[12px] w-[12px]', refreshing && 'animate-spin')} strokeWidth={1.75} />
          Re-scan my data
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="card p-6 text-center">
          <Trophy className="h-6 w-6 mx-auto text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.5} />
          <p className="text-[13px] text-[var(--color-text-secondary)] font-medium">No achievements yet</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">Build a 7-day habit streak, complete a savings goal, or finish a challenge — they'll show up here automatically.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {achievements.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 leading-none mt-0.5">{a.emoji ?? '🏆'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">{a.title}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mt-1">{a.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                      {new Date(a.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => share(a.id)}
                      disabled={a.is_shared}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors disabled:text-[var(--color-success-700)] disabled:cursor-default"
                    >
                      {a.is_shared
                        ? <><Check className="h-3 w-3" strokeWidth={2} />Shared</>
                        : <><Share2 className="h-3 w-3" strokeWidth={1.75} />Share</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center py-12">{children}</div>
}
