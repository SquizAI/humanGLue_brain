'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'pulse' | 'orbit' | 'dna' | 'neural'
  className?: string
  text?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'neural',
  className,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  if (variant === 'neural') {
    // Neural network inspired loader - nodes connecting
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Central core */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50" />
          </motion.div>

          {/* Orbiting nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={angle}
              className="absolute inset-0"
              animate={{ rotate: [angle, angle + 360] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <div className={cn(
                  'rounded-full',
                  i % 2 === 0
                    ? 'w-2 h-2 bg-cyan-400 shadow-lg shadow-cyan-400/50'
                    : 'w-1.5 h-1.5 bg-blue-400 shadow-lg shadow-blue-400/50'
                )} />
              </motion.div>
            </motion.div>
          ))}

          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r={20 + i * 12}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                animate={{ rotate: [0, i % 2 === 0 ? 360 : -360] }}
                transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: 'center' }}
              />
            ))}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-500/10"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        {text && (
          <motion.p
            className={cn('text-gray-400 font-diatype', textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  if (variant === 'dna') {
    // DNA helix inspired loader
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                rotateY: [0, 360],
                z: [0, 20, 0, -20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className={cn(
                  'rounded-full',
                  i % 2 === 0 ? 'bg-cyan-400' : 'bg-blue-500',
                  size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
                )}
                style={{
                  transform: `translateY(${(i - 3.5) * (size === 'sm' ? 4 : size === 'md' ? 6 : 8)}px)`,
                  boxShadow: i % 2 === 0 ? '0 0 10px #22d3ee' : '0 0 10px #3b82f6',
                }}
              />
            </motion.div>
          ))}
        </div>
        {text && (
          <motion.p
            className={cn('text-gray-400 font-diatype', textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  if (variant === 'orbit') {
    // Orbital loader with multiple rings
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          </motion.div>

          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-blue-500/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
          </motion.div>

          {/* Inner ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-purple-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
          </motion.div>

          {/* Center dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-white shadow-lg" />
          </motion.div>
        </div>
        {text && (
          <motion.p
            className={cn('text-gray-400 font-diatype', textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    // Pulsing concentric circles
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-cyan-500"
              animate={{
                scale: [1, 2],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>
        </div>
        {text && (
          <motion.p
            className={cn('text-gray-400 font-diatype', textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  // Default spinner - morphing shape
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <motion.div
        className={cn(
          'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500',
          sizeClasses[size]
        )}
        animate={{
          borderRadius: ['20%', '50%', '20%'],
          rotate: [0, 180, 360],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
        }}
      />
      {text && (
        <motion.p
          className={cn('text-gray-400 font-diatype', textSizes[size])}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Content area loader - shows in main content while sidebar stays visible
export function ContentLoader({
  text = 'Loading...',
  variant = 'neural',
  size = 'lg'
}: {
  text?: string
  variant?: 'default' | 'pulse' | 'orbit' | 'dna' | 'neural'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <LoadingSpinner variant={variant} size={size} text={text} />
    </div>
  )
}

// Page skeleton loader - shows structure while content loads
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-white/10 rounded-lg" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/10 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-6 w-16 bg-white/10 rounded" />
              </div>
            </div>
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
