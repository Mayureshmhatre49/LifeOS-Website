'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type {
  HouseholdPlanResult,
  ChoreBalanceResult,
  MentalLoadResult,
  HouseholdChecklistResult,
} from '@/types/family'
import { cn } from '@/lib/utils'

type AnyFamilyResult =
  | HouseholdPlanResult
  | ChoreBalanceResult
  | MentalLoadResult
  | HouseholdChecklistResult
  | { suggestions: string[] }

type ActionOption = {
  action: string
  label: string
  emoji: string
  needsInput?: boolean
  inputPlaceholder?: string
}

const ACTIONS: ActionOption[] = [
  { action: 'plan_week', label: 'Plan the week', emoji: '📅' },
  { action: 'balance_chores', label: 'Balance chores', emoji: '⚖️' },
  { action: 'mental_load', label: 'What are we forgetting?', emoji: '🧠', needsInput: true, inputPlaceholder: 'e.g. Preparing for school reopening…' },
  { action: 'checklist', label: 'Make a checklist', emoji: '✅', needsInput: true, inputPlaceholder: 'e.g. Weekend trip to Goa' },
  { action: 'suggest_groceries', label: 'Suggest groceries', emoji: '🛒' },
]

function ResultCard({ result }: { result: AnyFamilyResult }) {
  const [open, setOpen] = useState(true)

  const isPlan = 'priorities' in result
  const isChores = 'assignments' in result
  const isMental = 'forgotten_items' in result
  const isChecklist = 'checklist_title' in result
  const isSuggestions = 'suggestions' in result && !isPlan && !isChores

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 text-sm">
      {isPlan && (
        <>
          <p className="text-gray-700">{(result as HouseholdPlanResult).summary}</p>
          <div>
            <p className="font-medium text-gray-700 mb-1">Priorities</p>
            <ul className="space-y-1">
              {(result as HouseholdPlanResult).priorities.map((p, i) => (
                <li key={i} className="flex gap-2 text-gray-600"><span className="text-indigo-400 shrink-0">{i + 1}.</span>{p}</li>
              ))}
            </ul>
          </div>
          {(result as HouseholdPlanResult).suggestions.length > 0 && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-1">
              {(result as HouseholdPlanResult).suggestions.map((s, i) => (
                <p key={i} className="text-indigo-700 text-xs">→ {s}</p>
              ))}
            </div>
          )}
        </>
      )}

      {isChores && (
        <>
          <p className="text-gray-700">{(result as ChoreBalanceResult).analysis}</p>
          {(result as ChoreBalanceResult).assignments.map((a, i) => (
            <div key={i} className="rounded-xl bg-gray-50 p-3">
              <p className="font-medium text-gray-800 text-xs mb-1">{a.member}</p>
              <ul className="space-y-0.5">
                {a.tasks.map((t, j) => <li key={j} className="text-xs text-gray-600">• {t}</li>)}
              </ul>
            </div>
          ))}
          <p className="text-xs text-gray-400 italic">{(result as ChoreBalanceResult).tip}</p>
        </>
      )}

      {isMental && (
        <>
          <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3">
            <p className="text-yellow-800 text-sm">{(result as MentalLoadResult).check_in}</p>
          </div>
          {(result as MentalLoadResult).forgotten_items.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Might be forgotten</p>
              <ul className="space-y-1">
                {(result as MentalLoadResult).forgotten_items.map((f, i) => (
                  <li key={i} className="text-gray-600">⚠ {f}</li>
                ))}
              </ul>
            </div>
          )}
          {(result as MentalLoadResult).upcoming_flags.length > 0 && (
            <ul className="space-y-1">
              {(result as MentalLoadResult).upcoming_flags.map((f, i) => (
                <li key={i} className="text-gray-500 text-xs">→ {f}</li>
              ))}
            </ul>
          )}
          <p className="text-gray-400 italic text-xs">{(result as MentalLoadResult).calm_note}</p>
        </>
      )}

      {isChecklist && (
        <>
          <p className="font-semibold text-gray-800">{(result as HouseholdChecklistResult).checklist_title}</p>
          <ul className="space-y-1.5">
            {(result as HouseholdChecklistResult).items.map((item, i) => (
              <li key={i} className="flex gap-2 text-gray-600">
                <span className="text-gray-300 shrink-0">☐</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 italic">{(result as HouseholdChecklistResult).tip}</p>
        </>
      )}

      {isSuggestions && (
        <div className="flex flex-wrap gap-2">
          {((result as { suggestions: string[] }).suggestions).map((s, i) => (
            <span key={i} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs text-green-700">{s}</span>
          ))}
        </div>
      )}

      {'disclaimer' in result && (
        <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">{(result as { disclaimer: string }).disclaimer}</p>
      )}
    </div>
  )
}

interface Props {
  familyId: string
  onSubmit: (action: string, extra?: string) => Promise<AnyFamilyResult | null>
}

export function AskFamilyAI({ familyId, onSubmit }: Props) {
  const [selected, setSelected] = useState<ActionOption | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnyFamilyResult | null>(null)

  async function handleSubmit() {
    if (!selected) return
    if (selected.needsInput && !input.trim()) return
    setLoading(true)
    setResult(null)
    const res = await onSubmit(selected.action, input.trim() || undefined)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-indigo-700">Family AI</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(a => (
          <button
            key={a.action}
            onClick={() => { setSelected(a); setResult(null); setInput('') }}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selected?.action === a.action
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
            )}
          >
            <span>{a.emoji}</span>
            {a.label}
          </button>
        ))}
      </div>

      {selected?.needsInput && (
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={selected.inputPlaceholder}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          rows={2}
        />
      )}

      {selected && (
        <Button
          onClick={handleSubmit}
          disabled={loading || (!!selected.needsInput && !input.trim())}
          size="sm"
          className="gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? 'Thinking…' : 'Get help'}
        </Button>
      )}

      {result && <ResultCard result={result} />}
    </div>
  )
}
