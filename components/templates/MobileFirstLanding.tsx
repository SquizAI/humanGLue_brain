'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  MessageCircle, 
  Sparkles, 
  Brain,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
  Star,
  Building2,
  Zap,
  Menu,
  X,
  ArrowRight,
  Play,
  Check
} from 'lucide-react'
import Image from 'next/image'

interface MobileFirstLandingProps {
  onOpenChat?: () => void
}

export function MobileFirstLanding({ onOpenChat }: MobileFirstLandingProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 300], [0, -50])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5])
  
  // Stats animation
  const [statsVisible, setStatsVisible] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      const sections = ['hero', 'problem', 'solution', 'process', 'results', 'cta']
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          if (top <= window.innerHeight / 2 && bottom >= window.innerHeight / 2) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const stats = [
    { value: '94%', label: 'Success Rate', icon: Target },
    { value: '3.2x', label: 'Average ROI', icon: TrendingUp },
    { value: '500+', label: 'Companies', icon: Building2 },
    { value: '30d', label: 'Time to Value', icon: Zap }
  ]

  const solutions = [
    {
      title: 'AI Assessment',
      description: 'Deep organizational analysis using advanced AI',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      features: ['5-Dimension Analysis', 'Real-time Insights', 'Custom Roadmap']
    },
    {
      title: 'Strategic Workshops', 
      description: 'Expert-facilitated transformation sessions',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      features: ['Leadership Alignment', 'Team Building', 'Action Planning']
    },
    {
      title: 'Implementation Tools',
      description: '60+ practical tools and playbooks',
      icon: Target,
      color: 'from-green-500 to-green-600',
      features: ['Step-by-step Guides', 'Progress Tracking', 'Best Practices']
    }
  ]

  const processSteps = [
    { title: 'Discovery', time: '1 week', description: 'Understand your unique challenges' },
    { title: 'Assessment', time: '2 weeks', description: 'AI-powered organizational analysis' },
    { title: 'Strategy', time: '1 week', description: 'Custom transformation roadmap' },
    { title: 'Implementation', time: '3-6 months', description: 'Guided execution with support' }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/HumanGlue_nobackground.png"
            alt="HumanGlue"
            width={100}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-40 bg-gray-900 pt-16"
          >
            <nav className="px-6 py-8 space-y-6">
              {['Solutions', 'Process', 'Results', 'About', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-2xl font-medium text-gray-300 hover:text-white transition-colors"
                  whileHover={{ x: 10 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.button
                onClick={() => {
                  setIsMenuOpen(false)
                  onOpenChat?.()
                }}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start AI Assessment
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full px-4 py-12"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">AI-Powered Transformation</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Organization
              </span>
              with AI
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              Strengthen the human connections that drive performance, innovation, and resilience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4">
              <motion.button
                onClick={onOpenChat}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5" />
                Start Free Assessment
                <Sparkles className="w-4 h-4" />
              </motion.button>
              
              <button className="px-6 py-3 bg-gray-800/80 rounded-xl font-medium text-gray-300 flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch 2-min Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-3">Trusted by leading organizations</p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-300 ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="px-4 py-16 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-6 border border-red-900/30">
            <p className="text-lg text-gray-200 mb-4">
              Organizations are struggling to adapt to AI-driven change
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />
                <p className="text-gray-300">75% of employees fear being replaced by AI</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />
                <p className="text-gray-300">61% lack trust in leadership's AI strategy</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />
                <p className="text-gray-300">82% are reluctant to adopt AI tools</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-gray-900/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          onViewportEnter={() => setStatsVisible(true)}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={statsVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-4 text-center"
            >
              <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Solutions Section */}
      <section id="solution" className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Our Solution</h2>
          <div className="space-y-4">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0`}>
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{solution.description}</p>
                    <div className="space-y-1">
                      {solution.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process Section */}
      <section id="process" className="px-4 py-16 bg-gray-900/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Our Process</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500" />
            
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative flex gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="px-4 py-16 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Transform?</h2>
          <p className="text-lg text-white/90 mb-6">
            Join 500+ organizations already transforming with AI
          </p>
          <motion.button
            onClick={onOpenChat}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-sm text-white/70 mt-4">
            Free assessment • No credit card • 5 minutes
          </p>
        </motion.div>
      </section>

      {/* Floating Chat Button - Clean glassmorphic design */}
      <motion.button
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gray-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-30">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          style={{
            width: `${(['hero', 'problem', 'solution', 'process', 'results', 'cta'].indexOf(activeSection) + 1) * 20}%`
          }}
          transition={{ type: 'spring', damping: 30 }}
        />
      </div>
    </div>
  )
}