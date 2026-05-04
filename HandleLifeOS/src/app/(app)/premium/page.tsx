import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Crown, Sparkles, Brain, Shield, Zap, Users, Globe,
  Check, ArrowRight, Star, Infinity, Lock, BarChart3,
  Clock, MessageSquare, Bell, HeartHandshake,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Premium — HandleLife OS',
  description: 'Unlock the full power of your AI life OS.',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    badge: null,
    gradient: 'from-gray-50 to-gray-100',
    border: 'border-gray-200',
    cta: 'Current plan',
    ctaStyle: 'bg-gray-200 text-gray-500 cursor-default',
    features: [
      '50 AI requests/month',
      'Basic task planner',
      'Expense tracking',
      'Family sharing (2 members)',
      '7-day mood history',
    ],
    locked: ['Decision Copilot', 'Memory Engine', 'Voice mode', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '₹299',
    period: '/month',
    badge: 'Most popular',
    gradient: 'from-indigo-50 to-violet-50',
    border: 'border-indigo-200',
    cta: 'Upgrade to Plus',
    ctaStyle: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200',
    features: [
      '500 AI requests/month',
      'Decision Copilot',
      'Memory Engine (AI remembers you)',
      'Full focus suite',
      'Family sharing (6 members)',
      '90-day history + trends',
      'Email + WhatsApp reminders',
    ],
    locked: ['Unlimited AI', 'Voice assistant', 'Enterprise security'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹799',
    period: '/month',
    badge: 'Best value',
    gradient: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    cta: 'Upgrade to Pro',
    ctaStyle: 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-200',
    features: [
      'Unlimited AI requests',
      'Everything in Plus',
      'Voice assistant mode',
      'Advanced pattern analytics',
      'Unlimited family members',
      'Priority 24/7 support',
      'Data export (CSV / JSON)',
      'Early access to new features',
    ],
    locked: [],
  },
]

const PREMIUM_FEATURES = [
  {
    id: 'f1',
    icon: Brain,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'Decision Copilot',
    body: 'AI-powered analysis for major life choices — career, finance, family. Get pros/cons, risk scoring, and personalized recommendations.',
    badge: 'Plus+',
  },
  {
    id: 'f2',
    icon: Sparkles,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Memory Engine',
    body: 'HandleLife remembers your preferences, goals, and context. Every AI response is personalized — no re-explaining yourself.',
    badge: 'Plus+',
  },
  {
    id: 'f3',
    icon: Globe,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    title: 'Voice Assistant',
    body: 'Speak naturally in English, Hindi, or your language. Capture tasks, log expenses, and get answers hands-free.',
    badge: 'Pro',
  },
  {
    id: 'f4',
    icon: BarChart3,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Advanced Analytics',
    body: "AI detects patterns across productivity, mood, finance, and family. See correlations you'd never notice manually.",
    badge: 'Pro',
  },
  {
    id: 'f5',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Family OS',
    body: 'Shared task boards, family calendar, children development tracking (AURA), and household finance overview.',
    badge: 'Plus+',
  },
  {
    id: 'f6',
    icon: Shield,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    title: 'Protection Suite',
    body: 'Advanced scam detection, fraud alerts, insurance tracker, and emergency contact broadcast.',
    badge: 'Plus+',
  },
]

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Working mom, Bangalore', quote: 'I cancelled 3 other apps. HandleLife does everything in one place — and actually remembers me.', rating: 5 },
  { name: 'Rahul M.', role: 'Startup founder, Mumbai', quote: 'The Decision Copilot helped me think through a ₹50L investment. Paid for itself 100× over.', rating: 5 },
  { name: 'Arjun K.', role: 'Engineer, Hyderabad', quote: 'The focus sessions + mood tracking changed my sleep and energy. Night and day difference.', rating: 5 },
]

const BADGE_COLOR: Record<string, string> = {
  'Plus+': 'bg-indigo-100 text-indigo-700',
  'Pro':   'bg-violet-100 text-violet-700',
}

export default async function PremiumPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center fade-in py-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-3 py-1 mb-3">
          <Crown className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">HandleLife Premium</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Your AI life OS,<br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            fully unlocked
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
          Join 40,000+ people managing their lives smarter. Free forever, upgrade when ready.
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-3 fade-in fade-in-delay-1">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl border bg-gradient-to-br p-4 transition-all duration-200',
              plan.gradient,
              plan.border,
              plan.id !== 'free' && 'shadow-sm',
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-black text-gray-900">{plan.name}</p>
                  {plan.badge && (
                    <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-400">{plan.period}</span>
                </div>
              </div>
              {plan.id === 'pro' && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
                  <Crown className="h-4.5 w-4.5 text-white" />
                </div>
              )}
            </div>

            <ul className="space-y-1.5 mb-3">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
              {plan.locked.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="h-3 w-3 shrink-0 text-gray-300" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.id === 'free'}
              className={cn(
                'w-full rounded-xl py-2.5 text-xs font-bold transition-all duration-200',
                plan.ctaStyle,
                plan.id !== 'free' && 'hover:scale-[1.01] active:scale-[0.99]',
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Annual savings callout */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white fade-in fade-in-delay-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Infinity className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Save 40% with Annual</p>
            <p className="text-xs text-white/80 mt-0.5">Plus ₹1,999/yr · Pro ₹5,999/yr — billed once</p>
          </div>
          <button className="ml-auto rounded-xl bg-white/20 border border-white/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-colors shrink-0">
            Switch
          </button>
        </div>
      </div>

      {/* Premium features grid */}
      <div className="fade-in fade-in-delay-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What you unlock</p>
        <div className="grid grid-cols-1 gap-2">
          {PREMIUM_FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3.5 flex items-start gap-3">
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', f.bg)}>
                  <Icon className={cn('h-4.5 w-4.5', f.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800">{f.title}</p>
                    <span className={cn('text-[10px] font-bold rounded-full px-1.5 py-0.5', BADGE_COLOR[f.badge])}>
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="fade-in fade-in-delay-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Loved by users</p>
        <div className="space-y-2">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-1.5">
                    <p className="text-xs font-bold text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white text-center shadow-lg shadow-indigo-200 fade-in fade-in-delay-4">
        <Crown className="h-8 w-8 mx-auto mb-2 text-amber-300" />
        <p className="text-base font-black mb-1">Start free, upgrade anytime</p>
        <p className="text-xs text-white/70 mb-4">No contracts. Cancel anytime. 14-day money-back guarantee.</p>
        <button className="w-full rounded-xl bg-white text-indigo-700 py-3 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-md">
          Upgrade to Plus — ₹299/month
        </button>
        <p className="text-[10px] text-white/50 mt-2">Secured by Razorpay · Trusted by 40,000+ users</p>
      </div>
    </div>
  )
}
