'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface InteractiveSolutionCardProps {
  title: string
  description: string
  icon: ReactNode
  features: string[]
  tags: string[]
  imageUrl?: string
  className?: string
  delay?: number
}

export function InteractiveSolutionCard({
  title,
  description,
  icon,
  features,
  tags,
  imageUrl,
  className,
  delay = 0
}: InteractiveSolutionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.5 }}
      className={cn("relative group", className)}
    >
      <motion.div
        className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden h-full"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ padding: '1px' }}
        >
          <div className="absolute inset-[1px] bg-gray-900 rounded-2xl" />
        </motion.div>

        {/* Card content */}
        <div className="relative z-10 p-8">
          {/* Icon with animation */}
          <motion.div
            className="w-16 h-16 mb-6 relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 text-white">
              {icon}
            </div>
          </motion.div>

          {/* Title and description */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-400 mb-6 line-clamp-2 group-hover:text-gray-300 transition-colors">
            {description}
          </p>

          {/* Features list with stagger animation */}
          <ul className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <motion.span
                  className="text-blue-400 mt-1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: delay + idx * 0.1 + 0.2, type: "spring" }}
                >
                  ✓
                </motion.span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <motion.span
                key={idx}
                className="px-3 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-full
                         group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Hover reveal - Learn more */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-8 pt-12
                     translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <motion.button
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg
                       font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More →
            </motion.button>
          </motion.div>
        </div>

        {/* Background image with parallax effect */}
        {imageUrl && (
          <motion.div
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60"
              initial={{
                x: Math.random() * 300,
                y: 300
              }}
              animate={{
                y: -50,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}