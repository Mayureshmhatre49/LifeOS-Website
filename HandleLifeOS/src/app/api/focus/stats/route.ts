import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getWeeklyStats } from '@/lib/db/focus-queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await getWeeklyStats(session.user.id)
  return NextResponse.json(stats)
}
