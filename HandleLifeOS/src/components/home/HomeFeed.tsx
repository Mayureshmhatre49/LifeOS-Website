'use client'

import { useEffect, useState } from 'react'
import { Bell, Sparkles, X, ChevronRight, Menu, Circle, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'
import Link from 'next/link'

function getGreeting(hour: number): { text: string; emoji: string } {
  if (hour < 12) return { text: 'Good Morning', emoji: '👋' }
  if (hour < 17) return { text: 'Good Afternoon', emoji: '👋' }
  if (hour < 21) return { text: 'Good Evening', emoji: '👋' }
  return { text: 'Good Night', emoji: '🌙' }
}

interface Props {
  data: DashboardData
  userImage?: string | null
}

export function HomeFeed({ data, userImage }: Props) {
  const { data: session } = useSession()
  const [hour, setHour] = useState(10)
  useEffect(() => setHour(new Date().getHours()), [])

  const { text, emoji } = getGreeting(hour)

  return (
    <div className="flex flex-col space-y-6 w-full pb-32">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            {text},<br />
            {data.userName} <span className="inline-block hover:animate-waving-hand origin-bottom-right">{emoji}</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">
            You&apos;ve got a focused day ahead.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 mt-1">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-[22px] w-[22px]" strokeWidth={2} />
          </button>
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm cursor-pointer">
            <AvatarImage src={userImage ?? session?.user?.image ?? undefined} />
            <AvatarFallback className="text-sm bg-indigo-50 text-indigo-700 font-bold">
              {data.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Today's Focus Card */}
      <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-[15px]">Today&apos;s Focus</h2>
          </div>
          <Link href="/planner" className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-indigo-600 transition-colors font-medium">
            3 Priorities <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {[
            { title: 'Finish product strategy deck', time: '9:00 AM', done: false },
            { title: 'Client meeting', time: '11:30 AM', done: false },
            { title: 'Workout', time: '6:30 PM', done: false },
          ].map((task, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                {task.done ? (
                  <CheckCircle2 className="h-[18px] w-[18px] text-indigo-500" />
                ) : (
                  <Circle className="h-[18px] w-[18px] text-gray-300 group-hover:text-indigo-400 transition-colors" />
                )}
                <span className={cn("text-[15px] font-medium transition-colors", task.done ? "text-gray-400 line-through" : "text-gray-700 group-hover:text-gray-900")}>
                  {task.title}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-indigo-500">{task.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split Row: Payment & Mood */}
      <div className="grid grid-cols-2 gap-4">
        {/* Payment Card */}
        <div className="bg-white rounded-[20px] p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-2">Upcoming Payment</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">$125.00</p>
          <p className="text-[12px] text-gray-500 leading-snug mb-3 flex-1">
            Netflix Subscription<br />due in 2 days
          </p>
          <p className="text-[11px] font-medium text-gray-400 mt-auto">Due 24 May</p>
        </div>

        {/* Mood Card */}
        <div className="bg-white rounded-[20px] p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-2">Mood Check-in</h3>
          <p className="text-[12px] text-gray-500 leading-snug mb-3">
            How are you<br />feeling today?
          </p>
          <div className="flex items-center justify-between mb-3 mt-auto">
            {['😄', '🙂', '😐', '😔'].map(e => (
              <button key={e} className="text-xl hover:scale-110 transition-transform grayscale hover:grayscale-0 active:scale-95">
                {e}
              </button>
            ))}
          </div>
          <button className="w-full py-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold hover:bg-indigo-600 transition-colors shadow-sm">
            Very Good
          </button>
        </div>
      </div>

      {/* AI Suggestion Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-indigo-50/80 rounded-[20px] p-5 border border-indigo-100/60 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4">
          <button className="text-indigo-300 hover:text-indigo-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-[18px] w-[18px] text-indigo-500 fill-indigo-100" />
          <h3 className="text-[14px] font-bold text-indigo-900">AI Suggestion</h3>
        </div>
        <p className="text-[13.5px] text-indigo-800/80 leading-relaxed font-medium mb-4 pr-6">
          You have 2 back-to-back meetings. Want me to block 15 min break?
        </p>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95">
          Yes, Block Break
        </button>
      </div>

      {/* Family Reminder Card */}
      <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-gray-900 mb-1">Family Reminder</h3>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Emma&apos;s swimming class today<br />at 5:00 PM
          </p>
        </div>
        <div className="flex -space-x-2 shrink-0">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">EM</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">PA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
