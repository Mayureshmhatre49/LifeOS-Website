'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuraChildProfile, AuraGuidanceResult, AuraAITopic } from '@/types/aura'
import { AURA_AI_TOPICS } from '@/types/aura'
import { cn } from '@/lib/utils'

interface Props {
  children: AuraChildProfile[]
  initialChildId?: string
  initialTopic?: AuraAITopic
  initialMissingMilestones?: string[]
}

function GuidanceCard({ result }: { result: AuraGuidanceResult }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 text-sm shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-start justify-between w-full gap-2 text-left"
      >
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />}
      </button>

      {open && (
        <>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommendations</p>
            <ul className="space-y-1.5">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-gray-600 text-sm leading-snug">
                  <span className="text-indigo-400 font-semibold shrink-0">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resources</p>
            <ul className="space-y-1">
              {result.resources.map((r, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-indigo-600">
                  <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {result.when_to_escalate && (
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
              <p className="text-xs font-semibold text-orange-700 mb-0.5">When to seek professional help</p>
              <p className="text-xs text-orange-600">{result.when_to_escalate}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">{result.disclaimer}</p>
        </>
      )}
    </div>
  )
}

export function AskAuraAI({
  children,
  initialChildId,
  initialTopic = 'general',
  initialMissingMilestones,
}: Props) {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    initialChildId ?? children[0]?.id ?? '',
  )
  const [selectedTopic, setSelectedTopic] = useState<AuraAITopic>(initialTopic)
  const [question, setQuestion] = useState(
    initialMissingMilestones
      ? `My child hasn't shown these milestones yet: ${initialMissingMilestones.join(', ')}. What can I do?`
      : '',
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuraGuidanceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedChild = children.find(c => c.id === selectedChildId) ?? children[0]

  async function handleSubmit() {
    if (!selectedChild || !question.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const isMillestone = !!initialMissingMilestones && question.includes('hasn\'t shown')
      const body = isMillestone
        ? {
            action: 'milestone_guidance',
            child: selectedChild,
            missing_milestones: initialMissingMilestones,
          }
        : {
            action: 'guidance',
            child: selectedChild,
            question: question.trim(),
            topic: selectedTopic,
          }

      const res = await fetch('/api/family/aura/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.result) {
        setResult(json.result)
      } else {
        setError(json.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center space-y-2">
        <Sparkles className="h-6 w-6 text-indigo-400 mx-auto" />
        <p className="text-sm text-indigo-600 font-medium">Add a child profile first</p>
        <p className="text-xs text-indigo-400">AURA AI needs a child profile to give personalised guidance.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-indigo-700">Ask AURA AI</h3>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-500">Evidence-based</span>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Asking about:</p>
          <div className="flex gap-1.5 flex-wrap">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                  selectedChildId === c.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
                )}
              >
                {c.full_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic selector */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Topic:</p>
        <div className="flex flex-wrap gap-1.5">
          {AURA_AI_TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors',
                selectedTopic === t.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
              )}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question input */}
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder={`Ask AURA about ${selectedChild?.full_name ?? 'your child'}… e.g. "My 3-year-old isn't talking much, what can I do?"`}
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400"
      />

      <Button
        onClick={handleSubmit}
        disabled={loading || !question.trim() || !selectedChild}
        size="sm"
        className="gap-1.5"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? 'AURA is thinking…' : 'Get guidance'}
      </Button>

      {error && (
        <p className="text-xs text-red-500 rounded-xl bg-red-50 border border-red-100 px-3 py-2">{error}</p>
      )}

      {result && <GuidanceCard result={result} />}
    </div>
  )
}
