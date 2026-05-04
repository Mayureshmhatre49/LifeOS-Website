import type { AuraChildProfile } from '@/types/aura'
import { getMilestoneProgress, calculateAlerts } from '@/lib/aura-logic'

export interface AuraScore {
  total: number          // 0-100
  milestones: number     // 0-100 — percentage of due milestones achieved
  growth: number         // 0-100 — recency + frequency of growth tracking
  health: number         // 0-100 — alert pressure (inverse)
  recencyDays: {
    growth: number | null
    medical: number | null
  }
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_DAY)
}

export function computeAuraScore(child: AuraChildProfile): AuraScore {
  // Milestones
  const m = getMilestoneProgress(child)

  // Growth: recency-based. Logged in last 90 days = 100, fades to 0 by 365 days.
  const lastGrowth = child.growth_records.length
    ? child.growth_records.reduce((latest, r) => r.date > latest ? r.date : latest, '0000')
    : null
  let growthScore = 0
  let growthRecency: number | null = null
  if (lastGrowth) {
    growthRecency = daysSince(lastGrowth)
    if (growthRecency <= 90) growthScore = 100
    else if (growthRecency <= 365) growthScore = Math.round(100 - ((growthRecency - 90) / 275) * 100)
    else growthScore = 0
  }

  // Health: invert alert pressure. 0 urgent + 0 warning = 100. Each urgent -25, each warning -10, each info -2.
  const alerts = calculateAlerts(child)
  let healthDeduction = 0
  for (const a of alerts) {
    if (a.severity === 'urgent') healthDeduction += 25
    else if (a.severity === 'warning') healthDeduction += 10
    else healthDeduction += 2
  }
  const healthScore = Math.max(0, 100 - healthDeduction)

  // Medical recency
  const lastMedical = child.medical_records.length
    ? child.medical_records.reduce((latest, r) => r.date > latest ? r.date : latest, '0000')
    : null
  const medicalRecency = lastMedical ? daysSince(lastMedical) : null

  // Composite: milestones 50%, growth 25%, health 25%
  const total = Math.round(m.pct * 0.5 + growthScore * 0.25 + healthScore * 0.25)

  return {
    total,
    milestones: m.pct,
    growth: growthScore,
    health: healthScore,
    recencyDays: { growth: growthRecency, medical: medicalRecency },
  }
}

// BMI calculation + age-aware classification (simple, not z-score-precise)
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function classifyBMI(bmi: number, ageYears: number): { label: string; color: string } {
  // Adult-style thresholds work for ages 18+; for under 18 these are loose approximations.
  // Children's BMI is properly assessed via percentile curves; we hint with rough bands.
  if (ageYears < 2) return { label: 'See growth chart', color: 'text-gray-500' }
  if (bmi < 14) return { label: 'Below range',  color: 'text-orange-600' }
  if (bmi < 18.5) return { label: 'Lean',       color: 'text-emerald-600' }
  if (bmi < 25) return { label: 'Healthy range', color: 'text-emerald-600' }
  if (bmi < 30) return { label: 'Above range',  color: 'text-amber-600' }
  return { label: 'High',                       color: 'text-red-600' }
}
