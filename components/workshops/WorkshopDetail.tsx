'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  Video,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  Star,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Workshop } from './WorkshopCard'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'
import { mockWorkshops } from '@/lib/data/mock-workshops'
import { useCart } from '@/lib/contexts/CartContext'

interface WorkshopDetailProps {
  workshop: Workshop
}

export function WorkshopDetail({ workshop }: WorkshopDetailProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const pillarConfig = {
    adaptability: {
      gradient: 'from-blue-500 to-blue-600',
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-500/20',
      badgeText: 'text-blue-300',
      buttonGradient: 'from-blue-500 to-blue-600',
      textGradient: 'from-blue-400 to-blue-600',
    },
    coaching: {
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-300',
      buttonGradient: 'from-amber-500 to-orange-600',
      textGradient: 'from-amber-400 to-orange-500',
    },
    marketplace: {
      gradient: 'from-cyan-500 to-cyan-600',
      badgeBg: 'bg-cyan-500/10',
      badgeBorder: 'border-cyan-500/20',
      badgeText: 'text-cyan-300',
      buttonGradient: 'from-cyan-500 to-cyan-600',
      textGradient: 'from-cyan-400 to-cyan-600',
    },
  }

  const config = pillarConfig[workshop.pillar]
  const spotsLeft = workshop.capacity.remaining
  const isLowCapacity = spotsLeft <= 5 && spotsLeft > 0
  const isSoldOut = spotsLeft === 0

  // Get related workshops (same pillar, different id)
  const relatedWorkshops = mockWorkshops
    .filter((w) => w.pillar === workshop.pillar && w.id !== workshop.id)
    .slice(0, 3)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workshop.title,
          text: workshop.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleAddToCart = () => {
    setIsAddingToCart(true)

    addToCart({
      id: workshop.id,
      type: 'workshop',
      name: workshop.title,
      description: workshop.description,
      price: workshop.price.earlyBird || workshop.price.amount,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      metadata: {
        instructor: workshop.instructor.name,
        date: workshop.schedule.date,
        time: workshop.schedule.time,
        duration: workshop.schedule.duration,
        level: workshop.level,
        pillar: workshop.pillar,
      },
    })

    setIsAddingToCart(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleRegisterNow = () => {
    setIsAddingToCart(true)

    addToCart({
      id: workshop.id,
      type: 'workshop',
      name: workshop.title,
      description: workshop.description,
      price: workshop.price.earlyBird || workshop.price.amount,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      metadata: {
        instructor: workshop.instructor.name,
        date: workshop.schedule.date,
        time: workshop.schedule.time,
        duration: workshop.schedule.duration,
        level: workshop.level,
        pillar: workshop.pillar,
      },
    })

    setIsAddingToCart(false)
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Added to cart!</span>
        </motion.div>
      )}

      {/* Header/Hero Section */}
      <section className={cn('bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 relative overflow-hidden', spacing.section.y)}>
        {/* Decorative gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-r opacity-20', config.gradient)}></div>

        <div className={cn(spacing.container.wide, 'relative z-10')}>
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              data-testid="back-to-catalog"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold',
                      config.badgeBg,
                      'border',
                      config.badgeBorder,
                      config.badgeText
                    )}
                  >
                    {workshop.pillar.charAt(0).toUpperCase() + workshop.pillar.slice(1)}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-700 text-gray-300">
                    {workshop.level}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    {workshop.format === 'live' ? (
                      <>
                        <Video className="w-4 h-4" /> Live
                      </>
                    ) : workshop.format === 'hybrid' ? (
                      <>
                        <Video className="w-4 h-4" /> Hybrid
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" /> Recorded
                      </>
                    )}
                  </div>

                  {/* Capacity Badge */}
                  {isLowCapacity && !isSoldOut && (
                    <span className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold">
                      Only {spotsLeft} spots left!
                    </span>
                  )}

                  {isSoldOut && (
                    <span className="px-4 py-2 rounded-full bg-gray-500/20 border border-gray-500/40 text-gray-300 text-sm font-semibold">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className={cn(typography.manifesto.h2, 'mb-6 text-white')}>
                  {workshop.title}
                </h1>

                {/* Description */}
                <p className={cn(typography.body.lg, 'text-gray-300 mb-8')}>
                  {workshop.description}
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all flex items-center gap-2"
                    data-testid="share-button"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={cn(
                      'px-4 py-2 rounded-xl transition-all flex items-center gap-2',
                      isBookmarked
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    )}
                    data-testid="bookmark-button"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-gray-700 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {workshop.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {workshop.instructor.name}
                    </div>
                    <div className="text-gray-400">{workshop.instructor.title}</div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-gray-700">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Date</span>
                    </div>
                    <div className="text-white">{workshop.schedule.date}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-gray-700">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Time</span>
                    </div>
                    <div className="text-white">{workshop.schedule.time}</div>
                    <div className="text-sm text-gray-400">{workshop.schedule.duration}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-gray-700">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Capacity</span>
                    </div>
                    <div className="text-white">
                      {workshop.capacity.remaining}/{workshop.capacity.total} spots
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Learning Outcomes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <h2 className={cn(typography.heading.h3, 'text-white mb-6')}>
                  What You'll Learn
                </h2>
                <div className="space-y-4">
                  {workshop.outcomes.map((outcome, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-gray-700"
                    >
                      <CheckCircle
                        className={cn('w-6 h-6 mt-0.5 flex-shrink-0', config.badgeText)}
                      />
                      <span className="text-gray-300 text-lg">{outcome}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={cn(typography.heading.h5, 'text-white mb-4')}>
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {workshop.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sticky Registration Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border-2 border-gray-700 p-8">
                  {/* Price */}
                  <div className="mb-6">
                    {workshop.price.earlyBird && (
                      <div className="text-lg text-gray-400 line-through mb-2">
                        ${workshop.price.amount}
                      </div>
                    )}
                    <div className="text-4xl font-bold text-white mb-2">
                      ${workshop.price.earlyBird || workshop.price.amount}
                    </div>
                    {workshop.price.earlyBird && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                        <Star className="w-4 h-4" />
                        Early Bird Pricing
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mb-6">
                    <motion.button
                      whileHover={{ scale: isSoldOut ? 1 : 1.02 }}
                      whileTap={{ scale: isSoldOut ? 1 : 0.98 }}
                      onClick={handleAddToCart}
                      disabled={isSoldOut || isAddingToCart}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2',
                        isSoldOut || isAddingToCart
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-white/10 border border-white/20 hover:bg-white/20'
                      )}
                      data-testid="add-to-cart-button"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: isSoldOut ? 1 : 1.02 }}
                      whileTap={{ scale: isSoldOut ? 1 : 0.98 }}
                      onClick={handleRegisterNow}
                      disabled={isSoldOut || isAddingToCart}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2',
                        isSoldOut || isAddingToCart
                          ? 'bg-gray-600 cursor-not-allowed'
                          : `bg-gradient-to-r ${config.buttonGradient} hover:shadow-xl hover:shadow-${workshop.pillar === 'adaptability' ? 'blue' : workshop.pillar === 'coaching' ? 'amber' : 'cyan'}-500/30`
                      )}
                      data-testid="register-button"
                    >
                      {isSoldOut ? 'Sold Out' : 'Register Now'}
                      {!isSoldOut && <ArrowRight className="w-5 h-5" />}
                    </motion.button>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Lifetime access to recordings</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Community access</span>
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div className="pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Workshops */}
      {relatedWorkshops.length > 0 && (
        <section className={cn('bg-gray-900/50', spacing.section.y)}>
          <div className={spacing.container.wide}>
            <h2 className={cn(typography.heading.h3, 'text-white mb-8')}>
              Related Workshops
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorkshops.map((relatedWorkshop) => (
                <Link
                  key={relatedWorkshop.id}
                  href={`/workshops/${relatedWorkshop.id}`}
                  className="group"
                >
                  <div className="p-6 rounded-2xl bg-white/5 border border-gray-700 hover:border-gray-600 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          pillarConfig[relatedWorkshop.pillar].badgeBg,
                          'border',
                          pillarConfig[relatedWorkshop.pillar].badgeBorder,
                          pillarConfig[relatedWorkshop.pillar].badgeText
                        )}
                      >
                        {relatedWorkshop.pillar}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300">
                        {relatedWorkshop.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {relatedWorkshop.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {relatedWorkshop.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{relatedWorkshop.schedule.date}</span>
                      <span className="font-bold text-white">
                        ${relatedWorkshop.price.earlyBird || relatedWorkshop.price.amount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
