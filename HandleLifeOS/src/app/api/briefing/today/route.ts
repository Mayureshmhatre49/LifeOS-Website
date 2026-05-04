import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrCreateBriefing } from '@/lib/coach/briefing'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const force = new URL(req.url).searchParams.get('refresh') === 'true'
  const payload = await getOrCreateBriefing(session.user.id, session.user.name ?? undefined, force)
  return NextResponse.json(payload)
}
