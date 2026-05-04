import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const schema = z.object({
  tool_id: z.string().min(1).max(40),
  completed: z.boolean(),
  duration_s: z.number().int().min(0).max(3600).optional(),
  pre_intensity:  z.number().int().min(1).max(5).optional(),
  post_intensity: z.number().int().min(1).max(5).optional(),
  mood_before:    z.number().int().min(1).max(5).optional(),
  mood_after:     z.number().int().min(1).max(5).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from('mind_tool_sessions').insert({
    user_id: session.user.id,
    ...parsed.data,
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) return NextResponse.json({ sessions: [] })

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('mind_tool_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json({ sessions: data ?? [] })
}
