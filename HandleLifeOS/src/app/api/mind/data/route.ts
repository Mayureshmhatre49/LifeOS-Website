import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import {
  deleteAllMindData, hashPin, getMindSettings,
} from '@/lib/db/mind-settings-queries'
import { writeAuditLog } from '@/lib/security/audit-log'

const schema = z.object({
  confirm: z.literal('DELETE'),
  pin: z.string().regex(/^\d{4,6}$/).optional(),
  include_settings: z.boolean().optional(),
})

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Confirmation required: send {"confirm":"DELETE"}' }, { status: 400 })
  }

  const userId = session.user.id

  // If a PIN is set, require it to authorize destructive action
  const settings = await getMindSettings(userId)
  if (settings?.pin_hash) {
    if (!parsed.data.pin) {
      return NextResponse.json({ error: 'PIN required to delete data' }, { status: 400 })
    }
    if (settings.pin_hash !== hashPin(userId, parsed.data.pin)) {
      return NextResponse.json({ error: 'PIN incorrect' }, { status: 403 })
    }
  }

  await deleteAllMindData(userId, parsed.data.include_settings ?? false)

  writeAuditLog({
    action: 'mind.data_deleted',
    user_id: userId,
    metadata: { include_settings: parsed.data.include_settings ?? false },
    severity: 'warning',
  })

  return NextResponse.json({ ok: true })
}
