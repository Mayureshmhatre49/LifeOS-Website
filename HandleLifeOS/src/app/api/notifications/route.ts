import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNotifications, getUnreadCount } from '@/lib/db/notification-queries'
import { generateNotificationsForUser } from '@/lib/notifications/generators'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  // Compute "what's new" from current OS state. Best-effort, dedup-keyed.
  if (searchParams.get('skip_generate') !== 'true') {
    await generateNotificationsForUser(session.user.id)
  }

  const [items, unreadCount] = await Promise.all([
    getNotifications(session.user.id, { unreadOnly, limit }),
    getUnreadCount(session.user.id),
  ])

  return NextResponse.json({ items, unread_count: unreadCount })
}
