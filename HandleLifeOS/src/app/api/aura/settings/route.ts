import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getAuraSettings, upsertAuraSettings } from '@/lib/db/aura-settings-queries'

const patchSchema = z.object({
  notifications_enabled: z.boolean().optional(),
  voice_enabled: z.boolean().optional(),
  reduced_motion: z.boolean().optional(),
  text_size: z.enum(['sm', 'base', 'lg', 'xl']).optional(),
  high_contrast: z.boolean().optional(),
})

function publicSettings(s: Awaited<ReturnType<typeof getAuraSettings>>) {
  if (!s) return null
  const { pin_hash, ...rest } = s
  return { ...rest, pin_set: !!pin_hash }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getAuraSettings(session.user.id)
  return NextResponse.json({ settings: publicSettings(settings) })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const updated = await upsertAuraSettings(session.user.id, parsed.data)
  return NextResponse.json({ settings: publicSettings(updated) })
}
