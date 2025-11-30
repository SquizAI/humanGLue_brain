'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'md',
    error = false,
    icon,
    iconPosition = 'left',
    type = 'text',
    ...props
  }, ref) => {
    // Theme-aware input variants using CSS variables
    const variants = {
      default: cn(
        'hg-bg-secondary',
        'hg-text-primary',
        'hg-border border',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:border-[var(--hg-cyan-border)]',
        'focus:ring-1 focus:ring-[var(--hg-cyan-border)]'
      ),
      filled: cn(
        'bg-[var(--hg-bg-hover)]',
        'hg-text-primary',
        'border-transparent',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:bg-[var(--hg-bg-secondary)]',
        'focus:border-[var(--hg-cyan-border)]'
      ),
      outline: cn(
        'bg-transparent',
        'hg-text-primary',
        'hg-border border',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:border-[var(--hg-cyan-text)]'
      )
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : ''

    const iconPadding = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : ''

    if (icon) {
      return (
        <div className="relative">
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 hg-text-muted',
              iconPosition === 'left' ? 'left-3' : 'right-3'
            )}
          >
            {icon}
          </span>
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full rounded-lg transition-colors duration-200',
              'outline-none',
              variants[variant],
              sizes[inputSize],
              errorClasses,
              iconPadding,
              className
            )}
            {...props}
          />
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-lg transition-colors duration-200',
          'outline-none',
          variants[variant],
          sizes[inputSize],
          errorClasses,
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

// Textarea component
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'md',
    error = false,
    ...props
  }, ref) => {
    const variants = {
      default: cn(
        'hg-bg-secondary',
        'hg-text-primary',
        'hg-border border',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:border-[var(--hg-cyan-border)]',
        'focus:ring-1 focus:ring-[var(--hg-cyan-border)]'
      ),
      filled: cn(
        'bg-[var(--hg-bg-hover)]',
        'hg-text-primary',
        'border-transparent',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:bg-[var(--hg-bg-secondary)]',
        'focus:border-[var(--hg-cyan-border)]'
      ),
      outline: cn(
        'bg-transparent',
        'hg-text-primary',
        'hg-border border',
        'placeholder:text-[var(--hg-text-muted)]',
        'focus:border-[var(--hg-cyan-text)]'
      )
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : ''

    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg transition-colors duration-200',
          'outline-none resize-none',
          'min-h-[100px]',
          variants[variant],
          sizes[inputSize],
          errorClasses,
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

// Label component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({
  children,
  className,
  required = false,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium',
        'hg-text-primary',
        'mb-1.5 block',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}
