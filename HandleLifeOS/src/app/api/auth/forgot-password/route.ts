import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getUserByEmail, createPasswordResetToken } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAuthRateLimit, checkPasswordResetRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email/send'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  const limit = await checkAuthRateLimit(ip)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(limit.remaining, limit.resetIn) }
    )
  }

  // Always return 200 to prevent email enumeration
  const ok = NextResponse.json({ ok: true })

  if (!isSupabaseConfigured()) return ok

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return ok

    // Per-email rate limit (3 / hour) — prevents resetting the same account repeatedly.
    // Hide existence by always returning ok regardless of result.
    const emailLimit = await checkPasswordResetRateLimit(parsed.data.email)
    if (!emailLimit.success) return ok

    const user = await getUserByEmail(parsed.data.email)
    if (!user) return ok

    // Generate a cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    await createPasswordResetToken(user.id, tokenHash)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`

    await sendPasswordResetEmail(user.email, user.name ?? 'there', resetUrl)
  } catch (err) {
    // Swallow errors — never reveal to caller whether the email exists
    console.error('[forgot-password]', err)
  }

  return ok
}
