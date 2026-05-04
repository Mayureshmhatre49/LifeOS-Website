import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { clearAllMemory, createMemoryEvent } from '@/lib/db/memory-queries'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const deleted = await clearAllMemory(session.user.id)
  await createMemoryEvent(session.user.id, 'deleted', undefined, {
    bulk: true,
    count: deleted,
  })
  console.info('[Analytics] memory_deleted_all', session.user.id, deleted)
  return NextResponse.json({ success: true, deleted })
}
