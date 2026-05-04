import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exportAllAuraData } from '@/lib/db/aura-settings-queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await exportAllAuraData(session.user.id)
  const filename = `lifeos-aura-export-${new Date().toISOString().split('T')[0]}.json`
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
