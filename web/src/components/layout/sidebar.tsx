'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CATEGORIES } from '@/config/categories'
import { Conversation } from '@/types'
import { cn } from '@/lib/utils'
import {
  Plus,
  MessageSquare,
  LogOut,
  Settings,
  ChevronRight,
  Trash2,
} from 'lucide-react'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  onNewChat: () => void
  onSelectCategory: (prompt: string) => void
  onDeleteConversation?: (id: string) => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectCategory,
  onDeleteConversation,
}: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col bg-gray-50 border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/">
          <Logo />
        </Link>
        <Button
          size="icon"
          variant="ghost"
          onClick={onNewChat}
          title="New chat"
          aria-label="Start new chat"
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-gray-700"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {/* Recent Chats */}
        {conversations.length > 0 && (
          <section>
            <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Recent
            </p>
            <ul className="space-y-0.5" role="list">
              {conversations.slice(0, 15).map((conv) => (
                <li key={conv.id} className="group relative">
                  <Link
                    href={`/chat/${conv.id}`}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                      currentConversationId === conv.id
                        ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate flex-1">{conv.title}</span>
                  </Link>
                  {onDeleteConversation && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onDeleteConversation(conv.id)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-md hover:bg-red-50 hover:text-red-600 text-gray-400"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Categories */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Quick start
          </p>
          <ul className="space-y-0.5" role="list">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onSelectCategory(cat.starterPrompt)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-colors group"
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                  <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-gray-400 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white hover:text-gray-900 transition-colors">
          <Settings className="h-4 w-4" />
          Settings
          <span className="ml-auto text-xs text-gray-300">soon</span>
        </button>
        {session && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {session.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
