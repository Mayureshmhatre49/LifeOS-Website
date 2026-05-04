export type ProtectionCheckType = 'scam' | 'quote' | 'contract' | 'decision' | 'subscription'
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown'
export type NegotiationTone = 'polite' | 'firm' | 'professional'

export interface RiskCheck {
  id: string
  user_id: string
  type: ProtectionCheckType
  title: string
  input_hash: string
  risk_level: RiskLevel
  result_summary: string
  red_flags: string[]
  safe_next_step?: string | null
  created_at: string
}

export interface SavedQuote {
  id: string
  user_id: string
  title: string
  amount?: number | null
  currency: string
  category: string
  region?: string | null
  result_summary?: string | null
  risk_level: RiskLevel
  negotiation_script?: string | null
  created_at: string
}

export interface NegotiationTemplate {
  id: string
  user_id: string
  type: string
  context: string
  script: string
  tone: NegotiationTone
  created_at: string
}

// AI result types
export interface ScamAnalysisResult {
  risk_level: RiskLevel
  summary: string
  red_flags: string[]
  safe_next_step: string
  verdict: string
  disclaimer: string
}

export interface QuoteAnalysisResult {
  risk_level: RiskLevel
  summary: string
  verdict: string
  market_estimate?: string
  negotiation_tips: string[]
  negotiation_script?: string
  disclaimer: string
}

export interface ContractAnalysisResult {
  risk_level: RiskLevel
  summary: string
  plain_language: string
  hidden_risks: string[]
  watch_out: string[]
  safe_to_sign: boolean | null
  disclaimer: string
}

export interface SubscriptionAnalysisResult {
  risk_level: RiskLevel
  summary: string
  waste_items: Array<{ name: string; issue: string; suggestion: string }>
  potential_savings: string
  disclaimer: string
}

export interface DecisionAnalysisResult {
  risk_level: RiskLevel
  summary: string
  pros: string[]
  cons: string[]
  red_flags: string[]
  recommendation: string
  disclaimer: string
}

export interface NegotiationResult {
  script: string
  opening_line: string
  fallback_line: string
  tone: NegotiationTone
  tips: string[]
}

// API input types
export interface AnalyzeInput {
  type: ProtectionCheckType
  content: string
  context?: string
  amount?: number
  currency?: string
  region?: string
  category?: string
  title?: string
}
