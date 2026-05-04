import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getRiskChecks } from '@/lib/db/protection-queries'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as Parameters<typeof getRiskChecks>[1] ?? undefined

  const checks = await getRiskChecks(session.user.id, type)
  return NextResponse.json(checks)
}
