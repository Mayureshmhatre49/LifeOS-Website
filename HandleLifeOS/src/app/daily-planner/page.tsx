import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Daily Planner — Plan Your Day Intelligently',
  description: 'Plan your day intelligently with Life OS. AI-powered task prioritization, smart scheduling, and overwhelm management — free.',
  keywords: ['daily planner', 'AI planner', 'task management', 'productivity', 'day planning', 'to do list india', 'smart daily planner app'],
  path: '/daily-planner',
})

export default function DailyPlannerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            📅 Daily Planner
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Your AI-powered<br />daily planner
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Dump your tasks. Life OS structures your day, prioritizes what matters, and keeps you focused — without the stress.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Start planning free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-base font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🧠', title: 'Brain dump to plan', desc: 'Type anything. Life OS turns "pay bills, groceries, report" into a structured, prioritized task list.' },
            { icon: '⚡', title: 'AI prioritization', desc: 'Tasks are ranked by urgency, deadlines, and your energy level — so you always know what to do next.' },
            { icon: '🌊', title: 'Overwhelm mode', desc: 'Too many tasks? Life OS simplifies to your top 3. One step at a time.' },
            { icon: '📋', title: 'Smart scheduling', desc: 'Get a realistic day schedule with time blocks and breaks — no overloading.' },
            { icon: '🔄', title: 'Replanning', desc: 'Missed tasks? Life OS gently reschedules without guilt. Tomorrow is a fresh start.' },
            { icon: '📱', title: 'Mobile-first', desc: 'Quick-add tasks on mobile with one tap. Optimized for real life, not just desktops.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to take control of your day?</h2>
          <p className="text-indigo-200 mb-6">Join Life OS and start planning smarter — it's free.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
