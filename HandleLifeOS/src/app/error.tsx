'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/logo'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)] px-4 text-center">
      <Logo className="mb-8" />
      <h1 className="text-6xl font-bold text-[var(--color-text-primary)] mb-2">Oops</h1>
      <p className="text-[var(--color-text-secondary)] mb-2 max-w-xs">Something hiccupped on our end. Your data is safe — let's get you back on track.</p>
      {error.digest && (
        <p className="text-xs text-[var(--color-text-tertiary)] mb-6 font-mono">Ref: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
