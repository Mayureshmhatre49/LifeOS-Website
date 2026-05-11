import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { listAchievements, runAchievementDetectors } from '@/lib/community/achievements'

/**
 * GET /api/community/achievements
 *  - Lists user's existing achievements
 *  - Optional ?refresh=true triggers detectors to discover new milestones
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ achievements: [] })

  const url = new URL(req.url)
  if (url.searchParams.get('refresh') === 'true') {
    await runAchievementDetectors(session.user.id)
  }

  const achievements = await listAchievements(session.user.id)
  return NextResponse.json({ achievements })
}

/**
 * POST /api/community/achievements/share?id=…
 * Marks an achievement as shared (visible to active accountability partners).
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('achievements')
    .update({ is_shared: true })
    .eq('id', id).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ achievement: data })
}
