'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { CommandPalette } from './CommandPalette'

interface GlobalSearchCtx {
  open: boolean
  setOpen: (v: boolean) => void
}

const Ctx = createContext<GlobalSearchCtx | null>(null)

export function useGlobalSearch() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useGlobalSearch must be used inside <GlobalSearchProvider>')
  return c
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  )
}
