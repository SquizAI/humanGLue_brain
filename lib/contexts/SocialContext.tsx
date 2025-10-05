'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

export type ItemType = 'course' | 'workshop' | 'expert' | 'resource'

export interface SocialItem {
  id: string
  type: ItemType
  name: string
  image?: string
  metadata?: {
    instructor?: string
    duration?: string
    date?: string
    expertise?: string
    category?: string
    price?: number
    [key: string]: any
  }
}

export interface SocialStats {
  likes: number
  shares: number
  saves: number
}

interface SocialContextType {
  // Saved/Bookmarked items
  savedItems: SocialItem[]
  isSaved: (id: string, type: ItemType) => boolean
  toggleSave: (item: SocialItem) => void
  removeSaved: (id: string, type: ItemType) => void
  getSavedByType: (type: ItemType) => SocialItem[]
  savedCount: number

  // Liked items
  likedItems: Set<string>
  isLiked: (id: string, type: ItemType) => boolean
  toggleLike: (id: string, type: ItemType) => void
  likedCount: number

  // Share tracking
  shareItem: (id: string, type: ItemType, platform?: string) => void
  getShareCount: (id: string, type: ItemType) => number

  // Stats
  getStats: (id: string, type: ItemType) => SocialStats
  getLikeCount: (id: string, type: ItemType) => number
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

// Mock stats data (in production, this would come from an API)
const MOCK_STATS: Record<string, SocialStats> = {
  'course-1': { likes: 342, shares: 87, saves: 156 },
  'course-2': { likes: 289, shares: 63, saves: 134 },
  'course-3': { likes: 412, shares: 95, saves: 201 },
  'workshop-1': { likes: 178, shares: 42, saves: 89 },
  'workshop-2': { likes: 234, shares: 56, saves: 112 },
  'expert-1': { likes: 456, shares: 98, saves: 223 },
  'expert-2': { likes: 389, shares: 76, saves: 167 },
  'resource-1': { likes: 267, shares: 54, saves: 134 },
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SocialItem[]>([])
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({})
  const [localStats, setLocalStats] = useState<Record<string, SocialStats>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('humanglue_saved')
      const likedData = localStorage.getItem('humanglue_liked')
      const shareData = localStorage.getItem('humanglue_shares')
      const statsData = localStorage.getItem('humanglue_stats')

      if (savedData) {
        setSavedItems(JSON.parse(savedData))
      }
      if (likedData) {
        setLikedItems(new Set(JSON.parse(likedData)))
      }
      if (shareData) {
        setShareCounts(JSON.parse(shareData))
      }
      if (statsData) {
        setLocalStats(JSON.parse(statsData))
      } else {
        // Initialize with mock data
        setLocalStats(MOCK_STATS)
      }
    } catch (error) {
      console.error('Error loading social data:', error)
      setLocalStats(MOCK_STATS)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('humanglue_saved', JSON.stringify(savedItems))
      } catch (error) {
        console.error('Error saving bookmarks:', error)
      }
    }
  }, [savedItems, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('humanglue_liked', JSON.stringify(Array.from(likedItems)))
      } catch (error) {
        console.error('Error saving likes:', error)
      }
    }
  }, [likedItems, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('humanglue_shares', JSON.stringify(shareCounts))
        localStorage.setItem('humanglue_stats', JSON.stringify(localStats))
      } catch (error) {
        console.error('Error saving stats:', error)
      }
    }
  }, [shareCounts, localStats, isLoaded])

  const getItemKey = (id: string, type: ItemType) => `${type}-${id}`

  // Saved/Bookmark functions
  const isSaved = useCallback((id: string, type: ItemType) => {
    return savedItems.some(item => item.id === id && item.type === type)
  }, [savedItems])

  const toggleSave = useCallback((item: SocialItem) => {
    setSavedItems(prev => {
      const exists = prev.some(i => i.id === item.id && i.type === item.type)
      if (exists) {
        return prev.filter(i => !(i.id === item.id && i.type === item.type))
      } else {
        // Increment save count in stats
        const key = getItemKey(item.id, item.type)
        setLocalStats(prevStats => ({
          ...prevStats,
          [key]: {
            ...(prevStats[key] || { likes: 0, shares: 0, saves: 0 }),
            saves: (prevStats[key]?.saves || 0) + 1
          }
        }))
        return [...prev, item]
      }
    })
  }, [])

  const removeSaved = useCallback((id: string, type: ItemType) => {
    setSavedItems(prev => prev.filter(item => !(item.id === id && item.type === type)))
    // Decrement save count
    const key = getItemKey(id, type)
    setLocalStats(prevStats => ({
      ...prevStats,
      [key]: {
        ...(prevStats[key] || { likes: 0, shares: 0, saves: 0 }),
        saves: Math.max(0, (prevStats[key]?.saves || 0) - 1)
      }
    }))
  }, [])

  const getSavedByType = useCallback((type: ItemType) => {
    return savedItems.filter(item => item.type === type)
  }, [savedItems])

  // Like functions
  const isLiked = useCallback((id: string, type: ItemType) => {
    return likedItems.has(getItemKey(id, type))
  }, [likedItems])

  const toggleLike = useCallback((id: string, type: ItemType) => {
    const key = getItemKey(id, type)
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
        // Decrement like count
        setLocalStats(prevStats => ({
          ...prevStats,
          [key]: {
            ...(prevStats[key] || { likes: 0, shares: 0, saves: 0 }),
            likes: Math.max(0, (prevStats[key]?.likes || 0) - 1)
          }
        }))
      } else {
        newSet.add(key)
        // Increment like count
        setLocalStats(prevStats => ({
          ...prevStats,
          [key]: {
            ...(prevStats[key] || { likes: 0, shares: 0, saves: 0 }),
            likes: (prevStats[key]?.likes || 0) + 1
          }
        }))
      }
      return newSet
    })
  }, [])

  // Share functions
  const shareItem = useCallback((id: string, type: ItemType, platform?: string) => {
    const key = getItemKey(id, type)
    setShareCounts(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }))
    // Increment share count in stats
    setLocalStats(prevStats => ({
      ...prevStats,
      [key]: {
        ...(prevStats[key] || { likes: 0, shares: 0, saves: 0 }),
        shares: (prevStats[key]?.shares || 0) + 1
      }
    }))
  }, [])

  const getShareCount = useCallback((id: string, type: ItemType) => {
    const key = getItemKey(id, type)
    return shareCounts[key] || 0
  }, [shareCounts])

  // Stats functions
  const getStats = useCallback((id: string, type: ItemType): SocialStats => {
    const key = getItemKey(id, type)
    return localStats[key] || { likes: 0, shares: 0, saves: 0 }
  }, [localStats])

  const getLikeCount = useCallback((id: string, type: ItemType) => {
    const stats = getStats(id, type)
    return stats.likes
  }, [getStats])

  const value: SocialContextType = {
    savedItems,
    isSaved,
    toggleSave,
    removeSaved,
    getSavedByType,
    savedCount: savedItems.length,
    likedItems,
    isLiked,
    toggleLike,
    likedCount: likedItems.size,
    shareItem,
    getShareCount,
    getStats,
    getLikeCount,
  }

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider')
  }
  return context
}
