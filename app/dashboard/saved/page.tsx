'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Search, Trash2, ShoppingCart, GraduationCap, Calendar, Users, FileText, Sparkles } from 'lucide-react'
import { useSocial, type ItemType } from '@/lib/contexts/SocialContext'
import { useCart } from '@/lib/contexts/CartContext'
import { BookmarkButton } from '@/components/molecules/BookmarkButton'
import { LikeButton } from '@/components/molecules/LikeButton'
import { ShareButton } from '@/components/molecules/ShareButton'
import { cn } from '@/utils/cn'
import Image from 'next/image'

type TabType = 'all' | ItemType

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'all', label: 'All', icon: Bookmark },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'workshop', label: 'Workshops', icon: Calendar },
  { id: 'expert', label: 'Experts', icon: Users },
  { id: 'resource', label: 'Resources', icon: FileText },
]

export default function SavedItemsPage() {
  const { savedItems, getSavedByType, removeSaved } = useSocial()
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = activeTab === 'all'
    ? savedItems
    : getSavedByType(activeTab)

  const searchedItems = filteredItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      type: item.type === 'expert' ? 'consultation' : item.type,
      name: item.name,
      description: item.metadata?.description || `Amazing ${item.type}`,
      price: item.metadata?.price || 199,
      image: item.image || '/placeholder.jpg',
      metadata: item.metadata
    })
  }

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case 'course': return GraduationCap
      case 'workshop': return Calendar
      case 'expert': return Users
      case 'resource': return FileText
      default: return Bookmark
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bookmark className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Saved Items
              </h1>
              <p className="text-gray-400 mt-1">
                {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const count = tab.id === 'all'
                ? savedItems.length
                : getSavedByType(tab.id as ItemType).length

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    isActive
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      isActive ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-gray-300'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Items Grid */}
        {searchedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {searchQuery ? 'No items found' : 'No saved items yet'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start exploring courses, workshops, experts, and resources to save them here'}
            </p>
            {!searchQuery && (
              <motion.a
                href="/dashboard/learning"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Browse Courses
              </motion.a>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedItems.map((item, index) => {
              const ItemIcon = getItemIcon(item.type)
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index % 9) }}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ItemIcon className="w-16 h-16 text-white/20" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                        <ItemIcon className="w-3 h-3 text-white" />
                        <span className="text-xs font-medium text-white capitalize">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeSaved(item.id, item.type)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Metadata */}
                    <div className="space-y-1 mb-4">
                      {item.metadata?.instructor && (
                        <p className="text-sm text-gray-400">
                          by {item.metadata.instructor}
                        </p>
                      )}
                      {item.metadata?.duration && (
                        <p className="text-xs text-gray-500">
                          {item.metadata.duration}
                        </p>
                      )}
                      {item.metadata?.expertise && (
                        <p className="text-sm text-gray-400">
                          {item.metadata.expertise}
                        </p>
                      )}
                      {item.metadata?.date && (
                        <p className="text-xs text-gray-500">
                          {item.metadata.date}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <LikeButton
                        id={item.id}
                        type={item.type}
                        variant="compact"
                        showCount={false}
                        className="flex-1"
                      />
                      <ShareButton
                        id={item.id}
                        type={item.type}
                        title={item.name}
                        variant="compact"
                        showCount={false}
                        className="flex-1"
                      />

                      {/* Add to Cart - only for courses and workshops */}
                      {(item.type === 'course' || item.type === 'workshop') && (
                        <motion.button
                          onClick={() => handleAddToCart(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
