'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ariaLabel?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
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
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-neon-blue to-neon-cyan text-white hover:shadow-[0_0_20px_rgba(0,149,255,0.5)] disabled:from-gray-600 disabled:to-gray-700',
      secondary: 'bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:border-white/20 hover:bg-white/10',
      ghost: 'bg-transparent hover:bg-white/5 text-white',
      danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(255,0,128,0.5)] disabled:from-gray-600 disabled:to-gray-700',
      gradient: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-humanglue-blue',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'flex items-center justify-center gap-2',
          'font-gendy',
          variants[variant],
          sizes[size],
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

const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const spinnerSizes = {
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