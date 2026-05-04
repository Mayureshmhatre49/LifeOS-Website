import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { runLearners } from '@/lib/personalisation/learn'
import { DEFAULT_PREFERENCES } from '@/lib/personalisation/types'

/**
 * Trigger the learning pass. Respects the per-user `learning_enabled` flag.
 */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ insights: [] })

  // Privacy gate: skip if user opted out
  const db = getSupabaseAdmin()
  const { data: prefs } = await db
    .from('personalisation_preferences')
    .select('learning_enabled')
    .eq('user_id', session.user.id)
    .maybeSingle()
  const learningEnabled = prefs?.learning_enabled ?? DEFAULT_PREFERENCES.learning_enabled
  if (!learningEnabled) {
    return NextResponse.json({ insights: [], skipped: 'learning_disabled' })
  }

  const insights = await runLearners(session.user.id)
  return NextResponse.json({ insights, count: insights.length })
}

/**
 * Dismiss an insight (so it stops appearing until the next learning pass overwrites it).
 */
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from('personalisation_insights').update({ is_dismissed: true }).eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
