import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured } from '@/lib/db/client'
import { exportAllMemory, createMemoryEvent } from '@/lib/db/memory-queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })

  const data = await exportAllMemory(session.user.id)
  await createMemoryEvent(session.user.id, 'exported', undefined, { item_count: data.items.length })
  console.info('[Analytics] memory_exported', session.user.id, data.items.length)

  const payload = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      user_id: session.user.id,
      ...data,
    },
    null,
    2,
  )

  return new NextResponse(payload, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lifeos-memory-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
