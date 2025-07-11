'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface InputProps extends Omit<HTMLMotionProps<"input">, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  icon?: React.ReactNode
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', error = false, icon, ...props }, ref) => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-4 py-3 text-lg'
    }

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={cn(
            'w-full rounded-lg border glass',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-all duration-200',
            'placeholder:text-gray-500',
            error 
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
              : 'border-white/10 focus:ring-neon-blue/50 focus:border-neon-blue/50',
            sizes[size],
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'