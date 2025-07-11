'use client'

import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { UIState } from '../lib/types'

interface DynamicBackgroundProps {
  state: UIState
  showImage?: boolean
  industry?: string
  companySize?: string
  overlayOpacity?: number // Add opacity control
  isHero?: boolean // New prop to distinguish hero sections
  videoSrc?: string // New prop for video source
}

// Background images mapped to different states/industries
const backgroundImages = {
  default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2560',
  welcoming: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2560',
  exploring: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2560',
  analyzing: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2560',
  presenting: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2560',
  
  // Industry-specific images
  technology: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560',
  healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2560',
  finance: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2560',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2560',
  manufacturing: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=2560',
}

// Professional color schemes with solid colors
const colorSchemes = {
  default: {
    primary: 'from-blue-900/30 via-slate-900/30 to-blue-900/30',
    secondary: 'from-slate-900/20 via-blue-900/20 to-slate-900/20',
    accent: 'bg-blue-800/20'
  },
  welcoming: {
    primary: 'from-slate-900/30 via-blue-900/30 to-slate-900/30',
    secondary: 'from-blue-900/20 via-slate-900/20 to-blue-900/20',
    accent: 'bg-slate-800/20'
  },
  exploring: {
    primary: 'from-indigo-900/30 via-slate-900/30 to-indigo-900/30',
    secondary: 'from-slate-900/20 via-indigo-900/20 to-slate-900/20',
    accent: 'bg-indigo-800/20'
  },
  analyzing: {
    primary: 'from-blue-900/30 via-indigo-900/30 to-blue-900/30',
    secondary: 'from-indigo-900/20 via-blue-900/20 to-indigo-900/20',
    accent: 'bg-blue-800/20'
  },
  presenting: {
    primary: 'from-slate-900/30 via-indigo-900/30 to-slate-900/30',
    secondary: 'from-indigo-900/20 via-slate-900/20 to-indigo-900/20',
    accent: 'bg-slate-800/20'
  }
}

export default function DynamicBackground({ 
  state, 
  showImage = false, 
  industry,
  companySize,
  overlayOpacity,
  isHero = false,
  videoSrc
}: DynamicBackgroundProps) {
  const colors = colorSchemes[state]
  
  // Set opacity based on whether it's a hero section
  const finalOpacity = overlayOpacity !== undefined ? overlayOpacity : (isHero ? 0.7 : 0.9)
  
  // Always use default image to prevent layout shifts
  const currentImage = backgroundImages.default

  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Video background if provided */}
      {videoSrc && showImage && (
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      )}
      
      {/* Static background image with no transitions (only show if no video) */}
      {showImage && !videoSrc && (
        <div className="absolute inset-0">
          <Image
            src={currentImage}
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={90}
          />
        </div>
      )}
      
      {/* Dark overlay with customizable opacity */}
      <div 
        className="absolute inset-0 bg-gray-900 transition-opacity duration-700"
        style={{ opacity: finalOpacity }}
      />
      
      {/* Animated gradient overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Primary gradient */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${colors.primary}`}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Secondary animated gradient */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-tr ${colors.secondary}`}
            animate={{
              backgroundPosition: ['100% 0%', '0% 100%', '100% 0%'],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className={`absolute -top-40 -left-40 w-80 h-80 ${colors.accent} rounded-full blur-3xl`}
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className={`absolute -bottom-40 -right-40 w-80 h-80 ${colors.accent} rounded-full blur-3xl`}
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Particle effect based on company size */}
          {companySize && parseInt(companySize) > 100 && (
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}