import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import {
  createJournalEntry, getJournalEntries,
  updateJournalEntry, deleteJournalEntry,
} from '@/lib/db/mind-queries'
import { detectRisk } from '@/lib/mind/risk-detection'
import { generateEmbedding } from '@/lib/mind/embeddings'

const createSchema = z.object({
  content: z.string().min(1).max(10000),
  title: z.string().max(200).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  prompt: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000).optional(),
  title: z.string().max(200).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const entries = await getJournalEntries(session.user.id, limit)
  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const entry = await createJournalEntry({ user_id: session.user.id, ...parsed.data })
  const risk = detectRisk(parsed.data.content)

  // Fire-and-forget: generate embedding in the background so the Companion can recall this entry.
  ;(async () => {
    try {
      const embedding = await generateEmbedding(parsed.data.content)
      if (embedding) {
        const db = getSupabaseAdmin()
        await db.from('journal_entries').update({ embedding }).eq('id', entry.id)
      }
    } catch {
      // best-effort
    }
  })()

  return NextResponse.json({ entry, risk }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { id, ...rest } = parsed.data
  const entry = await updateJournalEntry(id, session.user.id, rest)
  return NextResponse.json({ entry })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await deleteJournalEntry(id, session.user.id)
  return NextResponse.json({ ok: true })
}
