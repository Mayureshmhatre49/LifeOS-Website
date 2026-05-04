import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type {
  Task,
  Routine,
  RoutineStep,
  PlannerPreferences,
  Reminder,
  CreateTaskInput,
  UpdateTaskInput,
  CreateRoutineInput,
  UpdatePlannerPreferencesInput,
} from '@/types/planner'

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function getTasks(
  userId: string,
  filters?: { status?: string; due_date?: string }
): Promise<Task[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let q = db.from('tasks').select('*').eq('user_id', userId).order('order_index').order('created_at', { ascending: false })
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.due_date) q = q.eq('due_date', filters.due_date)
  const { data } = await q
  return (data ?? []) as Task[]
}

export async function getTaskById(id: string, userId: string): Promise<Task | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('tasks').select('*').eq('id', id).eq('user_id', userId).single()
  return data as Task | null
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const db = getSupabaseAdmin()
  const { data: existing } = await db
    .from('tasks')
    .select('order_index')
    .eq('user_id', userId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()
  const nextOrder = existing ? (existing.order_index as number) + 1 : 0

  const { data, error } = await db
    .from('tasks')
    .insert({ user_id: userId, order_index: nextOrder, priority: 'medium', category: 'other', status: 'todo', ...input })
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, userId: string, updates: UpdateTaskInput): Promise<Task> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('tasks').delete().eq('id', id).eq('user_id', userId)
}

export async function bulkUpdateTaskScores(
  userId: string,
  updates: Array<{ id: string; ai_score: number; order_index: number }>
): Promise<void> {
  const db = getSupabaseAdmin()
  await Promise.all(
    updates.map(({ id, ai_score, order_index }) =>
      db
        .from('tasks')
        .update({ ai_score, order_index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
    )
  )
}

// ── Routines ───────────────────────────────────────────────────────────────

export async function getRoutines(userId: string): Promise<Routine[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data: routines } = await db
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!routines?.length) return []

  const routineIds = routines.map((r) => r.id)
  const { data: steps } = await db
    .from('routine_steps')
    .select('*')
    .in('routine_id', routineIds)
    .order('order_index')

  return routines.map((r) => ({
    ...(r as Routine),
    steps: ((steps ?? []) as RoutineStep[]).filter((s) => s.routine_id === r.id),
  }))
}

export async function createRoutine(userId: string, input: CreateRoutineInput): Promise<Routine> {
  const db = getSupabaseAdmin()
  const { steps, ...routineData } = input

  const { data: routine, error } = await db
    .from('routines')
    .insert({
      user_id: userId,
      type: 'custom',
      days_of_week: [1, 2, 3, 4, 5],
      is_active: true,
      ...routineData,
    })
    .select()
    .single()
  if (error) throw error

  if (steps?.length) {
    await db.from('routine_steps').insert(
      steps.map((s) => ({ routine_id: routine.id, ...s }))
    )
  }

  return { ...(routine as Routine), steps: [] }
}

export async function updateRoutine(
  id: string,
  userId: string,
  updates: Partial<CreateRoutineInput> & { is_active?: boolean }
): Promise<Routine> {
  const db = getSupabaseAdmin()
  const { steps, ...routineUpdates } = updates

  const { data, error } = await db
    .from('routines')
    .update({ ...routineUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error

  if (steps !== undefined) {
    await db.from('routine_steps').delete().eq('routine_id', id)
    if (steps.length) {
      await db.from('routine_steps').insert(steps.map((s) => ({ routine_id: id, ...s })))
    }
  }

  return data as Routine
}

export async function deleteRoutine(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('routines').delete().eq('id', id).eq('user_id', userId)
}

// ── Planner Preferences ────────────────────────────────────────────────────

export async function getPlannerPreferences(userId: string): Promise<PlannerPreferences | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('planner_preferences').select('*').eq('user_id', userId).single()
  return data as PlannerPreferences | null
}

export async function upsertPlannerPreferences(
  userId: string,
  input: UpdatePlannerPreferencesInput
): Promise<PlannerPreferences> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('planner_preferences')
    .upsert({ user_id: userId, ...input, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as PlannerPreferences
}

// ── Reminders ──────────────────────────────────────────────────────────────

export async function getUpcomingReminders(userId: string): Promise<Reminder[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_sent', false)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(20)
  return (data ?? []) as Reminder[]
}

export async function createReminder(
  userId: string,
  input: { title: string; scheduled_at: string; task_id?: string; routine_id?: string }
): Promise<Reminder> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('reminders')
    .insert({ user_id: userId, is_sent: false, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Reminder
}
