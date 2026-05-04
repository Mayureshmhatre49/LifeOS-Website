export type DecisionCategory =
  | 'financial'
  | 'career'
  | 'relocation'
  | 'education'
  | 'family'
  | 'business'
  | 'investment'
  | 'lifestyle'

export type DecisionMode = 'analyze' | 'compare'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ScenarioProbability = 'likely' | 'possible' | 'unlikely'

export interface FinancialImpact {
  summary: string
  monthlyCostChange: number | null
  oneTimeCost: number | null
  opportunityCost: string | null
  affordabilityScore: number | null
}

export interface ScenarioOutcome {
  label: string
  description: string
  probability: ScenarioProbability
}

export interface DecisionResult {
  summary: string
  recommendation: string
  confidenceScore: number
  riskScore: number
  riskLevel: RiskLevel
  financialImpact: FinancialImpact
  timeImpact: string
  emotionalImpact: string
  pros: string[]
  cons: string[]
  hiddenFactors: string[]
  bestCase: ScenarioOutcome
  worstCase: ScenarioOutcome
  threeYearView: string
  nextSteps: string[]
  memoryFactorsUsed: string[]
  dataSourcesUsed: string[]
}

export interface CompareOptionResult {
  label: string
  scores: Record<string, number>
  pros: string[]
  cons: string[]
  summary: string
}

export interface CompareResult {
  question: string
  factors: string[]
  options: CompareOptionResult[]
  recommendation: string
  winner: string
}

export interface DecisionInput {
  question: string
  category?: DecisionCategory
  mode?: DecisionMode
  options?: string[]
  additionalContext?: string
}

export interface DecisionLog {
  id: string
  user_id: string
  question: string
  category: string | null
  mode: DecisionMode
  options: string[]
  context_snapshot: Record<string, unknown>
  result: DecisionResult | CompareResult
  favorite: boolean
  created_at: string
}

export const DECISION_TEMPLATES: {
  label: string
  category: DecisionCategory
  question: string
  icon: string
}[] = [
  { label: 'Buy House',      category: 'financial',  question: 'Should I buy a house right now?',             icon: '🏠' },
  { label: 'Buy Car',        category: 'financial',  question: 'Should I buy a new car?',                     icon: '🚗' },
  { label: 'Job Switch',     category: 'career',     question: 'Should I switch jobs?',                       icon: '💼' },
  { label: 'Move City',      category: 'relocation', question: 'Should I relocate to a new city?',            icon: '🌆' },
  { label: 'Education',      category: 'education',  question: 'Should I pursue higher education?',           icon: '🎓' },
  { label: 'Start Business', category: 'business',   question: 'Should I start a business right now?',        icon: '🚀' },
  { label: 'Investment',     category: 'investment', question: 'How should I invest my savings?',             icon: '📈' },
  { label: 'Family Plan',    category: 'family',     question: 'Should I plan this major family decision?',   icon: '👨‍👩‍👧' },
]
