'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, Check, X, Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { PersonalisationPreferences, PersonalisationInsight, Tone, Verbosity, Proactivity } from '@/lib/personalisation/types'

interface Catalogs {
  interests: readonly string[]
  modules: readonly { id: string; label: string }[]
}

interface PageState {
  preferences: PersonalisationPreferences | null
  insights: PersonalisationInsight[]
  catalogs: Catalogs | null
  loading: boolean
  saving: boolean
  learning: boolean
  message: string | null
}

const TONE_OPTIONS: { id: Tone; label: string; hint: string }[] = [
  { id: 'warm',       label: 'Warm',       hint: 'Like a thoughtful friend' },
  { id: 'concise',    label: 'Concise',    hint: 'Direct, no filler' },
  { id: 'analytical', label: 'Analytical', hint: 'Quantified, precise' },
  { id: 'playful',    label: 'Playful',    hint: 'Light, occasional humour' },
  { id: 'formal',     label: 'Formal',     hint: 'Professional, respectful' },
]

const VERBOSITY_OPTIONS: { id: Verbosity; label: string; hint: string }[] = [
  { id: 'brief',    label: 'Brief',    hint: '1–3 sentences' },
  { id: 'balanced', label: 'Balanced', hint: 'Match the question' },
  { id: 'detailed', label: 'Detailed', hint: 'Thorough explanations' },
]

const PROACTIVITY_OPTIONS: { id: Proactivity; label: string; hint: string }[] = [
  { id: 'reactive', label: 'Reactive', hint: 'Answer only what was asked' },
  { id: 'balanced', label: 'Balanced', hint: 'One related suggestion' },
  { id: 'high',     label: 'High',     hint: 'Surface risks + opportunities' },
]

export default function PersonalisationPage() {
  const [state, setState] = useState<PageState>({
    preferences: null, insights: [], catalogs: null,
    loading: true, saving: false, learning: false, message: null,
  })

  async function load() {
    const r = await fetch('/api/personalisation').then(r => r.json())
    setState(s => ({
      ...s,
      preferences: r.preferences,
      insights: r.insights ?? [],
      catalogs: r.catalogs,
      loading: false,
    }))
  }

  useEffect(() => { load() }, [])

  async function save(patch: Partial<PersonalisationPreferences>) {
    setState(s => ({ ...s, saving: true, message: null }))
    try {
      const res = await fetch('/api/personalisation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setState(s => ({ ...s, preferences: json.preferences, saving: false }))
      } else {
        setState(s => ({ ...s, saving: false }))
        toast({ kind: 'error', message: 'Could not save preference', description: json.error })
      }
    } catch {
      setState(s => ({ ...s, saving: false }))
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  async function runLearning() {
    setState(s => ({ ...s, learning: true, message: null }))
    const res = await fetch('/api/personalisation/learn', { method: 'POST' })
    const json = await res.json()
    setState(s => ({
      ...s,
      insights: json.insights ?? [],
      learning: false,
      message: json.skipped === 'learning_disabled' ? 'Learning is paused in your privacy settings' : `Found ${json.count ?? 0} pattern${json.count === 1 ? '' : 's'}`,
    }))
    setTimeout(() => setState(s => ({ ...s, message: null })), 2500)
  }

  async function dismissInsight(id: string) {
    await fetch(`/api/personalisation/learn?id=${id}`, { method: 'DELETE' })
    setState(s => ({ ...s, insights: s.insights.filter(i => i.id !== id) }))
  }

  if (state.loading || !state.preferences || !state.catalogs) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  const p = state.preferences
  const c = state.catalogs

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]
  }

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 sm:py-8 max-w-[760px] mx-auto space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-[18px] w-[18px] text-[var(--color-brand-600)]" strokeWidth={1.75} />
          <h1>Personalisation</h1>
        </div>
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          Shape how your AI thinks, talks, and learns about you. Changes apply to chat, briefings, and every AI response across Life OS.
        </p>
        {state.message && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gray-100)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-secondary)]">
            <Check className="h-3 w-3" strokeWidth={2} /> {state.message}
          </p>
        )}
      </header>

      {/* AI tone */}
      <Section eyebrow="Tone" title="How should the AI sound?">
        <Choices
          value={p.tone}
          options={TONE_OPTIONS}
          onChange={(v) => save({ tone: v })}
          disabled={state.saving}
        />
      </Section>

      {/* Verbosity */}
      <Section eyebrow="Verbosity" title="How long should replies be?">
        <Choices
          value={p.verbosity}
          options={VERBOSITY_OPTIONS}
          onChange={(v) => save({ verbosity: v })}
          disabled={state.saving}
        />
      </Section>

      {/* Proactivity */}
      <Section eyebrow="Proactivity" title="How forward should the AI be?">
        <Choices
          value={p.proactivity}
          options={PROACTIVITY_OPTIONS}
          onChange={(v) => save({ proactivity: v })}
          disabled={state.saving}
        />
      </Section>

      {/* Interests */}
      <Section eyebrow="Interests" title="What do you actively care about?" hint="Used to bias your daily briefing and AI feed">
        <div className="flex flex-wrap gap-1.5">
          {c.interests.map(int => {
            const active = p.interests.includes(int)
            return (
              <button
                key={int}
                disabled={state.saving}
                onClick={() => save({ interests: toggle(p.interests, int) })}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                  active
                    ? 'bg-[var(--color-gray-900)] text-white border-[var(--color-gray-900)]'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
                )}
              >
                {int.replace('-', ' ')}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Pinned modules */}
      <Section eyebrow="Pinned modules" title="Surface these first" hint="Pinned modules will appear at the top of your home dashboard">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {c.modules.map(m => {
            const active = p.priority_modules.includes(m.id)
            return (
              <button
                key={m.id}
                disabled={state.saving}
                onClick={() => save({ priority_modules: toggle(p.priority_modules, m.id) })}
                className={cn(
                  'flex items-center justify-between rounded-md border px-3 py-2 text-[13px] font-medium transition-colors text-left',
                  active
                    ? 'bg-[var(--color-gray-100)] text-[var(--color-text-primary)] border-[var(--color-border-strong)]'
                    : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
                )}
              >
                <span className="truncate">{m.label}</span>
                {active && <Check className="h-[14px] w-[14px] text-[var(--color-text-primary)] shrink-0" strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Learning + insights */}
      <Section
        eyebrow="Learning"
        title="What the AI has noticed about you"
        hint="Computed from your task, mood, habit, and spending data — never sent to any third party"
      >
        <div className="card p-4 mb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Pattern learning</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                Aggregates patterns from your existing data. Toggle off to disable entirely.
              </p>
            </div>
            <SwitchToggle
              checked={p.learning_enabled}
              onChange={(v) => save({ learning_enabled: v })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={runLearning}
            disabled={state.learning || !p.learning_enabled}
            className="btn btn-secondary"
          >
            {state.learning
              ? <Loader2 className="h-[14px] w-[14px] animate-spin" />
              : <RefreshCw className="h-[14px] w-[14px]" strokeWidth={1.75} />}
            {state.learning ? 'Analysing…' : 'Re-analyse my data'}
          </button>
        </div>

        {!p.learning_enabled ? (
          <div className="card p-5 flex items-start gap-3">
            <Lock className="h-[16px] w-[16px] text-[var(--color-text-tertiary)] mt-0.5 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">Learning is paused</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">No patterns will be computed and existing insights are not shown to the AI.</p>
            </div>
          </div>
        ) : state.insights.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              No patterns yet. Use Life OS for a couple of weeks, then click <strong>Re-analyse</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.insights.map(i => (
              <InsightCard key={i.id} insight={i} onDismiss={() => dismissInsight(i.id)} />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Section({ eyebrow, title, hint, children }: { eyebrow: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="eyebrow mb-1">{eyebrow}</p>
      <h2 className="text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)] mb-1">{title}</h2>
      {hint && <p className="text-[13px] text-[var(--color-text-tertiary)] mb-3">{hint}</p>}
      <div className={hint ? '' : 'mt-3'}>{children}</div>
    </section>
  )
}

function Choices<T extends string>({
  value, options, onChange, disabled,
}: {
  value: T
  options: { id: T; label: string; hint: string }[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
      {options.map(o => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              'card-interactive p-3 text-left',
              active && 'border-[var(--color-text-primary)] ring-1 ring-[var(--color-text-primary)]',
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{o.label}</p>
              {active && <Check className="h-[14px] w-[14px] text-[var(--color-text-primary)]" strokeWidth={2} />}
            </div>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">{o.hint}</p>
          </button>
        )
      })}
    </div>
  )
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative h-6 w-10 rounded-full transition-colors duration-[var(--duration-fast)]',
        checked ? 'bg-[var(--color-gray-900)]' : 'bg-[var(--color-gray-200)]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform duration-[var(--duration-fast)]',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function InsightCard({ insight, onDismiss }: { insight: PersonalisationInsight; onDismiss: () => void }) {
  const dotColor =
    insight.severity === 'positive' ? 'bg-[var(--color-success-500)]' :
    insight.severity === 'attention' ? 'bg-[var(--color-warning-500)]' :
    insight.severity === 'urgent' ? 'bg-[var(--color-danger-500)]' :
    'bg-[var(--color-text-tertiary)]'

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className={cn('h-1.5 w-1.5 rounded-full mt-2 shrink-0', dotColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">{insight.title}</p>
            <button
              onClick={onDismiss}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="h-[14px] w-[14px]" strokeWidth={1.75} />
            </button>
          </div>
          <p
            className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mt-1"
            dangerouslySetInnerHTML={{ __html: simpleMd(insight.summary_md) }}
          />
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 uppercase tracking-wider font-medium">
            Confidence {Math.round(insight.confidence * 100)}%
          </p>
        </div>
      </div>
    </div>
  )
}

function simpleMd(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--color-text-primary)]">$1</strong>')
    .replace(/\n/g, '<br/>')
}
