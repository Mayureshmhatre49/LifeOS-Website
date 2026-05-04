import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { verifyOTP } from '@/lib/security/otp-store'
import { linkOrUpdateSession } from '@/lib/db/whatsapp-queries'
import { isTwilioConfigured, sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { isSupabaseConfigured } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/security/audit-log'
import { z } from 'zod'

const schema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{6,14}$/),
  otp: z.string().length(6).regex(/^\d{6}$/),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { phoneNumber, otp } = parsed.data
  const otpKey = `whatsapp:${session.user.id}:${phoneNumber}`
  const result = verifyOTP(otpKey, otp)

  if (!result.valid) {
    const messages: Record<string, string> = {
      expired: 'Code has expired. Please request a new one.',
      wrong_otp: 'Incorrect code. Please try again.',
      too_many_attempts: 'Too many attempts. Please request a new code.',
      not_found: 'Code not found. Please request a new one.',
    }
    return NextResponse.json(
      { error: messages[result.reason ?? 'wrong_otp'] ?? 'Invalid code.' },
      { status: 400 }
    )
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ linked: true, phoneNumber })
  }

  const waSession = await linkOrUpdateSession(
    session.user.id,
    phoneNumber,
    session.user.name ?? undefined
  )

  writeAuditLog({
    action: 'whatsapp.linked',
    user_id: session.user.id,
    metadata: { phoneNumber },
  })

  if (isTwilioConfigured()) {
    const name = session.user.name?.split(' ')[0] ?? 'there'
    sendWhatsAppMessage(
      phoneNumber,
      `✅ *Life OS linked!* Hi ${name}, your WhatsApp is now connected.\n\nMessage me anytime — I can help with planning, money, scam checks, focus, and more!`
    ).catch(() => {})
  }

  return NextResponse.json({ linked: true, phoneNumber: waSession.phoneNumber })
}
