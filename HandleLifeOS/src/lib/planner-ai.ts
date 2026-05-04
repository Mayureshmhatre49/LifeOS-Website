import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type { Task, AITaskPlan, DayPlan, PlannerPreferences, TaskPriority, TaskCategory } from '@/types/planner'

// Extract tasks from freeform user text ("pay bill, buy groceries, finish report")
export async function extractTasksFromText(
  text: string,
  prefs?: PlannerPreferences | null
): Promise<AITaskPlan> {
  if (isMockMode()) return mockExtractTasks(text)

  const model = getAIModel()
  const energyNote = prefs ? `User's peak energy is ${prefs.energy_peak}. Max daily tasks: ${prefs.max_daily_tasks}.` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a calm, practical daily planning assistant for Life OS. Your job is to convert messy user input into a structured task list. ${energyNote}

Always respond with valid JSON only. No markdown, no explanation. Format:
{
  "tasks": [
    {
      "title": "string (clear action)",
      "priority": "low|medium|high|urgent",
      "category": "work|personal|health|finance|family|learning|errands|other",
      "estimated_minutes": number,
      "notes": "optional string",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "summary": "1-2 sentence friendly overview",
  "overwhelmed": boolean (true if 6+ tasks),
  "top3": ["task title 1", "task title 2", "task title 3"],
  "suggested_order": ["task title ordered by priority/energy"]
}

Rules:
- Keep task titles concise action phrases
- Be realistic with time estimates
- If overwhelmed=true, top3 = highest-value quick wins
- Never be harsh or critical about the task list`,
    prompt: `Convert this into a structured task plan:\n${text}`,
    maxOutputTokens: 1200,
    temperature: 0.3,
  })

  return parseJSON<AITaskPlan>(raw, mockExtractTasks(text))
}

// Prioritize existing tasks using AI scoring
export async function prioritizeTasks(
  tasks: Task[],
  prefs?: PlannerPreferences | null,
  userContext?: string
): Promise<Array<{ id: string; ai_score: number; order_index: number }>> {
  if (isMockMode() || !tasks.length) return mockPrioritize(tasks)

  const model = getAIModel()
  const today = new Date().toISOString().slice(0, 10)
  const contextNote = userContext ? `User context: ${userContext}` : ''
  const energyNote = prefs ? `Peak energy: ${prefs.energy_peak}. Work hours: ${prefs.work_start}–${prefs.work_end}.` : ''

  const taskList = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    category: t.category,
    due_date: t.due_date,
    estimated_minutes: t.estimated_minutes,
    status: t.status,
  }))

  const { text: raw } = await generateText({
    model,
    system: `You are a prioritization engine for Life OS. Rank tasks by urgency, importance, deadlines, and user energy. ${energyNote} ${contextNote} Today is ${today}.

Respond with valid JSON only:
[
  { "id": "task_uuid", "ai_score": 0-100, "order_index": 0-based_integer }
]

Higher ai_score = higher priority. order_index starts from 0.`,
    prompt: `Rank these tasks:\n${JSON.stringify(taskList, null, 2)}`,
    maxOutputTokens: 800,
    temperature: 0.2,
  })

  return parseJSON<Array<{ id: string; ai_score: number; order_index: number }>>(raw, mockPrioritize(tasks))
}

// Generate a full day plan
export async function generateDayPlan(
  tasks: Task[],
  prefs?: PlannerPreferences | null,
  userContext?: string
): Promise<DayPlan> {
  if (isMockMode() || !tasks.length) return mockDayPlan(tasks)

  const model = getAIModel()
  const today = new Date().toISOString().slice(0, 10)
  const workStart = prefs?.work_start ?? '09:00'
  const workEnd = prefs?.work_end ?? '18:00'
  const maxTasks = prefs?.max_daily_tasks ?? 5
  const energyNote = userContext ? `User context: ${userContext}` : ''

  const todoTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress')

  const { text: raw } = await generateText({
    model,
    system: `You are a daily planning assistant for Life OS. Create a calm, realistic daily schedule. ${energyNote}
Today: ${today}. Work window: ${workStart}–${workEnd}. Max tasks to schedule: ${maxTasks}.

Respond with valid JSON only:
{
  "date": "${today}",
  "schedule": [
    { "time": "HH:MM", "task_id": "uuid or null", "task_title": "string", "duration_minutes": number, "type": "task|break|routine" }
  ],
  "prioritized_tasks": [{ "id": "uuid" }],
  "skipped_tasks": [{ "id": "uuid" }],
  "total_planned_minutes": number,
  "mood": "calm|focused|light"
}

Keep breaks (10-15 min) between tasks. prioritized_tasks = tasks included in schedule. skipped_tasks = overflow tasks.`,
    prompt: `Create a day plan for these tasks:\n${JSON.stringify(todoTasks.slice(0, 15), null, 2)}`,
    maxOutputTokens: 1500,
    temperature: 0.3,
  })

  type RawDayPlan = { date: string; schedule: DayPlan['schedule']; prioritized_tasks: Array<{ id: string }>; skipped_tasks: Array<{ id: string }>; total_planned_minutes: number; mood: DayPlan['mood'] }
  let parsed: RawDayPlan | null = null
  try {
    const match = raw.match(/(\{[\s\S]*\})/)
    if (match) parsed = JSON.parse(match[1]) as RawDayPlan
    else parsed = JSON.parse(raw) as RawDayPlan
  } catch { parsed = null }
  if (!parsed) return mockDayPlan(tasks)

  const prioritizedMap = new Map(tasks.map((t) => [t.id, t]))
  return {
    date: parsed.date,
    schedule: parsed.schedule,
    prioritized_tasks: parsed.prioritized_tasks.map((p) => prioritizedMap.get(p.id)).filter(Boolean) as Task[],
    skipped_tasks: parsed.skipped_tasks.map((p) => prioritizedMap.get(p.id)).filter(Boolean) as Task[],
    total_planned_minutes: parsed.total_planned_minutes,
    mood: parsed.mood,
  }
}

// ── Mock responses for demo mode ───────────────────────────────────────────

function mockExtractTasks(text: string): AITaskPlan {
  const items = text.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
  const tasks = items.slice(0, 8).map((item, i) => ({
    title: capitalize(item),
    priority: (i === 0 ? 'high' : 'medium') as TaskPriority,
    category: 'personal' as TaskCategory,
    estimated_minutes: 30,
  }))
  return {
    tasks,
    summary: `Found ${tasks.length} tasks. Here's your plan for the day — starting with what matters most.`,
    overwhelmed: tasks.length >= 6,
    top3: tasks.slice(0, 3).map((t) => t.title),
    suggested_order: tasks.map((t) => t.title),
  }
}

function mockPrioritize(tasks: Task[]): Array<{ id: string; ai_score: number; order_index: number }> {
  const priorityScore: Record<string, number> = { urgent: 100, high: 75, medium: 50, low: 25 }
  return tasks
    .sort((a, b) => (priorityScore[b.priority] ?? 50) - (priorityScore[a.priority] ?? 50))
    .map((t, i) => ({ id: t.id, ai_score: priorityScore[t.priority] ?? 50, order_index: i }))
}

function mockDayPlan(tasks: Task[]): DayPlan {
  const today = new Date().toISOString().slice(0, 10)
  const top = tasks.filter((t) => t.status === 'todo').slice(0, 3)
  return {
    date: today,
    schedule: top.map((t, i) => ({
      time: `${9 + i}:00`,
      task_id: t.id,
      task_title: t.title,
      duration_minutes: t.estimated_minutes ?? 60,
      type: 'task',
    })),
    prioritized_tasks: top,
    skipped_tasks: tasks.filter((t) => t.status === 'todo').slice(3),
    total_planned_minutes: top.reduce((s, t) => s + (t.estimated_minutes ?? 60), 0),
    mood: 'calm',
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const match = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (match) return JSON.parse(match[1]) as T
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
