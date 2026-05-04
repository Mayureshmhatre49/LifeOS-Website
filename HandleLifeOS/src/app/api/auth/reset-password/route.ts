import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getPasswordResetToken, markPasswordResetTokenUsed, updateUserPassword } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAuthRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/security/audit-log'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(64).max(64),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  const limit = await checkAuthRateLimit(ip)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: rateLimitHeaders(limit.remaining, limit.resetIn) }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { token, password } = parsed.data
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const record = await getPasswordResetToken(tokenHash)

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = (record.users as { id: string }).id

    await Promise.all([
      updateUserPassword(userId, passwordHash),
      markPasswordResetTokenUsed(record.id),
    ])

    writeAuditLog({
      action: 'user.password_changed',
      user_id: userId,
      ip_address: ip,
      metadata: { method: 'password_reset' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
