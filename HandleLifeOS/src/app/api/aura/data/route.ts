import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { deleteAllAuraData, hashAuraPin, getAuraSettings } from '@/lib/db/aura-settings-queries'
import { writeAuditLog } from '@/lib/security/audit-log'

const schema = z.object({
  confirm: z.literal('DELETE'),
  pin: z.string().regex(/^\d{4,6}$/).optional(),
  include_settings: z.boolean().optional(),
})

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Confirmation required: send {"confirm":"DELETE"}' }, { status: 400 })

  const userId = session.user.id
  const settings = await getAuraSettings(userId)
  if (settings?.pin_hash) {
    if (!parsed.data.pin) return NextResponse.json({ error: 'PIN required to delete data' }, { status: 400 })
    if (settings.pin_hash !== hashAuraPin(userId, parsed.data.pin)) {
      return NextResponse.json({ error: 'PIN incorrect' }, { status: 403 })
    }
  }

  await deleteAllAuraData(userId, parsed.data.include_settings ?? false)

  writeAuditLog({
    action: 'aura.data_deleted',
    user_id: userId,
    metadata: { include_settings: parsed.data.include_settings ?? false },
    severity: 'warning',
  })

  return NextResponse.json({ ok: true })
}
