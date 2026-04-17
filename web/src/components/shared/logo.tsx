import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="2.5" fill="white" />
          <path
            d="M8 2C8 2 4 5 4 8C4 10.2 5.8 12 8 12C10.2 12 12 10.2 12 8C12 5 8 2 8 2Z"
            stroke="white"
            strokeWidth="1.2"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M3 13L13 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="font-semibold text-gray-900 tracking-tight">Life OS</span>
      )}
    </div>
  )
}
