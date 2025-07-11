'use client'

import { LucideIcon } from 'lucide-react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface IconProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
}

export function Icon({ icon: IconComponent, size = 'md', color, className, ...props }: IconProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <IconComponent 
        size={sizeMap[size]} 
        color={color}
        className="shrink-0"
      />
    </motion.div>
  )
}