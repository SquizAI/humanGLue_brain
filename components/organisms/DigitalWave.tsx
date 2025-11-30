'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface DigitalWaveProps {
  className?: string
}

export function DigitalWave({ className = '' }: DigitalWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    const drawWave = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      if (width === 0 || height === 0) return
      
      ctx.clearRect(0, 0, width, height)
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')  // Blue
      gradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.6)') // Purple
      gradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.4)') // Pink
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)')   // Green

      // Draw multiple wave layers
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath()
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2 + layer * 0.5
        ctx.globalAlpha = 0.7 - layer * 0.15

        const amplitude = 80 + layer * 20
        const frequency = 0.005 + layer * 0.001
        const phase = time * (0.02 + layer * 0.005)

        for (let x = 0; x <= width; x += 2) {
          const y1 = height / 2 + Math.sin(x * frequency + phase) * amplitude
          const y2 = height / 2 + Math.sin(x * frequency * 1.5 + phase * 1.2) * (amplitude * 0.6)
          const y3 = height / 2 + Math.sin(x * frequency * 0.8 + phase * 0.8) * (amplitude * 0.4)
          
          const finalY = (y1 + y2 + y3) / 3

          if (x === 0) {
            ctx.moveTo(x, finalY)
          } else {
            ctx.lineTo(x, finalY)
          }
        }
        
        ctx.stroke()
      }

      // Add digital particles
      for (let i = 0; i < 50; i++) {
        const x = (time * 2 + i * 20) % (width + 100) - 50
        const baseY = height / 2
        const waveY = baseY + Math.sin(x * 0.005 + time * 0.02) * 80
        const y = waveY + (Math.random() - 0.5) * 40
        
        ctx.beginPath()
        ctx.fillStyle = `hsla(${200 + Math.sin(time * 0.01 + i) * 60}, 70%, 60%, ${0.3 + Math.sin(time * 0.03 + i) * 0.3})`
        ctx.arc(x, y, 1 + Math.sin(time * 0.05 + i) * 1, 0, Math.PI * 2)
        ctx.fill()
      }

      time += 1
      animationFrameId = requestAnimationFrame(drawWave)
    }

    // Initial setup with a small delay to ensure DOM is ready
    const initializeCanvas = () => {
      resize()
      drawWave()
    }

    // Use setTimeout to ensure the canvas is properly mounted
    const timeoutId = setTimeout(initializeCanvas, 100)

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/30" />
      
      {/* Fallback animated background if canvas fails */}
      <div className="absolute inset-0 opacity-50">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)
            `
          }}
        />
      </div>
      
      {/* Canvas for wave animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Additional animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Floating data streams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{
              width: '200px',
              top: `${20 + i * 15}%`,
              left: '-200px',
            }}
            animate={{
              x: ['0px', '1400px'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  )
}