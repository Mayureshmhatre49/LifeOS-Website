import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Logo className="mb-8" />
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        This page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/chat">Open Life OS</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
