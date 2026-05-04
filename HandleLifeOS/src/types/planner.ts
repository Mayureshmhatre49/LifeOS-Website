export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped'
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'family' | 'learning' | 'errands' | 'other'
export type RoutineType = 'morning' | 'evening' | 'work' | 'study' | 'weekend' | 'custom'
export type EnergyLevel = 'morning' | 'afternoon' | 'evening'
export type PlanningStyle = 'simple' | 'detailed'

export interface Task {
  id: string
  user_id: string
  title: string
  notes?: string | null
  due_date?: string | null
  priority: TaskPriority
  category: TaskCategory
  estimated_minutes?: number | null
  status: TaskStatus
  ai_score?: number | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface RoutineStep {
  id: string
  routine_id: string
  title: string
  description?: string | null
  duration_minutes?: number | null
  order_index: number
  created_at: string
}

export interface Routine {
  id: string
  user_id: string
  name: string
  description?: string | null
  type: RoutineType
  days_of_week: number[]
  start_time?: string | null
  estimated_minutes?: number | null
  is_active: boolean
  steps?: RoutineStep[]
  created_at: string
  updated_at: string
}

export interface PlannerPreferences {
  id: string
  user_id: string
  wake_time: string
  sleep_time: string
  work_start: string
  work_end: string
  energy_peak: EnergyLevel
  planning_style: PlanningStyle
  max_daily_tasks: number
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  task_id?: string | null
  routine_id?: string | null
  title: string
  scheduled_at: string
  is_sent: boolean
  created_at: string
}

// Input types for creation/update
export interface CreateTaskInput {
  title: string
  notes?: string
  due_date?: string
  priority?: TaskPriority
  category?: TaskCategory
  estimated_minutes?: number
  status?: TaskStatus
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus
  order_index?: number
  ai_score?: number
}

export interface CreateRoutineInput {
  name: string
  description?: string
  type?: RoutineType
  days_of_week?: number[]
  start_time?: string
  estimated_minutes?: number
  steps?: Array<{ title: string; description?: string; duration_minutes?: number; order_index: number }>
}

export interface UpdatePlannerPreferencesInput {
  wake_time?: string
  sleep_time?: string
  work_start?: string
  work_end?: string
  energy_peak?: EnergyLevel
  planning_style?: PlanningStyle
  max_daily_tasks?: number
}

// AI planner types
export interface AITaskPlan {
  tasks: Array<{
    title: string
    priority: TaskPriority
    category: TaskCategory
    estimated_minutes: number
    notes?: string
    due_date?: string
  }>
  summary: string
  overwhelmed: boolean
  top3: string[]
  suggested_order: string[]
}

export interface DayPlan {
  date: string
  schedule: Array<{
    time: string
    task_id?: string
    task_title: string
    duration_minutes: number
    type: 'task' | 'routine' | 'break'
  }>
  prioritized_tasks: Task[]
  skipped_tasks: Task[]
  total_planned_minutes: number
  mood: 'calm' | 'focused' | 'light'
}
