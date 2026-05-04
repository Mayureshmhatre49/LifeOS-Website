import { Resend } from 'resend'

// Lazy singleton — Resend's constructor throws on empty key in SDK v6+.
// Instantiating at module load breaks the production build when RESEND_API_KEY
// is not configured (the build evaluates every route module for cache analysis).
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not configured')
    _resend = new Resend(key)
  }
  return _resend
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Life OS <noreply@lifeos.app>'
export const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'support@lifeos.app'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}
