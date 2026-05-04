import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { getUserByEmail, createEmailVerificationToken } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkSignupRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { sendVerificationEmail } from '@/lib/email/send'

const schema = z.object({
  email: z.string().email().max(255).transform(v => v.toLowerCase().trim()),
})

// Generic response — never reveal whether an email exists
const OK = NextResponse.json({ message: 'If that email has an account, a verification link has been sent.' })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  const limit = await checkSignupRateLimit(ip)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(limit.remaining, limit.resetIn) }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  const { email } = parsed.data

  try {
    const user = await getUserByEmail(email)

    // If no user, or already verified — return generic OK (no enumeration)
    if (!user || user.email_verified) return OK

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    await createEmailVerificationToken(user.id, tokenHash)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${rawToken}`
    sendVerificationEmail(user.email, user.name ?? '', verifyUrl).catch(() => {})
  } catch (err) {
    console.error('[resend-verification]', err)
  }

  return OK
}
