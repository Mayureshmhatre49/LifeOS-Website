import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Home Organization App — Run Your Household Smoothly',
  description: 'AI-powered home organization. Plan your week, balance chores, manage groceries, and reduce household mental load with Life OS.',
  keywords: ['home organization app', 'household management app', 'AI home organizer', 'household management ai', 'family management app india', 'ghar ki management app', 'reduce mental load'],
  path: '/home-organization-ai',
})

export default function HomeOrganizationAIPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6">
            🏠 AI Home Organizer
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Run your home<br />without the chaos
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Life OS is an AI assistant for your entire household. Plan the week, balance chores, manage groceries, track elder care, and reduce the mental load — all in one app.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Organize your home free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { emoji: '📅', title: 'Plan the week', desc: 'AI reviews your tasks and events and tells you what needs attention.' },
            { emoji: '⚖️', title: 'Balance the load', desc: "Fairly distribute chores so it's not always the same person." },
            { emoji: '🧠', title: 'Mental load check', desc: '"What are we forgetting?" — AI scans your family data and answers.' },
            { emoji: '✅', title: 'Generate checklists', desc: 'Trip prep, school reopening, moving house — AI builds the list.' },
            { emoji: '🛒', title: 'Smart groceries', desc: 'Collaborative list with AI suggestions for what you likely need.' },
            { emoji: '👨‍👩‍👧', title: 'Full family view', desc: 'Parents, children, teens, elders — everyone has the right access.' },
          ].map(f => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="font-semibold text-gray-900 mt-3 mb-1 text-sm">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-purple-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Less chaos. More calm.</h2>
          <p className="text-purple-200 mb-6">Life OS helps your family run smoother — with AI doing the coordination work.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-purple-700 hover:bg-purple-50 transition-colors">
            Start for free
          </Link>
        </div>
      </div>
    </main>
  )
}
