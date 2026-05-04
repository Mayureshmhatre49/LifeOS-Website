import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Body Doubling — Virtual Accountability Companion',
  description: 'Work alongside an AI accountability companion. Body doubling helps you start, stay focused, and complete tasks — especially for ADHD and procrastination.',
  keywords: ['body doubling', 'AI body doubling', 'virtual body doubling', 'ADHD productivity', 'accountability partner', 'work with me app', 'focus accountability app'],
  path: '/body-doubling',
})

export default function BodyDoublingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6">
            🤝 Body Doubling
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Work better when<br />someone's there with you
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Body doubling is a proven technique — working in the presence of another person helps you start and stay focused. Life OS is that calm, non-intrusive presence, available 24/7.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Try body doubling free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {[
            { icon: '🚀', title: 'Help you start', desc: 'Life OS gives you a warm, personalized nudge to begin — and suggests the very first small step.' },
            { icon: '👀', title: 'Stay present', desc: 'Gentle check-ins at 5 and 15 minutes. Just enough presence, never intrusive.' },
            { icon: '🎉', title: 'Celebrate completion', desc: 'A genuine, earned congratulations when you finish. Not gimmicky. Just real.' },
            { icon: '💙', title: 'Guilt-free restarts', desc: 'Got distracted? Life OS helps you restart without shame. "Want to try just 5 minutes?"' },
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

        <div className="rounded-2xl border border-purple-100 bg-purple-50 px-6 py-8 mb-12 text-center">
          <p className="text-purple-700 font-medium mb-1">Especially helpful for:</p>
          <p className="text-gray-600 text-sm">ADHD · Procrastination · Low motivation · Working from home · Isolation · Executive function challenges</p>
        </div>

        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">You don't have to work alone</h2>
          <p className="text-indigo-200 mb-6">Life OS is always available when you need a companion to work with.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Start for free
          </Link>
        </div>
      </div>
    </main>
  )
}
