import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCompanionMessages } from '@/lib/db/companion-queries'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  const messages = await getCompanionMessages(sessionId, session.user.id)
  return NextResponse.json({ messages })
}
