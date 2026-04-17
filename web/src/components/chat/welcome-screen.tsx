'use client'

import { CATEGORIES } from '@/config/categories'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPTS = [
  'Which phone is best under ₹20,000?',
  'Calculate EMI for ₹10 lakh at 9% for 5 years',
  'Is this message a scam? "You won ₹50,000..."',
  'Help me plan my week effectively',
]

interface WelcomeScreenProps {
  onPrompt: (text: string) => void
}

export function WelcomeScreen({ onPrompt }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 max-w-2xl mx-auto w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-5 shadow-lg shadow-indigo-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="white" />
            <path
              d="M12 3C12 3 6 7.5 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 7.5 12 3 12 3Z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          How can I help you today?
        </h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Ask anything about shopping, money, planning, or daily decisions.
        </p>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onPrompt(cat.starterPrompt)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium',
              'border transition-all duration-150 cursor-pointer',
              cat.color
            )}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Example prompts */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm text-sm text-gray-600 hover:text-gray-900 transition-all duration-150 group"
          >
            <span className="line-clamp-2">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
