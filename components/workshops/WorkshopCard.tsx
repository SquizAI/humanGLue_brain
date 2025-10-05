'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Video, CheckCircle, ArrowRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/CartContext'
import { BookmarkButton } from '@/components/molecules/BookmarkButton'
import { ShareButton } from '@/components/molecules/ShareButton'
import { useState } from 'react'

export interface Workshop {
  id: string
  title: string
  description: string
  instructor: {
    name: string
    title: string
    avatar: string
  }
  schedule: {
    date: string
    time: string
    duration: string // e.g., "2 hours"
  }
  format: 'live' | 'hybrid' | 'recorded'
  capacity: {
    total: number
    remaining: number
  }
  price: {
    amount: number
    earlyBird?: number
  }
  outcomes: string[]
  pillar: 'adaptability' | 'coaching' | 'marketplace'
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

interface WorkshopCardProps {
  workshop: Workshop
  variant?: 'default' | 'featured'
}

export function WorkshopCard({ workshop, variant = 'default' }: WorkshopCardProps) {
  const { addToCart, setIsCartOpen } = useCart()
  const [showToast, setShowToast] = useState(false)

  const pillarConfig = {
    adaptability: {
      gradient: 'from-blue-500 to-blue-600',
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-500/20',
      badgeText: 'text-blue-300',
      buttonGradient: 'from-blue-500 to-blue-600',
    },
    coaching: {
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-300',
      buttonGradient: 'from-amber-500 to-orange-600',
    },
    marketplace: {
      gradient: 'from-purple-500 to-purple-600',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-500/20',
      badgeText: 'text-purple-300',
      buttonGradient: 'from-purple-500 to-purple-600',
    },
  }

  const config = pillarConfig[workshop.pillar]
  const isFeatured = variant === 'featured'
  const spotsLeft = workshop.capacity.remaining
  const isLowCapacity = spotsLeft <= 5 && spotsLeft > 0
  const isSoldOut = spotsLeft === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({
      id: workshop.id,
      type: 'workshop',
      name: workshop.title,
      description: workshop.description,
      price: workshop.price.earlyBird || workshop.price.amount,
      image: workshop.instructor.avatar || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
      metadata: {
        instructor: workshop.instructor.name,
        duration: workshop.schedule.duration,
        date: workshop.schedule.date,
        pillar: workshop.pillar,
        level: workshop.level,
      },
    })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`group relative ${isFeatured ? 'md:col-span-2' : ''}`}
    >
      <div className={`
        relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5
        border ${isFeatured ? 'border-2 border-amber-500/40' : 'border-gray-700'}
        transition-all duration-300
        hover:shadow-2xl ${config.badgeText.replace('text-', 'hover:shadow-')}/30
      `}>
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold">
              ⭐ Featured
            </div>
          </div>
        )}

        {/* Capacity Badge */}
        {isLowCapacity && !isSoldOut && (
          <div className="absolute top-4 left-4 z-10">
            <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold">
              Only {spotsLeft} spots left!
            </div>
          </div>
        )}

        {isSoldOut && (
          <div className="absolute top-4 left-4 z-10">
            <div className="px-4 py-2 rounded-full bg-gray-500/20 border border-gray-500/40 text-gray-300 text-sm font-semibold">
              Sold Out
            </div>
          </div>
        )}

        {/* Social Actions - Top Right (when not featured) */}
        <div className={`absolute ${isFeatured ? 'top-16' : 'top-4'} right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <BookmarkButton
            item={{
              id: workshop.id,
              type: 'workshop',
              name: workshop.title,
              image: workshop.instructor.avatar,
              metadata: {
                instructor: workshop.instructor.name,
                duration: workshop.schedule.duration,
                date: workshop.schedule.date,
                price: workshop.price.earlyBird || workshop.price.amount,
              }
            }}
            variant="icon-only"
          />
          <ShareButton
            id={workshop.id}
            type="workshop"
            title={workshop.title}
            description={workshop.description}
            variant="icon-only"
            showCount={false}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badgeBg} border ${config.badgeBorder} ${config.badgeText}`}>
                {workshop.pillar.charAt(0).toUpperCase() + workshop.pillar.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300">
                {workshop.level}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                {workshop.format === 'live' ? (
                  <><Video className="w-4 h-4" /> Live</>
                ) : workshop.format === 'hybrid' ? (
                  <><Video className="w-4 h-4" /> Hybrid</>
                ) : (
                  <><Video className="w-4 h-4" /> Recorded</>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {workshop.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {workshop.description}
            </p>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-gray-700">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {workshop.instructor.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white">{workshop.instructor.name}</div>
              <div className="text-sm text-gray-400">{workshop.instructor.title}</div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{workshop.schedule.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{workshop.schedule.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{workshop.capacity.remaining}/{workshop.capacity.total} spots</span>
            </div>
          </div>

          {/* Outcomes */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">What You'll Learn:</h4>
            <div className="space-y-2">
              {workshop.outcomes.slice(0, 3).map((outcome, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.badgeText}`} />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {workshop.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                {workshop.price.earlyBird && (
                  <div className="text-sm text-gray-400 line-through mb-1">
                    ${workshop.price.amount}
                  </div>
                )}
                <div className="text-2xl font-bold text-white">
                  ${workshop.price.earlyBird || workshop.price.amount}
                  {workshop.price.earlyBird && (
                    <span className="ml-2 text-sm text-green-400 font-normal">
                      Early Bird
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold text-white
                  transition-all duration-300 flex items-center justify-center gap-2
                  ${isSoldOut
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }
                `}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </motion.button>

              <Link href={`/workshops/${workshop.id}`} className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSoldOut}
                  className={`
                    w-full px-4 py-3 rounded-lg font-semibold text-white
                    transition-all duration-300 flex items-center justify-center gap-2
                    ${isSoldOut
                      ? 'bg-gray-600 cursor-not-allowed'
                      : `bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:shadow-${workshop.pillar === 'adaptability' ? 'blue' : workshop.pillar === 'coaching' ? 'amber' : 'purple'}-500/50`
                    }
                  `}
                >
                  {isSoldOut ? 'Sold Out' : 'View Details'}
                  {!isSoldOut && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </Link>
            </div>

            {/* Toast Notification */}
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 text-sm text-center"
              >
                Added to cart!
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
