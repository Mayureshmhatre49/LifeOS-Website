'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  DollarSign,
  MessageSquare,
  Users,
  Timer,
  ShieldCheck,
  Mic,
} from 'lucide-react'

interface Action {
  icon: React.ReactNode
  label: string
  href: string
  color: string
  event: string
}

const ACTIONS: Action[] = [
  {
    icon: <Plus className="h-4 w-4" />,
    label: 'Add Task',
    href: '/planner',
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100',
    event: 'quick_action_add_task',
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    label: 'Add Expense',
    href: '/money',
    color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100',
    event: 'quick_action_add_expense',
  },
  {
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'Ask AI',
    href: '/chat',
    color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100',
    event: 'quick_action_ask_ai',
  },
  {
    icon: <Timer className="h-4 w-4" />,
    label: 'Focus',
    href: '/focus',
    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100',
    event: 'quick_action_focus',
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: 'Family',
    href: '/family',
    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100',
    event: 'quick_action_family',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    label: 'Check Scam',
    href: '/protection',
    color: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100',
    event: 'quick_action_scam',
  },
  {
    icon: <Mic className="h-4 w-4" />,
    label: 'Voice',
    href: '/voice',
    color: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100',
    event: 'quick_action_voice',
  },
]

export function QuickActions() {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick actions</p>
      <div className="flex gap-2 flex-wrap">
        {ACTIONS.map(action => (
          <Link
            key={action.event}
            href={action.href}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${action.color}`}
            onClick={() => {
              if (typeof window !== 'undefined') {
                // Analytics event hook — replace with your analytics SDK
                console.info('[Analytics]', action.event)
              }
            }}
          >
            {action.icon}
            <span className="whitespace-nowrap">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
