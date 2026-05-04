import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getProfile, upsertProfile } from '@/lib/db/memory-queries'
import { deleteUserAccount } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/security/audit-log'
import { z } from 'zod'

const updateSchema = z.object({
  display_name: z.string().max(80).optional(),
  occupation: z.string().max(100).optional(),
  life_stage: z.enum(['student', 'early_career', 'mid_career', 'senior', 'retired', 'other']).optional(),
  country: z.string().length(2).optional(),
  currency: z.string().max(3).optional(),
  timezone: z.string().max(50).optional(),
  goals: z.array(z.string().max(200)).max(10).optional(),
  memory_enabled: z.boolean().optional(),
  preferred_language: z.string().max(10).optional(),  // BCP-47 code e.g. "hi-IN"
  onboarding_completed: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json(null)

  const profile = await getProfile(session.user.id)
  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const profile = await upsertProfile(session.user.id, parsed.data)
  return NextResponse.json(profile)
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  await deleteUserAccount(session.user.id)
  writeAuditLog({ action: 'user.account_deleted', user_id: session.user.id, metadata: {} })
  return NextResponse.json({ ok: true })
}
