'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button, ButtonProps, Icon } from '../atoms'
import { cn } from '../../utils/cn'

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: LucideIcon
  label: string // For accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      xs: 'xs' as const,
      sm: 'xs' as const,
      md: 'sm' as const,
      lg: 'md' as const
    }

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('!p-2', className)}
        aria-label={label}
        {...props}
      >
        <Icon icon={icon} size={iconSizes[size]} />
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'