import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateNegotiationScript } from '@/lib/protection-ai'
import { saveNegotiationTemplate } from '@/lib/db/protection-queries'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { isSupabaseConfigured } from '@/lib/db/client'
import { z } from 'zod'

const negotiateSchema = z.object({
  context: z.string().min(10).max(2000).trim(),
  type: z.string().min(1).max(50).trim(),
  tone: z.enum(['polite', 'firm', 'professional', 'friendly']).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().max(10).optional(),
  save: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = negotiateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { context, type, tone = 'polite', amount, currency, save } = parsed.data
  const userId = session.user.id

  let userContext: string | undefined
  if (isSupabaseConfigured()) {
    const memCtx = await buildMemoryContext(userId)
    userContext = formatMemoryForPrompt(memCtx) || undefined
  }

  const result = await generateNegotiationScript(context, type, tone, amount, currency, userContext)

  if (save !== false && isSupabaseConfigured()) {
    try {
      await saveNegotiationTemplate(userId, { type, context, script: result.script, tone })
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json(result)
}
