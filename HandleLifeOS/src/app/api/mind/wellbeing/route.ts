import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getWellbeingScore, getMoodLogs, getJournalEntries } from '@/lib/db/mind-queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [wellbeing, moodLogs, recentJournal] = await Promise.all([
    getWellbeingScore(session.user.id),
    getMoodLogs(session.user.id, 7),
    getJournalEntries(session.user.id, 3),
  ])

  return NextResponse.json({ wellbeing, moodLogs, recentJournal })
}
