import type { DecisionResult, RiskLevel } from '@/types/decision'

export function extractRiskLevel(riskScore: number): RiskLevel {
  if (riskScore < 35) return 'low'
  if (riskScore < 65) return 'medium'
  return 'high'
}

export function getRiskColor(level: RiskLevel): string {
  if (level === 'low') return 'emerald'
  if (level === 'medium') return 'amber'
  return 'rose'
}

export function getConfidenceLabel(score: number): string {
  if (score >= 80) return 'High confidence'
  if (score >= 60) return 'Moderate confidence'
  if (score >= 40) return 'Low confidence'
  return 'Uncertain'
}

export function normalizeResult(raw: Partial<DecisionResult>): DecisionResult {
  const riskScore = Math.min(100, Math.max(0, raw.riskScore ?? 50))
  return {
    summary: raw.summary ?? 'Analysis complete.',
    recommendation: raw.recommendation ?? 'Review the factors below carefully.',
    confidenceScore: Math.min(100, Math.max(0, raw.confidenceScore ?? 60)),
    riskScore,
    riskLevel: raw.riskLevel ?? extractRiskLevel(riskScore),
    financialImpact: raw.financialImpact ?? {
      summary: 'Financial data not available for this analysis.',
      monthlyCostChange: null,
      oneTimeCost: null,
      opportunityCost: null,
      affordabilityScore: null,
    },
    timeImpact: raw.timeImpact ?? 'Timeline not specified.',
    emotionalImpact: raw.emotionalImpact ?? 'Emotional impact not analyzed.',
    pros: raw.pros ?? [],
    cons: raw.cons ?? [],
    hiddenFactors: raw.hiddenFactors ?? [],
    bestCase: raw.bestCase ?? {
      label: 'Best case',
      description: 'Everything goes according to plan.',
      probability: 'possible',
    },
    worstCase: raw.worstCase ?? {
      label: 'Worst case',
      description: 'Key assumptions do not hold.',
      probability: 'unlikely',
    },
    threeYearView: raw.threeYearView ?? 'Long-term view requires more context.',
    nextSteps: raw.nextSteps ?? [],
    memoryFactorsUsed: raw.memoryFactorsUsed ?? [],
    dataSourcesUsed: raw.dataSourcesUsed ?? [],
  }
}

export function stripJsonFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
}
