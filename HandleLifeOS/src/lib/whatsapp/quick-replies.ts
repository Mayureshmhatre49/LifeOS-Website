/**
 * Quick reply card templates for the Life OS WhatsApp bot.
 * Returns pre-formatted WhatsApp-compatible strings.
 */

export function buildWelcomeMenu(firstName = 'there'): string {
  return `👋 *Namaste ${firstName}!* I'm Life OS — your personal AI for everyday life.

Here's what I can help you with:

1️⃣  💰 *EMI Calculator* — Home, car, or personal loan
2️⃣  🛡️ *Scam Checker* — Is this message real or fraud?
3️⃣  📅 *Daily Planner* — Plan your day with AI
4️⃣  💸 *Budget Help* — Track spending, check affordability
5️⃣  💬 *Just Chat* — Ask me anything

Reply with a number or just type your question!

_Powered by Life OS · lifeos.app_`
}

export function buildEmiResponse(params: {
  loanAmount: number
  interestRate: number
  tenureMonths: number
  emi: number
  totalPayment: number
  totalInterest: number
}): string {
  const fmt = (n: number) =>
    n >= 10_00_000
      ? `₹${(n / 10_00_000).toFixed(2)}L`
      : n >= 1000
      ? `₹${n.toLocaleString('en-IN')}`
      : `₹${n}`

  return `🏦 *EMI Calculation Result*

💰 Loan Amount: ${fmt(params.loanAmount)}
📊 Interest Rate: ${params.interestRate}% per year
📅 Tenure: ${params.tenureMonths} months (${(params.tenureMonths / 12).toFixed(1)} yrs)

─────────────────
*Monthly EMI: ${fmt(Math.round(params.emi))}*
Total Interest: ${fmt(Math.round(params.totalInterest))}
Total Payment: ${fmt(Math.round(params.totalPayment))}
─────────────────

💡 _Type another amount or ask "compare with 9% rate"_`
}

export function buildScamAlertResponse(riskLevel: 'low' | 'medium' | 'high', summary: string, nextStep?: string): string {
  const icons = {
    low:    '🟢 *LOW RISK*',
    medium: '🟡 *MEDIUM RISK — Be Careful*',
    high:   '🔴 *HIGH RISK — Likely Scam!*',
  }

  return `🛡️ *Life OS Scam Check*

${icons[riskLevel]}

${summary}${nextStep ? `\n\n✅ *What to do:* ${nextStep}` : ''}

─────────────────
_Always verify before clicking links or sending money._`
}

export function buildUnlinkedMessage(): string {
  return `👋 *Hello! I'm Life OS, your personal AI assistant.*

To use me, please link your WhatsApp number to your Life OS account:

1. Open Life OS: *lifeos.app*
2. Go to *Settings → WhatsApp*
3. Enter this phone number

Once linked, I'll remember your preferences and help with planning, money, scam checks, and more!

_It's free. No credit card needed._`
}

export function buildQuotaExceededMessage(): string {
  return `⚠️ *Monthly AI limit reached.*

You've used all your free AI requests for this month.

🚀 Upgrade to *Life OS Pro* for unlimited access:
👉 lifeos.app/billing/plans

_Your limit resets on the 1st of next month._`
}

export function buildErrorMessage(): string {
  return `😅 Sorry, I had some trouble processing that. Please try again in a moment.

If this keeps happening, visit: lifeos.app/chat`
}

/**
 * Parse EMI parameters from natural language text.
 * Examples: "5L 8.5% 20 years", "50 lakh at 9% for 15 years"
 */
export function parseEmiFromText(text: string): {
  amount?: number
  rate?: number
  tenureMonths?: number
} | null {
  const result: { amount?: number; rate?: number; tenureMonths?: number } = {}

  // Amount: 5L, 50 lakh, 50L, 5 crore, 500000
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(l|lakh|lac|cr|crore)/i)
  if (amountMatch) {
    const val = parseFloat(amountMatch[1])
    const unit = amountMatch[2].toLowerCase()
    if (unit === 'cr' || unit === 'crore') result.amount = val * 1_00_00_000
    else result.amount = val * 1_00_000
  }

  // Rate: 8.5%, 9 percent
  const rateMatch = text.match(/(\d+(?:\.\d+)?)\s*(%|percent)/i)
  if (rateMatch) result.rate = parseFloat(rateMatch[1])

  // Tenure: 20 years, 180 months
  const yearMatch = text.match(/(\d+)\s*(year|yr|sal|saal)/i)
  const monthMatch = text.match(/(\d+)\s*(month|mahina|mahine|maah)/i)
  if (yearMatch) result.tenureMonths = parseInt(yearMatch[1]) * 12
  else if (monthMatch) result.tenureMonths = parseInt(monthMatch[1])

  if (!result.amount && !result.rate && !result.tenureMonths) return null
  return result
}

/**
 * Calculate EMI using standard formula.
 */
export function calculateEmi(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / 12 / 100
  if (r === 0) {
    const emi = principal / tenureMonths
    return { emi, totalPayment: principal, totalInterest: 0 }
  }
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
  const totalPayment = emi * tenureMonths
  return { emi, totalPayment, totalInterest: totalPayment - principal }
}
