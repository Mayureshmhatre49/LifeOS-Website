import type {
  AuraChildProfile,
  DevelopmentalAlert,
  MilestoneAgeKey,
  MilestoneStatus,
} from '@/types/aura'
import { MILESTONES, MILESTONE_AGES_MONTHS } from '@/types/aura'

// ── Age helpers ───────────────────────────────────────────────────────────────

export function getAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  return Math.max(0, months)
}

export function getAgeDisplay(dateOfBirth: string): string {
  const months = getAgeInMonths(dateOfBirth)
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`
  return `${years}y ${rem}m`
}

// ── Milestone helpers ─────────────────────────────────────────────────────────

export function getRelevantAgeKeys(ageMonths: number): MilestoneAgeKey[] {
  return (Object.entries(MILESTONE_AGES_MONTHS) as [MilestoneAgeKey, number][])
    .filter(([, m]) => ageMonths >= m)
    .map(([key]) => key)
}

export function getNextAgeKey(ageMonths: number): MilestoneAgeKey | null {
  const next = (Object.entries(MILESTONE_AGES_MONTHS) as [MilestoneAgeKey, number][])
    .find(([, m]) => m > ageMonths)
  return next ? next[0] : null
}

export function getMilestoneStatus(
  child: AuraChildProfile,
  milestoneId: string,
): MilestoneStatus {
  const record = child.milestone_records.find(r => r.milestone_id === milestoneId)
  return record?.status ?? 'not_yet'
}

export function getMilestoneProgress(child: AuraChildProfile): {
  achieved: number
  total: number
  pct: number
} {
  const ageMonths = getAgeInMonths(child.date_of_birth)
  const due = MILESTONES.filter(
    m => MILESTONE_AGES_MONTHS[m.age_key] <= ageMonths,
  )
  const achieved = due.filter(
    m => getMilestoneStatus(child, m.id) === 'achieved',
  ).length
  const total = due.length
  return { achieved, total, pct: total > 0 ? Math.round((achieved / total) * 100) : 0 }
}

// ── Alert engine (runs locally — no AI needed) ────────────────────────────────

export function calculateAlerts(child: AuraChildProfile): DevelopmentalAlert[] {
  const ageMonths = getAgeInMonths(child.date_of_birth)
  const alerts: DevelopmentalAlert[] = []

  for (const milestone of MILESTONES) {
    const dueAt = MILESTONE_AGES_MONTHS[milestone.age_key]
    if (dueAt > ageMonths) continue

    const status = getMilestoneStatus(child, milestone.id)
    if (status === 'achieved' || status === 'skipped') continue

    const monthsOverdue = ageMonths - dueAt

    if (milestone.red_flag) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'urgent',
        message: `"${milestone.description}" — expected by ${milestone.age_key} (red flag)`,
        milestone_id: milestone.id,
        age_key: milestone.age_key,
        domain: milestone.domain,
        action: 'Contact your pediatrician for an immediate developmental evaluation.',
      })
    } else if (monthsOverdue >= 2) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'warning',
        message: `"${milestone.description}" — overdue by ${monthsOverdue} month${monthsOverdue === 1 ? '' : 's'}`,
        milestone_id: milestone.id,
        age_key: milestone.age_key,
        domain: milestone.domain,
        action: 'Bring this up at your next pediatric visit or request a screening.',
      })
    } else if (monthsOverdue >= 0) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'info',
        message: `Time to check: "${milestone.description}" (${milestone.age_key} milestone)`,
        milestone_id: milestone.id,
        age_key: milestone.age_key,
        domain: milestone.domain,
        action: 'Mark as achieved if your child is doing this.',
      })
    }
  }

  // Down Syndrome-specific health surveillance alerts
  const ds = child.genetic_conditions?.conditions.includes('Down Syndrome')
  if (ds) {
    if (!child.genetic_conditions?.last_echo_date && ageMonths <= 6) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'urgent',
        message: 'Echocardiogram (ECHO) recommended — ~50% of children with Down Syndrome have heart defects.',
        action: 'Schedule cardiac evaluation with a paediatric cardiologist.',
      })
    }
    if (!child.genetic_conditions?.last_sleep_study_date && ageMonths >= 48) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'warning',
        message: 'Sleep study due by age 4 to screen for Obstructive Sleep Apnea (Down Syndrome protocol).',
        action: 'Request a sleep study referral from your specialist.',
      })
    }
    if (!child.genetic_conditions?.last_thyroid_date && ageMonths >= 12) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'warning',
        message: 'Annual TSH (thyroid) test recommended for children with Down Syndrome.',
        action: 'Schedule an annual TSH blood test.',
      })
    }
  }

  // ASD universal screening reminder (18 and 24 months)
  if (!child.neurodivergence?.asd) {
    if (ageMonths >= 18 && ageMonths <= 20) {
      const has18mScreen = child.medical_records.some(r =>
        r.notes?.toLowerCase().includes('m-chat') ||
        r.notes?.toLowerCase().includes('autism') ||
        r.notes?.toLowerCase().includes('asd'),
      )
      if (!has18mScreen) {
        alerts.push({
          child_id: child.id,
          child_name: child.full_name,
          severity: 'info',
          message: 'Universal autism screening (M-CHAT) is recommended at 18 months.',
          action: 'Ask your pediatrician to administer the M-CHAT-R/F at the next visit.',
        })
      }
    }
    if (ageMonths >= 24 && ageMonths <= 26) {
      const has24mScreen = child.medical_records.some(r =>
        r.notes?.toLowerCase().includes('m-chat') ||
        (r.notes?.toLowerCase().includes('autism') && r.date >= new Date(new Date().getFullYear(), new Date().getMonth() - 8, 1).toISOString()),
      )
      if (!has24mScreen) {
        alerts.push({
          child_id: child.id,
          child_name: child.full_name,
          severity: 'info',
          message: 'Second autism screening (M-CHAT) is recommended at 24 months.',
          action: 'Ask your pediatrician to repeat the M-CHAT-R/F at the 2-year visit.',
        })
      }
    }
  }

  // Legal transition alert at 18 years for neurodivergent children
  const isNeurodivergent = child.neurodivergence?.adhd || child.neurodivergence?.asd || (child.neurodivergence?.other?.length ?? 0) > 0
  if (ageMonths >= 204 && isNeurodivergent) {
    const hasLegal = (child.financial_plan?.legal_documents?.length ?? 0) > 0
    if (!hasLegal) {
      alerts.push({
        child_id: child.id,
        child_name: child.full_name,
        severity: 'warning',
        message: 'Approaching 18 — parental legal authority ends. Legal transition planning needed.',
        action: 'Consult a special needs attorney about Power of Attorney, Limited Guardianship, or Guardian Advocacy.',
      })
    }
  }

  // Sort: urgent → warning → info
  const order: Record<string, number> = { urgent: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

// ── WHO z-score (LMS method, simplified) ─────────────────────────────────────

export function calculateZScore(value: number, L: number, M: number, S: number): number {
  if (L === 0) return Math.log(value / M) / S
  return (Math.pow(value / M, L) - 1) / (L * S)
}

export function interpretZScore(z: number): { label: string; color: string } {
  if (z < -3) return { label: 'Severely underweight/stunted', color: 'text-red-600' }
  if (z < -2) return { label: 'Underweight/stunted',         color: 'text-orange-500' }
  if (z > 2)  return { label: 'Overweight',                  color: 'text-orange-500' }
  if (z > 3)  return { label: 'Obese',                       color: 'text-red-600' }
  return       { label: 'Normal range',                       color: 'text-green-600' }
}

// ── Screening schedule ────────────────────────────────────────────────────────

export interface ScreeningRecommendation {
  name: string
  due_at_months: number
  description: string
  type: 'developmental' | 'hearing' | 'vision' | 'autism'
}

export const SCREENING_SCHEDULE: ScreeningRecommendation[] = [
  { name: 'Newborn hearing screen',    due_at_months: 1,  description: 'Universal newborn hearing test',               type: 'hearing' },
  { name: 'Developmental surveillance',due_at_months: 9,  description: '9-month surveillance visit',                   type: 'developmental' },
  { name: 'Autism screening (M-CHAT)', due_at_months: 18, description: 'First autism-specific screening with M-CHAT',  type: 'autism' },
  { name: 'Autism screening (M-CHAT)', due_at_months: 24, description: 'Second autism screening',                      type: 'autism' },
  { name: 'Developmental screening',   due_at_months: 30, description: 'Standardised developmental screening',         type: 'developmental' },
  { name: 'Vision screening',          due_at_months: 36, description: 'First formal vision screening',                type: 'vision' },
]

export function getDueScreenings(ageMonths: number): ScreeningRecommendation[] {
  return SCREENING_SCHEDULE.filter(s => {
    const windowStart = s.due_at_months
    const windowEnd   = s.due_at_months + 2
    return ageMonths >= windowStart && ageMonths <= windowEnd
  })
}
