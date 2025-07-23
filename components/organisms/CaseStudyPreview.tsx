'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '../../utils/cn'

interface CaseStudy {
  id: string
  title: string
  company: string
  industry: string
  logo?: string
  image?: string
  summary: string
  metrics: {
    label: string
    value: string
    icon?: React.ReactNode
  }[]
  tags: string[]
  readTime: string
  href: string
}

interface CaseStudyPreviewProps {
  caseStudy: CaseStudy
  variant?: 'card' | 'featured'
  className?: string
}

export function CaseStudyPreview({
  caseStudy,
  variant = 'card',
  className
}: CaseStudyPreviewProps) {
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn("group", className)}
      >
        <Link href={caseStudy.href}>
          <div className="relative bg-gradient-to-b from-gray-900/50 to-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden">
            {/* Background image */}
            {caseStudy.image && (
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <Image
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="relative z-10 p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {caseStudy.logo && (
                      <Image
                        src={caseStudy.logo}
                        alt={caseStudy.company}
                        width={48}
                        height={48}
                        className="rounded-lg"
                      />
                    )}
                    <div>
                      <div className="text-sm text-blue-400 font-medium">
                        {caseStudy.industry}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {caseStudy.company}
                      </h3>
                    </div>
                  </div>

                  <h4 className="text-3xl font-bold text-white leading-tight">
                    {caseStudy.title}
                  </h4>

                  <p className="text-gray-300 text-lg">
                    {caseStudy.summary}
                  </p>

                  <div className="flex items-center gap-6">
                    <motion.span
                      className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all"
                      whileHover={{ x: 5 }}
                    >
                      Read Case Study
                      <ArrowUpRight className="w-5 h-5" />
                    </motion.span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {caseStudy.readTime}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {caseStudy.metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
                    >
                      {metric.icon && (
                        <div className="mb-3 text-blue-400">
                          {metric.icon}
                        </div>
                      )}
                      <div className="text-3xl font-bold text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-400">
                        {metric.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn("group", className)}
    >
      <Link href={caseStudy.href}>
        <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden h-full hover:border-gray-700 transition-all">
          {/* Header with image */}
          {caseStudy.image && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={caseStudy.image}
                alt={caseStudy.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              
              {/* Company logo overlay */}
              {caseStudy.logo && (
                <div className="absolute bottom-4 left-4">
                  <Image
                    src={caseStudy.logo}
                    alt={caseStudy.company}
                    width={40}
                    height={40}
                    className="rounded-lg bg-white/10 backdrop-blur-sm p-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-sm text-blue-400 font-medium mb-1">
                {caseStudy.industry}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {caseStudy.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {caseStudy.company}
              </p>
            </div>

            <p className="text-gray-400 line-clamp-2">
              {caseStudy.summary}
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {caseStudy.metrics.slice(0, 2).map((metric, idx) => (
                <div key={idx} className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-blue-400">
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {caseStudy.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Read more */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Read Case Study
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {caseStudy.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}