import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-brand-600)] text-[var(--color-text-inverse)] shadow-sm hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-800)]',
        secondary:
          'bg-[var(--color-gray-100)] text-[var(--color-text-primary)] hover:bg-[var(--color-gray-200)] active:bg-[var(--color-gray-300)]',
        outline:
          'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:bg-[var(--color-gray-50)] hover:border-[var(--color-border-strong)] active:bg-[var(--color-gray-100)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-gray-200)]',
        danger:
          'bg-[var(--color-danger-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-danger-700)] active:bg-[var(--color-danger-700)]',
        link:
          'text-[var(--color-brand-600)] underline-offset-4 hover:underline p-0 h-auto font-normal',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9 p-0 rounded-lg',
        'icon-sm': 'h-7 w-7 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
