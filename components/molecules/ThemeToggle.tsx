'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
  variant?: 'default' | 'compact' | 'icon-only'
}

export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-white/5",
        variant === 'icon-only' && "p-2",
        className
      )}>
        <div className="w-5 h-5 bg-gray-600 rounded animate-pulse" />
        {variant !== 'icon-only' && (
          <div className="w-12 h-4 bg-gray-600 rounded animate-pulse" />
        )}
      </div>
    )
  }

  const isDark = theme === 'dark'

  if (variant === 'icon-only') {
    return (
      <motion.button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "p-2 rounded-lg transition-all",
          isDark
            ? "bg-white/5 hover:bg-white/10 text-yellow-400"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700",
          className
        )}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.button>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          isDark
            ? "bg-white/5 hover:bg-white/10 text-gray-300"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700",
          className
        )}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" />
        )}
        <span className="text-sm font-medium font-diatype">
          {isDark ? 'Light' : 'Dark'}
        </span>
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all group",
        isDark
          ? "hover:bg-white/5 text-gray-400 hover:text-white"
          : "hover:bg-gray-200 text-gray-600 hover:text-gray-900",
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
        isDark
          ? "bg-white/5 group-hover:bg-yellow-500/10"
          : "bg-gray-200 group-hover:bg-blue-500/10"
      )}>
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600" />
        )}
      </div>
      <span className="text-sm font-medium font-diatype">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </motion.button>
  )
}
