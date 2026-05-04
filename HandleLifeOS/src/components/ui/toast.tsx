'use client'

/**
 * Tiny toast notification system — no dependencies.
 *
 * Wrap your app once with <ToastProvider>, then call useToast().show()
 * or the imported `toast()` helper from anywhere.
 *
 *   toast({ kind: 'error', message: 'Could not save' })
 *   toast({ kind: 'success', message: 'Recipe saved' })
 *
 * Replaces silent fetch-then-update patterns where API failures used to
 * close forms with no feedback.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  kind: ToastKind
  message: string
  description?: string
}

interface ToastContextValue {
  show: (t: Omit<Toast, 'id'>) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

// Top-level reference so the imperative `toast()` helper works without a hook.
let externalShow: ((t: Omit<Toast, 'id'>) => void) | null = null

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, t.kind === 'error' ? 5000 : 3000)
  }, [])

  useEffect(() => { externalShow = show; return () => { externalShow = null } }, [show])

  const ctx = useMemo(() => ({ show }), [show])

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-[360px] pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto rounded-lg border bg-[var(--color-surface-raised)] shadow-[var(--shadow-md)] px-4 py-3 flex items-start gap-3 fade-in',
              t.kind === 'error'   && 'border-[var(--color-danger-500)]',
              t.kind === 'success' && 'border-[var(--color-success-500)]',
              t.kind === 'warning' && 'border-[var(--color-warning-500)]',
              t.kind === 'info'    && 'border-[var(--color-border-strong)]',
            )}
          >
            <ToastIcon kind={t.kind} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{t.message}</p>
              {t.description && <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-[14px] w-[14px]" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'success') return <CheckCircle2 className="h-[16px] w-[16px] text-[var(--color-success-700)] mt-0.5 shrink-0" strokeWidth={1.75} />
  if (kind === 'error')   return <AlertTriangle className="h-[16px] w-[16px] text-[var(--color-danger-700)] mt-0.5 shrink-0" strokeWidth={1.75} />
  if (kind === 'warning') return <AlertTriangle className="h-[16px] w-[16px] text-[var(--color-warning-700)] mt-0.5 shrink-0" strokeWidth={1.75} />
  return <Info className="h-[16px] w-[16px] text-[var(--color-text-tertiary)] mt-0.5 shrink-0" strokeWidth={1.75} />
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    // Fallback when called outside provider — don't crash, just no-op
    return { show: () => {} }
  }
  return ctx
}

/**
 * Imperative helper — works anywhere (useEffect, async handler, etc.)
 * without needing the hook. Silently no-ops if ToastProvider isn't mounted.
 */
export function toast(t: Omit<Toast, 'id'>): void {
  externalShow?.(t)
}
