import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@/auth'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { guardPrompt } from '@/lib/security/prompt-guard'

const MAX_TEXT_LENGTH = 8000

interface ExtractedRenewal {
  title: string
  category: string
  subcategory: string | null
  provider: string | null
  reference_no: string | null
  expiry_date: string | null
  start_date: string | null
  recurring_frequency: string | null
  estimated_cost: number | null
  currency: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  ai_summary: string
  ai_risk_notes: string
  confidence_score: number
}

function mockExtraction(text: string): ExtractedRenewal {
  const lower = text.toLowerCase()
  let category = 'other'
  if (lower.includes('insurance') || lower.includes('premium') || lower.includes('policy'))   category = 'financial'
  if (lower.includes('passport') || lower.includes('visa') || lower.includes('license'))      category = 'identity'
  if (lower.includes('vehicle') || lower.includes('car') || lower.includes('pollution'))      category = 'vehicle'
  if (lower.includes('domain') || lower.includes('hosting') || lower.includes('subscription')) category = 'digital'
  if (lower.includes('medicine') || lower.includes('prescription') || lower.includes('health')) category = 'health'
  if (lower.includes('property') || lower.includes('maintenance') || lower.includes('pest'))  category = 'property'

  return {
    title: 'Extracted Renewal Item',
    category,
    subcategory: null,
    provider: null,
    reference_no: null,
    expiry_date: null,
    start_date: null,
    recurring_frequency: 'yearly',
    estimated_cost: null,
    currency: 'INR',
    risk_level: 'medium',
    ai_summary: 'Could not fully parse document. Please review and fill in missing fields.',
    ai_risk_notes: 'Verify expiry date from the original document.',
    confidence_score: 0.3,
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const rawText: string = typeof body.text === 'string' ? body.text : ''

  if (!rawText.trim())
    return NextResponse.json({ error: 'Text content required' }, { status: 400 })

  // Security: guard against prompt injection
  const guardResult = guardPrompt(rawText)
  if (!guardResult.allowed)
    return NextResponse.json({ error: 'Content not allowed' }, { status: 400 })

  const safeText = rawText.slice(0, MAX_TEXT_LENGTH)

  if (isMockMode()) {
    return NextResponse.json({ extraction: mockExtraction(safeText), source: 'mock' })
  }

  const today = new Date().toISOString().slice(0, 10)

  const prompt = `You are an expert at extracting renewal and expiry information from documents.
Today's date: ${today}

Analyze the following text from a document (policy, invoice, receipt, certificate, prescription, etc.) and extract all renewal/expiry information.

Return ONLY a valid JSON object (no markdown, no explanation, no code fences):
{
  "title": "concise descriptive name for this renewal item (under 60 chars)",
  "category": one of: financial|identity|vehicle|property|health|education|digital|family|business|other,
  "subcategory": "specific type within category, or null",
  "provider": "company/vendor/institution name, or null",
  "reference_no": "policy/account/certificate/registration number, or null",
  "expiry_date": "YYYY-MM-DD format, or null if not found",
  "start_date": "YYYY-MM-DD format, or null if not found",
  "recurring_frequency": one of: monthly|quarterly|half_yearly|yearly|custom|null,
  "estimated_cost": renewal cost as a number (no currency symbol), or null,
  "currency": "INR" by default, or detect from document (USD/EUR/GBP etc.),
  "risk_level": one of: low|medium|high|critical (based on consequences of missing this renewal),
  "ai_summary": "1–2 sentence summary of what this is and when it expires",
  "ai_risk_notes": "brief note on consequences if not renewed — penalties, service loss, legal risk",
  "confidence_score": 0.0 to 1.0 (how confident you are in the extraction overall)
}

Risk level guidance:
- critical: passport, visa, vehicle insurance, professional license, compliance filings, medicine
- high: health insurance, property insurance, driving license, property tax, important contracts
- medium: domain, hosting, subscriptions, warranties, maintenance contracts
- low: streaming services, gym memberships, optional subscriptions

Document text:
---
${safeText}
---`

  try {
    const { text } = await generateText({
      model: getAIModel(),
      prompt,
      temperature: 0.1,
      maxOutputTokens: 700,
    })

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object in response')

    const raw: Partial<ExtractedRenewal> = JSON.parse(match[0])

    // Sanitize and validate the AI output
    const extraction: ExtractedRenewal = {
      title:              (typeof raw.title === 'string' ? raw.title : 'Extracted Item').slice(0, 200),
      category:           ['financial','identity','vehicle','property','health','education','digital','family','business','other'].includes(raw.category as string)
        ? raw.category as string : 'other',
      subcategory:        raw.subcategory ? String(raw.subcategory).slice(0, 100) : null,
      provider:           raw.provider    ? String(raw.provider).slice(0, 200)    : null,
      reference_no:       raw.reference_no ? String(raw.reference_no).slice(0, 100) : null,
      expiry_date:        raw.expiry_date && /^\d{4}-\d{2}-\d{2}$/.test(String(raw.expiry_date)) ? String(raw.expiry_date) : null,
      start_date:         raw.start_date  && /^\d{4}-\d{2}-\d{2}$/.test(String(raw.start_date))  ? String(raw.start_date)  : null,
      recurring_frequency: ['monthly','quarterly','half_yearly','yearly','custom'].includes(raw.recurring_frequency as string)
        ? raw.recurring_frequency as string : null,
      estimated_cost:     raw.estimated_cost != null && !isNaN(Number(raw.estimated_cost)) ? Number(raw.estimated_cost) : null,
      currency:           typeof raw.currency === 'string' ? raw.currency.slice(0, 10) : 'INR',
      risk_level:         ['low','medium','high','critical'].includes(raw.risk_level as string)
        ? raw.risk_level as ExtractedRenewal['risk_level'] : 'medium',
      ai_summary:         (typeof raw.ai_summary === 'string' ? raw.ai_summary : '').slice(0, 500),
      ai_risk_notes:      (typeof raw.ai_risk_notes === 'string' ? raw.ai_risk_notes : '').slice(0, 300),
      confidence_score:   raw.confidence_score != null ? Math.min(1, Math.max(0, Number(raw.confidence_score))) : 0.5,
    }

    return NextResponse.json({ extraction, source: 'ai' })
  } catch {
    return NextResponse.json({ extraction: mockExtraction(safeText), source: 'fallback' })
  }
}
