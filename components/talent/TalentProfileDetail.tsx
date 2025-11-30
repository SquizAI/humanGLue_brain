'use client'

import { motion } from 'framer-motion'
import {
  Star,
  MapPin,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  Clock,
  Target,
  Building2,
  MessageSquare,
  Shield,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { TalentProfile } from './TalentCard'
import { TalentCard } from './TalentCard'
import { mockTalent } from '@/lib/data/mock-talent'
import { useCart } from '@/lib/contexts/CartContext'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

interface TalentProfileDetailProps {
  talent: TalentProfile
}

export function TalentProfileDetail({ talent }: TalentProfileDetailProps) {
  const { addToCart, setIsCartOpen } = useCart()
  const [showToast, setShowToast] = useState(false)
  const isAvailable = talent.availability === 'available'
  const isLimited = talent.availability === 'limited'

  // Get related experts (same industries or expertise)
  const relatedExperts = mockTalent
    .filter((t) => {
      if (t.id === talent.id) return false
      return (
        t.focusAreas.industries.some((ind) =>
          talent.focusAreas.industries.includes(ind)
        ) ||
        t.expertise.some((exp) => talent.expertise.includes(exp))
      )
    })
    .slice(0, 3)

  const handleBookConsultation = () => {
    addToCart({
      id: `${talent.id}-consultation`,
      type: 'consultation',
      name: `Consultation with ${talent.name}`,
      description: `${talent.minEngagement || '1 hour'} consultation session`,
      price: talent.hourlyRate,
      image: talent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&size=200&background=8b5cf6&color=fff`,
      metadata: {
        expertName: talent.name,
        duration: talent.minEngagement || '1 hour',
      },
    })
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setIsCartOpen(true)
    }, 1500)
  }

  // Get metric color
  const getMetricColor = (score: number) => {
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-blue-400'
  }

  const getMetricBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-500/10 border-green-500/20'
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-blue-500/10 border-blue-500/20'
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900 py-16">
        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Back Link */}
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to marketplace
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold">
                  {talent.avatar ? (
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-full h-full rounded-3xl object-cover"
                    />
                  ) : (
                    talent.name.split(' ').map((n) => n[0]).join('')
                  )}
                </div>
                {/* Availability Indicator */}
                {isAvailable && (
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    Available
                  </div>
                )}
                {isLimited && (
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                    Limited
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-white">{talent.name}</h1>
                      <CheckCircle
                        className="w-7 h-7 text-blue-400"
                        aria-label="Verified Expert"
                      />
                    </div>
                    <p className="text-xl text-cyan-300 font-medium mb-3">
                      {talent.title}
                    </p>
                    <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                      {talent.tagline}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{talent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>{talent.yearsExperience}+ years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>{talent.clientsTransformed} clients transformed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>{talent.employeesReframed.toLocaleString()}+ reframed</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(talent.rating)
                            ? 'text-amber-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-semibold text-lg">
                    {talent.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">({talent.reviewCount} reviews)</span>
                </div>

                {/* CTA */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookConsultation}
                    disabled={talent.availability === 'booked'}
                    className={cn(
                      'flex-1 px-6 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 flex items-center justify-center gap-2',
                      talent.availability === 'booked'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                    )}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </motion.button>

                  <Link href={`/talent/${talent.id}/request`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={talent.availability === 'booked'}
                      className={cn(
                        'w-full px-6 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 flex items-center justify-center gap-2',
                        talent.availability === 'booked'
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50'
                      )}
                      data-testid="request-engagement-button"
                    >
                      {talent.availability === 'booked' ? 'Unavailable' : 'Request'}
                      {talent.availability !== 'booked' && <ArrowRight className="w-5 h-5" />}
                    </motion.button>
                  </Link>
                </div>

                {/* Toast */}
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 px-4 py-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 text-sm text-center"
                  >
                    Added to cart! Opening cart...
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className={spacing.section.y}>
        <div className={spacing.container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Adaptability Impact Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className={cn(typography.heading.h3, 'text-white mb-6')}>
                  Adaptability Impact Metrics
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div
                    className={cn(
                      'p-6 rounded-2xl border',
                      getMetricBgColor(talent.adaptabilityImpact.transformationSuccessRate)
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-gray-400">
                        Transformation Success Rate
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'text-5xl font-bold mb-2',
                        getMetricColor(talent.adaptabilityImpact.transformationSuccessRate)
                      )}
                    >
                      {talent.adaptabilityImpact.transformationSuccessRate}%
                    </div>
                    <p className="text-sm text-gray-400">
                      Projects achieving transformation goals
                    </p>
                  </div>

                  <div
                    className={cn(
                      'p-6 rounded-2xl border',
                      getMetricBgColor(talent.adaptabilityImpact.behaviorChangeScore)
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-gray-400">
                        Behavior Change Score
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'text-5xl font-bold mb-2',
                        getMetricColor(talent.adaptabilityImpact.behaviorChangeScore)
                      )}
                    >
                      {talent.adaptabilityImpact.behaviorChangeScore}%
                    </div>
                    <p className="text-sm text-gray-400">Sustained behavioral shifts</p>
                  </div>

                  <div
                    className={cn(
                      'p-6 rounded-2xl border',
                      getMetricBgColor(talent.adaptabilityImpact.clientRetentionRate)
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-gray-400">
                        Client Retention Rate
                      </h3>
                    </div>
                    <div
                      className={cn(
                        'text-5xl font-bold mb-2',
                        getMetricColor(talent.adaptabilityImpact.clientRetentionRate)
                      )}
                    >
                      {talent.adaptabilityImpact.clientRetentionRate}%
                    </div>
                    <p className="text-sm text-gray-400">Clients returning for more</p>
                  </div>

                  <div className="p-6 rounded-2xl border bg-cyan-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-gray-400">
                        Cultures Transformed
                      </h3>
                    </div>
                    <div className="text-5xl font-bold mb-2 text-cyan-400">
                      {talent.adaptabilityImpact.culturesTransformed}
                    </div>
                    <p className="text-sm text-gray-400">
                      Organizations fundamentally changed
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Expertise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className={cn(typography.heading.h3, 'text-white mb-6')}>
                  Areas of Expertise
                </h2>
                <div className="flex flex-wrap gap-3">
                  {talent.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Industries & Transformation Stages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Industries */}
                <div>
                  <h3 className={cn(typography.heading.h4, 'text-white mb-4')}>
                    Industries Served
                  </h3>
                  <div className="space-y-2">
                    {talent.focusAreas.industries.map((industry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-gray-700"
                      >
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300">{industry}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transformation Stages */}
                <div>
                  <h3 className={cn(typography.heading.h4, 'text-white mb-4')}>
                    Transformation Stages
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(['assess', 'reframe', 'embed', 'scale'] as const).map((stage) => (
                      <div
                        key={stage}
                        className={cn(
                          'p-4 rounded-xl text-center font-medium',
                          talent.focusAreas.transformationStages.includes(stage)
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40'
                            : 'bg-gray-800 text-gray-500 border border-gray-700'
                        )}
                      >
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span className="font-medium">Coaching Style:</span>
                      <span className="text-white capitalize">
                        {talent.focusAreas.coachingStyle}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Client Testimonials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className={cn(typography.heading.h3, 'text-white mb-6')}>
                  Client Testimonials
                </h2>
                <div className="space-y-6">
                  {talent.testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-2xl bg-white/5 border border-gray-700"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {testimonial.client.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-white">
                                {testimonial.client}
                              </div>
                              <div className="text-sm text-gray-400">
                                {testimonial.company}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-5 h-5 text-green-400" />
                              <span className="text-xs text-green-400 font-medium">
                                Verified
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed italic mb-4">
                            "{testimonial.quote}"
                          </p>
                          {testimonial.metric && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm">
                              <TrendingUp className="w-4 h-4" />
                              {testimonial.metric}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="sticky top-24 p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/20"
              >
                <h3 className={cn(typography.heading.h4, 'text-white mb-6')}>
                  Engagement Details
                </h3>

                {/* Hourly Rate */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-medium">Hourly Rate</span>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    ${talent.hourlyRate}
                    <span className="text-lg text-gray-400 font-normal">/hr</span>
                  </div>
                </div>

                {/* Minimum Engagement */}
                {talent.minEngagement && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-medium">Minimum Engagement</span>
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {talent.minEngagement}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-medium">Availability</span>
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
                      isAvailable
                        ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                        : isLimited
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-gray-500/20 border border-gray-500/40 text-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isAvailable
                          ? 'bg-green-400 animate-pulse'
                          : isLimited
                          ? 'bg-amber-400'
                          : 'bg-gray-400'
                      )}
                    ></div>
                    {isAvailable
                      ? 'Available Now'
                      : isLimited
                      ? 'Limited Availability'
                      : 'Fully Booked'}
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookConsultation}
                    disabled={talent.availability === 'booked'}
                    className={cn(
                      'w-full px-6 py-4 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2',
                      talent.availability === 'booked'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50'
                    )}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {talent.availability === 'booked'
                      ? 'Unavailable'
                      : 'Book Consultation'}
                  </motion.button>

                  <Link href={`/talent/${talent.id}/request`} className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 rounded-full font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Request Full Engagement
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Response within 24 hours
                </p>
              </motion.div>

              {/* Success Metrics Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-gray-700"
              >
                <h4 className="font-semibold text-white mb-4">Impact Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Success Stories</span>
                    <span className="font-semibold text-white">
                      {talent.testimonials.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Clients</span>
                    <span className="font-semibold text-white">
                      {talent.clientsTransformed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">People Transformed</span>
                    <span className="font-semibold text-white">
                      {talent.employeesReframed.toLocaleString()}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg. Rating</span>
                    <span className="font-semibold text-white">
                      {talent.rating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Experts */}
      {relatedExperts.length > 0 && (
        <section className="py-16 bg-gray-900/50">
          <div className={spacing.container.wide}>
            <h2 className={cn(typography.heading.h3, 'text-white mb-8')}>
              Related Experts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {relatedExperts.map((expert) => (
                <TalentCard key={expert.id} profile={expert} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
