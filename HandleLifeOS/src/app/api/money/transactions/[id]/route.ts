import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { deleteTransaction } from '@/lib/db/transactions-queries'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteTransaction(session.user.id, id)
  return NextResponse.json({ success: true })
}
