import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getUserPlanId } from '@/lib/billing/quota'
import { generateApiKey } from '@/lib/enterprise/api-keys'
import { getApiKeysByUser, createApiKey } from '@/lib/db/enterprise-queries'
import { isSupabaseConfigured } from '@/lib/db/client'

const createSchema = z.object({
  name: z.string().min(1).max(60).trim(),
})

const PRO_PLANS = new Set(['pro', 'family'])

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await getApiKeysByUser(session.user.id)
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  // API access requires Pro or Family plan
  const planId = await getUserPlanId(session.user.id)
  if (!PRO_PLANS.has(planId)) {
    return NextResponse.json(
      { error: 'API access requires a Pro or Family plan.', upgradeUrl: '/billing/plans' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Key name is required (max 60 chars)' }, { status: 400 })
  }

  // Limit to 5 active keys per user
  const existing = await getApiKeysByUser(session.user.id)
  if (existing.length >= 5) {
    return NextResponse.json({ error: 'Maximum 5 API keys per account' }, { status: 409 })
  }

  const { raw, hash, prefix } = await generateApiKey()
  const key = await createApiKey({
    userId: session.user.id,
    name: parsed.data.name,
    keyPrefix: prefix,
    keyHash: hash,
  })

  // Return the secret ONCE — it is not stored in plaintext
  return NextResponse.json({ ...key, secret: raw }, { status: 201 })
}
