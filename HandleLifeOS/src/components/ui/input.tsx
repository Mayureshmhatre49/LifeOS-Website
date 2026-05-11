import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'focus:outline-none focus:shadow-[var(--shadow-focus)] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-[var(--duration-fast)]',
            error && 'border-[var(--color-danger-500)] focus:shadow-[0_0_0_3px_var(--color-danger-50)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--color-danger-500)]" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
