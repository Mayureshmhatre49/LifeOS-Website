import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Family Task Manager — Assign & Track Household Chores',
  description: 'Assign household tasks to family members. Track who is doing what. AI balances chores fairly. Works for parents, teens, and kids.',
  keywords: ['family task manager', 'household chore tracker', 'family chores app', 'assign household tasks', 'family to do list', 'ghar ke kaam app', 'household management india'],
  path: '/family-task-manager',
})

export default function FamilyTaskManagerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
            ✅ Family Tasks
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Everyone knows<br />what they need to do
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Create household tasks, assign them to family members, and track progress. AI helps balance the load fairly — no one person carries everything.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Try free
            </Link>
          </div>
        </div>

        <div className="space-y-3 mb-16">
          {[
            { task: 'Clean living room', assigned: 'Raj', category: 'Cleaning', status: 'done' },
            { task: 'Pay electricity bill', assigned: 'Priya', category: 'Bills', status: 'pending' },
            { task: 'Pick up medicines', assigned: 'Unassigned', category: 'Health', status: 'pending' },
            { task: 'School project submission', assigned: 'Aryan', category: 'School', status: 'in_progress' },
          ].map(t => (
            <div key={t.task} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.status === 'done' ? 'bg-green-400' : t.status === 'in_progress' ? 'bg-orange-400' : 'bg-gray-300'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.task}</p>
                <p className="text-xs text-gray-400">{t.category} · {t.assigned}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-blue-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Fair. Clear. Done.</h2>
          <p className="text-blue-200 mb-6">Stop carrying the mental load alone. Share it with your family.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
