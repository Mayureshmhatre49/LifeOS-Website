export type FocusMode = 'quick' | 'pomodoro' | 'deep' | 'custom'
export type EnergyState = 'low' | 'normal' | 'high'

export const FOCUS_MODE_MINUTES: Record<FocusMode, number> = {
  quick: 15,
  pomodoro: 25,
  deep: 50,
  custom: 25,
}

export const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  quick: 'Quick Start',
  pomodoro: 'Pomodoro',
  deep: 'Deep Work',
  custom: 'Custom',
}

export interface FocusSession {
  id: string
  user_id: string
  task_id?: string | null
  task_title?: string | null
  mode: FocusMode
  planned_minutes: number
  actual_minutes?: number | null
  completed: boolean
  abandoned: boolean
  body_doubling_enabled: boolean
  notes?: string | null
  started_at: string
  ended_at?: string | null
  created_at: string
}

export interface FocusPreferences {
  id: string
  user_id: string
  default_mode: FocusMode
  break_interval_minutes: number
  long_break_minutes: number
  sessions_before_long_break: number
  body_doubling_default: boolean
  daily_focus_goal_minutes: number
  created_at: string
  updated_at: string
}

export interface CreateSessionInput {
  task_id?: string
  task_title?: string
  mode: FocusMode
  planned_minutes: number
  body_doubling_enabled?: boolean
}

export interface UpdateSessionInput {
  actual_minutes?: number
  completed?: boolean
  abandoned?: boolean
  ended_at?: string
  notes?: string
}

export interface UpdateFocusPrefsInput {
  default_mode?: FocusMode
  break_interval_minutes?: number
  long_break_minutes?: number
  sessions_before_long_break?: number
  body_doubling_default?: boolean
  daily_focus_goal_minutes?: number
}

export interface WeeklyStats {
  sessions_completed: number
  sessions_abandoned: number
  total_minutes: number
  tasks_finished: number
  best_hour: number | null
  daily_minutes: Record<string, number>
  streak_days: number
}

export interface TaskStep {
  title: string
  duration_minutes: number
  order: number
}

export interface BodyDoubleMessage {
  type: 'start' | 'checkin' | 'complete' | 'restart'
  message: string
  suggestion?: string
}
