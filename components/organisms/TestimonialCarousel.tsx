'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { cn } from '../../utils/cn'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  image?: string
  logo?: string
  results?: {
    metric: string
    value: string
  }[]
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  className
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, interval)

    return () => clearInterval(timer)
  }, [isAutoPlaying, interval, testimonials.length])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className={cn("relative", className)}>
      <div className="relative bg-gradient-to-b from-gray-900/50 to-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Quote icon */}
              <div className="flex justify-between items-start">
                <Quote className="w-12 h-12 text-blue-500/20" />
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < currentTestimonial.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "fill-gray-700 text-gray-700"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <blockquote className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                "{currentTestimonial.content}"
              </blockquote>

              {/* Results metrics */}
              {currentTestimonial.results && (
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-800">
                  {currentTestimonial.results.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold text-blue-400">
                        {result.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.metric}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Author */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <div className="flex items-center gap-4">
                  {currentTestimonial.image ? (
                    <Image
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {currentTestimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentTestimonial.role} at {currentTestimonial.company}
                    </div>
                  </div>
                </div>
                {currentTestimonial.logo && (
                  <Image
                    src={currentTestimonial.logo}
                    alt={currentTestimonial.company}
                    width={120}
                    height={40}
                    className="opacity-50 hover:opacity-70 transition-opacity"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentIndex
                ? "w-8 bg-blue-500"
                : "bg-gray-600 hover:bg-gray-500"
            )}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}