import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { DecisionsCopilot } from '@/components/decision/DecisionsCopilot'

export const metadata: Metadata = {
  title: 'Decision Copilot — Life OS',
  description: 'AI-powered decision intelligence for every major life choice.',
}

export default async function DecisionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  console.info('[Analytics] decision_copilot_viewed', session.user.id)

  return <DecisionsCopilot userId={session.user.id} />
}
