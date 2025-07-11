'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { UIState } from '../lib/types'

interface FuturisticBackgroundProps {
  state: UIState
}

export default function FuturisticBackground({ state }: FuturisticBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Base gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      
      {/* Animated gradient mesh */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-30" />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              background: `radial-gradient(circle, ${
                ['rgba(0, 149, 255, 0.3)', 'rgba(187, 134, 252, 0.3)', 'rgba(255, 0, 128, 0.3)', 'rgba(0, 255, 255, 0.3)', 'rgba(0, 255, 128, 0.3)'][i]
              } 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
            initial={{
              left: `${20 * i}%`,
              top: `${20 * i}%`,
            }}
          />
        ))}
      </div>

      {/* Interactive cursor glow */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(0, 149, 255, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
        }}
      />

      {/* Grid pattern */}
      <div className="fixed inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [-20, window.innerHeight + 20],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* State-based effects */}
      {state === 'presenting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/10 to-transparent animate-pulse" />
        </motion.div>
      )}
    </>
  )
}