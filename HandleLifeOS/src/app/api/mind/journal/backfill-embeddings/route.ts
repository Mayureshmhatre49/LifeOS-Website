import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { generateEmbedding } from '@/lib/mind/embeddings'

// One-time backfill: generates embeddings for the user's existing journal entries
// that don't have one yet. Caps at 50 per call to stay within request budget.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('journal_entries')
    .select('id, content')
    .eq('user_id', session.user.id)
    .is('embedding', null)
    .limit(50)

  const entries = (data ?? []) as { id: string; content: string }[]
  let succeeded = 0
  let failed = 0

  // Sequential to respect API rate limits — 50 at a time is fine
  for (const e of entries) {
    const embedding = await generateEmbedding(e.content)
    if (embedding) {
      const { error } = await db.from('journal_entries').update({ embedding }).eq('id', e.id)
      if (error) failed++
      else succeeded++
    } else {
      failed++
    }
  }

  return NextResponse.json({
    processed: entries.length,
    succeeded,
    failed,
    remaining_estimate: entries.length === 50 ? 'more available — call again' : 'all done',
  })
}
