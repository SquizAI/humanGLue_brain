'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Link2, Mail, Linkedin, Twitter, Facebook, Check, X } from 'lucide-react'
import { useSocial, type ItemType } from '@/lib/contexts/SocialContext'
import { cn } from '@/utils/cn'
import { useState, useEffect } from 'react'

interface ShareButtonProps {
  id: string
  type: ItemType
  title: string
  description?: string
  variant?: 'default' | 'compact' | 'icon-only'
  showCount?: boolean
  className?: string
}

export function ShareButton({
  id,
  type,
  title,
  description,
  variant = 'default',
  showCount = true,
  className
}: ShareButtonProps) {
  const { shareItem, getStats } = useSocial()
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const stats = getStats(id, type)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${type}s/${id}`
    : ''

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      shareItem(id, type, 'link')
      setShowNotification(true)
      setTimeout(() => {
        setCopied(false)
        setShowModal(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleShare = (platform: string) => {
    shareItem(id, type, platform)

    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || title)

    let url = ''

    switch (platform) {
      case 'email':
        url = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      setTimeout(() => setShowModal(false), 500)
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
    'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20',
    className
  )

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Link2,
      action: handleCopyLink,
      color: copied ? 'text-green-400' : 'text-blue-400',
      bgColor: copied ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => handleShare('email'),
      color: 'text-gray-400',
      bgColor: 'bg-white/5 border-white/10'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => handleShare('linkedin'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => handleShare('twitter'),
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => handleShare('facebook'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10 border-blue-600/20'
    }
  ]

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={baseClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />

        {variant !== 'icon-only' && showCount && stats.shares > 0 && (
          <span className="text-sm font-medium">
            {stats.shares.toLocaleString()}
          </span>
        )}

        {variant !== 'icon-only' && !showCount && (
          <span className="text-sm font-medium">Share</span>
        )}

        {/* Tooltip for icon-only variant */}
        {variant === 'icon-only' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Share {showCount && stats.shares > 0 && `(${stats.shares.toLocaleString()})`}
          </div>
        )}
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Share</h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Title */}
                <p className="text-sm text-gray-300 mb-6 line-clamp-2">
                  {title}
                </p>

                {/* Share Options Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {shareOptions.slice(0, 3).map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.name}
                        onClick={option.action}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                          option.bgColor,
                          'hover:brightness-110'
                        )}
                      >
                        <Icon className={cn('w-6 h-6', option.color)} />
                        <span className="text-xs font-medium text-white">
                          {option.name}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Social Media */}
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.slice(3).map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.name}
                        onClick={option.action}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all',
                          option.bgColor,
                          'hover:brightness-110'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', option.color)} />
                        <span className="text-sm font-medium text-white">
                          {option.name}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Copy Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 border border-green-500/30 rounded-lg shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">
              Link copied to clipboard!
            </span>
          </div>
        </motion.div>
      )}
    </>
  )
}
