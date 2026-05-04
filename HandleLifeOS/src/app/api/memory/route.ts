import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getMemoryItems, createMemoryItem, createMemoryEvent } from '@/lib/db/memory-queries'

const MEMORY_TYPES = ['fact', 'preference', 'goal', 'concern', 'context', 'habit', 'relationship'] as const

const createSchema = z.object({
  type: z.enum(MEMORY_TYPES),
  key: z.string().min(1).max(80).transform((s) => s.trim().toLowerCase().replace(/\s+/g, '_')),
  value: z.string().min(1).max(500).transform((s) => s.trim()),
  importance: z.number().int().min(1).max(10).optional().default(5),
  expires_at: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ items: [], total: 0 })

  const { searchParams } = req.nextUrl
  const activeOnly = searchParams.get('active') !== 'false'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0)

  const items = await getMemoryItems(session.user.id, activeOnly, limit, offset)
  console.info('[Analytics] memory_center_viewed', session.user.id)
  return NextResponse.json({ items, total: items.length })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const item = await createMemoryItem(session.user.id, {
    ...parsed.data,
    source: 'manual',
    confidence: 100,
  })
  await createMemoryEvent(session.user.id, 'created', item.id, { source: 'manual' })
  console.info('[Analytics] memory_created', session.user.id, item.type)
  return NextResponse.json({ item }, { status: 201 })
}
