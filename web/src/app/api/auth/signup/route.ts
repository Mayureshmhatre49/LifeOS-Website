import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signupSchema } from '@/lib/security/validators'
import { getUserByEmail, createUser } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { checkAuthRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const limit = checkAuthRateLimit(ip)

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(limit.remaining, limit.resetIn) }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
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
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await createUser({ email, name, password_hash })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
  } catch (error) {
    console.error('[signup]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
