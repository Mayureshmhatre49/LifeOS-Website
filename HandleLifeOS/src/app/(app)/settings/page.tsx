'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Brain, Shield, ChevronRight, Settings } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/memory/profile-form'
import { MemoryCenter } from '@/components/memory/memory-center'
import type { UserProfile, UpsertProfileInput } from '@/types/memory'

type Tab = 'profile' | 'memory' | 'privacy' | 'account'

const TABS = [
  { id: 'profile' as Tab, label: 'Profile', icon: User },
  { id: 'memory' as Tab, label: 'Memory', icon: Brain },
  { id: 'privacy' as Tab, label: 'Privacy', icon: Shield },
  { id: 'account' as Tab, label: 'Account', icon: Settings },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/settings')
  }, [status, router])

  const fetchProfile = useCallback(async () => {
    const res = await fetch('/api/profile')
    if (res.ok) {
      const data: UserProfile | null = await res.json()
      setProfile(data)
      if (data) setMemoryEnabled(data.memory_enabled)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) fetchProfile()
  }, [session?.user?.id, fetchProfile])

  async function handleSaveProfile(data: UpsertProfileInput) {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated: UserProfile = await res.json()
      setProfile(updated)
      setMemoryEnabled(updated.memory_enabled)
    }
  }

  async function handleExportData() {
    window.location.href = '/api/profile/export'
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' })
      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      }
    } finally {
      setDeletingAccount(false)
    }
  }

  async function handleToggleMemory() {
    setSavingToggle(true)
    const newValue = !memoryEnabled
    await handleSaveProfile({ memory_enabled: newValue })
    setMemoryEnabled(newValue)
    setSavingToggle(false)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading settings…
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">{session.user?.email}</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <nav className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  tab === id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {tab === id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Mobile tab bar */}
          <div className="sm:hidden flex gap-1 mb-4 w-full">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors ${
                  tab === id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === 'profile' && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Your profile</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Helps the AI personalise advice to your life situation.
                </p>
                <ProfileForm profile={profile} onSave={handleSaveProfile} />
              </section>
            )}

            {tab === 'memory' && (
              <section>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-900">Memory</h2>
                  <button
                    onClick={handleToggleMemory}
                    disabled={savingToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      memoryEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={memoryEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        memoryEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  {memoryEnabled
                    ? 'Memory is on — the AI uses what it knows about you to give better answers.'
                    : 'Memory is off — the AI responds without any personal context.'}
                </p>
                <Separator className="mb-5" />
                {memoryEnabled
                  ? <MemoryCenter />
                  : (
                    <div className="text-center py-10 text-gray-400">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Enable memory to manage your AI context.</p>
                    </div>
                  )
                }
              </section>
            )}

            {tab === 'privacy' && (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Privacy</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Your data stays in your Supabase instance. Nothing is shared with third parties.
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'Chat messages', detail: 'Stored in your database, never used for AI training.' },
                    { title: 'Memory items', detail: 'Only injected into your own chat sessions.' },
                    { title: 'AI requests', detail: 'Sent to Anthropic / OpenAI per their privacy policy.' },
                    { title: 'Rate limiting', detail: 'IP-based, in-memory only — not stored persistently.' },
                  ].map(({ title, detail }) => (
                    <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{title}</p>
                        <p className="text-xs text-gray-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-3 flex-wrap">
                  <a href="/legal/privacy" className="text-xs text-indigo-600 hover:underline">Privacy Policy</a>
                  <a href="/legal/terms" className="text-xs text-indigo-600 hover:underline">Terms of Service</a>
                  <a href="/legal/cookies" className="text-xs text-indigo-600 hover:underline">Cookie Policy</a>
                </div>
              </section>
            )}

            {tab === 'account' && (
              <section className="space-y-8">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Account info</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-900">Email:</span> {session.user?.email}</p>
                    <p><span className="font-medium text-gray-900">Name:</span> {session.user?.name ?? '—'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Export your data</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Download a copy of all your personal data (profile, conversations, messages) in JSON format.
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    Download my data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h2 className="text-base font-semibold text-red-700 mb-1">Delete account</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">
                        Type <strong>DELETE</strong> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'DELETE' || deletingAccount}
                      loading={deletingAccount}
                    >
                      Delete my account
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
