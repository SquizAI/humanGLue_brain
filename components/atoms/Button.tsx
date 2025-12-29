'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

/**
 * Button Component
 *
 * WHITE-LABEL READY: All button variants use CSS variables that can be customized
 * per-organization. The 'primary' variant uses --hg-cyan-text which maps to
 * org-primary when organization branding is active.
 *
 * Variants:
 * - primary: Main CTA button (uses brand primary color)
 * - cyan: Solid cyan button
 * - secondary: Glass effect secondary button
 * - ghost: Transparent hover button
 * - outline: Bordered button
 * - danger: Destructive action button
 * - success: Positive action button
 * - info: Informational button
 * - gradient: Purple to blue gradient
 */
export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan' | 'outline' | 'gradient' | 'success' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ariaLabel?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ariaLabel,
    ariaPressed,
    ariaExpanded,
    fullWidth = false,
    ...props
  }, ref) => {
    // Theme-aware button variants using CSS variables for white-label support
    const variants = {
      // Primary - uses CSS variable-based gradient (brand color)
      // WHITE-LABEL: Inherits from --hg-cyan-text which maps to org-primary
      primary: cn(
        'hg-btn-primary',
        'disabled:opacity-50 disabled:bg-gray-500'
      ),
      // Cyan variant - solid cyan
      cyan: cn(
        'bg-[var(--hg-cyan-text)]',
        'text-black dark:text-black',
        'hover:opacity-90',
        'hover:shadow-[0_0_20px_rgba(97,216,254,0.5)]',
        'disabled:bg-gray-500'
      ),
      // Secondary - glass effect with theme colors
      secondary: cn(
        'hg-bg-secondary',
        'hg-text-primary',
        'hg-border border',
        'hover:bg-[var(--hg-bg-hover)]',
        'backdrop-blur-sm'
      ),
      // Ghost - transparent with hover
      ghost: cn(
        'bg-transparent',
        'hg-text-secondary',
        'hover:bg-[var(--hg-bg-hover)]',
        'hover:hg-text-primary'
      ),
      // Outline - bordered
      outline: cn(
        'bg-transparent',
        'hg-text-primary',
        'hg-border border',
        'hover:bg-[var(--hg-bg-hover)]'
      ),
      // Danger - uses CSS variable-based gradient
      danger: cn(
        'hg-btn-danger',
        'disabled:opacity-50 disabled:bg-gray-500'
      ),
      // Success - uses CSS variable-based gradient
      success: cn(
        'hg-btn-success',
        'disabled:opacity-50 disabled:bg-gray-500'
      ),
      // Info - uses CSS variable-based gradient
      info: cn(
        'hg-btn-info',
        'disabled:opacity-50 disabled:bg-gray-500'
      ),
      // Gradient - purple to blue gradient (static, not white-label)
      gradient: cn(
        'bg-gradient-to-r from-purple-600 to-blue-600',
        'text-white',
        'hover:from-purple-700 hover:to-blue-700',
        'hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]',
        'disabled:from-gray-500 disabled:to-gray-600'
      )
    }

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500',
          'dark:focus:ring-offset-black',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

const LoadingSpinner = ({ size }: { size: 'xs' | 'sm' | 'md' | 'lg' }) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
