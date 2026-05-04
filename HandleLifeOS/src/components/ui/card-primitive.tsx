import * as React from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'elevated' | 'interactive' | 'sunken' | 'ghost'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const VARIANT_CLASS: Record<CardVariant, string> = {
  default:     'card',
  elevated:    'card-elevated',
  interactive: 'card-interactive cursor-pointer',
  sunken:      'rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-sunken)]',
  ghost:       'rounded-2xl',
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5 sm:p-6',
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  asChild?: boolean
}

/**
 * The single source of truth for surface elevation in the OS.
 * Replaces ad-hoc combinations of bg-white/border/shadow that have drifted.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(VARIANT_CLASS[variant], PADDING_CLASS[padding], className)}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between gap-3 mb-3', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

export const CardEyebrow = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('eyebrow', className)} {...props} />
  ),
)
CardEyebrow.displayName = 'CardEyebrow'
