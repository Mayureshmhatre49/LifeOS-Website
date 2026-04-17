'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Conversation } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations] = useState<Conversation[]>([])

  const handleNewChat = useCallback(() => {
    router.push('/chat')
    setSidebarOpen(false)
  }, [router])

  const handleSelectCategory = useCallback((prompt: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)
    setSidebarOpen(false)
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0">
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="relative h-full">
          <Sidebar
            conversations={conversations}
            onNewChat={handleNewChat}
            onSelectCategory={handleSelectCategory}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-gray-100 bg-white shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-gray-900">Life OS</span>
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
