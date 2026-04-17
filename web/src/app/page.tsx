import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/config/categories'
import { generatePageMeta } from '@/lib/seo/metadata'
import type { Metadata } from 'next'
import { ArrowRight, Zap, Shield, Globe, Star } from 'lucide-react'

export const metadata: Metadata = generatePageMeta({
  title: 'AI for Everyday Life Decisions, Planning & Help',
})

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5 text-indigo-600" />,
    title: 'Instant AI answers',
    desc: 'Get practical help in seconds — shopping, EMIs, plans, comparisons. No fluff.',
  },
  {
    icon: <Shield className="h-5 w-5 text-indigo-600" />,
    title: 'Scam & fraud protection',
    desc: 'Paste suspicious messages and get an instant risk assessment.',
  },
  {
    icon: <Globe className="h-5 w-5 text-indigo-600" />,
    title: 'India-aware intelligence',
    desc: 'Built for Indian context — rupee prices, local brands, real-world advice.',
  },
]

const TESTIMONIALS = [
  { text: '"Saved me from an overpriced laptop. Life OS told me the exact alternative."', author: 'Priya S., Bangalore' },
  { text: '"Finally understood my electricity bill after years of confusion."', author: 'Rajan M., Delhi' },
  { text: '"Checked a suspiciously good job offer — it was a scam. Thank you."', author: 'Neha K., Mumbai' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center pt-20 pb-24 px-4 text-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/60 via-white to-white"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-3xl -z-10"
        />

        <Badge variant="default" className="mb-6 px-3 py-1.5">
          <Star className="h-3 w-3" />
          AI for Everyday Life · Phase 1
        </Badge>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-3xl mb-6 leading-[1.1]">
          Your personal AI for{' '}
          <span className="text-indigo-600">every life decision</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
          Shopping help, EMI calculations, scam checks, daily planning — instant AI guidance for real life.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Button asChild size="lg" className="shadow-lg shadow-indigo-200">
            <Link href="/chat">
              Start chatting free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Create account</Link>
          </Button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl" aria-label="Available categories">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/chat?prompt=${encodeURIComponent(cat.starterPrompt)}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${cat.color}`}
            >
              <span className="text-base leading-none" aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="py-8 border-y border-gray-50 bg-gray-50/50">
        <div className="mx-auto max-w-4xl px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <blockquote className="text-sm text-gray-700 leading-relaxed">{t.text}</blockquote>
              <figcaption className="text-xs text-gray-400 font-medium">{t.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-gray-500 max-w-md mx-auto">Practical intelligence for real life — not a chatbot toy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How Life OS works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Ask anything', desc: 'Type your question exactly as you would ask a smart friend.' },
              { step: '2', title: 'Get instant help', desc: 'Life OS analyzes and gives you a structured, practical answer.' },
              { step: '3', title: 'Decide with confidence', desc: 'Act on real guidance, not guesswork. No more decision paralysis.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500 text-center">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start making better decisions today</h2>
          <p className="text-gray-500 mb-8">Free to use. No credit card needed.</p>
          <Button asChild size="lg" className="shadow-lg shadow-indigo-200">
            <Link href="/chat">
              Try Life OS free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </span>
            Life OS · AI for Everyday Life
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <span>© 2026 Life OS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
