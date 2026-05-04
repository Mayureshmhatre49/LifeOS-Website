import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { markRead, deleteNotification } from '@/lib/db/notification-queries'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await markRead(id, session.user.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteNotification(id, session.user.id)
  return NextResponse.json({ ok: true })
}
