'use client'

import { Heart, Share2, Bookmark } from 'lucide-react'
import { useSocial, type ItemType } from '@/lib/contexts/SocialContext'
import { cn } from '@/utils/cn'

interface SocialStatsProps {
  id: string
  type: ItemType
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
  showIcons?: boolean
}

export function SocialStats({
  id,
  type,
  variant = 'default',
  className,
  showIcons = true
}: SocialStatsProps) {
  const { getStats } = useSocial()
  const stats = getStats(id, type)

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-4 text-xs text-gray-400', className)}>
        {stats.likes > 0 && (
          <span>{formatCount(stats.likes)} likes</span>
        )}
        {stats.shares > 0 && (
          <span>{formatCount(stats.shares)} shares</span>
        )}
        {stats.saves > 0 && (
          <span>{formatCount(stats.saves)} saves</span>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {stats.likes > 0 && (
          <div className="flex items-center gap-1">
            {showIcons && <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />}
            <span className="text-xs text-gray-400">{formatCount(stats.likes)}</span>
          </div>
        )}
        {stats.shares > 0 && (
          <div className="flex items-center gap-1">
            {showIcons && <Share2 className="w-3.5 h-3.5 text-blue-400" />}
            <span className="text-xs text-gray-400">{formatCount(stats.shares)}</span>
          </div>
        )}
        {stats.saves > 0 && (
          <div className="flex items-center gap-1">
            {showIcons && <Bookmark className="w-3.5 h-3.5 text-blue-400 fill-current" />}
            <span className="text-xs text-gray-400">{formatCount(stats.saves)}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Likes */}
      <div className="flex items-center gap-2">
        {showIcons && (
          <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
            <Heart className="w-4 h-4 text-pink-400 fill-current" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {formatCount(stats.likes)}
          </span>
          <span className="text-xs text-gray-400">Likes</span>
        </div>
      </div>

      {/* Shares */}
      <div className="flex items-center gap-2">
        {showIcons && (
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Share2 className="w-4 h-4 text-blue-400" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {formatCount(stats.shares)}
          </span>
          <span className="text-xs text-gray-400">Shares</span>
        </div>
      </div>

      {/* Saves */}
      <div className="flex items-center gap-2">
        {showIcons && (
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Bookmark className="w-4 h-4 text-blue-400 fill-current" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {formatCount(stats.saves)}
          </span>
          <span className="text-xs text-gray-400">Saved</span>
        </div>
      </div>
    </div>
  )
}
