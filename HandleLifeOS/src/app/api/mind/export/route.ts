import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exportAllMindData } from '@/lib/db/mind-settings-queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await exportAllMindData(session.user.id)
  const filename = `lifeos-mind-export-${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
