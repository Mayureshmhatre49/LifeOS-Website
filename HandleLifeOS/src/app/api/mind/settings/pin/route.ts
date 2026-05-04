import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { hashPin, getMindSettings, upsertMindSettings, clearMindPin } from '@/lib/db/mind-settings-queries'

// Set or change PIN. If PIN already set, current_pin is required.
const setSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/),
  current_pin: z.string().regex(/^\d{4,6}$/).optional(),
})

const verifySchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/),
})

// Set/change PIN
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = setSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 })

  const userId = session.user.id
  const existing = await getMindSettings(userId)

  // If a PIN is already set, require the current PIN to change it
  if (existing?.pin_hash) {
    if (!parsed.data.current_pin) {
      return NextResponse.json({ error: 'Current PIN required to change' }, { status: 400 })
    }
    const matches = existing.pin_hash === hashPin(userId, parsed.data.current_pin)
    if (!matches) {
      return NextResponse.json({ error: 'Current PIN incorrect' }, { status: 403 })
    }
  }

  await upsertMindSettings(userId, { pin_hash: hashPin(userId, parsed.data.pin) })
  return NextResponse.json({ ok: true })
}

// Verify PIN — returns { valid: true/false }, used by gate
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const settings = await getMindSettings(session.user.id)
  if (!settings?.pin_hash) return NextResponse.json({ valid: true })

  const valid = settings.pin_hash === hashPin(session.user.id, parsed.data.pin)
  return NextResponse.json({ valid })
}

// Disable PIN — requires current PIN
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const pin = searchParams.get('pin')

  const userId = session.user.id
  const existing = await getMindSettings(userId)

  if (existing?.pin_hash) {
    if (!pin) return NextResponse.json({ error: 'Current PIN required' }, { status: 400 })
    const matches = existing.pin_hash === hashPin(userId, pin)
    if (!matches) return NextResponse.json({ error: 'PIN incorrect' }, { status: 403 })
  }

  await clearMindPin(userId)
  return NextResponse.json({ ok: true })
}
