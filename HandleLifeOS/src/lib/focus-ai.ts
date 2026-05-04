import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type { TaskStep, BodyDoubleMessage, EnergyState } from '@/types/focus'

// Break a big task into small actionable steps
export async function decomposeTask(
  taskTitle: string,
  notes?: string,
  estimatedMinutes?: number
): Promise<TaskStep[]> {
  if (isMockMode()) return mockDecompose(taskTitle)

  const model = getAIModel()
  const context = notes ? `Context: ${notes}` : ''
  const timeHint = estimatedMinutes ? `Total estimated time: ${estimatedMinutes} minutes.` : ''

  const { text: raw } = await generateText({
    model,
    system: `You are a calm, practical focus coach for Life OS. Break tasks into small, concrete, doable steps. Each step should take 5-20 minutes. Never be overwhelming. Respond with valid JSON only — no explanation.

Format:
[
  { "title": "Clear action phrase", "duration_minutes": number, "order": number }
]

Rules:
- Max 7 steps
- Keep titles short and action-oriented (start with a verb)
- Be realistic with time
- First step should be the easiest to start`,
    prompt: `Break this task into steps:\n"${taskTitle}"\n${context}\n${timeHint}`,
    maxOutputTokens: 600,
    temperature: 0.3,
  })

  return parseJSON<TaskStep[]>(raw, mockDecompose(taskTitle))
}

// Body doubling: generate a supportive message for the current session state
export async function getBodyDoubleMessage(
  type: BodyDoubleMessage['type'],
  taskTitle: string,
  minutesElapsed?: number,
  minutesRemaining?: number,
  userContext?: string
): Promise<BodyDoubleMessage> {
  if (isMockMode()) return mockBodyDouble(type, taskTitle, minutesElapsed, minutesRemaining)

  const model = getAIModel()
  const ctx = userContext ? `User background: ${userContext}` : ''
  const timeInfo = minutesElapsed != null ? `${minutesElapsed} min elapsed, ${minutesRemaining ?? 0} min remaining.` : ''

  const prompts: Record<BodyDoubleMessage['type'], string> = {
    start: `User is about to start: "${taskTitle}". ${ctx} Give a very short (1 sentence), warm, encouraging message to help them begin. Optionally suggest the very first micro-step.`,
    checkin: `User is in a focus session on: "${taskTitle}". ${timeInfo} ${ctx} Give a gentle, brief check-in message (1-2 sentences). Keep it calm and non-intrusive.`,
    complete: `User just completed a focus session on: "${taskTitle}". ${timeInfo} ${ctx} Give a warm, genuine congratulations (1-2 sentences). Make it feel earned, not gimmicky.`,
    restart: `User abandoned or paused a session on: "${taskTitle}". ${ctx} Give a guilt-free, compassionate restart nudge (1-2 sentences). Never shame them. Offer the smallest possible next step.`,
  }

  const { text: raw } = await generateText({
    model,
    system: `You are a calm, supportive focus companion for Life OS. Your tone is warm, human, never preachy or overly enthusiastic. You help users start, stay on task, and recover gracefully from interruptions. Respond with JSON only:
{ "type": "${type}", "message": "string", "suggestion": "optional short action string" }`,
    prompt: prompts[type],
    maxOutputTokens: 200,
    temperature: 0.7,
  })

  return parseJSON<BodyDoubleMessage>(raw, mockBodyDouble(type, taskTitle, minutesElapsed, minutesRemaining))
}

// Suggest tasks based on current energy level
export async function suggestTasksForEnergy(
  tasks: Array<{ id: string; title: string; priority: string; estimated_minutes?: number | null }>,
  energy: EnergyState,
  userContext?: string
): Promise<Array<{ id: string; reason: string }>> {
  if (isMockMode() || !tasks.length) return mockEnergySuggest(tasks, energy)

  const model = getAIModel()
  const ctx = userContext ? `User context: ${userContext}` : ''

  const energyGuidance: Record<EnergyState, string> = {
    low: 'User has low energy. Suggest easy, routine, or admin tasks that don\'t need heavy thinking.',
    normal: 'User has normal energy. Balance important and routine tasks.',
    high: 'User has high energy. Suggest the most important, cognitively demanding tasks.',
  }

  const { text: raw } = await generateText({
    model,
    system: `You are a focus coach. ${energyGuidance[energy]} ${ctx} Select the best 3 tasks from the list. Respond with JSON only:
[{ "id": "uuid", "reason": "one short reason why this fits current energy" }]`,
    prompt: `Tasks:\n${JSON.stringify(tasks.slice(0, 15))}`,
    maxOutputTokens: 400,
    temperature: 0.4,
  })

  return parseJSON<Array<{ id: string; reason: string }>>(raw, mockEnergySuggest(tasks, energy))
}

// ── Mock responses ─────────────────────────────────────────────────────────

function mockDecompose(taskTitle: string): TaskStep[] {
  return [
    { title: `Open and review: ${taskTitle}`, duration_minutes: 5, order: 0 },
    { title: 'Gather any needed materials or resources', duration_minutes: 10, order: 1 },
    { title: 'Complete the first section or draft', duration_minutes: 20, order: 2 },
    { title: 'Review and refine', duration_minutes: 10, order: 3 },
    { title: 'Wrap up and mark done', duration_minutes: 5, order: 4 },
  ]
}

function mockBodyDouble(
  type: BodyDoubleMessage['type'],
  taskTitle: string,
  minutesElapsed?: number,
  minutesRemaining?: number
): BodyDoubleMessage {
  const messages: Record<BodyDoubleMessage['type'], BodyDoubleMessage> = {
    start: {
      type: 'start',
      message: `Ready when you are. Let's work on "${taskTitle}" together.`,
      suggestion: 'Just open it and read the first line.',
    },
    checkin: {
      type: 'checkin',
      message: `${minutesElapsed} min in — you're doing great. ${minutesRemaining} min left.`,
    },
    complete: {
      type: 'complete',
      message: `Session complete. You focused for ${minutesElapsed} minutes — that's real progress.`,
    },
    restart: {
      type: 'restart',
      message: `No worries. Want to try just 5 minutes on "${taskTitle}"?`,
      suggestion: 'Start with the smallest piece.',
    },
  }
  return messages[type]
}

function mockEnergySuggest(
  tasks: Array<{ id: string; title: string; priority: string; estimated_minutes?: number | null }>,
  energy: EnergyState
): Array<{ id: string; reason: string }> {
  const sorted = [...tasks].sort((a, b) => {
    const score: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
    if (energy === 'low') return (a.estimated_minutes ?? 30) - (b.estimated_minutes ?? 30)
    return (score[b.priority] ?? 2) - (score[a.priority] ?? 2)
  })
  return sorted.slice(0, 3).map((t) => ({
    id: t.id,
    reason: energy === 'low' ? 'Short and manageable for low energy' : 'Good match for your current energy',
  }))
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
