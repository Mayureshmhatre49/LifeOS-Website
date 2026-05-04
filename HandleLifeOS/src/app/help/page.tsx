import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Centre — Life OS',
  description: 'Answers to common questions about using Life OS — your AI-powered life assistant.',
}

const FAQS = [
  {
    category: 'Getting started',
    items: [
      {
        q: 'What is Life OS?',
        a: 'Life OS is an AI-powered personal assistant that helps you plan your day, manage your finances, stay focused, protect yourself from scams, and manage your family — all in one place.',
      },
      {
        q: 'Do I need to sign up to use it?',
        a: 'No — you can chat with the AI assistant as a guest. Creating an account lets you save conversations, personalise the assistant with your profile, and unlock more features.',
      },
      {
        q: 'Which AI model does Life OS use?',
        a: 'Life OS uses Claude (by Anthropic) by default. Depending on your configuration, it can also use OpenAI models. You can configure this in your deployment settings.',
      },
    ],
  },
  {
    category: 'Account & security',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Go to the Login page and click "Forgot password?". Enter your email address and we\'ll send you a reset link. The link is valid for 1 hour.',
      },
      {
        q: 'How do I change my email or name?',
        a: 'Visit Settings → Profile to update your display name, occupation, and other profile details. Email changes are not currently supported — contact support if you need to migrate your account.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. Passwords are hashed with bcrypt (cost factor 12). All traffic is TLS-encrypted. We use rate limiting, brute-force protection, prompt injection detection, and row-level security in our database.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Settings → Account and click "Delete my account". All your data — conversations, memory, profile — is permanently deleted within 30 days.',
      },
    ],
  },
  {
    category: 'AI assistant',
    items: [
      {
        q: 'What can I ask the AI assistant?',
        a: 'You can ask about planning your day, budgeting, EMI calculations, scam detection, focus techniques, family tasks, and much more. Think of it as a smart friend who knows about finance, productivity, and everyday life.',
      },
      {
        q: 'Will the AI remember things I tell it?',
        a: 'Yes — when Memory is enabled (Settings → Memory), the AI stores key facts you share and uses them to personalise future responses. You can view and delete memory items at any time.',
      },
      {
        q: 'Why did the assistant say it can\'t do something?',
        a: 'The assistant is built to be helpful and safe. It will decline requests that could be harmful or illegal, or that fall outside its knowledge. Try rephrasing your question or breaking it into smaller parts.',
      },
    ],
  },
  {
    category: 'Billing & plans',
    items: [
      {
        q: 'Is Life OS free?',
        a: 'There is a free tier with a monthly AI message limit. Paid plans unlock more messages, memory, and premium features. See /billing/plans for current pricing.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Go to Settings → Billing and click "Cancel subscription". Your plan remains active until the end of the current billing period.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major debit/credit cards, UPI, net banking, and wallets via Razorpay (India). International cards are also accepted.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link href="/chat" className="text-sm text-indigo-600 hover:underline font-medium">
            Open assistant →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Help Centre</h1>
          <p className="text-gray-500">
            Can&apos;t find an answer? Email us at{' '}
            <a href="mailto:support@lifeos.app" className="text-indigo-600 hover:underline">
              support@lifeos.app
            </a>
          </p>
        </div>

        <div className="space-y-10">
          {FAQS.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {category}
              </h2>
              <div className="space-y-4">
                {items.map(({ q, a }) => (
                  <details
                    key={q}
                    className="group bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
                      <span className="text-sm font-medium text-gray-900">{q}</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 text-lg leading-none">
                        ↓
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our support team usually responds within 1 business day.
          </p>
          <a
            href="mailto:support@lifeos.app"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Contact support
          </a>
        </div>
      </main>

      <footer className="border-t bg-white mt-8">
        <div className="max-w-4xl mx-auto px-6 py-4 text-sm text-gray-400 flex gap-6">
          <Link href="/legal/privacy" className="hover:text-gray-600">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-gray-600">Terms</Link>
          <Link href="/legal/cookies" className="hover:text-gray-600">Cookies</Link>
        </div>
      </footer>
    </div>
  )
}
