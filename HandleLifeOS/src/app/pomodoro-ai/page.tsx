import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Pomodoro Timer — Smart Focus Sessions',
  description: 'The Pomodoro technique, powered by AI. Smart task selection, energy-based scheduling, and body doubling to keep you in flow.',
  keywords: ['pomodoro timer', 'AI pomodoro', 'pomodoro technique', 'focus technique', 'time management', 'pomodoro app free india', '25 minute timer study'],
  path: '/pomodoro-ai',
})

export default function PomodoroAIPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 mb-6">
            🍅 AI Pomodoro
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Pomodoro, made smarter<br />with AI
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            The classic 25/5 technique — upgraded. Life OS picks the right task for your energy, keeps you company during sessions, and adapts when life gets in the way.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Try AI Pomodoro free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { step: '1', title: 'Choose your energy', desc: 'Low, normal, or high — Life OS picks the right task for how you feel right now.' },
            { step: '2', title: 'Work for 25 minutes', desc: 'Focused session with a circular countdown. Pause anytime, no guilt.' },
            { step: '3', title: 'Break and repeat', desc: 'Automatic break prompts after each session. Long break every 4 sessions.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-lg mb-3">{s.step}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl border border-gray-100 bg-gray-50 px-8 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start your first Pomodoro</h2>
          <p className="text-sm text-gray-500 mb-5">Free, no credit card, works on mobile.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
