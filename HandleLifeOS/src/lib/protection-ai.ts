import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type {
  ScamAnalysisResult,
  QuoteAnalysisResult,
  ContractAnalysisResult,
  SubscriptionAnalysisResult,
  DecisionAnalysisResult,
  NegotiationResult,
  RiskLevel,
  NegotiationTone,
} from '@/types/protection'

const DISCLAIMER = 'This is informational guidance only. For major financial or legal decisions, consider consulting a qualified professional.'

// ── Scam Checker ───────────────────────────────────────────────────────────

export async function analyzeScam(
  content: string,
  userContext?: string
): Promise<ScamAnalysisResult> {
  if (isMockMode()) return mockScam(content)

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a calm, trustworthy scam detection assistant for Life OS. Analyze messages for fraud, phishing, pressure tactics, and suspicious patterns. ${ctx}

Be accurate and measured — not alarmist. Never claim absolute certainty.

Respond with valid JSON only:
{
  "risk_level": "low|medium|high",
  "verdict": "one sentence plain-language verdict",
  "summary": "2-3 sentence explanation of why",
  "red_flags": ["list", "of", "specific", "red", "flags"],
  "safe_next_step": "one clear actionable next step",
  "disclaimer": "standard disclaimer"
}

Common patterns to check: urgent pressure, request for OTP/password/money transfer, too-good offers, fake authority, grammar errors, suspicious links, advance payment requests, lottery/prize scams.`,
    prompt: `Analyze this for scam/fraud risk:\n\n${content}`,
    maxOutputTokens: 800,
    temperature: 0.2,
  })

  return parseJSON<ScamAnalysisResult>(raw, mockScam(content))
}

// ── Quote Fairness Checker ─────────────────────────────────────────────────

export async function analyzeQuote(
  content: string,
  amount?: number,
  currency = 'INR',
  category = 'service',
  region = 'India',
  userContext?: string
): Promise<QuoteAnalysisResult> {
  if (isMockMode()) return mockQuote(content, amount, currency)

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''
  const amountInfo = amount ? `Quoted amount: ${currency} ${amount.toLocaleString()}` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a fair-pricing advisor for Life OS. Analyze quotes for services, repairs, and purchases. ${ctx}

Provide honest, calibrated guidance — not extreme pessimism or optimism.

Respond with valid JSON only:
{
  "risk_level": "low|medium|high",
  "verdict": "one clear sentence — e.g. 'This quote seems reasonable / slightly high / significantly overpriced'",
  "summary": "2-3 sentence explanation",
  "market_estimate": "typical range for this service if known",
  "negotiation_tips": ["tip 1", "tip 2", "tip 3"],
  "negotiation_script": "polite 2-3 sentence script to negotiate down",
  "disclaimer": "standard disclaimer"
}`,
    prompt: `Category: ${category}\nRegion: ${region}\n${amountInfo}\n\nQuote details:\n${content}`,
    maxOutputTokens: 900,
    temperature: 0.3,
  })

  return parseJSON<QuoteAnalysisResult>(raw, mockQuote(content, amount, currency))
}

// ── Contract Simplifier ────────────────────────────────────────────────────

export async function analyzeContract(
  content: string,
  userContext?: string
): Promise<ContractAnalysisResult> {
  if (isMockMode()) return mockContract()

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a plain-language contract advisor for Life OS. Explain legal/contract text in simple, clear language. Flag hidden risks. ${ctx}

Never give legal advice. Always recommend professional review for major contracts.

Respond with valid JSON only:
{
  "risk_level": "low|medium|high",
  "summary": "2-3 sentence plain-language summary",
  "plain_language": "paragraph explaining what this means in simple terms",
  "hidden_risks": ["risk 1", "risk 2"],
  "watch_out": ["clause 1 to watch", "clause 2 to watch"],
  "safe_to_sign": null,
  "disclaimer": "standard disclaimer"
}

Note: safe_to_sign should almost always be null — you can't determine this without full context.`,
    prompt: `Simplify and analyze this contract/clause:\n\n${content}`,
    maxOutputTokens: 1000,
    temperature: 0.2,
  })

  return parseJSON<ContractAnalysisResult>(raw, mockContract())
}

// ── Subscription Waste Detector ────────────────────────────────────────────

export async function analyzeSubscriptions(
  content: string,
  currency = 'INR',
  userContext?: string
): Promise<SubscriptionAnalysisResult> {
  if (isMockMode()) return mockSubscriptions()

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a personal finance advisor for Life OS. Help identify wasteful or duplicate subscriptions and suggest ways to save money. ${ctx}

Be practical and helpful, not alarmist.

Respond with valid JSON only:
{
  "risk_level": "low|medium|high",
  "summary": "1-2 sentence overview",
  "waste_items": [
    { "name": "service name", "issue": "why it may be wasteful", "suggestion": "what to do" }
  ],
  "potential_savings": "estimated monthly/yearly savings",
  "disclaimer": "standard disclaimer"
}`,
    prompt: `Currency: ${currency}\n\nSubscriptions/bills list:\n${content}`,
    maxOutputTokens: 900,
    temperature: 0.3,
  })

  return parseJSON<SubscriptionAnalysisResult>(raw, mockSubscriptions())
}

// ── Decision Risk Checker ──────────────────────────────────────────────────

export async function analyzeDecision(
  content: string,
  userContext?: string
): Promise<DecisionAnalysisResult> {
  if (isMockMode()) return mockDecision()

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a balanced decision advisor for Life OS. Help users think through risky decisions with pros, cons, and red flags. ${ctx}

Be balanced and honest. Never claim certainty. Be warm and supportive.

Respond with valid JSON only:
{
  "risk_level": "low|medium|high",
  "summary": "2-3 sentence balanced assessment",
  "pros": ["pro 1", "pro 2"],
  "cons": ["con 1", "con 2"],
  "red_flags": ["flag 1 if any"],
  "recommendation": "1-2 sentence balanced recommendation",
  "disclaimer": "standard disclaimer"
}`,
    prompt: `Analyze this decision/situation:\n\n${content}`,
    maxOutputTokens: 800,
    temperature: 0.3,
  })

  return parseJSON<DecisionAnalysisResult>(raw, mockDecision())
}

// ── Negotiation Coach ──────────────────────────────────────────────────────

export async function generateNegotiationScript(
  context: string,
  negotiationType: string,
  tone: NegotiationTone = 'polite',
  amount?: number,
  currency = 'INR',
  userContext?: string
): Promise<NegotiationResult> {
  if (isMockMode()) return mockNegotiation(context, tone)

  const model = getAIModel()
  const ctx = userContext ? `User profile: ${userContext}` : ''
  const amountInfo = amount ? `Amount involved: ${currency} ${amount.toLocaleString()}` : ''

  const toneGuidance: Record<NegotiationTone, string> = {
    polite: 'Use a warm, respectful, and non-confrontational tone. Make it easy for both sides.',
    firm: 'Use a confident, clear, and assertive tone. Polite but direct.',
    professional: 'Use formal, business-appropriate language. Structured and credible.',
  }

  const { text: raw } = await generateText({
    model,
    system: `You are a negotiation coach for Life OS. Write practical, effective negotiation scripts for everyday situations. ${toneGuidance[tone]} ${ctx}

Respond with valid JSON only:
{
  "opening_line": "first sentence to say or write",
  "script": "full 3-5 sentence script",
  "fallback_line": "what to say if they say no",
  "tone": "${tone}",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`,
    prompt: `Type: ${negotiationType}\n${amountInfo}\nContext: ${context}`,
    maxOutputTokens: 700,
    temperature: 0.5,
  })

  return parseJSON<NegotiationResult>(raw, mockNegotiation(context, tone))
}

// ── Mock responses ─────────────────────────────────────────────────────────

function mockScam(content: string): ScamAnalysisResult {
  const hasUrgent = /urgent|immediately|claim|prize|won|OTP|password|transfer/i.test(content)
  return {
    risk_level: hasUrgent ? 'high' : 'medium',
    verdict: hasUrgent ? 'This message shows several scam warning signs.' : 'This message has some potentially suspicious elements.',
    summary: 'Life OS detected patterns that may indicate a scam attempt. Review the red flags before taking any action.',
    red_flags: hasUrgent
      ? ['Urgent pressure tactics', 'Requests sensitive information', 'Too-good-to-be-true offer']
      : ['Unverified sender', 'Unusual request'],
    safe_next_step: 'Do not click any links or share personal information. Verify directly with the official organization.',
    disclaimer: DISCLAIMER,
  }
}

function mockQuote(content: string, amount?: number, currency = 'INR'): QuoteAnalysisResult {
  return {
    risk_level: 'medium',
    verdict: amount && amount > 50000 ? 'This quote appears higher than typical market rates.' : 'This quote is in a reasonable range.',
    summary: 'Based on typical market rates, this quote warrants a closer look. Consider getting 2-3 comparison quotes.',
    market_estimate: 'Typical range varies by location and quality level.',
    negotiation_tips: [
      'Ask for an itemized breakdown of costs',
      'Request a 10-15% discount for prompt payment',
      'Compare with at least 2 other quotes',
    ],
    negotiation_script: `Thank you for the quote. I've received a few estimates and was hoping we could discuss pricing. Is there any flexibility on the total?`,
    disclaimer: DISCLAIMER,
  }
}

function mockContract(): ContractAnalysisResult {
  return {
    risk_level: 'medium',
    summary: 'This contract contains standard terms with a few clauses worth reviewing carefully.',
    plain_language: 'This agreement outlines the terms of service between you and the provider. Key points include payment terms, cancellation policy, and liability limitations.',
    hidden_risks: ['Auto-renewal clause', 'Liability waiver may limit your recourse'],
    watch_out: ['Cancellation notice period', 'Data usage terms'],
    safe_to_sign: null,
    disclaimer: DISCLAIMER,
  }
}

function mockSubscriptions(): SubscriptionAnalysisResult {
  return {
    risk_level: 'medium',
    summary: 'Found potential savings opportunities in your subscription list.',
    waste_items: [
      { name: 'Duplicate streaming service', issue: 'You may have overlapping content', suggestion: 'Consider keeping only the one you use most' },
      { name: 'Unused gym membership', issue: 'Low utilization increases cost per visit', suggestion: 'Switch to pay-per-class or cancel' },
    ],
    potential_savings: 'Estimated ₹500-2000/month in potential savings',
    disclaimer: DISCLAIMER,
  }
}

function mockDecision(): DecisionAnalysisResult {
  return {
    risk_level: 'medium',
    summary: 'This decision has both potential benefits and risks worth considering carefully.',
    pros: ['Potential upside if things go well', 'May solve the immediate problem'],
    cons: ['Financial commitment involved', 'Outcome is uncertain'],
    red_flags: ['Pressure to decide quickly'],
    recommendation: 'Take time to research further and consult with trusted people before committing.',
    disclaimer: DISCLAIMER,
  }
}

function mockNegotiation(context: string, tone: NegotiationTone): NegotiationResult {
  return {
    opening_line: 'I appreciate the offer and I\'d like to discuss the terms a bit.',
    script: `Thank you for the offer. I've done some research on current market rates and was hoping we could find a middle ground. Would you be open to discussing the price/terms?`,
    fallback_line: 'I understand. Could we explore any other adjustments — like payment terms or added value?',
    tone,
    tips: [
      'Be specific about what you want',
      'Show you\'ve done your research',
      'Be willing to walk away if needed',
    ],
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (match) return JSON.parse(match[1]) as T
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function hashContent(content: string): string {
  // Simple deterministic hash for deduplication (not cryptographic)
  let h = 0
  for (let i = 0; i < Math.min(content.length, 500); i++) {
    h = ((h << 5) - h + content.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(16)
}
