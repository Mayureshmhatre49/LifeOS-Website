import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata = { title: 'Offline · Life OS' }

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-indigo-50 to-violet-50">
      <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-white/60 flex items-center justify-center mb-5">
        <WifiOff className="h-7 w-7 text-indigo-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        Life OS needs an internet connection for live data. Anything you previously visited may still load from cache.
      </p>
      <Link href="/dashboard" className="mt-6 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
        Try again
      </Link>
    </div>
  )
}
