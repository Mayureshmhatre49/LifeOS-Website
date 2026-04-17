'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      return
    }

    setSuccess(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      router.push('/login')
    } else {
      router.push('/chat')
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/chat' })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-7">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500">Free. No credit card needed.</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Account created! Signing you in…
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mb-5 gap-2"
          onClick={handleGoogle}
          loading={googleLoading}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </Button>

        <div className="flex items-center gap-3 mb-5">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-400">or</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 number</p>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
