'use client'

import { cn } from '@/lib/utils'
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { RiskLevel } from '@/types/protection'

const RISK_CONFIG: Record<RiskLevel, {
  icon: React.ReactNode
  label: string
  bg: string
  border: string
  badge: string
  text: string
}> = {
  low: {
    icon: <CheckCircle className="h-5 w-5" />,
    label: 'Low Risk',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    text: 'text-green-700',
  },
  medium: {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: 'Medium Risk',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
  },
  high: {
    icon: <AlertCircle className="h-5 w-5" />,
    label: 'High Risk',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-700',
  },
  unknown: {
    icon: <Shield className="h-5 w-5" />,
    label: 'Analyzing...',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    text: 'text-gray-600',
  },
}

interface RiskResultProps {
  risk_level: RiskLevel
  verdict?: string
  summary: string
  red_flags?: string[]
  watch_out?: string[]
  safe_next_step?: string
  plain_language?: string
  hidden_risks?: string[]
  negotiation_tips?: string[]
  negotiation_script?: string
  pros?: string[]
  cons?: string[]
  recommendation?: string
  waste_items?: Array<{ name: string; issue: string; suggestion: string }>
  potential_savings?: string
  market_estimate?: string
  disclaimer: string
  script?: string
  opening_line?: string
  fallback_line?: string
  tips?: string[]
}

export function RiskResult({
  risk_level,
  verdict,
  summary,
  red_flags,
  watch_out,
  safe_next_step,
  plain_language,
  hidden_risks,
  negotiation_tips,
  negotiation_script,
  pros,
  cons,
  recommendation,
  waste_items,
  potential_savings,
  market_estimate,
  disclaimer,
  script,
  opening_line,
  fallback_line,
  tips,
}: RiskResultProps) {
  const cfg = RISK_CONFIG[risk_level]
  const [copied, setCopied] = useState(false)

  async function copyScript(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Risk badge */}
      <div className={cn('rounded-2xl border p-5', cfg.bg, cfg.border)}>
        <div className="flex items-center gap-3 mb-3">
          <span className={cfg.text}>{cfg.icon}</span>
          <span className={cn('text-sm font-bold px-2.5 py-1 rounded-full', cfg.badge)}>
            {cfg.label}
          </span>
        </div>
        {verdict && <p className="text-base font-semibold text-gray-900 mb-2">{verdict}</p>}
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </div>

      {/* Plain language */}
      {plain_language && (
        <Section title="In plain language" icon="📖">
          <p className="text-sm text-gray-700 leading-relaxed">{plain_language}</p>
        </Section>
      )}

      {/* Market estimate */}
      {market_estimate && (
        <Section title="Market estimate" icon="📊">
          <p className="text-sm text-gray-700">{market_estimate}</p>
        </Section>
      )}

      {/* Red flags */}
      {red_flags && red_flags.length > 0 && (
        <Section title="Red flags" icon="🚩">
          <ul className="space-y-1.5">
            {red_flags.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-0.5 shrink-0">•</span>{f}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Hidden risks / Watch out */}
      {(hidden_risks?.length || watch_out?.length) && (
        <Section title="Watch out for" icon="⚠️">
          <ul className="space-y-1.5">
            {[...(hidden_risks ?? []), ...(watch_out ?? [])].map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span>{r}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Pros / Cons */}
      {(pros?.length || cons?.length) && (
        <div className="grid grid-cols-2 gap-3">
          {pros && pros.length > 0 && (
            <Section title="Pros" icon="✅">
              <ul className="space-y-1">
                {pros.map((p, i) => <li key={i} className="text-xs text-gray-700">{p}</li>)}
              </ul>
            </Section>
          )}
          {cons && cons.length > 0 && (
            <Section title="Cons" icon="⚠️">
              <ul className="space-y-1">
                {cons.map((c, i) => <li key={i} className="text-xs text-gray-700">{c}</li>)}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <Section title="Recommendation" icon="💡">
          <p className="text-sm text-gray-700">{recommendation}</p>
        </Section>
      )}

      {/* Safe next step */}
      {safe_next_step && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-xs font-medium text-indigo-600 mb-1">Safe next step</p>
          <p className="text-sm text-indigo-800">{safe_next_step}</p>
        </div>
      )}

      {/* Negotiation tips */}
      {negotiation_tips && negotiation_tips.length > 0 && (
        <Section title="Negotiation tips" icon="🤝">
          <ul className="space-y-1.5">
            {negotiation_tips.map((t, i) => (
              <li key={i} className="text-sm text-gray-700">• {t}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Negotiation script */}
      {(negotiation_script ?? script) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Negotiation script</p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => copyScript(negotiation_script ?? script ?? '')}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          {opening_line && <p className="text-xs text-indigo-600 mb-2 font-medium">"{opening_line}"</p>}
          <p className="text-sm text-gray-700 leading-relaxed italic">"{negotiation_script ?? script}"</p>
          {fallback_line && (
            <p className="text-xs text-gray-500 mt-2">If they say no: "{fallback_line}"</p>
          )}
          {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
        </div>
      )}

      {/* Waste items */}
      {waste_items && waste_items.length > 0 && (
        <Section title="Potential waste" icon="💸">
          <div className="space-y-2">
            {waste_items.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.issue}</p>
                <p className="text-xs text-green-600 mt-0.5">→ {item.suggestion}</p>
              </div>
            ))}
          </div>
          {potential_savings && (
            <p className="text-sm font-medium text-green-700 mt-2">💰 {potential_savings}</p>
          )}
        </Section>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <Section title="Tips" icon="💡">
          <ul className="space-y-1.5">
            {tips.map((t, i) => <li key={i} className="text-sm text-gray-700">• {t}</li>)}
          </ul>
        </Section>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
        ℹ️ {disclaimer}
      </p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500 mb-2">{icon} {title}</p>
      {children}
    </div>
  )
}
