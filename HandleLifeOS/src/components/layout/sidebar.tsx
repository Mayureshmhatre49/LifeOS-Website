'use client'

import { useState } from 'react'
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
  ChevronUp,
  ChevronDown,
  Trash2,
  CalendarDays,
  ListTodo,
  RotateCcw,
  Calendar,
  Timer,
  BarChart2,
  ShieldCheck,
  Wallet,
  Calculator,
  Users,
  ShoppingCart,
  Mic,
  MessageCircle,
  Zap,
  Globe,
  Key,
  BrainCircuit,
  LayoutDashboard,
  Sparkles,
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
  const [footerOpen, setFooterOpen] = useState(false)

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
        {/* Dashboard + Memory */}
        <section className="space-y-0.5">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-white hover:text-gray-900'
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/memory"
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/dashboard/memory'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-gray-700 hover:bg-white hover:text-gray-900'
            )}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Memory Center
          </Link>
        </section>

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

        {/* Planner */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Planner
          </p>
          <ul className="space-y-0.5" role="list">
            {[
              { href: '/planner', icon: <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Today' },
              { href: '/planner/tasks', icon: <ListTodo className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'All tasks' },
              { href: '/planner/routines', icon: <RotateCcw className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Routines' },
              { href: '/planner/week', icon: <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Week view' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Focus */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Focus
          </p>
          <ul className="space-y-0.5" role="list">
            {[
              { href: '/focus', icon: <Timer className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Focus session' },
              { href: '/focus/insights', icon: <BarChart2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Insights' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Protection */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Protection
          </p>
          <ul className="space-y-0.5" role="list">
            <li>
              <Link
                href="/protection"
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === '/protection' || pathname.startsWith('/protection/')
                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="flex-1 text-left">Protection center</span>
              </Link>
            </li>
          </ul>
        </section>

        {/* Money */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Money
          </p>
          <ul className="space-y-0.5" role="list">
            {[
              { href: '/money', icon: <Wallet className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Dashboard' },
              { href: '/money/loans', icon: <Calculator className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Loans & EMI' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Voice & WhatsApp */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Accessibility
          </p>
          <ul className="space-y-0.5" role="list">
            {[
              { href: '/voice', icon: <Mic className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Voice mode' },
              { href: '/settings/whatsapp', icon: <MessageCircle className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'WhatsApp' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Family */}
        <section>
          <p className="px-2 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Family
          </p>
          <ul className="space-y-0.5" role="list">
            {[
              { href: '/family',         icon: <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />,       label: 'Home' },
              { href: '/family/grocery', icon: <ShoppingCart className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'Grocery list' },
              { href: '/family/aura',    icon: <BrainCircuit className="h-3.5 w-3.5 shrink-0 text-gray-400" />, label: 'AURA — Child development' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

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
      <div className="border-t border-gray-100 p-3">
        {/* Collapsed: user row acts as the toggle */}
        {session && (
          <button
            onClick={() => setFooterOpen(v => !v)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
            aria-label={footerOpen ? 'Collapse settings' : 'Expand settings'}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {session.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
            </div>
            {footerOpen
              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              : <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            }
          </button>
        )}

        {/* Expanded: settings links + sign out */}
        {footerOpen && (
          <div className="mt-1 space-y-0.5">
            <Link
              href="/settings/language"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === '/settings/language'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              )}
            >
              <Globe className="h-4 w-4" />
              Language
            </Link>
            <Link
              href="/settings/api"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === '/settings/api'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              )}
            >
              <Key className="h-4 w-4" />
              API keys
            </Link>
            <Link
              href="/billing"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === '/billing' || pathname.startsWith('/billing/')
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              )}
            >
              <Zap className="h-4 w-4" />
              Billing & plans
            </Link>
            <Link
              href="/settings"
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === '/settings'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white hover:text-red-500 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
