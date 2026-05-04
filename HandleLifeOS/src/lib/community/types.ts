export type ChallengeCategory =
  | 'health' | 'money' | 'mind' | 'focus' | 'habits' | 'learning' | 'relationships' | 'career'

export type ChallengeRuleKind =
  | 'habit' | 'expense_cap' | 'focus_minutes' | 'journal_streak' | 'task_count' | 'custom'

export interface Challenge {
  id: string
  slug: string
  title: string
  description: string
  category: ChallengeCategory
  duration_days: number
  rule_kind: ChallengeRuleKind
  rule_config: Record<string, unknown>
  difficulty: 'easy' | 'medium' | 'hard'
  emoji: string | null
  is_published: boolean
  participant_count: number
  completion_count: number
  created_at: string
}

export type ParticipantStatus = 'active' | 'completed' | 'abandoned' | 'expired'

export interface ChallengeParticipant {
  id: string
  user_id: string
  challenge_id: string
  started_at: string
  ends_at: string
  status: ParticipantStatus
  progress_pct: number
  progress_data: Record<string, unknown>
  is_public: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type PartnerStatus = 'pending' | 'active' | 'ended' | 'blocked'

export interface AccountabilityPartner {
  id: string
  user_id: string
  partner_id: string | null
  invite_code: string | null
  status: PartnerStatus
  share_habits: boolean
  share_goals: boolean
  share_challenges: boolean
  share_achievements: boolean
  invited_at: string
  accepted_at: string | null
  ended_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AchievementModule =
  | 'habits' | 'planner' | 'focus' | 'money' | 'mind' | 'aura' | 'community' | 'protection' | 'other'

export interface Achievement {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  emoji: string | null
  module: AchievementModule
  earned_at: string
  is_shared: boolean
  evidence: Record<string, unknown>
  created_at: string
}
