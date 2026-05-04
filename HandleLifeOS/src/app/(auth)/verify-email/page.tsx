'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle2, AlertCircle, XCircle, Mail, RefreshCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ── Resend form ───────────────────────────────────────────────────────────────
function ResendForm({ defaultEmail }: { defaultEmail: string }) {
  const [email, setEmail] = useState(defaultEmail)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Sent! Check your inbox and spam folder.
      </div>
    )
  }

  return (
    <form onSubmit={handleResend} className="space-y-2">
      {status === 'error' && (
        <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="sm" className="shrink-0 gap-1.5" loading={status === 'sending'}>
          <RefreshCw className="h-3.5 w-3.5" />
          Resend
        </Button>
      </div>
      <p className="text-xs text-gray-400">Didn&apos;t get it? Check spam or resend above.</p>
    </form>
  )
}

// ── Page content ──────────────────────────────────────────────────────────────
function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const status = searchParams.get('status')
  const emailParam = searchParams.get('email') ?? ''
  const defaultEmail = emailParam || session?.user?.email || ''

  // Redirect already-verified users away
  useEffect(() => {
    if (session?.user?.email_verified) {
      router.replace('/dashboard')
    }
  }, [session, router])

  // ── Verified successfully ─────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
          <p className="text-sm text-gray-500 mt-1">Your account is now active. Sign in to get started.</p>
        </div>
        <Link href="/login">
          <Button className="gap-2 w-full">
            Sign in now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  // ── Expired / invalid token ───────────────────────────────────────────────
  if (status === 'invalid' || status === 'error') {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Link expired</h1>
            <p className="text-sm text-gray-500 mt-1">
              This verification link has expired or already been used. Links are valid for 24 hours.
            </p>
          </div>
        </div>
        <ResendForm defaultEmail={defaultEmail} />
        <p className="text-center text-xs text-gray-400">
          Already verified?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    )
  }

  // ── Pending gate (logged in but unverified) ───────────────────────────────
  if (status === 'pending') {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-sm text-gray-500 mt-1">
              Please verify your email before accessing Life OS.
              Check your inbox for the link we sent when you signed up.
            </p>
          </div>
        </div>
        <ResendForm defaultEmail={defaultEmail} />
      </div>
    )
  }

  // ── Default: check inbox (right after signup) ─────────────────────────────
  return (
    <div className="space-y-5">
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
          <Mail className="h-7 w-7 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            We sent a verification link to{' '}
            {defaultEmail
              ? <span className="font-medium text-gray-700">{defaultEmail}</span>
              : 'your email address'
            }. Click it to activate your account.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-gray-500 text-left space-y-1">
          <p>• Link expires in <strong>24 hours</strong></p>
          <p>• Check your <strong>spam / junk</strong> folder</p>
          <p>• Gmail users: check the <strong>Promotions</strong> tab</p>
        </div>
      </div>
      <ResendForm defaultEmail={defaultEmail} />
      <p className="text-center text-xs text-gray-400">
        Wrong email?{' '}
        <Link href="/signup" className="text-indigo-600 hover:underline">Sign up again</Link>
      </p>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
