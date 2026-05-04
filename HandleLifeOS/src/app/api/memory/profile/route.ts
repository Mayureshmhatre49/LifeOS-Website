import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getProfile, upsertProfile } from '@/lib/db/memory-queries'

const profileSchema = z.object({
  display_name: z.string().max(100).optional(),
  occupation: z.string().max(150).optional(),
  life_stage: z.enum(['student', 'early_career', 'mid_career', 'senior', 'retired', 'other']).optional(),
  country: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  timezone: z.string().max(60).optional(),
  goals: z.array(z.string().max(200)).max(10).optional(),
  memory_enabled: z.boolean().optional(),
  preferred_language: z.string().max(20).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ profile: null })

  const profile = await getProfile(session.user.id)
  return NextResponse.json({ profile })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await upsertProfile(session.user.id, parsed.data)
  return NextResponse.json({ profile })
}
