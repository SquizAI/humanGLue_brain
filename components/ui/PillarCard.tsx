'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { getPillarTheme } from '@/lib/design-system'

interface PillarCardProps {
  pillar: 'adaptability' | 'coaching' | 'marketplace'
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  cta: {
    text: string
    href: string
  }
  metric?: {
    label: string
    value: string
  }
}

export function PillarCard({
  pillar,
  icon: Icon,
  title,
  description,
  features,
  cta,
  metric,
}: PillarCardProps) {
  const theme = getPillarTheme(pillar)

  const pillarConfig = {
    adaptability: {
      bgGradient: 'from-blue-500/10 via-blue-600/5 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-400/60',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      buttonGradient: 'from-blue-500 to-blue-600',
      glowColor: 'group-hover:shadow-blue-500/30',
    },
    coaching: {
      bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      buttonGradient: 'from-amber-500 to-orange-600',
      glowColor: 'group-hover:shadow-amber-500/30',
    },
    marketplace: {
      bgGradient: 'from-purple-500/10 via-purple-600/5 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-400/60',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      buttonGradient: 'from-purple-500 to-purple-600',
      glowColor: 'group-hover:shadow-purple-500/30',
    },
  }

  const config = pillarConfig[pillar]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div
        className={`
        relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5
        border-2 ${config.borderColor}
        transition-all duration-500
        hover:-translate-y-2 hover:shadow-2xl ${config.glowColor}
      `}
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
        />

        {/* Content */}
        <div className="relative p-8 lg:p-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.iconBg} mb-6`}
          >
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </motion.div>

          {/* Title */}
          <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-gray-300"
              >
                <svg
                  className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Metric (optional) */}
          {metric && (
            <div className={`mb-6 p-4 rounded-xl ${config.iconBg} border ${config.borderColor}`}>
              <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
              <div className={`text-2xl font-bold ${config.iconColor}`}>
                {metric.value}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Link href={cta.href}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full px-8 py-4 rounded-full font-semibold text-white
                bg-gradient-to-r ${config.buttonGradient}
                shadow-lg hover:shadow-xl
                transition-all duration-300
                flex items-center justify-center gap-2
              `}
            >
              {cta.text}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.button>
          </Link>
        </div>

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${config.buttonGradient} opacity-20 blur-xl`} />
        </div>
      </div>
    </motion.div>
  )
}
