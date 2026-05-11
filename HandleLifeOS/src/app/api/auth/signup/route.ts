import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { signupSchema } from '@/lib/security/validators'
import { getUserByEmail, createUser, createEmailVerificationToken } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAuthRateLimit, checkSignupRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { writeAuditLog, writeSecurityEvent } from '@/lib/security/audit-log'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  // ── Rate limiting (IP-level auth limit + dedicated signup limit) ─────────────
  const authLimit = await checkAuthRateLimit(ip)
  if (!authLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(authLimit.remaining, authLimit.resetIn) }
    )
  }

  const signupLimit = await checkSignupRateLimit(ip)
  if (!signupLimit.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(signupLimit.remaining, signupLimit.resetIn) }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()

    // ── Honeypot: bots fill the hidden `website` field ────────────────────────
    // Check BEFORE schema validation so the timing-matched bcrypt response is
    // reachable regardless of what the schema allows.
    if (body?.website) {
      writeSecurityEvent({
        type: 'unusual_activity',
        severity: 'info',
        details: { reason: 'honeypot_triggered', ip },
        ip_address: ip,
      })
      // Dummy bcrypt of equal cost to match real-signup timing
      await bcrypt.hash('honeypot-' + Date.now(), 12)
      return NextResponse.json({ id: 'bot', email: body.email ?? '' }, { status: 201 })
    }

    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data

    const existing = await getUserByEmail(email)
    if (existing) {
      // Constant-time response: do a dummy bcrypt so the rejection takes the same
      // time as a legitimate signup. Generic error message avoids enumerating.
      await bcrypt.hash(password, 12)
      return NextResponse.json(
        { error: 'Could not create account. Please check your details.' },
        { status: 409 }
      )
    }

    // bcrypt with cost factor 12 (≈ 250ms on modern hardware)
    const password_hash = await bcrypt.hash(password, 12)
    const user = await createUser({ email, name, password_hash })

    writeAuditLog({
      action: 'user.signup',
      user_id: user.id,
      ip_address: ip,
      metadata: { provider: 'credentials' },
    })

    // Store verification token (must succeed before returning 201)
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    await createEmailVerificationToken(user.id, tokenHash)

    // Send emails (fire-and-forget — token is already stored, resend endpoint handles retries)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${rawToken}`
    sendVerificationEmail(user.email, user.name ?? '', verifyUrl).catch(() => {})
    sendWelcomeEmail(user.email, user.name ?? '').catch(() => {})

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
  } catch (error) {
    console.error('[signup]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
