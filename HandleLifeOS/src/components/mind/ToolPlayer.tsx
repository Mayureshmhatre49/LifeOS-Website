'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MindTool } from '@/lib/mind/tools'

interface Props {
  tool: MindTool
  onComplete?: () => void
}

type PrePostStage = 'pre' | 'playing' | 'post' | 'closed'

export function ToolPlayer({ tool, onComplete }: Props) {
  const [stage, setStage] = useState<PrePostStage>('pre')
  const [preIntensity, setPreIntensity] = useState<number | null>(null)
  const [postIntensity, setPostIntensity] = useState<number | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(tool.steps[0].duration)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const tickRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)

  const step = tool.steps[stepIdx]
  const totalElapsed = tool.steps
    .slice(0, stepIdx)
    .reduce((s, st) => s + st.duration, 0) + (step.duration - secondsLeft)
  const progress = (totalElapsed / tool.totalSeconds) * 100

  // Tick
  useEffect(() => {
    if (!running || done) return
    tickRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1
        // step done
        if (stepIdx < tool.steps.length - 1) {
          const nextIdx = stepIdx + 1
          setStepIdx(nextIdx)
          return tool.steps[nextIdx].duration
        }
        setRunning(false)
        setDone(true)
        return 0
      })
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [running, stepIdx, done, tool.steps])

  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
      // Move to post-survey instead of immediate log
      setStage('post')
    }
  }, [done, onComplete])

  function logSession(post: number | null) {
    fetch('/api/mind/tools/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_id: tool.id,
        completed: true,
        pre_intensity: preIntensity ?? undefined,
        post_intensity: post ?? undefined,
      }),
    }).catch(() => {})
  }

  function handleStartFromPre() {
    setStage('playing')
  }

  function handleSkipPre() {
    setStage('playing')
  }

  function handleSubmitPost() {
    logSession(postIntensity)
    setStage('closed')
  }

  function handleSkipPost() {
    logSession(null)
    setStage('closed')
  }

  function handleStart() {
    setRunning(true)
  }
  function handlePause() {
    setRunning(false)
  }
  function handleReset() {
    setStepIdx(0)
    setSecondsLeft(tool.steps[0].duration)
    setRunning(false)
    setDone(false)
    completedRef.current = false
  }
  function handleSkip() {
    if (stepIdx < tool.steps.length - 1) {
      const next = stepIdx + 1
      setStepIdx(next)
      setSecondsLeft(tool.steps[next].duration)
    } else {
      setRunning(false)
      setDone(true)
    }
  }

  // Animation key for breathing — changes per step to retrigger CSS
  const animKey = `${tool.id}-${stepIdx}-${step.animation}`

  // Pre-survey: ask intensity before starting
  if (stage === 'pre') {
    return (
      <div className={cn('rounded-3xl border border-white/60 shadow-md p-6 md:p-8 bg-gradient-to-br', tool.bgGradient)}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Before we start</p>
        <h3 className={cn('text-xl font-bold mb-1', tool.color)}>How intense is what you&apos;re feeling?</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">A quick rating helps you see what works over time. Optional.</p>
        <IntensityScale value={preIntensity} onChange={setPreIntensity} />
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleStartFromPre}
            disabled={!preIntensity}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-violet-500 to-indigo-600 disabled:opacity-40"
          >
            Continue
          </button>
          <button onClick={handleSkipPre} className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm">
            Skip
          </button>
        </div>
      </div>
    )
  }

  // Post-survey: ask intensity after completion
  if (stage === 'post') {
    const delta = preIntensity != null && postIntensity != null ? preIntensity - postIntensity : null
    return (
      <div className={cn('rounded-3xl border border-white/60 shadow-md p-6 md:p-8 bg-gradient-to-br', tool.bgGradient)}>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Session complete</p>
        <h3 className="text-xl font-bold text-gray-800 mb-1">How does it feel now?</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed italic">{tool.closing}</p>
        <IntensityScale value={postIntensity} onChange={setPostIntensity} />
        {delta != null && delta > 0 && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs text-emerald-700 font-bold">
              Intensity dropped {delta} {delta === 1 ? 'point' : 'points'} 🌿
            </p>
          </div>
        )}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmitPost}
            disabled={!postIntensity}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-40"
          >
            Save
          </button>
          <button onClick={handleSkipPost} className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm">
            Skip
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'closed') {
    return (
      <div className={cn('rounded-3xl border border-white/60 shadow-md p-6 md:p-8 bg-gradient-to-br', tool.bgGradient, 'text-center')}>
        <Check className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
        <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Session logged</p>
        <p className="text-base text-gray-700 mt-2 italic max-w-md mx-auto leading-relaxed">{tool.closing}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-3xl border border-white/60 shadow-md p-6 md:p-8 bg-gradient-to-br',
      tool.bgGradient
    )}>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/50 overflow-hidden mb-6">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-1000', done && 'from-emerald-400 to-emerald-500')}
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>

      {/* Animation circle */}
      <div className="flex items-center justify-center mb-6">
        <div className={cn(
          'relative h-44 w-44 rounded-full flex items-center justify-center',
          step.animation === 'breathe' && 'breathe-circle',
          step.animation === 'pulse' && 'pulse-circle',
        )} key={animKey}>
          <div className={cn(
            'absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 shadow-inner',
          )} />
          <div className="relative text-center z-10">
            {done ? (
              <div className="space-y-1">
                <Check className="h-10 w-10 mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Complete</p>
              </div>
            ) : (
              <>
                <p className="text-5xl font-bold text-gray-800 tabular-nums">{secondsLeft}</p>
                <p className="text-xs text-gray-500 mt-1">seconds</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Step label + detail */}
      <div className="text-center mb-6 min-h-[60px]">
        {done ? (
          <p className="text-base text-gray-700 leading-relaxed max-w-md mx-auto italic">
            {tool.closing}
          </p>
        ) : (
          <>
            <p className={cn('text-2xl font-bold mb-1 tracking-tight', tool.color)}>{step.label}</p>
            {step.detail && (
              <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">{step.detail}</p>
            )}
          </>
        )}
      </div>

      {/* Step indicator */}
      {!done && (
        <p className="text-center text-[11px] text-gray-400 mb-4 font-medium">
          Step {stepIdx + 1} of {tool.steps.length}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {done ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Run again
          </button>
        ) : (
          <>
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-white/70 border border-white/80 text-gray-500 hover:bg-white transition-all"
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {running ? (
              <button
                onClick={handlePause}
                className={cn('flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-gray-700 to-gray-800')}
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                className={cn('flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-violet-500 to-indigo-600')}
              >
                <Play className="h-4 w-4" />
                {totalElapsed > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button
              onClick={handleSkip}
              className="p-3 rounded-2xl bg-white/70 border border-white/80 text-gray-500 hover:bg-white transition-all"
              aria-label="Next step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .breathe-circle {
          animation: breatheScale 4s ease-in-out infinite;
        }
        .pulse-circle {
          animation: pulseScale 1.5s ease-in-out infinite;
        }
        @keyframes breatheScale {
          0%, 100% { transform: scale(0.92); }
          50%      { transform: scale(1.08); }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.04); opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}

function IntensityScale({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  const labels = ['', 'Mild', 'Some', 'Moderate', 'High', 'Severe']
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all',
            value === v
              ? v >= 4 ? 'bg-rose-100 border-rose-300 text-rose-700'
                : v >= 3 ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              : 'bg-white/60 border-gray-200 text-gray-500',
          )}
        >
          <span className="text-base font-bold">{v}</span>
          <span className="text-[9px]">{labels[v]}</span>
        </button>
      ))}
    </div>
  )
}
