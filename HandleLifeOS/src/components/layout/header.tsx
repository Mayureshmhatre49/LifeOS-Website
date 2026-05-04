'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, User, MessageSquare, ChevronDown } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none">
                  Tools
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={8}
                  className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                  {[
                    { name: 'EMI Calculator', href: '/emi-calculator' },
                    { name: 'Scam Checker', href: '/scam-checker' },
                    { name: 'Daily Planner', href: '/daily-planner' },
                    { name: 'Budget Planner', href: '/budget-planner' },
                    { name: 'Focus Timer', href: '/focus-timer' },
                  ].map((tool) => (
                    <DropdownMenu.Item key={tool.href} asChild>
                      <Link
                        href={tool.href}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                      >
                        {tool.name}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Link
              href="/#features"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Features
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/chat">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Open Chat
                  </Link>
                </Button>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={session.user?.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {session.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={8}
                      className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
                    >
                      <div className="px-3 py-2 border-b border-gray-50 mb-1">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/chat"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                        >
                          <MessageSquare className="h-4 w-4" />
                          My Chats
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Get started free</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
