import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteRiskCheck } from '@/lib/db/protection-queries'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteRiskCheck(id, session.user.id)
  return NextResponse.json({ success: true })
}
