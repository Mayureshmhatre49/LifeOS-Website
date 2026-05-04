import Link from 'next/link'
import { Plus, DollarSign, MessageSquare, Users } from 'lucide-react'

const ONBOARDING_STEPS = [
  {
    icon: <Plus className="h-5 w-5 text-indigo-600" />,
    bg: 'bg-indigo-50 border-indigo-100',
    title: 'Add your first task',
    description: 'Plan your day with AI-powered task prioritization.',
    href: '/planner',
    cta: 'Open Planner',
  },
  {
    icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
    bg: 'bg-emerald-50 border-emerald-100',
    title: 'Track your spending',
    description: 'Set a budget and log your first expense.',
    href: '/money',
    cta: 'Open Money',
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-violet-600" />,
    bg: 'bg-violet-50 border-violet-100',
    title: 'Ask your AI assistant',
    description: 'Chat about anything — plans, advice, decisions.',
    href: '/chat',
    cta: 'Start chatting',
  },
  {
    icon: <Users className="h-5 w-5 text-pink-600" />,
    bg: 'bg-pink-50 border-pink-100',
    title: 'Set up family mode',
    description: 'Share tasks, grocery lists and calendars.',
    href: '/family',
    cta: 'Family board',
  },
]

export function EmptyDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-8 py-4">
      {/* Welcome message */}
      <div className="text-center space-y-2 pt-4">
        <div className="text-4xl">👋</div>
        <h2 className="text-xl font-bold text-gray-900">Welcome to Life OS, {userName}!</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Your personal AI-powered life assistant. Get started by setting up one of these modules — your dashboard will come alive.
        </p>
      </div>

      {/* Onboarding cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ONBOARDING_STEPS.map(step => (
          <Link
            key={step.href}
            href={step.href}
            className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200"
            onClick={() => console.info('[Analytics] onboarding_cta_clicked', step.href)}
          >
            <div className={`inline-flex rounded-xl border p-3 mb-3 ${step.bg}`}>
              {step.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{step.description}</p>
            <span className="text-xs font-medium text-indigo-500 group-hover:text-indigo-700 transition-colors">
              {step.cta} →
            </span>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        Your data stays private and syncs across devices.
      </p>
    </div>
  )
}
