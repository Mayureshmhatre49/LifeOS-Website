'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const SESSION_KEY = 'mind:unlocked'

export function MindLockGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'open' | 'locked' | 'unlocked'>('loading')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') {
      setStatus('unlocked')
      return
    }
    fetch('/api/mind/settings')
      .then(r => r.json())
      .then(({ settings }) => {
        if (!settings?.pin_set) {
          setStatus('open')
        } else {
          setStatus('locked')
        }
      })
      .catch(() => setStatus('open')) // fail-open if API is unreachable
  }, [])

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (verifying) return
    setError(null)
    setVerifying(true)
    try {
      const res = await fetch('/api/mind/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const j = await res.json()
      if (j.valid) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setStatus('unlocked')
      } else {
        setError('Incorrect PIN')
        setPin('')
      }
    } catch {
      setError('Could not verify. Try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  if (status === 'open' || status === 'unlocked') {
    return <>{children}</>
  }

  // Locked
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="rounded-3xl bg-white/90 backdrop-blur border border-white/60 shadow-md p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-violet-200">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Mind is locked</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Enter your PIN to access your private mental wellness data.
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className={cn(
                'w-full text-center text-2xl tracking-[0.6em] rounded-2xl border bg-gray-50 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-violet-300',
                error ? 'border-red-300' : 'border-gray-200'
              )}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={pin.length < 4 || verifying}
              className="w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {verifying ? 'Verifying…' : 'Unlock'}
            </button>
          </form>

          <Link
            href="/dashboard"
            className="block mt-4 text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
