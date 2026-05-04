'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Check, Unlink, Loader2, ExternalLink, Smartphone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WhatsAppStatus {
  linked: boolean
  phoneNumber?: string
  displayName?: string
  linkedAt?: string
  twilioConfigured: boolean
  whatsappNumber?: string
}

type FlowStep = 'idle' | 'otp_sent' | 'linked'

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [flowStep, setFlowStep] = useState<FlowStep>('idle')
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'email'>('whatsapp')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then((r) => r.json())
      .then((data: WhatsAppStatus) => {
        setStatus(data)
        if (data.phoneNumber) setPhoneInput(data.phoneNumber)
      })
      .catch(() => setError('Could not load WhatsApp status.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/settings/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneInput.trim() }),
      })
      const data = await res.json() as { ok?: boolean; channel?: 'whatsapp' | 'email'; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP.')
      } else {
        setOtpChannel(data.channel ?? 'whatsapp')
        setFlowStep('otp_sent')
        setSuccess(
          data.channel === 'email'
            ? 'OTP sent to your email (WhatsApp not configured).'
            : 'OTP sent to your WhatsApp number.'
        )
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/settings/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneInput.trim(), otp: otpInput.trim() }),
      })
      const data = await res.json() as { linked?: boolean; phoneNumber?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Verification failed.')
      } else {
        setStatus((prev) => prev ? { ...prev, linked: true, phoneNumber: data.phoneNumber ?? phoneInput.trim() } : null)
        setFlowStep('linked')
        setSuccess('WhatsApp linked successfully! You can now message Life OS directly.')
        setOtpInput('')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUnlink() {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await fetch('/api/settings/whatsapp', { method: 'DELETE' })
      setStatus((prev) => prev ? { ...prev, linked: false, phoneNumber: undefined } : null)
      setPhoneInput('')
      setSuccess('WhatsApp unlinked successfully.')
    } catch {
      setError('Failed to unlink. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  const lifeOsWaNumber = status?.whatsappNumber

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-semibold text-gray-900">WhatsApp</h1>
        </div>
        <p className="text-sm text-gray-500">
          Connect your WhatsApp number to access Life OS hands-free from any device.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">How it works</p>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
            Enter your WhatsApp phone number below (include country code)
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
            Click Link — we&apos;ll send a test message to confirm
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
            Message Life OS on WhatsApp anytime — it knows who you are
          </li>
        </ol>

        {lifeOsWaNumber && (
          <div className="flex items-center gap-2 pt-1 text-sm">
            <Smartphone className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-gray-600">Life OS WhatsApp number:</span>
            <span className="font-mono font-semibold text-gray-900">{lifeOsWaNumber}</span>
            <a
              href={`https://wa.me/${lifeOsWaNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Current status */}
      {status?.linked && (
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">WhatsApp linked</p>
            <p className="text-xs text-green-600 font-mono">{status.phoneNumber}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlink}
            disabled={saving}
            className="shrink-0 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Unlink className="h-3.5 w-3.5 mr-1.5" />
            Unlink
          </Button>
        </div>
      )}

      {/* OTP flow */}
      {flowStep === 'idle' || flowStep === 'linked' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Your WhatsApp number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+919876543210"
              className="font-mono"
              disabled={saving}
            />
            <p className="text-xs text-gray-400">Include country code, e.g. +91 for India</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

          <Button
            type="submit"
            disabled={saving || !phoneInput.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}
            Send verification code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <p className="font-medium mb-0.5">Code sent!</p>
            <p className="text-xs">
              A 6-digit code was sent via <strong>{otpChannel === 'whatsapp' ? 'WhatsApp' : 'email'}</strong> to <strong>{phoneInput}</strong>. Enter it below.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="font-mono tracking-widest text-lg text-center"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setFlowStep('idle'); setError(''); setOtpInput('') }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={saving || otpInput.length !== 6}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify & link
            </Button>
          </div>

          <button
            type="button"
            onClick={handleSendOTP as unknown as React.MouseEventHandler}
            className="w-full text-xs text-gray-400 hover:text-gray-600 text-center"
          >
            Didn&apos;t receive it? Resend code
          </button>
        </form>
      )}

      {/* Twilio warning */}
      {!status?.twilioConfigured && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p className="font-medium mb-1">Twilio not configured</p>
          <p className="text-xs">
            Add <code className="bg-amber-100 px-1 rounded">TWILIO_ACCOUNT_SID</code>,{' '}
            <code className="bg-amber-100 px-1 rounded">TWILIO_AUTH_TOKEN</code>, and{' '}
            <code className="bg-amber-100 px-1 rounded">TWILIO_WHATSAPP_NUMBER</code> to your
            environment to enable WhatsApp messaging.
          </p>
        </div>
      )}
    </div>
  )
}
