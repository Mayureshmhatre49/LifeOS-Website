import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { updateMemoryItem, deleteMemoryItem, createMemoryEvent } from '@/lib/db/memory-queries'

const patchSchema = z.object({
  key: z.string().min(1).max(80).optional(),
  value: z.string().min(1).max(500).optional(),
  type: z.enum(['fact', 'preference', 'goal', 'concern', 'context', 'habit', 'relationship']).optional(),
  importance: z.number().int().min(1).max(10).optional(),
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const item = await updateMemoryItem(id, session.user.id, parsed.data)

  const eventType = parsed.data.is_active === false
    ? 'archived'
    : parsed.data.is_active === true
      ? 'restored'
      : 'updated'

  await createMemoryEvent(session.user.id, eventType, id, { fields: Object.keys(parsed.data) })
  console.info('[Analytics] memory_updated', session.user.id, eventType)
  return NextResponse.json({ item })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const { id } = await params
  await createMemoryEvent(session.user.id, 'deleted', id)
  await deleteMemoryItem(id, session.user.id)
  console.info('[Analytics] memory_deleted', session.user.id)
  return NextResponse.json({ success: true })
}
