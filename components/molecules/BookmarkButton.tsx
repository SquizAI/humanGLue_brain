'use client'

import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useSocial, type SocialItem } from '@/lib/contexts/SocialContext'
import { cn } from '@/utils/cn'
import { useState, useEffect } from 'react'

interface BookmarkButtonProps {
  item: SocialItem
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
  showToast?: boolean
}

export function BookmarkButton({
  item,
  variant = 'default',
  className,
  showToast = true
}: BookmarkButtonProps) {
  const { isSaved, toggleSave } = useSocial()
  const [showNotification, setShowNotification] = useState(false)
  const saved = isSaved(item.id, item.type)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleSave(item)

    if (showToast) {
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 2000)
    }
  }

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  const baseClasses = cn(
    'group relative flex items-center gap-2 rounded-lg transition-all duration-300',
    variant === 'icon-only' ? 'p-2' : 'px-3 py-2',
    saved
      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30'
      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20',
    className
  )

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={baseClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={saved ? 'Remove bookmark' : 'Bookmark'}
      >
        <motion.div
          initial={false}
          animate={{
            scale: saved ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut'
          }}
        >
          <Bookmark
            className={cn(
              'w-5 h-5 transition-all duration-300',
              saved ? 'fill-current' : 'group-hover:scale-110'
            )}
          />
        </motion.div>

        {variant !== 'icon-only' && (
          <span className="text-sm font-medium">
            {saved ? 'Saved' : 'Save'}
          </span>
        )}

        {/* Tooltip for icon-only variant */}
        {variant === 'icon-only' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {saved ? 'Remove bookmark' : 'Bookmark'}
          </div>
        )}
      </motion.button>

      {/* Toast Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 border border-blue-500/30 rounded-lg shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 fill-current text-blue-400" />
            <span className="text-sm font-medium text-white">
              {saved ? 'Saved to your collection!' : 'Removed from saved'}
            </span>
          </div>
        </motion.div>
      )}
    </>
  )
}
