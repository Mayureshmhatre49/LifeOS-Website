import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import {
  findSessionByUserId,
  linkOrUpdateSession,
  unlinkSession,
} from '@/lib/db/whatsapp-queries'
import { isTwilioConfigured, sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { isSupabaseConfigured } from '@/lib/db/client'

const linkSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g. +919876543210)'),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      linked: false,
      twilioConfigured: isTwilioConfigured(),
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER ?? null,
    })
  }

  const wa = await findSessionByUserId(session.user.id)
  return NextResponse.json({
    linked: Boolean(wa),
    phoneNumber: wa?.phoneNumber ?? null,
    displayName: wa?.displayName ?? null,
    linkedAt: wa?.createdAt ?? null,
    twilioConfigured: isTwilioConfigured(),
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER ?? null,
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = linkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid phone number. Use E.164 format, e.g. +919876543210' },
      { status: 400 }
    )
  }

  const { phoneNumber } = parsed.data

  const waSession = await linkOrUpdateSession(
    session.user.id,
    phoneNumber,
    session.user.name ?? undefined
  )

  // Send a welcome message if Twilio is configured
  if (isTwilioConfigured()) {
    const name = session.user.name?.split(' ')[0] ?? 'there'
    await sendWhatsAppMessage(
      phoneNumber,
      `✅ *Life OS linked!* Hi ${name}, your WhatsApp is now connected.\n\nMessage me anytime — I can help with planning, money, scam checks, focus, and more. Try: "What's on my to-do list today?"`
    ).catch(() => {
      // Non-fatal — user can still see the link in settings
    })
  }

  return NextResponse.json({ linked: true, phoneNumber: waSession.phoneNumber }, { status: 201 })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await unlinkSession(session.user.id)
  return NextResponse.json({ linked: false })
}
