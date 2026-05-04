import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const Body = z.object({
  invite_code: z.string().regex(/^[A-Z0-9]{8}$/, 'Code is 8 alphanumeric characters'),
}).strict()

/**
 * POST /api/community/partners/redeem
 * The recipient enters the invite code to accept a partnership.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid code' }, { status: 400 })
  }

  const code = parsed.data.invite_code.toUpperCase()
  const uid = session.user.id
  const db = getSupabaseAdmin()

  const { data: invite } = await db
    .from('accountability_partners')
    .select('*')
    .eq('invite_code', code)
    .eq('status', 'pending')
    .maybeSingle()

  if (!invite) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })
  if (invite.user_id === uid) {
    return NextResponse.json({ error: "You can't redeem your own invite code" }, { status: 400 })
  }
  if (invite.partner_id) {
    return NextResponse.json({ error: 'This invite has already been used' }, { status: 410 })
  }

  // Attach the partner + clear the code so it cannot be reused
  const { data: updated, error } = await db
    .from('accountability_partners')
    .update({
      partner_id: uid,
      status: 'active',
      accepted_at: new Date().toISOString(),
      invite_code: null,
    })
    .eq('id', invite.id)
    .eq('status', 'pending')
    .select().single()

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? 'Could not redeem' }, { status: 500 })
  }

  return NextResponse.json({ partner: updated, status: 'active' })
}
