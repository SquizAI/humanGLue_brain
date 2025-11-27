'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UnifiedChatSystem } from './UnifiedChatSystem'
import { ChatErrorBoundary } from './ChatErrorBoundary'
import { HeroChat } from '../organisms/HeroChat'
import { DynamicAssessmentCards } from '../organisms/DynamicAssessmentCards'
import { DynamicRoadmap } from '../organisms/DynamicRoadmap'
import { ROICalculator } from '../organisms/ROICalculator'
import { Navigation } from '../organisms/Navigation'
import { AnimatedWave } from '../organisms/AnimatedWave'
import { Footer } from '../organisms/Footer'
import { ExitIntentModal } from '../organisms/ExitIntentModal'
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Play,
  X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useChat } from '../../lib/contexts/ChatContext'
import { ChatState } from '../../lib/types'
import { useExitIntent } from '../../lib/hooks/useExitIntent'
import { useScrollTriggers } from '../../lib/hooks/useScrollTriggers'
import Image from 'next/image'

export function EnhancedHomepage() {
  const { userData, chatState, onChatStateChange, setIsChatOpen, setChatState } = useChat()
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showROI, setShowROI] = useState(false)
  const [currentRoadmapStep, setCurrentRoadmapStep] = useState(-1)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHeroVisible, setIsHeroVisible] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const roadmapRef = useRef<HTMLDivElement>(null)
  const roiRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Exit Intent Detection - Fixed with refs instead of state
  const shouldShowExitIntent = chatState === 'initial' || chatState === 'greeting'
  const { showExitIntent, closeExitIntent } = useExitIntent(shouldShowExitIntent)

  // Scroll Triggers - Fixed with proper memoization
  const shouldEnableScrollTriggers = chatState === 'initial' || chatState === 'greeting'

  // Memoize options to prevent infinite re-renders
  const scrollTriggerOptions = useMemo(() => ({
    enabled: shouldEnableScrollTriggers,
    persistTriggers: true,
  }), [shouldEnableScrollTriggers])

  const { metrics, hasTrigger } = useScrollTriggers(scrollTriggerOptions)

  // Contextual CTA state based on scroll triggers
  const [showScrollCTA, setShowScrollCTA] = useState<{
    visible: boolean
    message: string
    variant: 'scroll-50' | 'scroll-75' | 'bounce' | null
  }>({
    visible: false,
    message: '',
    variant: null,
  })

  // Show contextual CTAs based on scroll triggers
  useEffect(() => {
    if (!shouldEnableScrollTriggers) return

    // Priority order: bounce > scroll-75 > scroll-50
    // Show CTA for 8 seconds then hide

    if (hasTrigger('bounce') && !showScrollCTA.visible) {
      setShowScrollCTA({
        visible: true,
        message: 'Still have questions? Start the assessment',
        variant: 'bounce',
      })

      setTimeout(() => {
        setShowScrollCTA((prev) => ({ ...prev, visible: false }))
      }, 8000)
    } else if (hasTrigger('scroll-75') && !showScrollCTA.visible && !hasTrigger('bounce')) {
      setShowScrollCTA({
        visible: true,
        message: 'Join companies transforming with AI',
        variant: 'scroll-75',
      })

      setTimeout(() => {
        setShowScrollCTA((prev) => ({ ...prev, visible: false }))
      }, 8000)
    } else if (hasTrigger('scroll-50') && !showScrollCTA.visible && !hasTrigger('scroll-75') && !hasTrigger('bounce')) {
      setShowScrollCTA({
        visible: true,
        message: 'Ready to see your AI readiness score?',
        variant: 'scroll-50',
      })

      setTimeout(() => {
        setShowScrollCTA((prev) => ({ ...prev, visible: false }))
      }, 8000)
    }
  }, [hasTrigger, shouldEnableScrollTriggers, showScrollCTA.visible])

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

  // Handle video loading with enhanced reliability
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let retryTimeout: NodeJS.Timeout | null = null

    const handleLoadedData = () => {
      setVideoLoaded(true)
      setVideoError(false)
      console.log('[Video] Successfully loaded')
    }

    const handleError = () => {
      setVideoError(true)
      setVideoLoaded(false)
      console.warn('[Video] Failed to load, falling back to static image')
    }

    const handleCanPlay = () => {
      // Video is ready to play
      setVideoLoaded(true)
      console.log('[Video] Ready to play')
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    // Force load the video
    video.load()

    // Attempt to play the video
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[Video] Autoplay started successfully')
        })
        .catch((error) => {
          console.warn('[Video] Autoplay prevented:', error.message)
          // Autoplay was prevented, but video will still be visible when user interacts
          // This is common on mobile and some browsers - not an error
        })
    }

    // Fallback: If video doesn't load within 5 seconds, show error
    // We use a timeout to prevent waiting forever if video loading stalls
    retryTimeout = setTimeout(() => {
      // Check the video's readyState to determine if it loaded
      if (video.readyState < 2) { // HAVE_CURRENT_DATA or higher means loaded
        console.warn('[Video] Loading timeout (readyState:', video.readyState + ') - falling back to static image')
        setVideoError(true)
      }
    }, 5000)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [])

  // Handler to start assessment (open chat and set to greeting state)
  const handleStartAssessment = () => {
    setChatState('greeting')
    setIsChatOpen(true)
    closeExitIntent() // Close exit intent modal if open
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <Navigation />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[51]"
        style={{ scaleX: scrollProgress, transformOrigin: '0% 0%' }}
      />

      {/* Main Content - Adjust margin when sidebar is visible, padding-bottom for mobile chat */}
      <div className={cn(
        "transition-all duration-300",
        !isHeroVisible ? "mr-[480px]" : "",
        "pb-[50vh] lg:pb-0" // Add bottom padding on mobile for chat footer
      )}>
        {/* Hero Section with Chat */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background Video */}
          <div className="absolute inset-0">
            {!videoError ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-700",
                    videoLoaded ? "opacity-100" : "opacity-0"
                  )}
                  poster="/optimized/herobackground-desktop.jpg"
                >
                  <source
                    src="https://framerusercontent.com/assets/bA94l9akR9HvaEC25OtLJwJuocU.mp4"
                    type="video/mp4"
                  />
                </video>
                {/* Loading state - show optimized poster image while video loads */}
                {!videoLoaded && (
                  <div className="absolute inset-0">
                    <picture>
                      <source
                        media="(max-width: 640px)"
                        type="image/avif"
                        srcSet="/optimized/herobackground-mobile.avif"
                      />
                      <source
                        media="(max-width: 640px)"
                        type="image/webp"
                        srcSet="/optimized/herobackground-mobile.webp"
                      />
                      <source
                        media="(max-width: 1280px)"
                        type="image/avif"
                        srcSet="/optimized/herobackground-tablet.avif"
                      />
                      <source
                        media="(max-width: 1280px)"
                        type="image/webp"
                        srcSet="/optimized/herobackground-tablet.webp"
                      />
                      <source
                        type="image/avif"
                        srcSet="/optimized/herobackground-desktop.avif"
                      />
                      <source
                        type="image/webp"
                        srcSet="/optimized/herobackground-desktop.webp"
                      />
                      <img
                        src="/optimized/herobackground-desktop.jpg"
                        alt="HumanGlue Platform Background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                )}
              </>
            ) : (
              // Fallback optimized image if video fails to load
              <div className="absolute inset-0">
                <picture>
                  <source
                    media="(max-width: 640px)"
                    type="image/avif"
                    srcSet="/optimized/herobackground-mobile.avif"
                  />
                  <source
                    media="(max-width: 640px)"
                    type="image/webp"
                    srcSet="/optimized/herobackground-mobile.webp"
                  />
                  <source
                    media="(max-width: 1280px)"
                    type="image/avif"
                    srcSet="/optimized/herobackground-tablet.avif"
                  />
                  <source
                    media="(max-width: 1280px)"
                    type="image/webp"
                    srcSet="/optimized/herobackground-tablet.webp"
                  />
                  <source
                    type="image/avif"
                    srcSet="/optimized/herobackground-desktop.avif"
                  />
                  <source
                    type="image/webp"
                    srcSet="/optimized/herobackground-desktop.webp"
                  />
                  <img
                    src="/optimized/herobackground-desktop.jpg"
                    alt="HumanGlue Platform Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </picture>
              </div>
            )}
          </div>

          {/* Large HumanGlue Logo Branding */}
          <div className="absolute inset-0 flex items-start justify-center pt-24 pointer-events-none z-[5]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full"
            >
              <Image
                src="/HumnaGlue_logo_hero.png"
                alt="HumanGlue"
                width={2400}
                height={500}
                className="w-full h-auto"
                priority
              />
            </motion.div>
          </div>

          <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-20 lg:pb-20 pb-32">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Left Content - Takes all available space */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 max-w-2xl"
              >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6"
              >
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-xs sm:text-sm text-white/90 font-diatype">AI-Powered Transformation</span>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-gendy">
                  Disruption is here.
                </h2>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-gendy">
                  What you do next matters.
                </h2>
              </div>

              {/* Hero CTAs - Above the fold */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 sm:mt-10 space-y-6"
              >
                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Primary CTA - Start Assessment */}
                  <motion.button
                    onClick={handleStartAssessment}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'group px-8 py-4 rounded-full font-semibold text-white',
                      'bg-gradient-to-r from-blue-600 to-purple-600',
                      'hover:from-blue-500 hover:to-purple-500',
                      'transition-all duration-300',
                      'hover:shadow-xl hover:shadow-blue-500/30',
                      'flex items-center justify-center gap-2',
                      'font-diatype text-lg'
                    )}
                  >
                    Start Free Assessment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Secondary CTA - Watch Demo */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'group px-8 py-4 rounded-full font-semibold',
                      'border-2 border-white/30 backdrop-blur-sm bg-white/5',
                      'text-white hover:bg-white/10 hover:border-white/50',
                      'transition-all duration-300',
                      'flex items-center justify-center gap-2',
                      'font-diatype text-lg'
                    )}
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </motion.button>
                </div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-white/70"
                >
                  <div className="flex items-center gap-2 font-diatype">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 font-diatype">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>5 minutes to complete</span>
                  </div>
                  <div className="flex items-center gap-2 font-diatype">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Enterprise secure</span>
                  </div>
                </motion.div>
              </motion.div>
              </motion.div>

              {/* Right Content - Unified Chat System in hero mode (DESKTOP ONLY) */}
              {/* Fixed width to prevent pushing left content when chat expands */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex justify-center items-start pt-8 lg:pt-8 flex-shrink-0 w-auto"
              >
                {isHeroVisible && (
                  <ChatErrorBoundary>
                    <UnifiedChatSystem
                      isHeroVisible={isHeroVisible}
                      onShowROI={() => setShowROI(true)}
                      onShowRoadmap={() => setShowRoadmap(true)}
                    />
                  </ChatErrorBoundary>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mobile Sticky Footer Chat - Only visible on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <ChatErrorBoundary>
            <UnifiedChatSystem
              isHeroVisible={isHeroVisible}
              onShowROI={() => setShowROI(true)}
              onShowRoadmap={() => setShowRoadmap(true)}
              isMobileSticky={true}
            />
          </ChatErrorBoundary>
        </div>

        {/* Dynamic Assessment Cards - Appear as user progresses through chat */}
        <AnimatePresence>
          {chatState !== 'initial' && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative py-12 bg-gradient-to-b from-gray-900 to-gray-900/50"
              id="ai-transformation"
            >
              <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                <DynamicAssessmentCards
                  chatState={chatState}
                  userData={userData}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

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

        {/* Stats Section */}
        <section className="relative py-20 bg-gray-950">
          <div className="container max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white max-w-2xl font-gendy">
                Beneath the buzzwords lies a hard truth: Work is breaking. So are the people doing it.
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
              {[
                {
                  percentage: "75%",
                  stat: "54% of companies can't connect innovation to impact.",
                  detail: "Only 6% of execs are satisfied with their innovation performance.",
                  width: 75
                },
                {
                  percentage: "6%",
                  stat: "54% of companies can't connect innovation to impact.",
                  detail: "Only 6% of execs are satisfied with their innovation performance.",
                  width: 6
                },
                {
                  percentage: "82%",
                  stat: "Two-thirds of leaders feel found in 62% of managers struggle to lead across generations.",
                  detail: "",
                  width: 82
                },
                {
                  percentage: "56%",
                  stat: "More than half of employees feel due to lack of development.",
                  detail: "Belonging boosts job performance by 56%, tenure turnover falls by 50%.",
                  width: 56
                },
                {
                  percentage: "25%",
                  stat: "90% of leaders admit disengagement is a threat.",
                  detail: "Only 25% have a plan to fix it.",
                  width: 25
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple" />
                    </div>
                    <div className="text-3xl font-bold text-brand-cyan font-gendy">{item.percentage}</div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className="h-full bg-brand-cyan"
                    />
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-gendy">{item.stat}</p>
                  {item.detail && <p className="text-xs text-gray-400 leading-relaxed font-gendy">{item.detail}</p>}
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-brand-cyan text-sm font-gendy"
            >
              Pro tip: It's not just a productivity crisis. It's a purpose crisis.
            </motion.p>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/HGsolution_background.png"
              alt="Background"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 container max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-gendy">
                The Human Glue Solution
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed font-gendy">
                Our Adaptation Accelerator blends diagnostic assessments, leadership coaching, AI fluency, and culture design into a powerful new model for future-ready transformation. Your Strategy for the Human + AI Era.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  title: "Human Intellect\n+ AI Dynamics",
                  description: "Accelerate adoption while elevating human value. We help people embrace tech without losing what makes them irreplaceable.",
                  cta: "Learn More →"
                },
                {
                  title: "Performance\n+ Belonging",
                  description: "Engagement, retention, and generational trust aren't perks, they're performance drivers. We measure what matters most.",
                  cta: "Learn More →"
                },
                {
                  title: "Future-Proof\nRoadmaps",
                  description: "We align your goals with fast-evolving realities like AI, Agents, new work models, so your team is ready for what's next.",
                  cta: "Learn More →"
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
                  <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:border-gray-700 transition-all h-full flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-4 whitespace-pre-line leading-tight font-gendy">{solution.title}</h3>
                    <p className="text-gray-300 text-sm mb-6 flex-grow leading-relaxed font-gendy">{solution.description}</p>
                    <button className="text-brand-cyan font-semibold hover:text-brand-cyan/80 transition-colors text-sm font-gendy">
                      {solution.cta}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Adapt. Lead. Thrive Section */}
        <section className="relative py-24 bg-gradient-to-br from-brand-cyan via-blue-300 to-pink-300">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="relative">
              {/* Top Row - 2 Circular Photos */}
              <div className="flex justify-center items-center gap-12 mb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: -20 }}
                  whileInView={{ scale: 1, opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{
                    scale: { delay: 0.1, type: "spring", stiffness: 100 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img
                    src="/team/professional-leader.jpg"
                    alt="Professional leader"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: -20 }}
                  whileInView={{ scale: 1, opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -2, 0]
                  }}
                  transition={{
                    scale: { delay: 0.2, type: "spring", stiffness: 100 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                    rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                  }}
                  className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img
                    src="/team/business-executive.jpg"
                    alt="Business executive"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Main Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 text-center mb-8 leading-tight font-gendy"
              >
                Adapt. Lead. Thrive.
              </motion.h2>

              {/* Bottom Row - 2 Circular Photos */}
              <div className="flex justify-center items-center gap-12 mb-12">
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  whileInView={{ scale: 1, opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{
                    scale: { delay: 0.3, type: "spring", stiffness: 100 },
                    y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
                    rotate: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                  }}
                  className="w-36 h-36 rounded-full bg-gray-200 overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img
                    src="/team/innovation-leader.jpg"
                    alt="Innovation leader"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  whileInView={{ scale: 1, opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 3, 0]
                  }}
                  transition={{
                    scale: { delay: 0.4, type: "spring", stiffness: 100 },
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                    rotate: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                  }}
                  className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img
                    src="/team/strategic-advisor.jpg"
                    alt="Strategic advisor"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Description Text */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center text-gray-900 text-lg max-w-2xl mx-auto leading-relaxed font-gendy"
              >
                In a world transformed by AI, Human Glue gives leaders and teams the edge, equipping them to drive progress, not just keep pace.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      {/* Unified Chat System - Transitions to sidebar when scrolled */}
      {!isHeroVisible && (
        <ChatErrorBoundary>
          <UnifiedChatSystem
            isHeroVisible={isHeroVisible}
            onShowROI={() => setShowROI(true)}
            onShowRoadmap={() => setShowRoadmap(true)}
          />
        </ChatErrorBoundary>
      )}

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitIntent}
        onClose={closeExitIntent}
        onStartAssessment={handleStartAssessment}
      />

      {/* Scroll-Triggered Contextual CTA */}
      <AnimatePresence>
        {showScrollCTA.visible && !showExitIntent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4"
          >
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="p-5 backdrop-blur-xl bg-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base mb-2">
                      {showScrollCTA.message}
                    </p>
                    <p className="text-white/80 text-sm">
                      Free 5-minute assessment • No credit card required
                    </p>
                  </div>
                  <motion.button
                    onClick={handleStartAssessment}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
                  >
                    Start Now
                    <ArrowRight className="w-4 h-4 inline-block ml-2" />
                  </motion.button>
                </div>

                {/* Progress indicator for scroll depth */}
                <div className="mt-3 w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.scrollDepth}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowScrollCTA((prev) => ({ ...prev, visible: false }))}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 