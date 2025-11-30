'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Award,
  Lightbulb,
  Rocket,
  Heart,
  AlertTriangle
} from 'lucide-react'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/utils/cn'

// Reusable Components
interface PillarCardProps {
  pillar: 'adaptability' | 'coaching' | 'marketplace'
  icon: React.ReactNode
  headline: string
  description: string
  features: string[]
  cta: {
    text: string
    href: string
  }
  delay?: number
}

const PillarCard = ({ pillar, icon, headline, description, features, cta, delay = 0 }: PillarCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const pillarColors = {
    adaptability: {
      gradient: 'from-blue-500 to-cyan-500',
      border: 'border-blue-500/30',
      glow: 'hover:shadow-[0_0_60px_rgba(59,130,246,0.4)]',
      icon: 'text-blue-400',
      bg: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/20'
    },
    coaching: {
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/30',
      glow: 'hover:shadow-[0_0_60px_rgba(245,158,11,0.4)]',
      icon: 'text-amber-400',
      bg: 'bg-gradient-to-br from-amber-900/30 to-orange-900/20'
    },
    marketplace: {
      gradient: 'from-cyan-500 to-pink-500',
      border: 'border-cyan-500/30',
      glow: 'hover:shadow-[0_0_60px_rgba(168,85,247,0.4)]',
      icon: 'text-cyan-400',
      bg: 'bg-gradient-to-br from-cyan-900/30 to-pink-900/20'
    }
  }

  const colors = pillarColors[pillar]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={cn(
        "relative group h-full",
        "backdrop-blur-xl rounded-2xl border-2",
        colors.border,
        colors.bg,
        "p-8 transition-all duration-500",
        "hover:scale-[1.02] hover:border-opacity-60",
        colors.glow
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Icon */}
      <motion.div
        className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative z-10",
          "border-2",
          colors.border,
          "backdrop-blur-sm"
        )}
        style={{ background: `linear-gradient(135deg, ${pillarColors[pillar].bg})` }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className={colors.icon}>
          {icon}
        </div>
      </motion.div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{headline}</h3>
      <p className="text-gray-300 text-lg mb-6 leading-relaxed relative z-10">{description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8 relative z-10">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: delay + 0.1 + (index * 0.1) }}
            className="flex items-start gap-3 text-gray-300"
          >
            <CheckCircle className={cn("w-5 h-5 flex-shrink-0 mt-0.5", colors.icon)} />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={cta.href} className="relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-full px-6 py-4 rounded-xl font-semibold text-lg",
            "bg-gradient-to-r",
            colors.gradient,
            "text-white flex items-center justify-center gap-2",
            "shadow-lg transition-all duration-300",
            "hover:shadow-2xl"
          )}
        >
          {cta.text}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </Link>
    </motion.div>
  )
}

interface TransformationMetricProps {
  value: string
  label: string
  delay?: number
}

const TransformationMetric = ({ value, label, delay = 0 }: TransformationMetricProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView && typeof value === 'string' && value.includes('+')) {
      const targetValue = parseInt(value.replace(/\D/g, ''))
      let current = 0
      const increment = targetValue / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= targetValue) {
          setDisplayValue(targetValue)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, 30)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-3">
        {value.includes('+') ? `${displayValue.toLocaleString()}+` : value}
      </div>
      <div className="text-gray-400 text-base md:text-lg font-medium">{label}</div>
    </motion.div>
  )
}

// Main Component
export default function ManifestoPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section - Cinematic Entry */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold backdrop-blur-xl">
                The Human Glue Manifesto
              </span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block text-white mb-4">The Future of Work</span>
              <span className="block text-white mb-4">Isn't AI Replacing People.</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                It's People, Transformed.
              </span>
            </motion.h1>

            <motion.p
              className="text-2xl md:text-3xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              The bond that glues the future together.
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Problem Section */}
      <section className="py-32 md:py-40 relative bg-gradient-to-b from-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="block text-white mb-2">Why We Exist:</span>
              <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                The Problem
              </span>
            </h2>
            <p className="text-3xl md:text-4xl text-white font-bold max-w-4xl mx-auto mb-6">
              The biggest risk isn't AI.
            </p>
            <p className="text-3xl md:text-4xl text-white font-bold max-w-4xl mx-auto">
              It's people left behind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: <AlertTriangle className="w-10 h-10" />,
                title: "Change Management is Broken",
                text: "Built for a slower era. Today's pace demands a new approach."
              },
              {
                icon: <TrendingUp className="w-10 h-10" />,
                title: "Training Doesn't Stick",
                text: "Workshops fade. Training gets ignored. Consultants stop short of real transformation."
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Employees Wonder If They Fit",
                text: "In an AI-driven future, people question their relevance and value."
              },
              {
                icon: <Target className="w-10 h-10" />,
                title: "Leaders Improvise",
                text: "Without a transformation playbook, organizations stumble through change."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm rounded-2xl border-2 border-red-500/20 p-8 hover:border-red-500/40 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="text-red-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-r from-red-900/40 to-orange-900/40 rounded-3xl border-2 border-red-500/40 p-12 md:p-16 text-center backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]" />
            <p className="text-3xl md:text-5xl font-black text-white relative z-10 leading-tight">
              Work is evolving faster than<br />humans can keep up.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 md:py-40 relative bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-12">
              <span className="block text-white mb-2">Our Vision:</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Humans + AI, Stronger Together
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <div className="inline-block p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 mb-6">
                <Target className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6">Our Vision</h3>
              <p className="text-2xl text-gray-300 leading-relaxed">
                To empower a future where every workforce is built on <span className="text-blue-400 font-semibold">adaptability</span>—where Humans + AI work stronger and smarter together.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <div className="inline-block p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <Rocket className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-2xl text-gray-300 leading-relaxed">
                We transform workforces from <span className="text-red-400 font-semibold">fragile</span> to <span className="text-green-400 font-semibold">future-proof</span> by unlocking human adaptability, embedding new behaviors, and accelerating change with AI.
              </p>
            </motion.div>
          </div>

          {/* Transformation Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-pink-900/20 rounded-3xl border-2 border-blue-500/30 p-12 md:p-16 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
            <h3 className="text-4xl font-bold text-center text-white mb-16 relative z-10">Impact at Scale</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
              <TransformationMetric value="10,000+" label="Employees Transformed" delay={0.1} />
              <TransformationMetric value="500+" label="Leaders Reframed" delay={0.2} />
              <TransformationMetric value="85%" label="Behavior Success Rate" delay={0.3} />
              <TransformationMetric value="3.5x" label="ROI on Transformation" delay={0.4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="py-32 md:py-40 relative bg-gradient-to-b from-gray-900 to-black">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
              How We Do It:
            </h2>
            <p className="text-2xl md:text-3xl bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent font-bold mb-6">
              The Three Pillars
            </p>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              An integrated system that transforms your workforce from fragile to future-proof
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <PillarCard
              pillar="adaptability"
              icon={<Brain className="w-10 h-10" />}
              headline="The Adaptability Engine"
              description="Measure what actually matters: not just your tech readiness, but your people's capacity to adapt."
              features={[
                "Assess every leader and employee on change readiness",
                "Reframe thinking from fear of AI to confidence",
                "Track behavior shifts in real-time",
                "Get your custom transformation roadmap"
              ]}
              cta={{ text: "Start Assessment", href: "/#chat" }}
              delay={0.1}
            />

            <PillarCard
              pillar="coaching"
              icon={<Zap className="w-10 h-10" />}
              headline="Human + AI Coaching"
              description="Workshops spark change. AI reinforcement + human coaching make it stick forever."
              features={[
                "Expert-led masterclasses on adaptability & AI",
                "Daily AI nudges that embed new behaviors",
                "1:1 human coaching for deeper transformation",
                "Community support & peer accountability"
              ]}
              cta={{ text: "Explore Programs", href: "/solutions" }}
              delay={0.2}
            />

            <PillarCard
              pillar="marketplace"
              icon={<Users className="w-10 h-10" />}
              headline="The Talent Marketplace"
              description="A curated bench of vetted specialists—not a commodity gig platform."
              features={[
                "Experts ranked for adaptability impact",
                "Culture-fit matching, not just skills",
                "Embedded teams for sustained change",
                "Impact measured on behaviors, not deliverables"
              ]}
              cta={{ text: "Find Your Expert", href: "/solutions" }}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-32 md:py-40 relative bg-gradient-to-b from-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="block text-white mb-2">We Don't Just Train.</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                We Future-Proof.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-10 h-10" />,
                title: "People First, AI Accelerated",
                description: "We focus on transforming humans, not just plugging in technology. AI amplifies human potential."
              },
              {
                icon: <Sparkles className="w-10 h-10" />,
                title: "Transformation That Sticks",
                description: "Behaviors are reinforced daily until they become culture. Change becomes permanent."
              },
              {
                icon: <Award className="w-10 h-10" />,
                title: "Premium Expertise on Demand",
                description: "Curated talent marketplace to scale impact precisely when and where you need it."
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: "Resilient & Future-Proof",
                description: "Build workforces ready for whatever comes next. Adaptability becomes competitive advantage."
              },
              {
                icon: <TrendingUp className="w-10 h-10" />,
                title: "Exit Value",
                description: "Organizations built on adaptability become stronger, faster, and exponentially more valuable."
              },
              {
                icon: <CheckCircle className="w-10 h-10" />,
                title: "Measurable Impact",
                description: "Track actual behavior change and cultural shifts, not just training completion rates."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm rounded-2xl border-2 border-white/10 p-8 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-40 relative bg-gradient-to-b from-gray-900 via-blue-900/20 to-cyan-900/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-white leading-tight">
              That's Human Glue.
            </h2>
            <p className="text-4xl md:text-6xl font-bold mb-16 bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              The Bond That Glues<br />the Future Together.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/">
                <Button
                  variant="gradient"
                  size="lg"
                  className="text-xl px-12 py-6 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                  icon={<Rocket className="w-6 h-6" />}
                >
                  Start Your Transformation
                </Button>
              </Link>
              <Link href="/solutions">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-xl px-12 py-6"
                  icon={<Lightbulb className="w-6 h-6" />}
                >
                  Explore Solutions
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
