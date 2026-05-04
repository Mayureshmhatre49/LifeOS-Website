// Mental health one-click tools.
// Each tool defines steps with a duration; UI plays them sequentially with a timer.

import type { LucideIcon } from 'lucide-react'
import { Wind, ShieldAlert, Flame, Moon, Repeat, Crown, Rocket } from 'lucide-react'

export type Animation = 'breathe' | 'pulse' | 'count' | 'still'

export interface ToolStep {
  label: string
  detail?: string
  duration: number // seconds
  animation?: Animation
  voice?: string // optional voice-over text (used when voice mode is on)
}

export interface MindTool {
  id: string
  title: string
  tagline: string
  intent: string
  totalSeconds: number
  icon: LucideIcon
  color: string
  bgGradient: string
  steps: ToolStep[]
  closing: string
}

// ── 1. 2-min Breathing Reset ───────────────────────────────────────────────────
const breathingReset: MindTool = {
  id: 'breathing',
  title: '2-min Breathing Reset',
  tagline: 'Box breathing · 4-4-4-4',
  intent: 'Calm your nervous system fast.',
  totalSeconds: 120,
  icon: Wind,
  color: 'text-sky-600',
  bgGradient: 'from-sky-50 to-cyan-50',
  steps: Array.from({ length: 8 }, () => [
    { label: 'Inhale',     detail: 'Breathe in slowly through your nose', duration: 4, animation: 'breathe' as Animation },
    { label: 'Hold',       detail: 'Hold gently, no strain',              duration: 4, animation: 'still'   as Animation },
    { label: 'Exhale',     detail: 'Slow release through your mouth',     duration: 4, animation: 'breathe' as Animation },
    { label: 'Hold',       detail: 'Pause, soft and steady',              duration: 4, animation: 'still'   as Animation },
  ]).flat(),
  closing: 'Notice how your body feels now. Your nervous system is calmer than 2 minutes ago.',
}

// ── 2. Panic Mode Grounding (5-4-3-2-1) ────────────────────────────────────────
const panicGrounding: MindTool = {
  id: 'grounding',
  title: 'Panic Grounding',
  tagline: '5-4-3-2-1 sensory technique',
  intent: 'Pull yourself out of panic by anchoring to your senses.',
  totalSeconds: 180,
  icon: ShieldAlert,
  color: 'text-rose-600',
  bgGradient: 'from-rose-50 to-pink-50',
  steps: [
    { label: 'See',   detail: 'Name 5 things you can SEE around you, slowly',   duration: 45, animation: 'count' },
    { label: 'Touch', detail: 'Name 4 things you can TOUCH or feel',            duration: 35, animation: 'count' },
    { label: 'Hear',  detail: 'Name 3 things you can HEAR right now',           duration: 30, animation: 'count' },
    { label: 'Smell', detail: 'Name 2 things you can SMELL',                    duration: 25, animation: 'count' },
    { label: 'Taste', detail: 'Name 1 thing you can TASTE — or take a sip',     duration: 20, animation: 'count' },
    { label: 'Anchor', detail: 'Take three slow breaths. You are here, now.',   duration: 25, animation: 'breathe' },
  ],
  closing: 'You came back to your body. The panic wave passes — you outlasted it.',
}

// ── 3. Anger Cooldown ──────────────────────────────────────────────────────────
const angerCooldown: MindTool = {
  id: 'anger',
  title: 'Anger Cooldown',
  tagline: '60-sec controlled exhale',
  intent: 'Drop the heat before you say something you regret.',
  totalSeconds: 90,
  icon: Flame,
  color: 'text-orange-600',
  bgGradient: 'from-orange-50 to-red-50',
  steps: [
    { label: 'Notice',       detail: 'Name the feeling: "I am angry." That is okay.',  duration: 10, animation: 'still'   },
    { label: 'Long exhale',  detail: 'Breathe in 4, exhale 8. Repeat.',                duration: 24, animation: 'breathe' },
    { label: 'Long exhale',  detail: 'Slower exhale than inhale calms the body.',      duration: 24, animation: 'breathe' },
    { label: 'Reframe',      detail: 'What is underneath the anger? Hurt? Fear? Disrespect?', duration: 15, animation: 'still' },
    { label: 'Choose',       detail: 'What response will you be proud of in 1 hour?',  duration: 17, animation: 'still'   },
  ],
  closing: "Anger gave you information. You don't have to act on the heat — you can act on the message.",
}

// ── 4. Sleep Wind-down (4-7-8) ─────────────────────────────────────────────────
const sleepWindDown: MindTool = {
  id: 'sleep',
  title: 'Sleep Wind-down',
  tagline: '4-7-8 breathing · 6 cycles',
  intent: 'Lower your heart rate and ease into sleep.',
  totalSeconds: 114,
  icon: Moon,
  color: 'text-indigo-600',
  bgGradient: 'from-indigo-50 to-violet-50',
  steps: Array.from({ length: 6 }, () => [
    { label: 'Inhale 4',  detail: 'Through your nose',           duration: 4,  animation: 'breathe' as Animation },
    { label: 'Hold 7',    detail: 'Quiet stillness',             duration: 7,  animation: 'still'   as Animation },
    { label: 'Exhale 8',  detail: 'Soft whoosh through mouth',   duration: 8,  animation: 'breathe' as Animation },
  ]).flat(),
  closing: 'Let your body sink. Tomorrow can wait. Your only job now is to rest.',
}

// ── 5. Overthinking Breaker ────────────────────────────────────────────────────
const overthinkingBreaker: MindTool = {
  id: 'overthinking',
  title: 'Overthinking Breaker',
  tagline: '90-sec pattern interrupt',
  intent: 'Step out of the thought loop with three questions.',
  totalSeconds: 90,
  icon: Repeat,
  color: 'text-violet-600',
  bgGradient: 'from-violet-50 to-purple-50',
  steps: [
    { label: 'Question 1', detail: 'What is the loop telling you? Say it out loud once.', duration: 20, animation: 'still' },
    { label: 'Question 2', detail: 'Is this thought helpful, or just loud? Be honest.',   duration: 25, animation: 'still' },
    { label: 'Question 3', detail: "What's one tiny action you could take in the next hour?", duration: 25, animation: 'still' },
    { label: 'Decide',     detail: 'Pick the action. The loop ends with movement.',       duration: 20, animation: 'pulse' },
  ],
  closing: 'Loops feed on repetition. One small action breaks the spell.',
}

// ── 6. Confidence Boost ────────────────────────────────────────────────────────
const confidenceBoost: MindTool = {
  id: 'confidence',
  title: 'Confidence Boost',
  tagline: '90-sec power reset',
  intent: 'Stand taller in the next hour.',
  totalSeconds: 90,
  icon: Crown,
  color: 'text-amber-600',
  bgGradient: 'from-amber-50 to-yellow-50',
  steps: [
    { label: 'Stand',     detail: 'Stand up. Roll shoulders back. Plant your feet.',     duration: 15, animation: 'still' },
    { label: 'Power pose', detail: 'Hands on hips. Chest open. Chin up. Hold.',          duration: 25, animation: 'pulse' },
    { label: 'Recall',    detail: 'Recall ONE moment you nailed something hard.',        duration: 25, animation: 'still' },
    { label: 'Speak',     detail: '"I have done hard things. I can do this." — say it.', duration: 15, animation: 'pulse' },
    { label: 'Step in',   detail: 'Walk into the next thing with that posture.',         duration: 10, animation: 'still' },
  ],
  closing: 'Posture shifts physiology. Physiology shifts presence. Presence shifts outcomes.',
}

// ── 7. Motivation Reset ────────────────────────────────────────────────────────
const motivationReset: MindTool = {
  id: 'motivation',
  title: 'Motivation Reset',
  tagline: '2-min direction-finder',
  intent: 'When everything feels heavy and pointless.',
  totalSeconds: 120,
  icon: Rocket,
  color: 'text-emerald-600',
  bgGradient: 'from-emerald-50 to-teal-50',
  steps: [
    { label: 'Acknowledge', detail: 'Motivation is low right now. That is real, not a flaw.', duration: 20, animation: 'still' },
    { label: 'Why',         detail: 'What did past-you start this for? Remember the reason.', duration: 30, animation: 'still' },
    { label: 'Smallest step', detail: "What's the tiniest version of doing it for 2 minutes?", duration: 30, animation: 'still' },
    { label: 'Commit',      detail: 'Just 2 minutes. Not the whole thing. Just start.',       duration: 25, animation: 'pulse' },
    { label: 'Go',          detail: 'Close this and begin. Momentum follows action.',         duration: 15, animation: 'pulse' },
  ],
  closing: 'You did not need motivation — you needed permission to start small.',
}

export const MIND_TOOLS: MindTool[] = [
  breathingReset, panicGrounding, angerCooldown, sleepWindDown,
  overthinkingBreaker, confidenceBoost, motivationReset,
]

export function getTool(id: string): MindTool | undefined {
  return MIND_TOOLS.find(t => t.id === id)
}
