import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
        outline:
          'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100',
        ghost:
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        link:
          'text-indigo-600 underline-offset-4 hover:underline p-0 h-auto font-normal',
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
