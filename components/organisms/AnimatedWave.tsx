'use client'

import { motion } from 'framer-motion'

interface AnimatedWaveProps {
  className?: string
}

export function AnimatedWave({ className = '' }: AnimatedWaveProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/30 to-cyan-900/40" />
      
      {/* Animated wave layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Wave Layer 1 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent 0%,
                rgba(59, 130, 246, 0.1) 25%,
                rgba(147, 51, 234, 0.1) 50%,
                rgba(236, 72, 153, 0.1) 75%,
                transparent 100%
              )
            `,
            transform: 'skew(-20deg)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Wave Layer 2 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                -90deg,
                transparent 0%,
                rgba(16, 185, 129, 0.1) 25%,
                rgba(59, 130, 246, 0.1) 50%,
                rgba(147, 51, 234, 0.1) 75%,
                transparent 100%
              )
            `,
            transform: 'skew(15deg)',
          }}
          animate={{
            x: ['100%', '-100%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Wave Layer 3 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 800px 400px at 0% 50%,
                rgba(59, 130, 246, 0.15) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 800px 400px at 100% 50%,
                rgba(236, 72, 153, 0.15) 0%,
                transparent 50%
              )
            `,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Digital grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Animated data streams */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            style={{
              width: '300px',
              top: `${20 + i * 20}%`,
              left: '-300px',
            }}
            animate={{
              x: [0, 1700],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Pulsing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  )
}