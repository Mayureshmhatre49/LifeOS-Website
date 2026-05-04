'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Settings as SettingsIcon, Lock, Unlock, Bell, Mic,
  Download, Trash2, AlertTriangle, CheckCircle2, Clock, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublicSettings {
  user_id: string
  pin_set: boolean
  reminder_time: string | null
  voice_enabled: boolean
  notifications_enabled: boolean
  created_at?: string
  updated_at?: string
}

export default function MindSettingsPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/mind/settings')
      .then(r => r.json())
      .then(({ settings }) => setSettings(settings ?? {
        user_id: '', pin_set: false, reminder_time: null, voice_enabled: false, notifications_enabled: true,
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function patch(body: Partial<{ reminder_time: string | null; voice_enabled: boolean; notifications_enabled: boolean }>, key: string) {
    setSavingKey(key)
    try {
      const res = await fetch('/api/mind/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const { settings: updated } = await res.json()
        setSettings(updated)
      }
    } finally {
      setSavingKey(null)
    }
  }

  function refreshFromServer() {
    fetch('/api/mind/settings').then(r => r.json()).then(({ settings }) => setSettings(settings))
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md shadow-gray-300">
            <SettingsIcon className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mind Settings</h1>
        </div>
      </div>

      {/* PIN section */}
      <PinSection settings={settings} onChanged={refreshFromServer} />

      {/* Daily check-in reminder */}
      <Section icon={<Clock className="h-4 w-4 text-amber-600" />} title="Daily reminder" subtitle="When to nudge you for a mood check-in">
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={settings.reminder_time ?? ''}
            onChange={e => patch({ reminder_time: e.target.value || null }, 'reminder_time')}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          {settings.reminder_time && (
            <button
              onClick={() => patch({ reminder_time: null }, 'reminder_time')}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Clear
            </button>
          )}
        </div>
        {savingKey === 'reminder_time' && <p className="text-[10px] text-gray-400 mt-1">Saving…</p>}
      </Section>

      {/* Toggles */}
      <Section icon={<Bell className="h-4 w-4 text-indigo-600" />} title="Notifications" subtitle="Receive reminders and insights">
        <Toggle
          checked={settings.notifications_enabled}
          onChange={v => patch({ notifications_enabled: v }, 'notifications')}
          loading={savingKey === 'notifications'}
        />
      </Section>

      <Section icon={<Mic className="h-4 w-4 text-rose-600" />} title="Voice mode" subtitle="Speak instead of type for journaling and check-ins">
        <Toggle
          checked={settings.voice_enabled}
          onChange={v => patch({ voice_enabled: v }, 'voice')}
          loading={savingKey === 'voice'}
        />
      </Section>

      {/* Data section */}
      <DataSection hasPin={settings.pin_set} />
    </div>
  )
}

// ── PIN section ────────────────────────────────────────────────────────────────
function PinSection({ settings, onChanged }: { settings: PublicSettings; onChanged: () => void }) {
  const [mode, setMode] = useState<'idle' | 'set' | 'change' | 'remove'>('idle')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function reset() {
    setMode('idle'); setCurrentPin(''); setNewPin(''); setConfirmPin(''); setError(null)
  }

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      if (mode === 'set' || mode === 'change') {
        if (!/^\d{4,6}$/.test(newPin)) { setError('PIN must be 4-6 digits'); return }
        if (newPin !== confirmPin) { setError('PINs do not match'); return }
        const body: Record<string, string> = { pin: newPin }
        if (mode === 'change') body.current_pin = currentPin
        const res = await fetch('/api/mind/settings/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError(j.error ?? 'Failed to set PIN')
          return
        }
      } else if (mode === 'remove') {
        if (!/^\d{4,6}$/.test(currentPin)) { setError('Enter your current PIN'); return }
        const res = await fetch(`/api/mind/settings/pin?pin=${encodeURIComponent(currentPin)}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError(j.error ?? 'Failed to remove PIN')
          return
        }
        // Clear unlocked-this-session flag too
        sessionStorage.removeItem('mind:unlocked')
      }
      onChanged()
      reset()
    } finally {
      setBusy(false)
    }
  }

  const Icon = settings.pin_set ? Lock : Unlock
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
          settings.pin_set ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Privacy PIN</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {settings.pin_set
              ? 'A 4-6 digit PIN gates access to your Mind module on this device.'
              : 'Set a PIN to require unlock when opening Mind. Recommended on shared devices.'}
          </p>
        </div>
        {settings.pin_set && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">On</span>
        )}
      </div>

      {mode === 'idle' && (
        <div className="flex flex-wrap gap-2">
          {!settings.pin_set ? (
            <button
              onClick={() => setMode('set')}
              className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
            >
              Set PIN
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode('change')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Change PIN
              </button>
              <button
                onClick={() => setMode('remove')}
                className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Remove PIN
              </button>
            </>
          )}
        </div>
      )}

      {mode !== 'idle' && (
        <div className="space-y-2 mt-2 border-t border-gray-100 pt-3">
          {(mode === 'change' || mode === 'remove') && (
            <PinInput value={currentPin} onChange={setCurrentPin} placeholder="Current PIN" />
          )}
          {(mode === 'set' || mode === 'change') && (
            <>
              <PinInput value={newPin} onChange={setNewPin} placeholder="New PIN (4-6 digits)" />
              <PinInput value={confirmPin} onChange={setConfirmPin} placeholder="Confirm new PIN" />
            </>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={busy}
              className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-40"
            >
              {busy ? 'Saving…' : mode === 'remove' ? 'Remove PIN' : mode === 'set' ? 'Set PIN' : 'Change PIN'}
            </button>
            <button onClick={reset} className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PinInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="password"
      inputMode="numeric"
      maxLength={6}
      autoComplete="off"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder={placeholder}
      className="w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-gray-400"
    />
  )
}

// ── Data section ───────────────────────────────────────────────────────────────
function DataSection({ hasPin }: { hasPin: boolean }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletePin, setDeletePin] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  async function handleDelete() {
    setDeleteError(null)
    setDeleting(true)
    try {
      const body: Record<string, unknown> = { confirm: 'DELETE' }
      if (hasPin) body.pin = deletePin
      const res = await fetch('/api/mind/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setDeleteError(j.error ?? 'Failed to delete')
        return
      }
      setDeleted(true)
      setTimeout(() => { window.location.href = '/mind' }, 1500)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Your data</p>
          <p className="text-xs text-gray-500 mt-0.5">Export everything or wipe all Mind data from your account.</p>
        </div>
      </div>

      <BackfillButton />

      {/* Export */}
      <a
        href="/api/mind/export"
        download
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
      >
        <Download className="h-4 w-4 text-indigo-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-indigo-700">Export all data (JSON)</p>
          <p className="text-[11px] text-indigo-500">Mood, journal, gratitude, sleep, tools, companion sessions</p>
        </div>
      </a>

      {/* Delete */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-red-700">Delete all Mind data</p>
            <p className="text-[11px] text-red-500">Permanent. Cannot be undone.</p>
          </div>
        </button>
      ) : deleted ? (
        <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-bold">All Mind data deleted. Redirecting…</p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800 leading-relaxed">
              This permanently deletes all mood logs, journal entries, gratitudes, sleep logs, tool sessions, and companion conversations. Your settings and PIN are preserved.
            </p>
          </div>
          {hasPin && (
            <PinInput value={deletePin} onChange={setDeletePin} placeholder="Enter your PIN to confirm" />
          )}
          {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting || (hasPin && !deletePin)}
              className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40"
            >
              {deleting ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <button
              onClick={() => { setConfirmDelete(false); setDeletePin(''); setDeleteError(null) }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reusable bits ──────────────────────────────────────────────────────────────
function BackfillButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [result, setResult] = useState<{ succeeded: number; processed: number } | null>(null)

  async function run() {
    setStatus('running'); setResult(null)
    let totalSucceeded = 0
    let totalProcessed = 0
    // Loop until backend reports done
    for (let i = 0; i < 10; i++) {
      const res = await fetch('/api/mind/journal/backfill-embeddings', { method: 'POST' })
      if (!res.ok) break
      const j = await res.json()
      totalSucceeded += j.succeeded ?? 0
      totalProcessed += j.processed ?? 0
      if (j.processed < 50) break
    }
    setResult({ succeeded: totalSucceeded, processed: totalProcessed })
    setStatus('done')
  }

  return (
    <div className="rounded-xl bg-violet-50/50 border border-violet-100 p-3">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-bold text-violet-700">AI memory (RAG)</p>
          <p className="text-[11px] text-violet-600 mt-0.5 leading-relaxed">
            Lets the Companion recall past journal entries semantically. New entries are indexed automatically — use this once for older entries.
          </p>
          {result && (
            <p className="text-[11px] text-violet-700 mt-1 font-bold">
              ✓ {result.succeeded} of {result.processed} entries indexed
            </p>
          )}
        </div>
        <button
          onClick={run}
          disabled={status === 'running'}
          className="px-3 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 disabled:opacity-40 shrink-0"
        >
          {status === 'running' ? 'Working…' : status === 'done' ? 'Run again' : 'Index past entries'}
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading?: boolean }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={loading}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-violet-500' : 'bg-gray-200',
        loading && 'opacity-60'
      )}
    >
      <span className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  )
}
