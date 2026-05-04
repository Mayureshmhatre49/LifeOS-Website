import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

/**
 * Generate an 8-char share code from random bytes.
 * No ambiguous chars (0/O, 1/I/l).
 */
function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  let s = ''
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length]
  return s
}

/**
 * GET /api/community/partners
 * Returns: { sent: [...], received: [...], active: [...] }
 *  - sent: invites the user has issued (incl. partner not yet attached)
 *  - received: invites where the user is the partner_id
 *  - active: rows in 'active' status from either side, with the OTHER user's display name resolved
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ sent: [], received: [], active: [] })

  const uid = session.user.id
  const db = getSupabaseAdmin()
  const { data: rows } = await db
    .from('accountability_partners')
    .select('*')
    .or(`user_id.eq.${uid},partner_id.eq.${uid}`)
    .order('created_at', { ascending: false })

  // Resolve "other-user" names in one shot
  const otherIds = new Set<string>()
  for (const r of (rows ?? []) as Array<{ user_id: string; partner_id: string | null }>) {
    if (r.user_id !== uid) otherIds.add(r.user_id)
    if (r.partner_id && r.partner_id !== uid) otherIds.add(r.partner_id)
  }
  const others = otherIds.size
    ? (await db.from('users').select('id, name, email').in('id', [...otherIds])).data ?? []
    : []
  const byId = new Map((others as { id: string; name: string | null; email: string }[]).map(u => [u.id, u]))

  const enrich = (r: { user_id: string; partner_id: string | null; [k: string]: unknown }) => {
    const otherId = r.user_id === uid ? r.partner_id : r.user_id
    const other = otherId ? byId.get(otherId) : null
    return { ...r, partner: other ? { id: other.id, name: other.name, email: other.email } : null }
  }

  const sent = (rows ?? []).filter(r => r.user_id === uid && r.status === 'pending').map(enrich)
  const received = (rows ?? []).filter(r => r.partner_id === uid && r.status === 'pending').map(enrich)
  const active = (rows ?? []).filter(r => r.status === 'active').map(enrich)
  const ended = (rows ?? []).filter(r => r.status === 'ended' || r.status === 'blocked').map(enrich)

  return NextResponse.json({ sent, received, active, ended })
}

const Create = z.object({
  share_habits: z.boolean().optional(),
  share_goals: z.boolean().optional(),
  share_challenges: z.boolean().optional(),
  share_achievements: z.boolean().optional(),
  notes: z.string().max(200).nullable().optional(),
}).strict()

/**
 * POST /api/community/partners — generate a fresh invite code (no partner attached yet).
 * The user shares the code; the recipient redeems via /api/community/partners/redeem.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const parsed = Create.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Try a few times in case of code collision
  let invite_code = ''
  for (let i = 0; i < 5; i++) {
    const candidate = generateInviteCode()
    const { data: existing } = await db.from('accountability_partners').select('id').eq('invite_code', candidate).maybeSingle()
    if (!existing) { invite_code = candidate; break }
  }
  if (!invite_code) return NextResponse.json({ error: 'Could not generate invite code' }, { status: 500 })

  const { data, error } = await db
    .from('accountability_partners')
    .insert({
      user_id: session.user.id,
      invite_code,
      status: 'pending',
      share_habits: parsed.data.share_habits ?? true,
      share_goals: parsed.data.share_goals ?? true,
      share_challenges: parsed.data.share_challenges ?? true,
      share_achievements: parsed.data.share_achievements ?? true,
      notes: parsed.data.notes ?? null,
    })
    .select().single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Could not create invite' }, { status: 500 })
  return NextResponse.json({ partner: data, invite_code }, { status: 201 })
}

/**
 * DELETE /api/community/partners?id=…  — end a partnership / cancel an invite
 */
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const uid = session.user.id
  const db = getSupabaseAdmin()
  // Only allow ending if user is on either side of the partnership
  await db
    .from('accountability_partners')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', id)
    .or(`user_id.eq.${uid},partner_id.eq.${uid}`)
  return NextResponse.json({ ok: true })
}
