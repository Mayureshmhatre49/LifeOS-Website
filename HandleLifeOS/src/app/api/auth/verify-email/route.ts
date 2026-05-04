import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getEmailVerificationToken, markEmailVerified } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/security/audit-log'
import { checkAuthRateLimit } from '@/lib/security/rate-limit'

// Token format guard — block obviously malformed tokens before any DB work.
// Tokens are 32 random bytes hex-encoded → 64 chars.
const TOKEN_RE = /^[0-9a-f]{64}$/i

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'

  // Rate-limit by IP to prevent token brute-force (5 attempts / 15 min).
  const limit = await checkAuthRateLimit(ip)
  if (!limit.success) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=rate_limited`)
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token || !TOKEN_RE.test(token) || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`)
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const record = await getEmailVerificationToken(tokenHash)

    if (!record) {
      return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`)
    }

    const userId = (record.users as { id: string }).id
    await markEmailVerified(userId, record.id)

    writeAuditLog({
      action: 'user.email_verified',
      user_id: userId,
      metadata: {},
    })

    return NextResponse.redirect(`${appUrl}/verify-email?status=success`)
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.redirect(`${appUrl}/verify-email?status=error`)
  }
}
