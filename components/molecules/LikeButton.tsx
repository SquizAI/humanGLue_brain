'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useSocial, type ItemType } from '@/lib/contexts/SocialContext'
import { cn } from '@/utils/cn'
import { useState, useEffect } from 'react'

interface LikeButtonProps {
  id: string
  type: ItemType
  variant?: 'default' | 'compact' | 'icon-only'
  showCount?: boolean
  className?: string
  showToast?: boolean
}

export function LikeButton({
  id,
  type,
  variant = 'default',
  showCount = true,
  className,
  showToast = true
}: LikeButtonProps) {
  const { isLiked, toggleLike, getLikeCount } = useSocial()
  const [showNotification, setShowNotification] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const liked = isLiked(id, type)
  const likeCount = getLikeCount(id, type)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleLike(id, type)
    setIsAnimating(true)

    if (showToast && !liked) {
      setShowNotification(true)
    }

    setTimeout(() => setIsAnimating(false), 600)
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
    liked
      ? 'bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30'
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
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <motion.div
          animate={
            isAnimating && liked
              ? {
                  scale: [1, 1.3, 1],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            times: [0, 0.4, 1]
          }}
          className="relative"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-all duration-300',
              liked ? 'fill-current' : 'group-hover:scale-110'
            )}
          />

          {/* Pulse effect on like */}
          {isAnimating && liked && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full"
            >
              <Heart className="w-5 h-5 fill-current text-pink-400" />
            </motion.div>
          )}
        </motion.div>

        {variant !== 'icon-only' && showCount && (
          <span className="text-sm font-medium">
            {likeCount > 0 ? likeCount.toLocaleString() : 'Like'}
          </span>
        )}

        {variant !== 'icon-only' && !showCount && (
          <span className="text-sm font-medium">
            {liked ? 'Liked' : 'Like'}
          </span>
        )}

        {/* Tooltip for icon-only variant */}
        {variant === 'icon-only' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {liked ? 'Unlike' : 'Like'} {showCount && likeCount > 0 && `(${likeCount.toLocaleString()})`}
          </div>
        )}
      </motion.button>

      {/* Toast Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 border border-pink-500/30 rounded-lg shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-current text-pink-400" />
            <span className="text-sm font-medium text-white">
              Added to liked items!
            </span>
          </div>
        </motion.div>
      )}
    </>
  )
}
