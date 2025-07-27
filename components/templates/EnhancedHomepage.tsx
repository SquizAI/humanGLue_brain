'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UnifiedChatSystem } from './UnifiedChatSystem'
import { DynamicRoadmap } from '../organisms/DynamicRoadmap'
import { ROICalculator } from '../organisms/ROICalculator'
import { Navigation } from '../organisms/Navigation'
import { Footer } from '../organisms/Footer'
import { 
  ArrowRight, 
  Brain, 
  Users, 
  Zap, 
  BarChart3, 
  Building2,
  ChevronDown,
  Play,
  Sparkles,
  CheckCircle,
  Layers
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { ChatState } from '../../lib/types'

interface EnhancedHomepageProps {
  userData?: any
  chatState: ChatState
  onChatStateChange: (state: ChatState, data?: any) => void
}

export function EnhancedHomepage({ userData, chatState, onChatStateChange }: EnhancedHomepageProps) {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showROI, setShowROI] = useState(false)
  const [currentRoadmapStep, setCurrentRoadmapStep] = useState(-1)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHeroVisible, setIsHeroVisible] = useState(true)
  const roadmapRef = useRef<HTMLDivElement>(null)
  const roiRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // Track hero visibility
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const heroBottom = rect.bottom
        setIsHeroVisible(heroBottom > 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate roadmap step based on chat progress
  useEffect(() => {
    switch (chatState) {
      case 'greeting':
      case 'collectingBasicInfo':
        setCurrentRoadmapStep(0)
        break
      case 'collectingCompanyInfo':
        setCurrentRoadmapStep(1)
        break
      case 'collectingChallenges':
        setCurrentRoadmapStep(2)
        break
      case 'collectingContactInfo':
        setCurrentRoadmapStep(3)
        break
      case 'performingAnalysis':
      case 'booking':
        setCurrentRoadmapStep(4)
        setShowROI(true)
        break
    }
  }, [chatState])

  // Show roadmap when user starts engaging
  useEffect(() => {
    if (chatState !== 'initial' && chatState !== 'greeting') {
      setTimeout(() => setShowRoadmap(true), 1000)
    }
  }, [chatState])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrolled / maxScroll, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to roadmap when it appears
  useEffect(() => {
    if (showRoadmap && roadmapRef.current) {
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  }, [showRoadmap])

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <Navigation />
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[51]"
        style={{ scaleX: scrollProgress, transformOrigin: '0% 0%' }}
      />

      {/* Main Content - Adjust margin when sidebar is visible */}
      <div className={cn(
        "transition-all duration-300",
        !isHeroVisible ? "mr-[480px]" : ""
      )}>
        {/* Hero Section with Chat */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/HumanGlue.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gray-900 transition-opacity duration-700" style={{ opacity: 0.6 }} />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          />
        </div>

        <div className="relative z-10 container max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">AI-Powered Transformation</span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                Transform Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Organization{userData?.name && `, ${userData.name}`}
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Start a conversation with our AI to discover personalized insights and build your transformation roadmap.
              </p>

              {/* Dynamic Content Based on Progress */}
              <AnimatePresence mode="wait">
                {userData?.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <p className="text-sm text-gray-300">
                      Welcome {userData.name}! We're creating a custom transformation plan for {userData.company || 'your organization'}.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                {showRoadmap ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => roadmapRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    View Your Roadmap
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-gray-400 flex items-center gap-2"
                  >
                    <span>Start chatting to unlock your roadmap</span>
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Content - Chat (Only visible in hero) */}
            {isHeroVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
                id="hero-chat-container"
              >
                {/* Chat will be portaled here when in hero mode */}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Roadmap Section */}
      <AnimatePresence>
        {showRoadmap && (
          <motion.section
            ref={roadmapRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative py-20 bg-gray-900/50"
          >
            <div className="container max-w-7xl mx-auto px-6">
              <DynamicRoadmap 
                currentStep={currentRoadmapStep} 
                userData={userData}
                className="mb-20"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ROI Calculator Section */}
      <AnimatePresence>
        {showROI && (
          <motion.section
            ref={roiRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative py-20 bg-gray-950"
          >
            <div className="container max-w-7xl mx-auto px-6">
              <ROICalculator 
                userData={userData}
                className="mb-20"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Solutions Preview */}
      <section className="relative py-20">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Three-Pillar Approach
            </h2>
            <p className="text-xl text-gray-300">
              A comprehensive solution that combines AI insights, human expertise, and practical tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Assessment",
                description: "Deep organizational analysis using advanced AI",
                features: ["5-Dimension Analysis", "Real-time Insights", "Predictive Analytics"]
              },
              {
                icon: Users,
                title: "Strategic Workshops",
                description: "Expert-facilitated sessions to validate and plan",
                features: ["Leadership Alignment", "Priority Setting", "Action Planning"]
              },
              {
                icon: Layers,
                title: "Implementation Toolkit",
                description: "60+ practical tools for transformation",
                features: ["Step-by-step Guides", "Progress Tracking", "Change Playbooks"]
              }
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6">
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-300 mb-6">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations that have successfully transformed with Human Glue
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2">
            Schedule Your Strategy Session
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </div>

      {/* Unified Chat System - Single Instance - Outside of main content */}
      <UnifiedChatSystem 
        onStateChange={onChatStateChange} 
        isHeroVisible={isHeroVisible}
        userData={userData}
      />
    </div>
  )
} 