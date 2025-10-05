'use client'

import { motion } from 'framer-motion'
import { Star, MapPin, Briefcase, TrendingUp, Award, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export interface TalentProfile {
  id: string
  name: string
  title: string
  tagline: string
  avatar: string
  location: string
  expertise: string[]

  // Adaptability-first metrics
  adaptabilityImpact: {
    transformationSuccessRate: number // 0-100
    behaviorChangeScore: number // 0-100
    clientRetentionRate: number // 0-100
    culturesTransformed: number
  }

  // Experience
  yearsExperience: number
  clientsTransformed: number
  employeesReframed: number

  // Specializations
  focusAreas: {
    industries: string[]
    transformationStages: ('assess' | 'reframe' | 'embed' | 'scale')[]
    coachingStyle: 'directive' | 'facilitative' | 'hybrid'
  }

  // Social proof
  rating: number // 0-5
  reviewCount: number
  testimonials: Array<{
    client: string
    company: string
    quote: string
    metric?: string
  }>

  // Availability
  availability: 'available' | 'limited' | 'booked'
  hourlyRate: number
  minEngagement?: string // e.g., "3 months"
  featured?: boolean
}

interface TalentCardProps {
  profile: TalentProfile
  showFullDetails?: boolean
  matchScore?: number // 0-100, how well they match client needs
}

export function TalentCard({ profile, showFullDetails = false, matchScore }: TalentCardProps) {
  const getAvailabilityConfig = (availability: string) => {
    switch (availability) {
      case 'available':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Available Now',
        }
      case 'limited':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          label: 'Limited Availability',
        }
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          label: 'Fully Booked',
        }
    }
  }

  const availConfig = getAvailabilityConfig(profile.availability)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
        {/* Match Score Badge */}
        {matchScore && matchScore >= 80 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              {matchScore}% Match
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              {/* Availability Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-gray-900 ${profile.availability === 'available' ? 'bg-green-500' : profile.availability === 'limited' ? 'bg-amber-500' : 'bg-gray-500'}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white mb-1 truncate">
                {profile.name}
              </h3>
              <p className="text-purple-400 font-medium mb-2">{profile.title}</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {profile.tagline}
              </p>
            </div>
          </div>

          {/* Adaptability Impact Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <div>
              <div className="text-xs text-gray-400 mb-1">Transformation Success</div>
              <div className="text-2xl font-bold text-purple-400">
                {profile.adaptabilityImpact.transformationSuccessRate}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Behavior Change</div>
              <div className="text-2xl font-bold text-purple-400">
                {profile.adaptabilityImpact.behaviorChangeScore}/100
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Client Retention</div>
              <div className="text-2xl font-bold text-purple-400">
                {profile.adaptabilityImpact.clientRetentionRate}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Cultures Transformed</div>
              <div className="text-2xl font-bold text-purple-400">
                {profile.adaptabilityImpact.culturesTransformed}
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="flex items-center gap-6 mb-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>{profile.yearsExperience}+ years</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{profile.clientsTransformed} clients</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>{profile.employeesReframed}+ reframed</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(profile.rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-white font-semibold">{profile.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({profile.reviewCount} reviews)</span>
          </div>

          {/* Expertise */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Expertise:</h4>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.slice(0, showFullDetails ? undefined : 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-purple-500/10 border border-purple-500/20 text-purple-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Transformation Stages */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Transformation Stages:</h4>
            <div className="flex gap-2">
              {(['assess', 'reframe', 'embed', 'scale'] as const).map((stage) => (
                <div
                  key={stage}
                  className={`
                    px-3 py-1 rounded-lg text-xs font-medium
                    ${profile.focusAreas.transformationStages.includes(stage)
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-gray-700 text-gray-500'
                    }
                  `}
                >
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial (Featured) */}
          {profile.testimonials.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-gray-700">
              <p className="text-gray-300 text-sm italic mb-3">
                "{profile.testimonials[0].quote}"
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-white font-medium">{profile.testimonials[0].client}</span>
                  <span className="text-gray-400"> · {profile.testimonials[0].company}</span>
                </div>
                {profile.testimonials[0].metric && (
                  <div className="text-sm font-semibold text-green-400">
                    {profile.testimonials[0].metric}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability & Rate */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${availConfig.bg} border ${availConfig.border} ${availConfig.color} mb-2`}>
                <div className={`w-2 h-2 rounded-full ${profile.availability === 'available' ? 'bg-green-400' : profile.availability === 'limited' ? 'bg-amber-400' : 'bg-gray-400'} animate-pulse`} />
                {availConfig.label}
              </div>
              <div className="text-2xl font-bold text-white">
                ${profile.hourlyRate}/hr
              </div>
              {profile.minEngagement && (
                <div className="text-sm text-gray-400">
                  Min. {profile.minEngagement}
                </div>
              )}
            </div>

            <Link href={`/talent/${profile.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2"
              >
                View Profile
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
