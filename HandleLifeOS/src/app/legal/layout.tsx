import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/legal/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-gray-900">Cookies</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-sm text-gray-400 flex gap-6">
          <Link href="/legal/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-gray-600">Terms of Service</Link>
          <Link href="/legal/cookies" className="hover:text-gray-600">Cookie Policy</Link>
          <Link href="/help" className="hover:text-gray-600">Help</Link>
        </div>
      </footer>
    </div>
  )
}
