import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDecisions } from '@/lib/db/decision-queries'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 20)))

  const decisions = await getDecisions(session.user.id, limit)
  return NextResponse.json({ decisions })
}
