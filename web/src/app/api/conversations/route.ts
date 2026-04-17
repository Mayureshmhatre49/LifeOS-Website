import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getConversations, createConversation } from '@/lib/db/queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(200).trim(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json([])
  }

  try {
    const conversations = await getConversations(session.user.id)
    return NextResponse.json(conversations)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const conversation = await createConversation({
      user_id: session.user.id,
      title: parsed.data.title,
    })
    return NextResponse.json(conversation, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
