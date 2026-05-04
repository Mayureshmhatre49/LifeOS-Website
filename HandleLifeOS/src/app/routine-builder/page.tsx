import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Routine Builder — Build Habits That Stick',
  description: 'Build powerful morning, evening, and weekly routines. Life OS helps you create habits that stick and structure your days.',
  keywords: ['routine builder', 'habit builder', 'morning routine', 'daily routine', 'productivity habits', 'morning routine app india', 'habit tracker free'],
  path: '/routine-builder',
})

export default function RoutineBuilderPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            🔄 Routine Builder
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Build routines that<br />actually stick
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Morning routine, evening shutdown, work start — create recurring routines with steps, times, and schedules. Life OS keeps you consistent.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Build your routine free
            </Link>
          </div>
        </div>

        {/* Routine types */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: '🌅', type: 'Morning routine', desc: 'Start strong. Meditation, exercise, journaling — set up your morning for success.' },
            { icon: '🌙', type: 'Evening shutdown', desc: 'Wind down with purpose. Review your day and prepare for tomorrow.' },
            { icon: '💼', type: 'Work start', desc: 'Get into deep work mode with a consistent pre-work ritual.' },
            { icon: '📚', type: 'Study routine', desc: 'Build a focused study session with warm-up, deep work, and review blocks.' },
            { icon: '🛒', type: 'Weekend errands', desc: 'Batch your chores and errands so weekdays stay clear.' },
            { icon: '✨', type: 'Custom', desc: 'Build any routine that fits your life — fully customizable steps and schedule.' },
          ].map((r) => (
            <div key={r.type} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{r.type}</h3>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-green-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Your best days start with routines</h2>
          <p className="text-green-200 mb-6">Create your first routine in under 2 minutes.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
