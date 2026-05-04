import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exportUserData } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/security/audit-log'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const data = await exportUserData(session.user.id)
  writeAuditLog({ action: 'user.data_exported', user_id: session.user.id, metadata: {} })

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lifeos-data-${session.user.id}.json"`,
    },
  })
}
