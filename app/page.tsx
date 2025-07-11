'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Navigation } from '../components/organisms/Navigation'
import { Footer } from '../components/organisms/Footer'
import DynamicBackground from '../components/DynamicBackground'
import { AIInsightsBanner } from '../components/AIInsightsBanner'
import { MobileLayout } from '../components/templates/MobileLayout'
import { HeroSection } from '../components/templates/HeroSection'
import { ChatTransitionWrapper } from '../components/templates/ChatTransitionWrapper'
import { SharedChatInterface } from '../components/templates/SharedChatInterface'
import { GlobalAIChat } from '../components/templates/GlobalAIChat'
import { ChatState, UIState } from '../lib/types'
import { cn } from '../utils/cn'
import { useChat } from '../lib/contexts/ChatContext'
import { 
  ArrowRight, 
  Brain, 
  Users, 
  Zap, 
  BarChart3, 
  Building2, 
  Target,
  TrendingUp,
  Shield,
  Layers,
  CheckCircle,
  Globe,
  Award,
  ChevronDown,
  Play,
  Sparkles
} from 'lucide-react'

// Dynamic content based on user journey
const dynamicContent = {
  default: {
    headline: "Transform Your Organization",
    subheadline: "with AI-Powered Insights",
    description: "Start a conversation to discover how Human Glue can strengthen your teams and drive measurable outcomes."
  },
  welcoming: {
    headline: "Welcome to Human Glue",
    subheadline: "Let's explore your challenges",
    description: "We're analyzing your organizational context to provide personalized insights."
  },
  exploring: {
    headline: "Understanding Your",
    subheadline: "Unique Challenges",
    description: "Every organization is different. We're tailoring our approach to your specific needs."
  },
  analyzing: {
    headline: "Analyzing Your",
    subheadline: "Organizational DNA",
    description: "Our AI is processing millions of data points to identify opportunities for transformation."
  },
  presenting: {
    headline: "Your Personalized",
    subheadline: "Transformation Roadmap",
    description: "Based on our analysis, here's how we can help you achieve your goals."
  }
}

export default function Home() {
  const [uiState, setUIState] = useState<UIState>('default')
  const [showVideo, setShowVideo] = useState(false)
  const [activeSections, setActiveSections] = useState<string[]>(['hero'])
  const [isHeroVisible, setIsHeroVisible] = useState(true)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  
  // Use shared chat context
  const { 
    messages, 
    setMessages, 
    userData, 
    setUserData, 
    chatState, 
    setChatState,
    suggestions,
    setSuggestions 
  } = useChat()

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleChatStateChange = (newState: ChatState, data?: any) => {
    setChatState(newState)
    
    if (data) {
      // Use the full updated userData object from the chat
      setUserData(data)
    }
    
    // Update UI state based on chat progress
    switch (newState) {
      case 'greeting':
        setUIState('welcoming')
        break
      case 'discovery':
        setUIState('exploring')
        // Smoothly add sections without jumping
        setTimeout(() => setActiveSections(prev => Array.from(new Set([...prev, 'solutions']))), 300)
        break
      case 'assessment':
        setUIState('analyzing')
        setTimeout(() => setActiveSections(prev => Array.from(new Set([...prev, 'solutions', 'process']))), 300)
        break
      case 'solution':
        setUIState('presenting')
        setTimeout(() => setActiveSections(prev => Array.from(new Set([...prev, 'solutions', 'process', 'results']))), 300)
        break
      default:
        setUIState('default')
    }
  }

  const content = dynamicContent[uiState]

  // Track hero visibility for sticky chat
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero')
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        setIsHeroVisible(rect.bottom > 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent automatic scrolling when sections appear
  useEffect(() => {
    const preventAutoScroll = () => {
      // Temporarily disable scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
    }
    
    preventAutoScroll()
    
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto'
      }
    }
  }, [])

  // Show loading state while detecting device type
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-500 rounded-full" />
        </div>
      </div>
    )
  }

  // Use mobile layout for mobile devices
  if (isMobile) {
    return <MobileLayout backgroundState={uiState}>{null}</MobileLayout>
  }

  // Desktop layout
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-blue-600 text-white rounded-lg">
        Skip to main content
      </a>
      
      <div className="relative min-h-screen overflow-x-hidden">
        <DynamicBackground 
          state={uiState} 
          showImage={true} // Re-enable background image
          overlayOpacity={0.7}
          isHero={true}
        />
        <Navigation />
        
        {/* AI Insights Banner */}
        <AIInsightsBanner />

        {/* Main Content */}
        <main id="main-content" className="transition-all duration-300">
        {/* Hero Section - AI-First Design */}
        <HeroSection 
          videoSrc="/HumanGlue.mp4"
          overlayOpacity={0.3}
          minHeight="100vh"
        >
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container max-w-7xl mx-auto px-6 transition-all duration-300">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Dynamic content with smooth transitions */}
            <motion.div 
              className="text-center lg:text-left min-h-[300px] lg:min-h-[400px] flex flex-col justify-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${uiState}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Dynamic badge */}
                  {uiState !== 'default' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-300">
                        {uiState === 'welcoming' && 'Getting Started'}
                        {uiState === 'exploring' && `Learning about ${userData.company || 'your organization'}`}
                        {uiState === 'analyzing' && 'AI Analysis in Progress'}
                        {uiState === 'presenting' && 'Your Custom Solution'}
                      </span>
                    </motion.div>
                  )}

                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                    {content.headline}
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      {content.subheadline}
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8 max-w-xl mx-auto lg:mx-0">
                    {content.description}
                  </p>

                  {/* Primary CTAs - Always visible */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowVideo(true)}
                      className="group px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-3 shadow-lg"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Play className="w-5 h-5" />
                      </motion.div>
                      Watch Demo
                    </motion.button>
                    
                    {/* Show additional CTA when presenting */}
                    {uiState === 'presenting' && userData.company ? (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                      >
                        View {userData.company} Transformation Plan
                        <ArrowRight className="w-5 h-5 ml-2 inline" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const chatSection = document.querySelector('#chat')
                          chatSection?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-3 shadow-lg"
                      >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Scroll indicator */}
                  {uiState === 'default' && (
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="text-gray-300 text-sm mt-6 flex items-center gap-2 justify-center lg:justify-start"
                    >
                      <span>Or start chatting below</span>
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  )}

                  {/* Dynamic user context */}
                  {userData.company && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-12 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Analyzing for</p>
                          <p className="text-sm font-medium text-white">{userData.company}</p>
                          {userData.role && <p className="text-xs text-gray-400">{userData.role}</p>}
                        </div>
                        {userData.size && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Organization Size</p>
                            <p className="text-sm font-medium text-white">{userData.size}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right side - Chat Interface for Hero */}
            {isHeroVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-10 min-h-[500px] lg:min-h-[600px]"
              >
                {/* Animated glow effect */}
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Chat container */}
                <div className="relative">
                  <SharedChatInterface 
                    onStateChange={handleChatStateChange}
                    userData={userData}
                    messages={messages}
                    setMessages={setMessages}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </HeroSection>

      {/* Dynamic Sections - Use min-height to prevent layout shifts */}
      <div className="relative">
        {/* Solutions Section */}
        <motion.section
          id="solutions"
          className={cn(
            "relative py-20 transition-all duration-500",
            activeSections.includes('solutions') ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 py-0'
          )}
        >
          <AnimatePresence>
            {activeSections.includes('solutions') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="container max-w-7xl mx-auto px-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Solutions Tailored to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      {userData.challenge || 'Your Needs'}
                    </span>
                  </h2>
                  <p className="text-lg text-gray-300">
                    {userData.company ? 
                      `Here's how we can help ${userData.company} overcome ${userData.challenge || 'organizational challenges'}.` :
                      'Our integrated approach addresses your specific organizational challenges.'
                    }
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Core Solutions from Human Glue */}
                  {[
                    {
                      icon: Brain,
                      title: "AI Assessment Tool",
                      description: "Multi-dimensional organizational analysis powered by advanced AI that goes beyond traditional surveys",
                      features: [
                        "NLP & Sentiment Analysis",
                        "Pattern Recognition",
                        "Predictive Analytics",
                        "Real-time Insights",
                        "Comprehensive 5-Dimension Analysis"
                      ],
                      details: "Assesses Leadership Effectiveness, Culture & Values, Organizational Structure, Employee Experience, and Innovation Readiness",
                      color: "blue"
                    },
                    {
                      icon: Users,
                      title: "Strategic Workshops",
                      description: "Expert-facilitated sessions that validate AI insights and build consensus on transformation priorities",
                      features: [
                        "Assessment Result Validation",
                        "Priority Setting",
                        "Action Planning",
                        "Leadership Alignment",
                        "Change Readiness Assessment"
                      ],
                      details: "Full-day workshops with executive, virtual, and team-specific formats available",
                      color: "purple"
                    },
                    {
                      icon: Layers,
                      title: "Human Glue Toolbox",
                      description: "Comprehensive implementation toolkit with 60+ practical tools across 5 core organizational areas",
                      features: [
                        "Organizational Network Analysis",
                        "Role Clarity Framework",
                        "Employee Journey Mapping",
                        "Culture Activation Kit",
                        "Change Management Playbooks"
                      ],
                      details: "Modular, adaptable tools with step-by-step implementation guides and progress tracking",
                      color: "green"
                    }
                  ].map((solution, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${solution.color}-500/20 to-${solution.color}-600/20 flex items-center justify-center mb-6`}>
                          <solution.icon className={`w-8 h-8 text-${solution.color}-400`} />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-3">{solution.title}</h3>
                        <p className="text-gray-300 mb-4">{solution.description}</p>
                        {solution.details && (
                          <p className="text-sm text-gray-400 mb-6 italic">{solution.details}</p>
                        )}
                        <ul className="space-y-2">
                          {solution.features.slice(0, 4).map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {solution.features.length > 4 && (
                          <p className="text-xs text-gray-500 mt-3">+{solution.features.length - 4} more features</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Process Section */}
        <motion.section
          key="process"
          className={cn(
            "relative py-20 bg-gradient-to-b from-transparent via-gray-800/50 to-transparent transition-all duration-500",
            activeSections.includes('process') ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 py-0'
          )}
        >
          <AnimatePresence>
            {activeSections.includes('process') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="container max-w-7xl mx-auto px-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Our Proven Process
                  </h2>
                  <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                    A systematic approach that combines AI-powered insights with human expertise to drive lasting organizational transformation
                  </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />
                  {[
                    { 
                      phase: "Initial Discovery",
                      duration: "2-4 weeks",
                      description: "Deep dive into your organizational context and challenges",
                      activities: [
                        "Stakeholder interviews",
                        "Current state analysis",
                        "Goal alignment",
                        "Success metrics definition"
                      ]
                    },
                    { 
                      phase: "AI Assessment",
                      duration: "1-2 weeks",
                      description: "Comprehensive multi-dimensional analysis using our proprietary AI platform",
                      activities: [
                        "Employee survey deployment",
                        "Data collection & analysis",
                        "Pattern recognition",
                        "Insight generation"
                      ]
                    },
                    { 
                      phase: "Strategic Workshop",
                      duration: "1-2 days",
                      description: "Leadership alignment and action planning based on AI insights",
                      activities: [
                        "Results validation",
                        "Priority setting",
                        "Roadmap development",
                        "Quick wins identification"
                      ]
                    },
                    { 
                      phase: "Implementation",
                      duration: "3-6 months",
                      description: "Structured deployment with continuous support and optimization",
                      activities: [
                        "Toolbox deployment",
                        "Change management",
                        "Progress monitoring",
                        "Iterative refinement"
                      ]
                    }
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i % 2 ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`relative flex ${i % 2 ? 'justify-start' : 'justify-end'} mb-8`}
                    >
                      <div className={`w-1/2 ${i % 2 ? 'pl-8' : 'pr-8 text-right'}`}>
                        <motion.div 
                          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                          whileHover={{ scale: 1.02 }}
                        >
                          <h3 className="text-xl font-semibold text-white mb-2">{step.phase}</h3>
                          <p className="text-sm text-blue-400 mb-3">{step.duration}</p>
                          <p className="text-gray-300 mb-4">{step.description}</p>
                          {step.activities && (
                            <ul className="space-y-1">
                              {step.activities.map((activity, j) => (
                                <li key={j} className="text-xs text-gray-400 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      </div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Results Section */}
        <motion.section
          id="results"
          className={cn(
            "relative py-20 transition-all duration-500",
            activeSections.includes('results') ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 py-0'
          )}
        >
          <AnimatePresence>
            {activeSections.includes('results') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="container max-w-7xl mx-auto px-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Expected Outcomes
                  </h2>
                  <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                    Based on industry research and AI-powered predictions for organizations like yours
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* GlobalFinance Case Study Results */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Building2 className="w-6 h-6 text-blue-400" />
                      <h3 className="text-2xl font-semibold text-white">Projected Impact</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { metric: "Employee Engagement", improvement: "Target", baseline: "Based on your industry" },
                        { metric: "Organizational Efficiency", improvement: "Goal", baseline: "Customized to your needs" },
                        { metric: "Innovation Capacity", improvement: "Potential", baseline: "AI-predicted opportunity" },
                        { metric: "Team Collaboration", improvement: "Objective", baseline: "Tailored benchmark" }
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <div>
                            <p className="text-white font-medium">{item.metric}</p>
                            <p className="text-xs text-gray-400">{item.baseline}</p>
                          </div>
                          <div className="text-lg font-medium text-blue-400">{item.improvement}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Financial Impact */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      <h3 className="text-2xl font-semibold text-white">Financial Impact</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="text-center py-6 border-b border-white/10">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          Custom ROI
                        </div>
                        <p className="text-gray-300 mt-2">Tailored to Your Organization</p>
                        <p className="text-xs text-gray-400 mt-1">Calculate during assessment</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">TBD</div>
                          <p className="text-xs text-gray-400">Your ROI</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">Custom</div>
                          <p className="text-xs text-gray-400">Timeline</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-16 text-center"
                >
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Ready to Transform Your Organization?
                  </h3>
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Be among the first to experience our AI-powered approach to organizational transformation.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const chatSection = document.querySelector('#chat')
                      chatSection?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-3"
                  >
                    Start Your Transformation Journey
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>

      {/* Chat Transition Wrapper - Moved outside main content for proper z-index layering */}
      <ChatTransitionWrapper
        onStateChange={handleChatStateChange}
        userData={userData}
        isHeroVisible={isHeroVisible}
        messages={messages}
        setMessages={setMessages}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />
    </>
  )
}