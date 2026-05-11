import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { refreshAllProgress, computeProgress } from '@/lib/community/progress'
import type { Challenge } from '@/lib/community/types'

/**
 * GET /api/community/challenges?refresh=true
 * Returns: { catalog: Challenge[], joined: Participant[] (with progress refreshed) }
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ catalog: [], joined: [] })

  const url = new URL(req.url)
  const refresh = url.searchParams.get('refresh') === 'true'

  const db = getSupabaseAdmin()
  if (refresh) await refreshAllProgress(session.user.id)

  const [catalog, joined] = await Promise.all([
    db.from('challenges').select('*').eq('is_published', true).order('participant_count', { ascending: false }),
    db.from('challenge_participants').select('*, challenges:challenge_id(*)').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
  ])
  return NextResponse.json({ catalog: catalog.data ?? [], joined: joined.data ?? [] })
}

const Join = z.object({
  challenge_id: z.string().uuid(),
  is_public: z.boolean().optional(),
}).strict()

/**
 * POST /api/community/challenges  — join a challenge
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const parsed = Join.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data: ch } = await db.from('challenges').select('*').eq('id', parsed.data.challenge_id).eq('is_published', true).maybeSingle()
  if (!ch) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

  const challenge = ch as Challenge
  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + challenge.duration_days * 86_400_000)

  const { data: participant, error } = await db
    .from('challenge_participants')
    .upsert({
      user_id: session.user.id,
      challenge_id: challenge.id,
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'active',
      progress_pct: 0,
      progress_data: {},
      is_public: parsed.data.is_public ?? false,
    }, { onConflict: 'user_id,challenge_id' })
    .select()
    .single()

  if (error || !participant) {
    return NextResponse.json({ error: 'Could not join challenge' }, { status: 500 })
  }

  // (Aggregate participant_count on the challenge row is updated lazily — a Postgres
  // trigger or periodic worker would handle that. Skipped inline to avoid a race.)

  // Compute initial progress so user sees their starting state immediately
  const r = await computeProgress(challenge, participant)
  await db
    .from('challenge_participants')
    .update({ progress_pct: r.progress_pct, progress_data: r.progress_data, status: r.status })
    .eq('id', participant.id)
    .eq('user_id', session.user.id)

  return NextResponse.json({ participant: { ...participant, progress_pct: r.progress_pct, progress_data: r.progress_data, status: r.status } }, { status: 201 })
}

const Patch = z.object({
  participant_id: z.string().uuid(),
  is_public: z.boolean().optional(),
  status: z.enum(['active', 'abandoned']).optional(),
  notes: z.string().max(500).nullable().optional(),
}).strict()

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const parsed = Patch.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { participant_id, ...patch } = parsed.data
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('challenge_participants')
    .update(patch)
    .eq('id', participant_id).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ participant: data })
}
