'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  MessageCircle
} from 'lucide-react'

interface MobileHomePageProps {
  onStartChat: () => void
}

export function MobileHomePage({ onStartChat }: MobileHomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Transform Your Organization",
      subtitle: "with AI-Powered Insights",
      description: "Start a conversation to discover how Human Glue can strengthen your teams",
      icon: Brain,
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "40% Faster AI Adoption",
      subtitle: "3.2x ROI in 18 months",
      description: "Join organizations achieving measurable transformation",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Your AI Transformation Partner",
      subtitle: "From Assessment to Action",
      description: "Get personalized recommendations in minutes",
      icon: Users,
      color: "from-pink-500 to-orange-500"
    }
  ]

  return (
    <div className="flex flex-col px-4 py-4">
      {/* Hero Carousel */}
      <div className="flex-grow flex flex-col justify-center -mx-4 px-4 mb-6">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center bg-gray-900/60 backdrop-blur-md rounded-2xl p-5 -mx-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-lg`}
          >
            {slides[currentSlide].icon && (
              <motion.div>
                {slides[currentSlide].icon === Brain && <Brain className="w-8 h-8 text-white" />}
                {slides[currentSlide].icon === TrendingUp && <TrendingUp className="w-8 h-8 text-white" />}
                {slides[currentSlide].icon === Users && <Users className="w-8 h-8 text-white" />}
              </motion.div>
            )}
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-gray-300 mb-6 text-sm">
            {slides[currentSlide].description}
          </p>
        </motion.div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-blue-500' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Key Benefits */}
        <div className="space-y-2 mb-6 bg-gray-900/50 backdrop-blur-sm rounded-xl p-3">
          {[
            "AI-powered organizational assessment",
            "Expert-facilitated workshops",
            "60+ implementation tools",
            "Continuous support & optimization"
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-gray-100 text-xs">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section - Fixed at bottom */}
      <div className="space-y-2 bg-gray-900/60 backdrop-blur-md rounded-2xl p-3 -mx-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartChat}
          className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Start Your Assessment
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium">
            Watch Demo
          </button>
          <button className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium">
            Get Pricing
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          No credit card required • 5-minute assessment
        </p>
      </div>
    </div>
  )
} 