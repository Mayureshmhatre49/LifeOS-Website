import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'
import { DEFAULT_PREFERENCES, INTEREST_CATALOG, MODULE_CATALOG } from '@/lib/personalisation/types'
import { getInsights } from '@/lib/personalisation/learn'

const VALID_INTERESTS = new Set(INTEREST_CATALOG)
const VALID_MODULES = new Set(MODULE_CATALOG.map(m => m.id))

const PrefsPatch = z.object({
  tone:        z.enum(['warm', 'concise', 'analytical', 'playful', 'formal']).optional(),
  verbosity:   z.enum(['brief', 'balanced', 'detailed']).optional(),
  proactivity: z.enum(['reactive', 'balanced', 'high']).optional(),
  interests:   z.array(z.string().min(1).max(40)).max(20).optional(),
  priority_modules: z.array(z.string().min(1).max(120)).max(10).optional(),
  language:    z.string().min(2).max(10).optional(),
  currency:    z.string().length(3).optional(),
  timezone:    z.string().max(80).nullable().optional(),
  learning_enabled: z.boolean().optional(),
  notes:       z.string().max(500).nullable().optional(),
}).strict()

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      preferences: { ...DEFAULT_PREFERENCES, user_id: session.user.id },
      insights: [],
      catalogs: { interests: INTEREST_CATALOG, modules: MODULE_CATALOG },
    })
  }

  const db = getSupabaseAdmin()
  const [prefsRes, insights] = await Promise.all([
    db.from('personalisation_preferences').select('*').eq('user_id', session.user.id).maybeSingle(),
    getInsights(session.user.id),
  ])

  const preferences = prefsRes.data ?? { ...DEFAULT_PREFERENCES, user_id: session.user.id }
  return NextResponse.json({
    preferences,
    insights,
    catalogs: { interests: INTEREST_CATALOG, modules: MODULE_CATALOG },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const parsed = PrefsPatch.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Allowlist filter on interests + modules — reject anything not in our catalog
  const safe = stripServerFields(parsed.data) as Record<string, unknown>
  if (Array.isArray(safe.interests)) {
    safe.interests = (safe.interests as string[]).filter(i => VALID_INTERESTS.has(i as never))
  }
  if (Array.isArray(safe.priority_modules)) {
    safe.priority_modules = (safe.priority_modules as string[]).filter(m => VALID_MODULES.has(m as never))
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('personalisation_preferences')
    .upsert({ user_id: session.user.id, ...safe }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ preferences: data })
}
