import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Task Planner — Smart Task Management',
  description: 'Let AI plan your tasks. Life OS converts messy text into structured plans, prioritizes automatically, and helps you execute every day.',
  keywords: ['AI task planner', 'task planning AI', 'smart task manager', 'productivity AI', 'task prioritization app', 'best task planner india'],
  path: '/ai-task-planner',
})

export default function AITaskPlannerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6">
            ✨ AI Task Planning
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Tell Life OS what<br />you need to do
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-4">
            Just type: <em>"pay rent, buy groceries, finish report, call dentist"</em>
          </p>
          <p className="text-lg text-gray-500">
            Life OS converts it into a structured, prioritized task list — instantly.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Try it free
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Dump your tasks', desc: 'Type or paste anything — a list, a brain dump, or a messy pile of to-dos.' },
              { step: '2', title: 'AI structures it', desc: 'Life OS identifies tasks, estimates time, sets priorities, and organizes categories.' },
              { step: '3', title: 'Execute with clarity', desc: 'Follow your structured plan with clear next steps and AI-suggested order.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center rounded-3xl border border-gray-100 bg-gray-50 px-8 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start for free</h2>
          <p className="text-gray-500 text-sm mb-5">No credit card needed. Works on all devices.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </div>
    </main>
  )
}
