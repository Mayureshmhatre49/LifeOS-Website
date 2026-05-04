import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Focus Timer — Pomodoro & Deep Work Sessions',
  description: 'Pomodoro, deep work, and custom focus timers. Start a focused work session in one click. AI-powered body doubling keeps you on track.',
  keywords: ['focus timer', 'pomodoro timer', 'deep work timer', 'study timer', 'productivity timer', 'focus timer app free', 'study timer india'],
  path: '/focus-timer',
})

export default function FocusTimerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            ⏱️ Focus Timer
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            One-click focus sessions<br />that actually work
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            15-min quick start. 25-min Pomodoro. 50-min deep work. Pick your mode, pick your task, and start. Life OS handles the rest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Start focusing free
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Timer modes */}
        <div className="grid sm:grid-cols-4 gap-4 mb-16">
          {[
            { time: '15', label: 'Quick Start', desc: 'For when you just need to start.', color: 'bg-green-50 border-green-100' },
            { time: '25', label: 'Pomodoro', desc: 'The proven work/break rhythm.', color: 'bg-indigo-50 border-indigo-100' },
            { time: '50', label: 'Deep Work', desc: 'Long, uninterrupted concentration.', color: 'bg-purple-50 border-purple-100' },
            { time: '?', label: 'Custom', desc: 'Set any duration you need.', color: 'bg-gray-50 border-gray-100' },
          ].map((m) => (
            <div key={m.label} className={`rounded-2xl border ${m.color} p-5 text-center`}>
              <p className="text-3xl font-bold text-gray-900 mb-1">{m.time}</p>
              <p className="font-semibold text-gray-700 text-sm">{m.label}</p>
              <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {[
            { icon: '🤝', title: 'AI Body Doubling', desc: 'Life OS acts like a calm presence beside you — gentle check-ins, no notifications spam.' },
            { icon: '🔍', title: 'Task Breakdown', desc: 'Overwhelmed by a big task? Life OS breaks it into 5-minute steps so you can just start.' },
            { icon: '⚡', title: 'Energy matching', desc: 'Low energy? Life OS suggests shorter, easier tasks. High energy? Go for deep work.' },
            { icon: '🔄', title: 'Guilt-free restart', desc: 'Abandoned a session? No shame. Life OS helps you restart with the smallest possible step.' },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to actually focus?</h2>
          <p className="text-indigo-200 mb-6">Free forever. Works on any device.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
