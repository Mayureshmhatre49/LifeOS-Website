import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getMindSettings, upsertMindSettings } from '@/lib/db/mind-settings-queries'

const patchSchema = z.object({
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  voice_enabled: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
})

// Strip pin_hash before returning to client
function publicSettings(s: Awaited<ReturnType<typeof getMindSettings>>) {
  if (!s) return null
  const { pin_hash, ...rest } = s
  return { ...rest, pin_set: !!pin_hash }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await getMindSettings(session.user.id)
  return NextResponse.json({ settings: publicSettings(settings) })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const updated = await upsertMindSettings(session.user.id, parsed.data)
  return NextResponse.json({ settings: publicSettings(updated) })
}
