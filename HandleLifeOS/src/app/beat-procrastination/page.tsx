import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Beat Procrastination with AI — Stop Delaying, Start Doing',
  description: 'Stop procrastinating with Life OS. AI task breakdown, body doubling, guilt-free restarts, and energy-based planning help you start and finish what matters.',
  keywords: ['beat procrastination', 'stop procrastinating', 'procrastination app', 'overcome procrastination', 'productivity for procrastinators', 'how to stop procrastinating', 'ADHD productivity tips'],
  path: '/beat-procrastination',
})

export default function BeatProcrastinationPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            ✅ Beat Procrastination
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            You're not lazy.<br />You just need the right system.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Procrastination isn't a character flaw — it's a signal that tasks feel too big, too vague, or too overwhelming. Life OS fixes all three.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Start for free
            </Link>
          </div>
        </div>

        <div className="space-y-4 mb-16">
          {[
            {
              problem: '"I don\'t know where to start"',
              solution: 'Task Breakdown: Life OS breaks any task into 5 steps, each under 15 minutes.',
              icon: '🔍',
            },
            {
              problem: '"It feels too big and scary"',
              solution: 'Overwhelm Mode: See just your top 3 tasks. Nothing else.',
              icon: '🌊',
            },
            {
              problem: '"I start but can\'t stay focused"',
              solution: 'Body Doubling: Life OS stays with you during sessions, checking in gently.',
              icon: '🤝',
            },
            {
              problem: '"I gave up. I feel guilty."',
              solution: 'Restart Mode: "Want to try just 5 minutes?" — no shame, fresh start.',
              icon: '💙',
            },
            {
              problem: '"I have no energy today"',
              solution: 'Energy Matching: Pick "Low energy" and get easy, manageable tasks.',
              icon: '🌙',
            },
          ].map((item) => (
            <div key={item.problem} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm text-gray-500 italic mb-1">{item.problem}</p>
                  <p className="text-sm font-medium text-gray-900">{item.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-green-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Start small. Start now.</h2>
          <p className="text-green-200 mb-6">Life OS is designed for people who struggle to start. That's the whole point.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
