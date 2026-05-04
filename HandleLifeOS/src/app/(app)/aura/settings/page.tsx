'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Settings as SettingsIcon, Lock, Unlock, Bell, Mic,
  Download, Trash2, AlertTriangle, CheckCircle2, Shield, Baby, X,
  Accessibility, Type,
} from 'lucide-react'
import type { AuraChildProfile } from '@/types/aura'
import { cn } from '@/lib/utils'

type TextSize = 'sm' | 'base' | 'lg' | 'xl'

interface PublicSettings {
  user_id: string
  pin_set: boolean
  notifications_enabled: boolean
  voice_enabled: boolean
  reduced_motion?: boolean
  text_size?: TextSize
  high_contrast?: boolean
  created_at?: string
  updated_at?: string
}

export default function AuraSettingsPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/aura/settings').then(r => r.json()),
      fetch('/api/family/aura/profiles').then(r => r.json()),
    ])
      .then(([{ settings }, { profiles }]) => {
        setSettings(settings ?? {
          user_id: '', pin_set: false, notifications_enabled: true, voice_enabled: false,
        })
        setProfiles(profiles ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function refresh() {
    fetch('/api/aura/settings').then(r => r.json()).then(({ settings }) => setSettings(settings))
  }

  async function patch(body: Partial<{ notifications_enabled: boolean; voice_enabled: boolean; reduced_motion: boolean; text_size: TextSize; high_contrast: boolean }>, key: string) {
    setSavingKey(key)
    try {
      const res = await fetch('/api/aura/settings', {
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

  async function handleDeleteChild(id: string, name: string) {
    if (!confirm(`Delete profile for ${name}? This cannot be undone.`)) return
    const res = await fetch(`/api/family/aura/profiles/${id}`, { method: 'DELETE' })
    if (res.ok) setProfiles(prev => prev.filter(p => p.id !== id))
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md shadow-gray-300">
            <SettingsIcon className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AURA Settings</h1>
        </div>
      </div>

      <PinSection settings={settings} onChanged={refresh} />

      <Section icon={<Bell className="h-4 w-4 text-fuchsia-600" />} title="Notifications" subtitle="Receive milestone alerts and reminders">
        <Toggle checked={settings.notifications_enabled} onChange={v => patch({ notifications_enabled: v }, 'notif')} loading={savingKey === 'notif'} />
      </Section>

      <Section icon={<Mic className="h-4 w-4 text-rose-600" />} title="Voice mode" subtitle="Speak instead of type when adding entries">
        <Toggle checked={settings.voice_enabled} onChange={v => patch({ voice_enabled: v }, 'voice')} loading={savingKey === 'voice'} />
      </Section>

      <AccessibilitySection settings={settings} onPatch={patch} savingKey={savingKey} />

      <ChildrenSection children={profiles} onDelete={handleDeleteChild} />

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
    setError(null); setBusy(true)
    try {
      if (mode === 'set' || mode === 'change') {
        if (!/^\d{4,6}$/.test(newPin)) { setError('PIN must be 4-6 digits'); return }
        if (newPin !== confirmPin) { setError('PINs do not match'); return }
        const body: Record<string, string> = { pin: newPin }
        if (mode === 'change') body.current_pin = currentPin
        const res = await fetch('/api/aura/settings/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Failed'); return }
      } else if (mode === 'remove') {
        if (!/^\d{4,6}$/.test(currentPin)) { setError('Enter your current PIN'); return }
        const res = await fetch(`/api/aura/settings/pin?pin=${encodeURIComponent(currentPin)}`, { method: 'DELETE' })
        if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Failed'); return }
        sessionStorage.removeItem('aura:unlocked')
      }
      onChanged(); reset()
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
              ? 'A 4-6 digit PIN gates access to your AURA data on this device.'
              : 'Set a PIN to require unlock when opening AURA. Recommended for sensitive child data.'}
          </p>
        </div>
        {settings.pin_set && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">On</span>
        )}
      </div>

      {mode === 'idle' && (
        <div className="flex flex-wrap gap-2">
          {!settings.pin_set ? (
            <button onClick={() => setMode('set')} className="px-3 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs font-semibold hover:bg-fuchsia-700">
              Set PIN
            </button>
          ) : (
            <>
              <button onClick={() => setMode('change')} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Change PIN
              </button>
              <button onClick={() => setMode('remove')} className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50">
                Remove PIN
              </button>
            </>
          )}
        </div>
      )}

      {mode !== 'idle' && (
        <div className="space-y-2 mt-2 border-t border-gray-100 pt-3">
          {(mode === 'change' || mode === 'remove') && <PinInput value={currentPin} onChange={setCurrentPin} placeholder="Current PIN" />}
          {(mode === 'set' || mode === 'change') && (
            <>
              <PinInput value={newPin} onChange={setNewPin} placeholder="New PIN (4-6 digits)" />
              <PinInput value={confirmPin} onChange={setConfirmPin} placeholder="Confirm new PIN" />
            </>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={busy} className="flex-1 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-semibold hover:bg-fuchsia-700 disabled:opacity-40">
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
      type="password" inputMode="numeric" maxLength={6} autoComplete="off"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder={placeholder}
      className="w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 tracking-widest focus:outline-none focus:ring-2 focus:ring-fuchsia-300 placeholder:text-gray-400"
    />
  )
}

// ── Children management ────────────────────────────────────────────────────────
function ChildrenSection({ children, onDelete }: { children: AuraChildProfile[]; onDelete: (id: string, name: string) => void }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
          <Baby className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Children</p>
          <p className="text-xs text-gray-500 mt-0.5">{children.length} {children.length === 1 ? 'child' : 'children'} on this account</p>
        </div>
        <Link href="/aura?action=add" className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-800">
          Add new
        </Link>
      </div>
      {children.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">No children added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {children.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50">
              <div className="h-8 w-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold shrink-0">
                {c.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{c.full_name}</p>
                <p className="text-[11px] text-gray-400">DOB {new Date(c.date_of_birth + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button onClick={() => onDelete(c.id, c.full_name)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Data section ───────────────────────────────────────────────────────────────
function DataSection({ hasPin }: { hasPin: boolean }) {
  const [confirm, setConfirm] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleDelete() {
    setError(null); setDeleting(true)
    try {
      const body: Record<string, unknown> = { confirm: 'DELETE' }
      if (hasPin) body.pin = pin
      const res = await fetch('/api/aura/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Failed'); return }
      setDone(true)
      setTimeout(() => { window.location.href = '/aura' }, 1500)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Your data</p>
          <p className="text-xs text-gray-500 mt-0.5">Export everything or wipe all AURA data from your account.</p>
        </div>
      </div>

      <a href="/api/aura/export" download className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-fuchsia-200 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors">
        <Download className="h-4 w-4 text-fuchsia-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-fuchsia-700">Export all data (JSON)</p>
          <p className="text-[11px] text-fuchsia-500">All child profiles + coach conversations</p>
        </div>
      </a>

      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
          <Trash2 className="h-4 w-4 text-red-600" />
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-red-700">Delete all AURA data</p>
            <p className="text-[11px] text-red-500">Permanent. Cannot be undone.</p>
          </div>
        </button>
      ) : done ? (
        <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-bold">All AURA data deleted. Redirecting…</p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800 leading-relaxed">
              This permanently deletes all child profiles, milestones, growth records, health records, behaviour logs, learning data, and coach conversations. Your settings and PIN are preserved.
            </p>
          </div>
          {hasPin && <PinInput value={pin} onChange={setPin} placeholder="Enter your PIN to confirm" />}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleting || (hasPin && !pin)} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40">
              {deleting ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <button onClick={() => { setConfirm(false); setPin(''); setError(null) }} className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Accessibility Section ──────────────────────────────────────────────────────
function AccessibilitySection({ settings, onPatch, savingKey }: {
  settings: PublicSettings
  onPatch: (body: Partial<{ reduced_motion: boolean; text_size: TextSize; high_contrast: boolean }>, key: string) => Promise<void>
  savingKey: string | null
}) {
  const textSize = settings.text_size ?? 'base'

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
          <Accessibility className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Accessibility</p>
          <p className="text-xs text-gray-500 mt-0.5">Reduce motion, increase text, or boost contrast across all AURA pages.</p>
        </div>
      </div>

      {/* Text size */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Type className="h-3.5 w-3.5 text-gray-400" />
          <p className="text-xs font-semibold text-gray-600">Text size</p>
        </div>
        <div className="flex gap-1">
          {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
            <button
              key={size}
              onClick={() => onPatch({ text_size: size }, 'text_size')}
              className={cn(
                'flex-1 py-2 rounded-xl border transition-all',
                textSize === size
                  ? 'bg-violet-100 border-violet-300 text-violet-700 font-bold'
                  : 'bg-white border-gray-200 text-gray-500',
                size === 'sm' && 'text-[12px]',
                size === 'base' && 'text-[14px]',
                size === 'lg' && 'text-[16px]',
                size === 'xl' && 'text-[18px]',
              )}
            >
              A
            </button>
          ))}
        </div>
      </div>

      {/* Reduced motion */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Reduce motion</p>
          <p className="text-[11px] text-gray-500">Disable animations and transitions</p>
        </div>
        <Toggle
          checked={settings.reduced_motion ?? false}
          onChange={v => onPatch({ reduced_motion: v }, 'reduced_motion')}
          loading={savingKey === 'reduced_motion'}
        />
      </div>

      {/* High contrast */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">High contrast</p>
          <p className="text-[11px] text-gray-500">Darken text and borders for better visibility</p>
        </div>
        <Toggle
          checked={settings.high_contrast ?? false}
          onChange={v => onPatch({ high_contrast: v }, 'high_contrast')}
          loading={savingKey === 'high_contrast'}
        />
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
    <button onClick={() => onChange(!checked)} disabled={loading} className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
      checked ? 'bg-fuchsia-500' : 'bg-gray-200',
      loading && 'opacity-60',
    )}>
      <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}
