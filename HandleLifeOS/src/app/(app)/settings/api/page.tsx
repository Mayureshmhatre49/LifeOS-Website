'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, Loader2, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ApiKey, ApiKeyWithSecret } from '@/types/enterprise'

export default function ApiSettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/enterprise/keys')
      .then((r) => r.json())
      .then((data: ApiKey[] | { error?: string }) => {
        if (Array.isArray(data)) setKeys(data)
        else if ('error' in data) setError(data.error ?? 'Failed to load keys.')
      })
      .catch(() => setError('Could not load API keys.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/enterprise/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json() as ApiKeyWithSecret & { error?: string; upgradeUrl?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to create key.')
      } else {
        setKeys((prev) => [data, ...prev])
        setNewSecret(data.secret)
        setNewKeyName('')
        setShowForm(false)
      }
    } catch {
      setError('Network error.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this API key? Any apps using it will stop working immediately.')) return
    await fetch(`/api/enterprise/keys/${id}`, { method: 'DELETE' })
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">API Keys</h1>
          </div>
          <a
            href="/docs"
            target="_blank"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
          >
            API Docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Use API keys to integrate Life OS into your own apps. Requires Pro or Family plan.
        </p>
      </div>

      {/* One-time secret reveal */}
      {newSecret && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-green-800">API key created — copy it now!</p>
          </div>
          <p className="text-xs text-green-700">This key will not be shown again.</p>
          <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
            <code className="flex-1 text-xs font-mono text-gray-800 break-all">{newSecret}</code>
            <button
              onClick={() => handleCopy(newSecret, 'new')}
              className="shrink-0 text-green-600 hover:text-green-700"
            >
              {copiedId === 'new' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewSecret(null)} className="w-full">
            I&apos;ve saved it
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
          {error.includes('Pro') && (
            <a href="/billing/plans" className="ml-1 font-semibold underline">Upgrade</a>
          )}
        </div>
      )}

      {/* Existing keys */}
      {keys.length > 0 && (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{key.name}</p>
                <p className="text-xs font-mono text-gray-400">{key.keyPrefix}…</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {key.requestCount.toLocaleString()} requests
                  {key.lastUsedAt && ` · last used ${new Date(key.lastUsedAt).toLocaleDateString('en-IN')}`}
                </p>
              </div>
              <button
                onClick={() => handleCopy(key.keyPrefix + '…', key.id)}
                className="text-gray-400 hover:text-gray-600"
                title="Copy prefix"
              >
                {copiedId === key.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleRevoke(key.id)}
                className="text-gray-400 hover:text-red-500"
                title="Revoke key"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {keys.length === 0 && !showForm && !error && (
        <p className="text-sm text-gray-400 text-center py-6">No API keys yet.</p>
      )}

      {/* Create form */}
      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              placeholder="e.g. My App, Production"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={creating}
              autoFocus
            />
          </div>
          <div className={cn('flex gap-2')}>
            <Button type="submit" disabled={creating || !newKeyName.trim()} className="flex-1">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
              Create key
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        keys.length < 5 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setShowForm(true); setError('') }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New API key
          </Button>
        )
      )}
    </div>
  )
}
