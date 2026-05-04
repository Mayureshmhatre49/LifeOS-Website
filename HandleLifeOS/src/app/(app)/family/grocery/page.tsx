import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FamilyHome } from '@/components/family/family-home'

export const metadata: Metadata = {
  title: 'Grocery List — Family | Life OS',
  description: 'Shared family grocery list with AI suggestions.',
}

export default async function GroceryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <FamilyHome userId={session.user.id} defaultTab="grocery" />
    </div>
  )
}
