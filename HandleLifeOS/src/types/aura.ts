// ── Domain types ─────────────────────────────────────────────────────────────

export type MilestoneDomain =
  | 'social_emotional'
  | 'language_communication'
  | 'cognitive'
  | 'movement_physical'

export type MilestoneStatus = 'achieved' | 'not_yet' | 'concern' | 'skipped'

export type MilestoneAgeKey =
  | '2m' | '4m' | '6m' | '9m' | '12m' | '15m' | '18m'
  | '2y' | '3y' | '4y' | '5y'
  | '6y' | '7y' | '8y' | '10y' | '12y' | '14y' | '16y' | '18y'

export type AlertSeverity = 'info' | 'warning' | 'urgent'

// ── Milestone definitions ─────────────────────────────────────────────────────

export interface MilestoneDefinition {
  id: string
  age_key: MilestoneAgeKey
  domain: MilestoneDomain
  description: string
  red_flag?: boolean
}

export interface MilestoneRecord {
  milestone_id: string
  status: MilestoneStatus
  achieved_date?: string
  notes?: string
  updated_at: string
}

// ── Child profile sub-types ───────────────────────────────────────────────────

export interface NeurodivergenceProfile {
  adhd: boolean
  adhd_type?: 'inattentive' | 'hyperactive_impulsive' | 'combined'
  asd: boolean
  asd_support_level?: 1 | 2 | 3
  other: string[]
}

export interface TherapyRecord {
  type: 'PT' | 'OT' | 'SLP' | 'ABA' | 'behavioral' | 'other'
  provider?: string
  frequency?: string
  started_date?: string
  notes?: string
}

export interface SpecialistContact {
  name: string
  specialty: string
  phone?: string
  email?: string
}

export interface PhysicalDisabilityProfile {
  conditions: string[]
  mobility_aid?: string
  therapies: TherapyRecord[]
  environmental_mods: string[]
}

export interface GeneticConditionProfile {
  conditions: string[]
  last_echo_date?: string
  last_sleep_study_date?: string
  last_thyroid_date?: string
  specialist_contacts: SpecialistContact[]
}

export type IEPGoalArea = 'academic' | 'behavioural' | 'social' | 'communication' | 'motor' | 'self_care' | 'transition'

export interface IEPGoal {
  id: string
  area: IEPGoalArea
  goal: string                  // measurable goal text
  baseline?: string             // where the child is now
  target?: string               // measurable target (e.g., "8/10 trials")
  progress_pct: number          // 0-100 self-assessed
  last_updated: string
  notes?: string
}

export interface EducationPlan {
  plan_type: 'iep' | '504' | 'none'
  school_name?: string
  grade?: string
  accommodations: string[]
  goals: string[]                       // legacy free-form goals (kept for compatibility)
  iep_goals?: IEPGoal[]                 // structured measurable goals
  last_review_date?: string
  next_review_date?: string
}

export interface MedicalRecord {
  id: string
  date: string
  type: 'appointment' | 'screening' | 'vaccination' | 'therapy_session' | 'other'
  provider?: string
  notes?: string
  follow_up_date?: string
}

export interface Medication {
  id: string
  name: string
  dose?: string
  frequency?: string
  started_date?: string
  prescriber?: string
}

export interface GrowthRecord {
  id: string
  date: string
  weight_kg?: number
  height_cm?: number
  head_circumference_cm?: number
  z_score_weight?: number
  z_score_height?: number
}

export interface AbleAccountInfo {
  enabled: boolean
  institution?: string
  account_balance?: number
  yearly_contributions?: number    // current year contributions (vs $19,000 limit in 2025)
  beneficiary_name?: string
  notes?: string
}

export interface SNTInfo {
  enabled: boolean
  trustee_name?: string
  trustee_contact?: string
  attorney_name?: string
  attorney_contact?: string
  trust_type?: 'first_party' | 'third_party' | 'pooled'
  notes?: string
}

export type LegalDocumentType = 'poa' | 'limited_guardianship' | 'guardian_advocacy' | 'health_proxy' | 'will'

export interface LegalDocumentRecord {
  id: string
  type: LegalDocumentType
  status: 'planned' | 'in_progress' | 'completed'
  filed_date?: string
  attorney?: string
  notes?: string
}

export interface DisabilityFinancialPlan {
  able_account: boolean
  special_needs_trust: boolean
  snt_trustee?: string
  legal_documents: LegalDocumentType[]                 // legacy short list — kept for compatibility
  // Phase 4 — richer details
  able?: AbleAccountInfo
  snt?: SNTInfo
  legal_docs?: LegalDocumentRecord[]                    // structured records with status
  transition_checklist?: { id: string; done: boolean; due_at_age?: number; note?: string }[]
  notes?: string
}

// ── Behaviour & Learning (Phase 2) ────────────────────────────────────────────

export type BehaviourMood = 'great' | 'good' | 'okay' | 'low' | 'tough'

export type BehaviourTag =
  | 'happy' | 'calm' | 'focused' | 'social' | 'energetic'
  | 'tired' | 'distracted' | 'frustrated' | 'withdrawn'
  | 'meltdown' | 'tantrum' | 'aggressive' | 'hyperactive' | 'anxious' | 'overstimulated'

export interface BehaviourLog {
  id: string
  date: string                 // YYYY-MM-DD
  mood: BehaviourMood
  tags: BehaviourTag[]
  intensity?: 1 | 2 | 3 | 4 | 5  // 1 = mild, 5 = severe — only relevant for tough/low days
  triggers?: string             // free text — what may have set it off
  notes?: string
  duration_minutes?: number    // if logging an episode
  created_at: string
}

export type LearningArea =
  | 'reading' | 'writing' | 'math' | 'science'
  | 'art' | 'music' | 'sports' | 'social_skills'
  | 'life_skills' | 'language' | 'other'

export type LearningLevel = 'struggling' | 'developing' | 'on_track' | 'advanced'

export interface LearningSkill {
  id: string
  area: LearningArea
  name: string                  // e.g., "Reading aloud", "Multiplication tables"
  level: LearningLevel
  notes?: string
  updated_at: string
}

export interface SchoolProgress {
  current_grade?: string
  school_year?: string
  teacher_name?: string
  iep_status?: 'iep' | '504' | 'none'
  recent_report?: string
  strengths: string[]
  challenges: string[]
  last_review_date?: string
}

export interface Interest {
  id: string
  name: string
  intensity: 'casual' | 'strong' | 'special_interest'
  notes?: string
  added_at: string
}

export interface LearningProfile {
  school?: SchoolProgress
  skills: LearningSkill[]
  interests: Interest[]
}

// ── DSM-5 ADHD symptom log ────────────────────────────────────────────────────
// 18 DSM-5 ADHD criteria (9 inattention + 9 hyperactivity-impulsivity).
// Rated 0-3 (Vanderbilt-style) per setting (home / school).

export type ADHDSymptomRating = 0 | 1 | 2 | 3   // 0=Never, 1=Occasionally, 2=Often, 3=Very often
export type ADHDSetting = 'home' | 'school'

export interface ADHDSymptomReport {
  id: string
  date: string                   // YYYY-MM-DD
  setting: ADHDSetting
  rater?: string                 // 'parent', 'teacher', name
  // 9 inattention items, ratings 0-3
  inattention: ADHDSymptomRating[]
  // 9 hyperactivity-impulsivity items
  hyperactivity: ADHDSymptomRating[]
  notes?: string
  created_at: string
}

export const ADHD_INATTENTION_ITEMS = [
  'Fails to give close attention to details or makes careless mistakes',
  'Has difficulty sustaining attention in tasks or play',
  'Does not seem to listen when spoken to directly',
  'Does not follow through on instructions; fails to finish tasks',
  'Has difficulty organising tasks and activities',
  'Avoids tasks that require sustained mental effort',
  'Loses things necessary for tasks or activities',
  'Is easily distracted by extraneous stimuli',
  'Is forgetful in daily activities',
] as const

export const ADHD_HYPERACTIVITY_ITEMS = [
  'Fidgets with hands or feet, or squirms in seat',
  'Leaves seat when remaining seated is expected',
  'Runs about or climbs in inappropriate situations',
  'Unable to play or engage in leisure activities quietly',
  'Is "on the go" or acts as if "driven by a motor"',
  'Talks excessively',
  'Blurts out an answer before a question is completed',
  'Has difficulty awaiting turn',
  'Interrupts or intrudes on others',
] as const

// ── Main AURA child profile ───────────────────────────────────────────────────

export interface AuraChildProfile {
  id: string
  full_name: string
  date_of_birth: string
  gender?: 'male' | 'female' | 'other'
  school_name?: string
  class_grade?: string

  milestone_records: MilestoneRecord[]

  neurodivergence?: NeurodivergenceProfile
  physical_disabilities?: PhysicalDisabilityProfile
  genetic_conditions?: GeneticConditionProfile

  medical_records: MedicalRecord[]
  medications: Medication[]
  therapies: TherapyRecord[]

  education_plan?: EducationPlan
  growth_records: GrowthRecord[]
  financial_plan?: DisabilityFinancialPlan

  // Phase 2 — behaviour & learning (optional, JSONB-backed)
  behaviour_logs?: BehaviourLog[]
  learning?: LearningProfile

  // Phase 3+ extensions
  adhd_reports?: ADHDSymptomReport[]

  created_at: string
  updated_at: string
}

// ── Alert ─────────────────────────────────────────────────────────────────────

export interface DevelopmentalAlert {
  child_id: string
  child_name: string
  severity: AlertSeverity
  message: string
  milestone_id?: string
  age_key?: MilestoneAgeKey
  domain?: MilestoneDomain
  action?: string
}

// ── AI result ─────────────────────────────────────────────────────────────────

export interface AuraGuidanceResult {
  summary: string
  recommendations: string[]
  resources: string[]
  when_to_escalate?: string
  disclaimer: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MILESTONE_AGES_MONTHS: Record<MilestoneAgeKey, number> = {
  '2m': 2, '4m': 4, '6m': 6, '9m': 9, '12m': 12,
  '15m': 15, '18m': 18, '2y': 24, '3y': 36, '4y': 48, '5y': 60,
  '6y': 72, '7y': 84, '8y': 96, '10y': 120, '12y': 144,
  '14y': 168, '16y': 192, '18y': 216,
}

export const DOMAIN_LABELS: Record<MilestoneDomain, string> = {
  social_emotional: 'Social & Emotional',
  language_communication: 'Language & Communication',
  cognitive: 'Cognitive',
  movement_physical: 'Movement & Physical',
}

export const DOMAIN_COLORS: Record<MilestoneDomain, { bg: string; text: string; border: string }> = {
  social_emotional:      { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200' },
  language_communication:{ bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  cognitive:             { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  movement_physical:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
}

export const BEHAVIOUR_MOOD_LABELS: Record<BehaviourMood, { label: string; emoji: string; color: string }> = {
  great: { label: 'Great',  emoji: '🤩', color: 'text-emerald-600' },
  good:  { label: 'Good',   emoji: '😊', color: 'text-green-600' },
  okay:  { label: 'Okay',   emoji: '🙂', color: 'text-amber-600' },
  low:   { label: 'Low',    emoji: '😔', color: 'text-orange-600' },
  tough: { label: 'Tough',  emoji: '😣', color: 'text-rose-600' },
}

export const BEHAVIOUR_TAGS: BehaviourTag[] = [
  'happy', 'calm', 'focused', 'social', 'energetic',
  'tired', 'distracted', 'frustrated', 'withdrawn',
  'meltdown', 'tantrum', 'aggressive', 'hyperactive', 'anxious', 'overstimulated',
]

export const LEARNING_AREA_LABELS: Record<LearningArea, string> = {
  reading: 'Reading',
  writing: 'Writing',
  math: 'Math',
  science: 'Science',
  art: 'Art',
  music: 'Music',
  sports: 'Sports',
  social_skills: 'Social skills',
  life_skills: 'Life skills',
  language: 'Language',
  other: 'Other',
}

export const IEP_GOAL_AREA_LABELS: Record<IEPGoalArea, { label: string; color: string; bg: string }> = {
  academic:      { label: 'Academic',      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  behavioural:   { label: 'Behavioural',   color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200' },
  social:        { label: 'Social',        color: 'text-pink-700',    bg: 'bg-pink-50 border-pink-200' },
  communication: { label: 'Communication', color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
  motor:         { label: 'Motor',         color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
  self_care:     { label: 'Self-care',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  transition:    { label: 'Transition',    color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
}

export const LEARNING_LEVEL_LABELS: Record<LearningLevel, { label: string; color: string; bg: string }> = {
  struggling: { label: 'Struggling',  color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200' },
  developing: { label: 'Developing',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  on_track:   { label: 'On track',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  advanced:   { label: 'Advanced',    color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
}

export const THERAPY_TYPE_LABELS: Record<TherapyRecord['type'], string> = {
  PT: 'Physical Therapy', OT: 'Occupational Therapy',
  SLP: 'Speech & Language', ABA: 'Applied Behavior Analysis',
  behavioral: 'Behavioral Therapy', other: 'Other Therapy',
}

export const AURA_AI_TOPICS = [
  { id: 'general',            label: 'Development question',    emoji: '🧠' },
  { id: 'adhd',               label: 'ADHD guidance',           emoji: '⚡' },
  { id: 'asd',                label: 'Autism support',          emoji: '🌈' },
  { id: 'physical_disability',label: 'Physical disability',     emoji: '♿' },
  { id: 'genetic',            label: 'Genetic condition',       emoji: '🧬' },
  { id: 'iep',                label: 'IEP / 504 advocacy',      emoji: '📋' },
  { id: 'financial',          label: 'Disability finances',     emoji: '💰' },
  { id: 'nutrition',          label: 'Nutrition & growth',      emoji: '🥦' },
] as const

export type AuraAITopic = (typeof AURA_AI_TOPICS)[number]['id']

// ── Milestone data (CDC/AAP 75th percentile) ──────────────────────────────────

export const MILESTONES: MilestoneDefinition[] = [
  // 2 months
  { id: '2m_se_1', age_key: '2m', domain: 'social_emotional',       description: 'Calms when spoken to or picked up' },
  { id: '2m_se_2', age_key: '2m', domain: 'social_emotional',       description: 'Smiles at people' },
  { id: '2m_lc_1', age_key: '2m', domain: 'language_communication', description: 'Makes cooing sounds' },
  { id: '2m_lc_2', age_key: '2m', domain: 'language_communication', description: 'Turns head toward voices' },
  { id: '2m_cg_1', age_key: '2m', domain: 'cognitive',              description: 'Pays attention to faces' },
  { id: '2m_cg_2', age_key: '2m', domain: 'cognitive',              description: 'Follows movement with eyes' },
  { id: '2m_mp_1', age_key: '2m', domain: 'movement_physical',      description: 'Lifts head and chest when on tummy', red_flag: true },
  { id: '2m_mp_2', age_key: '2m', domain: 'movement_physical',      description: 'Movements are becoming smoother' },

  // 4 months
  { id: '4m_se_1', age_key: '4m', domain: 'social_emotional',       description: 'Smiles spontaneously to get attention' },
  { id: '4m_se_2', age_key: '4m', domain: 'social_emotional',       description: 'Likes to play with people' },
  { id: '4m_lc_1', age_key: '4m', domain: 'language_communication', description: 'Babbles with expression' },
  { id: '4m_lc_2', age_key: '4m', domain: 'language_communication', description: 'Copies sounds and facial expressions' },
  { id: '4m_cg_1', age_key: '4m', domain: 'cognitive',              description: 'Reaches for toys' },
  { id: '4m_cg_2', age_key: '4m', domain: 'cognitive',              description: 'Uses hands and eyes together' },
  { id: '4m_mp_1', age_key: '4m', domain: 'movement_physical',      description: 'Holds head steady without support', red_flag: true },
  { id: '4m_mp_2', age_key: '4m', domain: 'movement_physical',      description: 'Rolls from tummy to back' },

  // 6 months
  { id: '6m_se_1', age_key: '6m', domain: 'social_emotional',       description: 'Knows familiar faces' },
  { id: '6m_se_2', age_key: '6m', domain: 'social_emotional',       description: 'Likes to look at self in mirror' },
  { id: '6m_lc_1', age_key: '6m', domain: 'language_communication', description: 'Responds to sounds by making sounds' },
  { id: '6m_lc_2', age_key: '6m', domain: 'language_communication', description: 'Strings vowels together (ah, eh, oh)' },
  { id: '6m_cg_1', age_key: '6m', domain: 'cognitive',              description: 'Shows curiosity; brings things to mouth' },
  { id: '6m_cg_2', age_key: '6m', domain: 'cognitive',              description: 'Passes things from hand to hand' },
  { id: '6m_mp_1', age_key: '6m', domain: 'movement_physical',      description: 'Rolls in both directions' },
  { id: '6m_mp_2', age_key: '6m', domain: 'movement_physical',      description: 'Begins to sit without support' },

  // 9 months
  { id: '9m_se_1', age_key: '9m', domain: 'social_emotional',       description: 'Shows fear of strangers' },
  { id: '9m_se_2', age_key: '9m', domain: 'social_emotional',       description: 'Becomes clingy with familiar caregivers' },
  { id: '9m_lc_1', age_key: '9m', domain: 'language_communication', description: 'Makes "mama" and "dada" sounds' },
  { id: '9m_lc_2', age_key: '9m', domain: 'language_communication', description: 'Waves bye-bye' },
  { id: '9m_cg_1', age_key: '9m', domain: 'cognitive',              description: 'Watches the path of a falling object' },
  { id: '9m_cg_2', age_key: '9m', domain: 'cognitive',              description: 'Plays peek-a-boo' },
  { id: '9m_mp_1', age_key: '9m', domain: 'movement_physical',      description: 'Sits without support' },
  { id: '9m_mp_2', age_key: '9m', domain: 'movement_physical',      description: 'Crawls or pulls to stand' },

  // 12 months
  { id: '12m_se_1', age_key: '12m', domain: 'social_emotional',       description: 'Has favourite things and people' },
  { id: '12m_se_2', age_key: '12m', domain: 'social_emotional',       description: 'Shows others objects when interested' },
  { id: '12m_lc_1', age_key: '12m', domain: 'language_communication', description: 'Tries to say words you say' },
  { id: '12m_lc_2', age_key: '12m', domain: 'language_communication', description: 'Uses simple gestures (shaking head no)' },
  { id: '12m_cg_1', age_key: '12m', domain: 'cognitive',              description: 'Explores things in different ways (shaking, banging)' },
  { id: '12m_cg_2', age_key: '12m', domain: 'cognitive',              description: 'Finds hidden objects easily' },
  { id: '12m_mp_1', age_key: '12m', domain: 'movement_physical',      description: 'Gets to sitting position without help' },
  { id: '12m_mp_2', age_key: '12m', domain: 'movement_physical',      description: 'Pulls up to stand; cruises along furniture' },

  // 15 months
  { id: '15m_se_1', age_key: '15m', domain: 'social_emotional',       description: 'Shows affection (hugs, kisses)' },
  { id: '15m_se_2', age_key: '15m', domain: 'social_emotional',       description: 'Shows empathy if someone is hurt' },
  { id: '15m_lc_1', age_key: '15m', domain: 'language_communication', description: 'Tries to say 3+ words besides mama/dada' },
  { id: '15m_lc_2', age_key: '15m', domain: 'language_communication', description: 'Follows one-step directions' },
  { id: '15m_cg_1', age_key: '15m', domain: 'cognitive',              description: 'Scribbles on paper' },
  { id: '15m_cg_2', age_key: '15m', domain: 'cognitive',              description: 'Copies simple chores (sweeping)' },
  { id: '15m_mp_1', age_key: '15m', domain: 'movement_physical',      description: 'Walks well without holding on' },
  { id: '15m_mp_2', age_key: '15m', domain: 'movement_physical',      description: 'Drinks from a cup without a lid' },

  // 18 months
  { id: '18m_se_1', age_key: '18m', domain: 'social_emotional',       description: 'Moves away from caregiver but checks in' },
  { id: '18m_se_2', age_key: '18m', domain: 'social_emotional',       description: 'Points to show something interesting' },
  { id: '18m_lc_1', age_key: '18m', domain: 'language_communication', description: 'Says several single words' },
  { id: '18m_lc_2', age_key: '18m', domain: 'language_communication', description: 'Understands and follows simple instructions' },
  { id: '18m_cg_1', age_key: '18m', domain: 'cognitive',              description: 'Knows what ordinary things are for (phone, spoon)' },
  { id: '18m_cg_2', age_key: '18m', domain: 'cognitive',              description: 'Plays with toys simply (pushing a toy car)' },
  { id: '18m_mp_1', age_key: '18m', domain: 'movement_physical',      description: 'Walks without holding on' },
  { id: '18m_mp_2', age_key: '18m', domain: 'movement_physical',      description: 'Climbs on and off furniture' },

  // 2 years
  { id: '2y_se_1', age_key: '2y', domain: 'social_emotional',       description: 'Copies others; especially adults' },
  { id: '2y_se_2', age_key: '2y', domain: 'social_emotional',       description: 'Shows defiant behaviour occasionally' },
  { id: '2y_lc_1', age_key: '2y', domain: 'language_communication', description: 'Points to things or pictures when named' },
  { id: '2y_lc_2', age_key: '2y', domain: 'language_communication', description: 'Uses 2-word phrases ("more milk", "big dog")' },
  { id: '2y_cg_1', age_key: '2y', domain: 'cognitive',              description: 'Follows 2-step instructions' },
  { id: '2y_cg_2', age_key: '2y', domain: 'cognitive',              description: 'Sorts shapes and colours' },
  { id: '2y_mp_1', age_key: '2y', domain: 'movement_physical',      description: 'Kicks a ball' },
  { id: '2y_mp_2', age_key: '2y', domain: 'movement_physical',      description: 'Runs and stands on tiptoe' },

  // 3 years
  { id: '3y_se_1', age_key: '3y', domain: 'social_emotional',       description: 'Shows affection for friends; takes turns' },
  { id: '3y_se_2', age_key: '3y', domain: 'social_emotional',       description: 'Shows a wide range of emotions' },
  { id: '3y_lc_1', age_key: '3y', domain: 'language_communication', description: 'Follows 2–3 step instructions' },
  { id: '3y_lc_2', age_key: '3y', domain: 'language_communication', description: 'Strangers can understand most of what they say' },
  { id: '3y_cg_1', age_key: '3y', domain: 'cognitive',              description: 'Plays make-believe' },
  { id: '3y_cg_2', age_key: '3y', domain: 'cognitive',              description: 'Works toy buttons, levers, moving parts' },
  { id: '3y_mp_1', age_key: '3y', domain: 'movement_physical',      description: 'Runs easily' },
  { id: '3y_mp_2', age_key: '3y', domain: 'movement_physical',      description: 'Pedals a tricycle' },

  // 4 years
  { id: '4y_se_1', age_key: '4y', domain: 'social_emotional',       description: 'Enjoys playing "Mom" and "Dad"' },
  { id: '4y_se_2', age_key: '4y', domain: 'social_emotional',       description: 'Prefers to play with other children' },
  { id: '4y_lc_1', age_key: '4y', domain: 'language_communication', description: 'Uses 4+ word sentences with basic grammar' },
  { id: '4y_lc_2', age_key: '4y', domain: 'language_communication', description: 'Tells stories and sings simple songs' },
  { id: '4y_cg_1', age_key: '4y', domain: 'cognitive',              description: 'Names and understands colours' },
  { id: '4y_cg_2', age_key: '4y', domain: 'cognitive',              description: 'Understands the idea of counting' },
  { id: '4y_mp_1', age_key: '4y', domain: 'movement_physical',      description: 'Hops on one foot' },
  { id: '4y_mp_2', age_key: '4y', domain: 'movement_physical',      description: 'Catches a bounced ball most of the time' },

  // 5 years
  { id: '5y_se_1', age_key: '5y', domain: 'social_emotional',       description: 'Distinguishes real from make-believe' },
  { id: '5y_se_2', age_key: '5y', domain: 'social_emotional',       description: 'Wants to please friends; wants to be liked' },
  { id: '5y_lc_1', age_key: '5y', domain: 'language_communication', description: 'Tells simple stories using full sentences' },
  { id: '5y_lc_2', age_key: '5y', domain: 'language_communication', description: 'Uses future tense ("Grandma will come")' },
  { id: '5y_cg_1', age_key: '5y', domain: 'cognitive',              description: 'Counts 10 or more things' },
  { id: '5y_cg_2', age_key: '5y', domain: 'cognitive',              description: 'Draws a person with 6 body parts' },
  { id: '5y_mp_1', age_key: '5y', domain: 'movement_physical',      description: 'Stands on one foot for 10 seconds or longer' },
  { id: '5y_mp_2', age_key: '5y', domain: 'movement_physical',      description: 'May skip and hop on one foot' },

  // 6 years — early school readiness
  { id: '6y_se_1', age_key: '6y', domain: 'social_emotional',       description: 'Plays cooperatively in groups; takes turns' },
  { id: '6y_se_2', age_key: '6y', domain: 'social_emotional',       description: 'Recognises and names own emotions' },
  { id: '6y_lc_1', age_key: '6y', domain: 'language_communication', description: 'Reads simple sight words; recognises letter sounds' },
  { id: '6y_lc_2', age_key: '6y', domain: 'language_communication', description: 'Tells a story with a clear beginning, middle, end' },
  { id: '6y_cg_1', age_key: '6y', domain: 'cognitive',              description: 'Counts to 100; understands simple addition' },
  { id: '6y_cg_2', age_key: '6y', domain: 'cognitive',              description: 'Knows left from right; understands ordinals (1st, 2nd)' },
  { id: '6y_mp_1', age_key: '6y', domain: 'movement_physical',      description: 'Ties shoelaces; uses scissors well' },
  { id: '6y_mp_2', age_key: '6y', domain: 'movement_physical',      description: 'Rides a bicycle (with or without training wheels)' },

  // 7 years
  { id: '7y_se_1', age_key: '7y', domain: 'social_emotional',       description: 'Has consistent friendships; understands fairness' },
  { id: '7y_lc_1', age_key: '7y', domain: 'language_communication', description: 'Reads early chapter books fluently' },
  { id: '7y_lc_2', age_key: '7y', domain: 'language_communication', description: 'Writes complete sentences with capitals and periods' },
  { id: '7y_cg_1', age_key: '7y', domain: 'cognitive',              description: 'Tells time on an analog clock' },
  { id: '7y_cg_2', age_key: '7y', domain: 'cognitive',              description: 'Understands money — coins, simple change' },
  { id: '7y_mp_1', age_key: '7y', domain: 'movement_physical',      description: 'Coordinated in organised sports activities' },

  // 8 years — middle childhood
  { id: '8y_se_1', age_key: '8y', domain: 'social_emotional',       description: 'Has best friends; navigates peer conflict' },
  { id: '8y_se_2', age_key: '8y', domain: 'social_emotional',       description: 'Self-conscious; cares what others think' },
  { id: '8y_lc_1', age_key: '8y', domain: 'language_communication', description: 'Writes paragraphs; uses descriptive language' },
  { id: '8y_cg_1', age_key: '8y', domain: 'cognitive',              description: 'Multi-step math problems (multiplication tables)' },
  { id: '8y_cg_2', age_key: '8y', domain: 'cognitive',              description: 'Plans short tasks (homework, simple chores)' },
  { id: '8y_mp_1', age_key: '8y', domain: 'movement_physical',      description: 'Refined fine motor — neat handwriting, drawing detail' },

  // 10 years — pre-adolescence
  { id: '10y_se_1', age_key: '10y', domain: 'social_emotional',       description: 'Can identify and name complex emotions in self and others' },
  { id: '10y_se_2', age_key: '10y', domain: 'social_emotional',       description: 'Manages personal hygiene independently' },
  { id: '10y_lc_1', age_key: '10y', domain: 'language_communication', description: 'Reads for information (research, instructions)' },
  { id: '10y_lc_2', age_key: '10y', domain: 'language_communication', description: 'Argues a position with reasons and evidence' },
  { id: '10y_cg_1', age_key: '10y', domain: 'cognitive',              description: 'Plans multi-day projects; manages time loosely' },
  { id: '10y_cg_2', age_key: '10y', domain: 'cognitive',              description: 'Abstract thinking emerging — metaphors, hypotheticals' },
  { id: '10y_mp_1', age_key: '10y', domain: 'movement_physical',      description: 'Pre-pubertal growth spurt may begin (esp. girls)' },

  // 12 years — early adolescence
  { id: '12y_se_1', age_key: '12y', domain: 'social_emotional',       description: 'Identity exploration begins; experiments with self-image' },
  { id: '12y_se_2', age_key: '12y', domain: 'social_emotional',       description: 'Strong peer orientation; opinions of friends matter most' },
  { id: '12y_lc_1', age_key: '12y', domain: 'language_communication', description: 'Reads and discusses chapter books / age-appropriate news' },
  { id: '12y_cg_1', age_key: '12y', domain: 'cognitive',              description: 'Formal operational thinking — abstract logic, "what if"' },
  { id: '12y_cg_2', age_key: '12y', domain: 'cognitive',              description: 'Manages own homework with parental check-ins' },
  { id: '12y_mp_1', age_key: '12y', domain: 'movement_physical',      description: 'Puberty milestones (Tanner stages) may be progressing' },

  // 14 years — middle adolescence
  { id: '14y_se_1', age_key: '14y', domain: 'social_emotional',       description: 'Forms close, mutual friendships; values trust and loyalty' },
  { id: '14y_se_2', age_key: '14y', domain: 'social_emotional',       description: 'Mood regulation improves but still volatile' },
  { id: '14y_cg_1', age_key: '14y', domain: 'cognitive',              description: 'Critical thinking about ideas, ethics, social issues' },
  { id: '14y_cg_2', age_key: '14y', domain: 'cognitive',              description: 'Plans and tracks academic goals across a term' },
  { id: '14y_mp_1', age_key: '14y', domain: 'movement_physical',      description: 'Most pubertal changes well underway' },

  // 16 years — late adolescence
  { id: '16y_se_1', age_key: '16y', domain: 'social_emotional',       description: 'Stable identity emerging — values, interests, future self' },
  { id: '16y_se_2', age_key: '16y', domain: 'social_emotional',       description: 'Romantic relationships explored healthily' },
  { id: '16y_cg_1', age_key: '16y', domain: 'cognitive',              description: 'Independent decision-making with adult guidance' },
  { id: '16y_cg_2', age_key: '16y', domain: 'cognitive',              description: 'Long-term planning — college, vocational, life goals' },
  { id: '16y_mp_1', age_key: '16y', domain: 'movement_physical',      description: 'Adult-like physical proportions; growth nearly complete' },

  // 18 years — transition to adulthood
  { id: '18y_se_1', age_key: '18y', domain: 'social_emotional',       description: 'Self-advocates for own needs and boundaries' },
  { id: '18y_se_2', age_key: '18y', domain: 'social_emotional',       description: 'Takes responsibility for actions and emotional impact' },
  { id: '18y_lc_1', age_key: '18y', domain: 'language_communication', description: 'Communicates effectively with adults in formal settings' },
  { id: '18y_cg_1', age_key: '18y', domain: 'cognitive',              description: 'Adult executive function — planning, prioritising, follow-through' },
  { id: '18y_cg_2', age_key: '18y', domain: 'cognitive',              description: 'Manages money, schedules, and own healthcare' },
  { id: '18y_mp_1', age_key: '18y', domain: 'movement_physical',      description: 'Reached or near adult physical maturity' },
]
