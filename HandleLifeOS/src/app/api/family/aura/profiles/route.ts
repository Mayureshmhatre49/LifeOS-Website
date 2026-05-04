import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { getAuraProfiles, createAuraProfile } from '@/lib/db/aura-queries'
import { isSupabaseConfigured } from '@/lib/db/client'

const createSchema = z.object({
  full_name: z.string().min(1).max(100),
  date_of_birth: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']).optional(),
  school_name: z.string().max(150).optional(),
  class_grade: z.string().max(50).optional(),
  milestone_records: z.array(z.unknown()).default([]),
  medical_records: z.array(z.unknown()).default([]),
  medications: z.array(z.unknown()).default([]),
  therapies: z.array(z.unknown()).default([]),
  growth_records: z.array(z.unknown()).default([]),
  neurodivergence: z.unknown().optional(),
  physical_disabilities: z.unknown().optional(),
  genetic_conditions: z.unknown().optional(),
  education_plan: z.unknown().optional(),
  financial_plan: z.unknown().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ profiles: [] })
  }

  const profiles = await getAuraProfiles(session.user.id)
  return NextResponse.json({ profiles })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = await createAuraProfile(session.user.id, parsed.data as any)
  return NextResponse.json({ profile }, { status: 201 })
}
