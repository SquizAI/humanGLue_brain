'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { ReactNode, HTMLAttributes } from 'react'

type TextElement = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'muted' | 'cyan' | 'error' | 'success' | 'warning' | 'label' | 'caption'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  as?: TextElement
  animate?: boolean
}

export function Text({
  children,
  className,
  variant = 'primary',
  size = 'md',
  weight = 'normal',
  as = 'p',
  animate = false,
  ...props
}: TextProps) {
  const Component = animate ? (motion[as] as any) : as

  // Use CSS variables for theme-aware colors
  const variants = {
    primary: 'hg-text-primary',
    secondary: 'hg-text-secondary',
    muted: 'hg-text-muted',
    cyan: 'hg-text-cyan',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-emerald-500 dark:text-emerald-400',
    warning: 'text-amber-500 dark:text-amber-400',
    label: 'hg-text-primary',
    caption: 'hg-text-muted'
  }

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const baseProps = {
    className: cn(
      variants[variant],
      sizes[size],
      weights[weight],
      className
    ),
    ...props
  }

  if (animate) {
    return (
      <Component {...baseProps}>
        {children}
      </Component>
    )
  }

  const Tag = as
  return (
    <Tag {...baseProps}>
      {children}
    </Tag>
  )
}

// Specialized heading components for convenience
export function Heading({
  children,
  level = 1,
  className,
  ...props
}: TextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const sizes: Record<number, TextProps['size']> = {
    1: '4xl',
    2: '3xl',
    3: '2xl',
    4: 'xl',
    5: 'lg',
    6: 'md'
  }

  return (
    <Text
      as={`h${level}` as TextElement}
      size={sizes[level]}
      weight="bold"
      className={cn('tracking-tight', className)}
      {...props}
    >
      {children}
    </Text>
  )
}
