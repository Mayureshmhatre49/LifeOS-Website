import { useEffect, useRef, useCallback } from 'react'

const EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click',
]

interface Options {
  idleMs: number       // time before warning (default: 25 min)
  warningMs: number    // warning window before logout (default: 5 min)
  onWarning: () => void
  onTimeout: () => void
  enabled?: boolean
}

export function useIdleTimeout({
  idleMs,
  warningMs,
  onWarning,
  onTimeout,
  enabled = true,
}: Options) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (warnTimer.current) clearTimeout(warnTimer.current)

    if (!enabled) return

    idleTimer.current = setTimeout(() => {
      onWarning()
      warnTimer.current = setTimeout(onTimeout, warningMs)
    }, idleMs)
  }, [enabled, idleMs, warningMs, onWarning, onTimeout])

  useEffect(() => {
    if (!enabled) return

    reset()
    EVENTS.forEach((e) => document.addEventListener(e, reset, { passive: true }))
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (warnTimer.current) clearTimeout(warnTimer.current)
      EVENTS.forEach((e) => document.removeEventListener(e, reset))
    }
  }, [enabled, reset])

  return reset
}
