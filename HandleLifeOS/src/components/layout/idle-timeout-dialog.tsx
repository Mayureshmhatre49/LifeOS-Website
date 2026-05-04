'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useIdleTimeout } from '@/lib/hooks/use-idle-timeout'
import { Button } from '@/components/ui/button'

const IDLE_MS = 25 * 60 * 1000   // 25 minutes idle before warning
const WARN_MS = 5 * 60 * 1000    // 5 minute warning window

export function IdleTimeoutDialog() {
  const { data: session } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(Math.floor(WARN_MS / 1000))

  const handleTimeout = () => {
    signOut({ callbackUrl: '/login?reason=idle' })
  }

  const handleStayActive = () => {
    setShowWarning(false)
    setCountdown(Math.floor(WARN_MS / 1000))
    resetIdle()
  }

  const resetIdle = useIdleTimeout({
    idleMs: IDLE_MS,
    warningMs: WARN_MS,
    onWarning: () => setShowWarning(true),
    onTimeout: handleTimeout,
    enabled: Boolean(session?.user?.id),
  })

  useEffect(() => {
    if (!showWarning) return
    setCountdown(Math.floor(WARN_MS / 1000))
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showWarning])

  if (!showWarning) return null

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">⏰</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Still there?</h2>
        <p className="text-sm text-gray-500 mb-2">
          You&apos;ve been inactive for a while. For your security, you&apos;ll be signed out in:
        </p>
        <div className="text-3xl font-black text-indigo-600 mb-6 tabular-nums">{timeStr}</div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Sign out
          </Button>
          <Button className="flex-1" onClick={handleStayActive}>
            Stay signed in
          </Button>
        </div>
      </div>
    </div>
  )
}
