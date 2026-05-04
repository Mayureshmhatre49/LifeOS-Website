'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'lifeos.pwa.installDismissedAt'
const DISMISS_TTL_DAYS = 14

function dismissedRecently() {
  if (typeof window === 'undefined') return false
  const at = window.localStorage.getItem(DISMISS_KEY)
  if (!at) return false
  const days = (Date.now() - Number(at)) / 86_400_000
  return days < DISMISS_TTL_DAYS
}

export function PWARegister() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        // Auto-update on new SW found
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage('SKIP_WAITING')
            }
          })
        })
      } catch (err) {
        console.warn('[PWA] SW registration failed', err)
      }
    }
    register()
  }, [])

  useEffect(() => {
    // Detect existing standalone mode
    const mq = window.matchMedia('(display-mode: standalone)')
    setIsStandalone(mq.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

    function onPrompt(e: Event) {
      e.preventDefault()
      if (dismissedRecently()) return
      setInstallEvt(e as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setInstallEvt(null)
      setIsStandalone(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!installEvt) return
    await installEvt.prompt()
    await installEvt.userChoice
    setInstallEvt(null)
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setInstallEvt(null)
  }

  if (!installEvt || isStandalone) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 print:hidden">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-xl border border-indigo-100">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">Install Life OS</p>
          <p className="text-[11px] text-gray-500 truncate">Faster access — works offline</p>
        </div>
        <button onClick={install} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 shrink-0">
          <Download className="h-3 w-3" /> Install
        </button>
        <button onClick={dismiss} className="p-1.5 text-gray-400 hover:text-gray-700 shrink-0" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
