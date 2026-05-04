import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type {
  SharedTask,
  FamilyEvent,
  FamilyMember,
  GroceryItem,
  HouseholdPlanResult,
  ChoreBalanceResult,
  MentalLoadResult,
  HouseholdChecklistResult,
} from '@/types/family'
import { TASK_CATEGORY_LABELS } from '@/types/family'

const DISCLAIMER = 'This is a helpful suggestion, not professional advice.'

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return fallback
  try { return JSON.parse(match[0]) as T } catch { return fallback }
}

// ── Household Week Plan ───────────────────────────────────────────────────────

export async function planHouseholdWeek(
  tasks: SharedTask[],
  events: FamilyEvent[],
  members: FamilyMember[]
): Promise<HouseholdPlanResult> {
  if (isMockMode()) {
    return {
      summary: 'Looks like a manageable week. A few tasks need attention.',
      priorities: ['Clear pending groceries', 'Handle upcoming appointments', 'Assign unassigned tasks'],
      suggestions: ['Schedule a quick 5-min family check-in on Sunday.', 'Batch similar errands together.'],
      disclaimer: DISCLAIMER,
    }
  }

  const taskSummary = tasks.slice(0, 20).map(t => `- ${t.title} (${t.category}, ${t.status}${t.assigned_to ? ', assigned' : ', unassigned'})`).join('\n')
  const eventSummary = events.slice(0, 10).map(e => `- ${e.title} on ${e.start_date} (${e.event_type})`).join('\n')
  const memberCount = members.filter(m => m.status === 'active').length

  const prompt = `You are a warm, practical household coordination assistant.

Family overview:
- Active members: ${memberCount}
- Pending tasks:\n${taskSummary || '(none)'}
- Upcoming events:\n${eventSummary || '(none)'}

Provide a weekly household plan as JSON:
{
  "summary": "2-sentence overview of the week",
  "priorities": ["3 top priorities for this week"],
  "suggestions": ["2-3 actionable coordination tips"],
  "disclaimer": "${DISCLAIMER}"
}

Tone: warm, helpful, stress-reducing.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<HouseholdPlanResult>(result.text, {
    summary: 'Your family has a manageable week ahead.',
    priorities: ['Review and assign open tasks', 'Check upcoming events', 'Restock essentials'],
    suggestions: ['Divide tasks by availability, not just role.'],
    disclaimer: DISCLAIMER,
  })
}

// ── Chore Balance ─────────────────────────────────────────────────────────────

export async function balanceChores(
  members: FamilyMember[],
  tasks: SharedTask[]
): Promise<ChoreBalanceResult> {
  const activeMembers = members.filter(m => m.status === 'active' && ['owner', 'partner', 'adult'].includes(m.role))

  if (isMockMode() || activeMembers.length === 0) {
    return {
      analysis: 'Chore distribution looks uneven. Consider reassigning some tasks.',
      assignments: activeMembers.map(m => ({ member: m.display_name ?? 'Member', tasks: [] })),
      tip: 'Share tasks based on availability, not just who usually does what.',
      disclaimer: DISCLAIMER,
    }
  }

  const memberNames = activeMembers.map(m => m.display_name ?? m.invited_email ?? 'Member').join(', ')
  const taskList = tasks.filter(t => t.status !== 'done').slice(0, 20)
    .map(t => `${t.title} (${TASK_CATEGORY_LABELS[t.category]})`).join(', ')

  const prompt = `You are a fair household task coordinator.

Adult family members: ${memberNames}
Open tasks: ${taskList || 'none'}

Suggest a balanced chore distribution as JSON:
{
  "analysis": "1-2 sentence assessment of current distribution",
  "assignments": [{"member": "name", "tasks": ["task1", "task2"]}],
  "tip": "one practical coordination tip",
  "disclaimer": "${DISCLAIMER}"
}

Principles: fairness, not perfection. No gender assumptions. Consider shared load.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<ChoreBalanceResult>(result.text, {
    analysis: 'Try to distribute tasks evenly across available members.',
    assignments: activeMembers.map(m => ({ member: m.display_name ?? 'Member', tasks: [] })),
    tip: 'Check in weekly to see if the split still feels fair.',
    disclaimer: DISCLAIMER,
  })
}

// ── Mental Load Check ─────────────────────────────────────────────────────────

export async function getMentalLoadCheck(
  tasks: SharedTask[],
  events: FamilyEvent[],
  groceryItems: GroceryItem[],
  userMessage?: string
): Promise<MentalLoadResult> {
  if (isMockMode()) {
    return {
      check_in: "Let me check what your family might be missing this week.",
      forgotten_items: ['Medicine refill check', 'School bag check for Monday', 'Bill due this week'],
      upcoming_flags: ['Event coming up in 2 days', 'Grocery list has unpurchased items'],
      calm_note: "You're more on top of things than you think. One step at a time.",
      disclaimer: DISCLAIMER,
    }
  }

  const pendingTasks = tasks.filter(t => t.status !== 'done').map(t => t.title).join(', ')
  const soonEvents = events.slice(0, 5).map(e => `${e.title} (${e.start_date})`).join(', ')
  const unpurchased = groceryItems.filter(i => !i.is_bought).map(i => i.name).join(', ')

  const prompt = `You are a calm, thoughtful household assistant.

Current state:
- Pending tasks: ${pendingTasks || 'none'}
- Upcoming events: ${soonEvents || 'none'}
- Grocery items needed: ${unpurchased || 'none'}
${userMessage ? `User asked: "${userMessage}"` : ''}

Provide a mental load check as JSON:
{
  "check_in": "1-2 sentence warm acknowledgment",
  "forgotten_items": ["2-4 things the family might be forgetting or should check"],
  "upcoming_flags": ["1-3 upcoming things to be aware of"],
  "calm_note": "one reassuring closing sentence",
  "disclaimer": "${DISCLAIMER}"
}

Tone: calm, reassuring, never overwhelming.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<MentalLoadResult>(result.text, {
    check_in: "Let's take a quick look at what's on the family's plate.",
    forgotten_items: ['Check if all tasks are assigned'],
    upcoming_flags: events.length > 0 ? [`${events[0].title} is coming up on ${events[0].start_date}`] : [],
    calm_note: "Your family is doing great. Keep going.",
    disclaimer: DISCLAIMER,
  })
}

// ── Household Checklist ───────────────────────────────────────────────────────

export async function generateHouseholdChecklist(
  context: string,
  members?: FamilyMember[]
): Promise<HouseholdChecklistResult> {
  if (isMockMode()) {
    return {
      checklist_title: 'Household Preparation Checklist',
      items: [
        'Review all pending tasks',
        'Check grocery stock',
        'Confirm upcoming appointments',
        'Assign any unassigned tasks',
        'Check school bag / documents needed',
      ],
      tip: 'Tackle the list together as a family in 15 minutes.',
      disclaimer: DISCLAIMER,
    }
  }

  const memberCount = members?.filter(m => m.status === 'active').length ?? 1

  const prompt = `You are a helpful household preparation assistant.

Context: "${context}"
Family size: ${memberCount} active members

Generate a practical preparation checklist as JSON:
{
  "checklist_title": "specific title for this checklist",
  "items": ["6-10 specific, actionable checklist items"],
  "tip": "one practical tip for completing this together",
  "disclaimer": "${DISCLAIMER}"
}

Be specific and practical. Tailor to the context.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<HouseholdChecklistResult>(result.text, {
    checklist_title: 'Household Checklist',
    items: ['Review open tasks', 'Restock groceries', 'Check upcoming events'],
    tip: 'Work through the list together.',
    disclaimer: DISCLAIMER,
  })
}

// ── Grocery Suggestions ───────────────────────────────────────────────────────

export async function suggestGroceries(
  currentItems: string[],
  familySize: number
): Promise<string[]> {
  if (isMockMode()) {
    return ['Milk', 'Bread', 'Eggs', 'Vegetables', 'Rice']
  }

  const prompt = `A family of ${familySize} has these groceries on their list: ${currentItems.join(', ') || 'nothing yet'}.

Suggest 5-8 common essential grocery items they may have forgotten. Return ONLY a JSON array of strings: ["item1", "item2", ...]
Keep suggestions practical and common.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 200 })
  const match = result.text.match(/\[[\s\S]*?\]/)
  if (!match) return []
  try { return JSON.parse(match[0]) as string[] } catch { return [] }
}
