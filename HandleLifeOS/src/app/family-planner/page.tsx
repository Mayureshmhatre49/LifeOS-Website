import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Family Planner — Coordinate Your Household',
  description: 'Plan family tasks, events, and routines together. AI-powered household coordination for parents, children, and elders.',
  keywords: ['family planner', 'family task manager', 'household planner', 'family schedule app', 'family organizer app', 'family planner india', 'family management app'],
  path: '/family-planner',
})

export default function FamilyPlannerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            🏡 Family Planner
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Your family,<br />finally in sync
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Shared tasks, family calendar, grocery lists, and AI household assistance — all in one place. Designed for parents, elders, and children.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Start your family space free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { emoji: '✅', title: 'Shared task board', desc: 'Assign household tasks to family members. Track who does what.' },
            { emoji: '📅', title: 'Family calendar', desc: 'School events, appointments, birthdays, and trips in one view.' },
            { emoji: '🛒', title: 'Grocery list', desc: 'Collaborative shopping list everyone can add to from their phone.' },
            { emoji: '🤖', title: 'AI household assistant', desc: '"What are we forgetting?" — AI checks in on your week.' },
            { emoji: '👴', title: 'Elder care', desc: 'Medicine reminders, doctor contacts, and family check-ins.' },
            { emoji: '🎒', title: 'Child support', desc: 'School, homework routines, and gentle reminders for kids.' },
          ].map(f => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl shrink-0">{f.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">One app for the whole family</h2>
          <p className="text-indigo-200 mb-6">Reduce mental load. Share the work. Stay connected.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
