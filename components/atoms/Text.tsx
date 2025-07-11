'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { ComponentPropsWithoutRef } from 'react'

type TextElement = 'p' | 'span' | 'div' | 'label'

export interface TextProps extends ComponentPropsWithoutRef<'p'> {
  variant?: 'body' | 'caption' | 'label' | 'error' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  as?: TextElement
}

export function Text({ 
  children, 
  className, 
  variant = 'body', 
  size = 'md',
  weight = 'normal',
  as = 'p',
  ...props 
}: TextProps) {
  const Component = motion[as] as any

  const variants = {
    body: 'text-gray-900 dark:text-gray-100',
    caption: 'text-gray-600 dark:text-gray-400',
    label: 'text-gray-700 dark:text-gray-300',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400'
  }

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  return (
    <Component
      className={cn(
        variants[variant],
        sizes[size],
        weights[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}