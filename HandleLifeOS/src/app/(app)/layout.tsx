'use client'

import { Suspense, useState } from 'react'
import { X, Menu, Search as SearchIcon } from 'lucide-react'
import { LeftRail } from '@/components/navigation/LeftRail'
import { BottomNav } from '@/components/navigation/BottomNav'
import { CaptureModal } from '@/components/capture/CaptureModal'
import { GlobalSearchProvider, useGlobalSearch } from '@/components/search/GlobalSearchProvider'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ToastProvider } from '@/components/ui/toast'

const RailFallback = () => (
  <div className="h-full w-full bg-white border-r border-gray-100" />
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GlobalSearchProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </GlobalSearchProvider>
    </ToastProvider>
  )
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)
  const { setOpen: setSearchOpen } = useGlobalSearch()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* Desktop left rail */}
      <div className="hidden lg:flex lg:w-[var(--rail-width)] lg:shrink-0">
        <Suspense fallback={<RailFallback />}>
          <LeftRail />
        </Suspense>
      </div>

      {/* Mobile side-drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[220px] lg:hidden shadow-2xl">
            <Suspense fallback={<RailFallback />}>
              <LeftRail />
            </Suspense>
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-3 h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-2 px-4 h-[var(--header-height)] border-b border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] backdrop-blur-md shrink-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-6 w-6 rounded-md bg-[var(--color-gray-900)] flex items-center justify-center">
              <span className="text-white font-semibold text-[10px] leading-none">L</span>
            </div>
            <span className="font-semibold text-[13px] text-[var(--color-text-primary)] tracking-tight">Life OS</span>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="h-9 w-9 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <SearchIcon className="h-[16px] w-[16px]" strokeWidth={1.75} />
          </button>
          <NotificationBell />
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end gap-2 px-6 h-[var(--header-height)] border-b border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] backdrop-blur-md shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 h-8 text-[12px] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <SearchIcon className="h-[13px] w-[13px]" strokeWidth={1.75} />
            <span>Search</span>
            <kbd className="ml-2 rounded border border-[var(--color-border)] bg-[var(--color-gray-50)] px-1 py-0.5 text-[10px] font-mono text-[var(--color-text-tertiary)]">⌘K</kbd>
          </button>
          <NotificationBell />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <div className="lg:hidden shrink-0">
          <Suspense fallback={<div className="h-14" />}>
            <BottomNav />
          </Suspense>
        </div>
      </div>

      {/* Desktop floating capture button — restrained, monochrome */}
      <button
        onClick={() => setCaptureOpen(true)}
        className="hidden lg:flex fixed bottom-24 right-6 h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gray-900)] text-white shadow-[var(--shadow-lg)] hover:bg-[var(--color-gray-800)] active:scale-95 transition-all duration-[var(--duration-fast)] z-30"
        aria-label="Quick capture"
      >
        <svg
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </div>
  )
}
