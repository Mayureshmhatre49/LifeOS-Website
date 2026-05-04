import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { revokeApiKey } from '@/lib/db/enterprise-queries'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await revokeApiKey(id, session.user.id)
  return NextResponse.json({ revoked: true })
}
