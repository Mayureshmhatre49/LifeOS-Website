'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sun, Plus, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CaptureModal } from '@/components/capture/CaptureModal'

const ITEMS = [
  { href: '/dashboard', icon: Home,      label: 'Home',     exact: true },
  { href: '/today',     icon: Sun,       label: 'Today'    },
  { href: null,         icon: Plus,      label: 'Capture',  isFab: true },
  { href: '/insights',  icon: BarChart3, label: 'Insights' },
  { href: '/settings',  icon: Settings,  label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [captureOpen, setCaptureOpen] = useState(false)

  function isActive(href: string | null, exact?: boolean) {
    if (!href) return false
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <nav className="flex items-stretch border-t border-[var(--color-border-soft)] bg-[var(--color-surface-overlay)] backdrop-blur-md safe-area-pb">
        {ITEMS.map(item => {
          if (item.isFab) {
            return (
              <div key="fab" className="flex flex-1 items-center justify-center py-2">
                <button
                  onClick={() => setCaptureOpen(true)}
                  className="h-11 w-11 rounded-full bg-[var(--color-gray-900)] flex items-center justify-center shadow-[var(--shadow-md)] active:scale-95 transition-transform duration-[var(--duration-fast)] -mt-5 ring-4 ring-[var(--color-surface-overlay)]"
                  aria-label="Quick capture"
                >
                  <Plus className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
                </button>
              </div>
            )
          }

          const active = isActive(item.href, item.exact)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-[var(--duration-fast)]',
                active
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2 : 1.75} />
              <span>{item.label}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--color-text-primary)]" />
              )}
            </Link>
          )
        })}
      </nav>

      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  )
}
