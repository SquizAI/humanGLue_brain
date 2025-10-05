'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { DigitalWave } from '../organisms/DigitalWave'

interface HeroSectionProps {
  children: ReactNode
  backgroundImage?: string
  videoSrc?: string
  overlayOpacity?: number
  minHeight?: string
  useDigitalWave?: boolean
}

const defaultBackgrounds = {
  solutions: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2560',
  process: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2560',
  results: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2560',
  default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2560'
}

export function HeroSection({ 
  children, 
  backgroundImage,
  videoSrc,
  overlayOpacity = 0.3,
  minHeight = '80vh',
  useDigitalWave = false
}: HeroSectionProps) {
  return (
    <section 
      className={`relative flex items-center justify-center px-4 sm:px-6 overflow-hidden`}
      style={{ minHeight }}
    >
      {/* Digital Wave Background */}
      {useDigitalWave && (
        <DigitalWave className="absolute inset-0" />
      )}

      {/* Video Background */}
      {videoSrc && !useDigitalWave && (
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
          {/* Dark overlay */}
          <div 
            className="absolute inset-0 bg-gray-900 transition-opacity duration-700"
            style={{ opacity: overlayOpacity }}
          />
          
          {/* Grid overlay pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      )}
      
      {/* Background Image (only if no video or digital wave) */}
      {backgroundImage && !videoSrc && !useDigitalWave && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hero Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={90}
          />
          {/* Dark overlay */}
          <div 
            className="absolute inset-0 bg-gray-900 transition-opacity duration-700"
            style={{ opacity: overlayOpacity }}
          />
          
          {/* Grid overlay pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  )
} 