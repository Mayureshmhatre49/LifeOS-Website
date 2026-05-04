'use client'

import { useState, useEffect } from 'react'
import { Lock, ShieldCheck, Milestone } from 'lucide-react'
import { cn } from '@/lib/utils'

const SESSION_KEY = 'roadmap:unlocked'

export function RoadmapLockGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') {
      setUnlocked(true)
    }
    setLoading(false)
  }, [])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (pin === '0000') {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  if (loading) return null

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50/50">
      <div className="max-w-sm w-full">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Roadmap Locked</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Enter the developer PIN to view the implementation status.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                value={pin}
                onChange={e => {
                  setError(null)
                  setPin(e.target.value.replace(/\D/g, ''))
                }}
                placeholder="••••"
                className={cn(
                  'w-full text-center text-3xl tracking-[0.5em] font-mono rounded-2xl border bg-gray-50 px-4 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all',
                  error ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'
                )}
              />
            </div>
            
            {error && (
              <p className="text-xs font-semibold text-red-500 animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              <ShieldCheck className="h-4 w-4" />
              Unlock Roadmap
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-400">
            <Milestone className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Internal Build v2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
