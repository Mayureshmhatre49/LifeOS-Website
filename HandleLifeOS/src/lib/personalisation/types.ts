export type Tone = 'warm' | 'concise' | 'analytical' | 'playful' | 'formal'
export type Verbosity = 'brief' | 'balanced' | 'detailed'
export type Proactivity = 'reactive' | 'balanced' | 'high'

export interface PersonalisationPreferences {
  user_id: string
  tone: Tone
  verbosity: Verbosity
  proactivity: Proactivity
  interests: string[]
  priority_modules: string[]
  language: string
  currency: string
  timezone: string | null
  learning_enabled: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type InsightKind =
  | 'circadian.focus_peak'        // when in the day they're most focused
  | 'circadian.task_completion'   // when most tasks get done
  | 'spending.top_category'       // dominant expense category
  | 'spending.spike'              // current month significantly above baseline
  | 'mood.weekday_low'            // lowest-mood day of week
  | 'mood.weekday_high'           // highest-mood day of week
  | 'habit.fragile'               // habit with low completion rate
  | 'habit.streak'                // habit with long current streak
  | 'goal.velocity'               // savings-goal progress velocity
  | 'subscription.bloat'          // many recurring subs vs activity
  | 'rhythm.weekend_drift'        // weekend behaviour vs weekday

export type Severity = 'info' | 'positive' | 'attention' | 'urgent'

export interface PersonalisationInsight {
  id: string
  user_id: string
  kind: InsightKind | string
  title: string
  summary_md: string
  evidence: Record<string, unknown>
  confidence: number
  severity: Severity
  is_dismissed: boolean
  generated_at: string
}

// Default preferences object — used for new users / when DB row missing
export const DEFAULT_PREFERENCES: Omit<PersonalisationPreferences, 'user_id' | 'created_at' | 'updated_at'> = {
  tone: 'warm',
  verbosity: 'balanced',
  proactivity: 'balanced',
  interests: [],
  priority_modules: [],
  language: 'en',
  currency: 'INR',
  timezone: null,
  learning_enabled: true,
  notes: null,
}

// Curated catalog the user picks from — keeps interests / modules consistent
export const INTEREST_CATALOG = [
  'finance', 'fitness', 'mental-health', 'parenting', 'productivity',
  'cooking', 'reading', 'meditation', 'investing', 'travel',
  'career', 'relationships', 'creativity', 'minimalism',
] as const

export const MODULE_CATALOG = [
  { id: '/today',        label: 'Today' },
  { id: '/planner',      label: 'Planner' },
  { id: '/money',        label: 'Money' },
  { id: '/investments',  label: 'Investments' },
  { id: '/family',       label: 'Family' },
  { id: '/aura',         label: 'AURA · Children' },
  { id: '/mind',         label: 'Mental health' },
  { id: '/nutrition',    label: 'Nutrition' },
  { id: '/network',      label: 'Network' },
  { id: '/career',       label: 'Career' },
  { id: '/business',     label: 'Business' },
  { id: '/home',         label: 'Home & property' },
  { id: '/travel',       label: 'Travel' },
  { id: '/protection',   label: 'Protection' },
  { id: '/legal',        label: 'Legal' },
  { id: '/briefing',     label: 'Daily briefing' },
  { id: '/habits',       label: 'Habits' },
  { id: '/vault',        label: 'Document vault' },
  { id: '/focus',        label: 'Focus' },
] as const
