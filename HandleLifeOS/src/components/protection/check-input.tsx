'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'
import { RiskResult } from './risk-result'
import type { ProtectionCheckType, RiskLevel } from '@/types/protection'

interface CheckInputProps {
  type: ProtectionCheckType
  title: string
  placeholder: string
  icon: string
  showAmount?: boolean
  showCategory?: boolean
  showTone?: boolean
  categories?: string[]
  onResult?: (result: unknown) => void
}

export function CheckInput({
  type,
  title,
  placeholder,
  icon,
  showAmount,
  showCategory,
  showTone,
  categories,
  onResult,
}: CheckInputProps) {
  const [content, setContent] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories?.[0] ?? 'other')
  const [tone, setTone] = useState<'polite' | 'firm' | 'professional'>('polite')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  const isNegotiate = type === 'subscription' && showTone // reuse for negotiate
  const apiUrl = showTone ? '/api/protection/negotiate' : '/api/protection/analyze'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (content.trim().length < 10) {
      setError('Please enter at least 10 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = { type, content: content.trim() }
      if (showAmount && amount) body.amount = parseFloat(amount)
      if (showCategory) body.category = category
      if (showTone) { body.tone = tone; body.context = content.trim(); body.type = type }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
      onResult?.(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setContent('')
    setResult(null)
    setError('')
    setAmount('')
  }

  return (
    <div className="space-y-4">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`${type}-content`}>
              {icon} {title}
            </Label>
            <div className="relative mt-1.5">
              <textarea
                id={`${type}-content`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={6}
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-24"
              />
              <div className="absolute right-1 top-1">
                <VoiceMicButton
                  onTranscript={setContent}
                  className="h-8 w-8 bg-transparent hover:bg-gray-50 text-gray-400"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{content.length}/8000</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {showAmount && (
              <div>
                <Label htmlFor={`${type}-amount`}>Amount (optional)</Label>
                <Input
                  id={`${type}-amount`}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="mt-1"
                />
              </div>
            )}
            {showCategory && categories && (
              <div>
                <Label htmlFor={`${type}-cat`}>Category</Label>
                <select
                  id={`${type}-cat`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
            {showTone && (
              <div>
                <Label>Tone</Label>
                <div className="mt-1 flex gap-1.5">
                  {(['polite', 'firm', 'professional'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                        tone === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} disabled={content.trim().length < 10} className="w-full">
            Analyze now
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <RiskResult
            risk_level={(result.risk_level as RiskLevel) ?? 'unknown'}
            verdict={result.verdict as string | undefined}
            summary={result.summary as string}
            red_flags={result.red_flags as string[] | undefined}
            watch_out={result.watch_out as string[] | undefined}
            safe_next_step={result.safe_next_step as string | undefined}
            plain_language={result.plain_language as string | undefined}
            hidden_risks={result.hidden_risks as string[] | undefined}
            negotiation_tips={result.negotiation_tips as string[] | undefined}
            negotiation_script={result.negotiation_script as string | undefined}
            pros={result.pros as string[] | undefined}
            cons={result.cons as string[] | undefined}
            recommendation={result.recommendation as string | undefined}
            waste_items={result.waste_items as RiskResult['waste_items']}
            potential_savings={result.potential_savings as string | undefined}
            market_estimate={result.market_estimate as string | undefined}
            disclaimer={(result.disclaimer as string) ?? ''}
            script={result.script as string | undefined}
            opening_line={result.opening_line as string | undefined}
            fallback_line={result.fallback_line as string | undefined}
            tips={result.tips as string[] | undefined}
          />
          <Button variant="outline" onClick={handleClear} className="w-full">
            Check something else
          </Button>
        </div>
      )}
    </div>
  )
}

// Re-export RiskResult type for use in check-input props
type RiskResultWasteItem = { name: string; issue: string; suggestion: string }
interface RiskResult {
  waste_items?: RiskResultWasteItem[]
}
