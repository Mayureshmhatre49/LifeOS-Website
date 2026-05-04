import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOTP } from '@/lib/security/otp-store'
import { sendOtpEmail } from '@/lib/email/send'
import { checkAuthRateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { getUserById } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { z } from 'zod'

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Invalid phone number'),
})

async function sendWhatsAppOTP(phone: string, otp: string): Promise<boolean> {
  const { isTwilioConfigured, sendWhatsAppMessage } = await import('@/lib/whatsapp/client')
  if (!isTwilioConfigured()) return false
  try {
    await sendWhatsAppMessage(
      phone,
      `Your Life OS verification code is: *${otp}*\n\nThis code expires in 10 minutes. Do not share it with anyone.`
    )
    return true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const limit = await checkAuthRateLimit(ip)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: rateLimitHeaders(limit.remaining, limit.resetIn) }
    )
  }

  const body = await req.json()
  const parsed = phoneSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 })
  }

  const { phoneNumber } = parsed.data
  const otpKey = `whatsapp:${session.user.id}:${phoneNumber}`
  const otp = createOTP(session.user.id, otpKey, 'WhatsApp verification')

  // Try WhatsApp first, fall back to email
  const sentViaWhatsApp = await sendWhatsAppOTP(phoneNumber, otp)

  if (!sentViaWhatsApp && isSupabaseConfigured()) {
    const user = await getUserById(session.user.id)
    if (user?.email) {
      await sendOtpEmail(user.email, user.name ?? '', otp, 'WhatsApp number verification')
    }
  }

  return NextResponse.json({
    ok: true,
    channel: sentViaWhatsApp ? 'whatsapp' : 'email',
  })
}
