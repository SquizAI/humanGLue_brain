'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MobilePageContentProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function MobilePageContent({ title, subtitle, children }: MobilePageContentProps) {
  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-gray-300 mb-6">{subtitle}</p>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
} 