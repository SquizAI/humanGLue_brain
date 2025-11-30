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
  Heart
} from 'lucide-react'
import { Navigation } from '../organisms/Navigation'
import { Footer } from '../organisms/Footer'
import { Button } from '../atoms/Button'
import { cn } from '../../utils/cn'

// Inline Components
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
      gradient: 'from-blue-500 to-blue-600',
      border: 'border-blue-500/20',
      glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]',
      icon: 'text-blue-400',
      bg: 'bg-blue-900/20'
    },
    coaching: {
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
      icon: 'text-amber-400',
      bg: 'bg-amber-900/20'
    },
    marketplace: {
      gradient: 'from-cyan-500 to-pink-500',
      border: 'border-cyan-500/20',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]',
      icon: 'text-cyan-400',
      bg: 'bg-cyan-900/20'
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
        "relative group",
        "bg-gray-900/50 backdrop-blur-sm rounded-2xl border",
        colors.border,
        "p-8 transition-all duration-300",
        "hover:scale-[1.02]",
        colors.glow
      )}
    >
      {/* Icon */}
      <motion.div
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center mb-6",
          colors.bg,
          "border",
          colors.border
        )}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <div className={colors.icon}>
          {icon}
        </div>
      </motion.div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-4">{headline}</h3>
      <p className="text-gray-300 text-lg mb-6 leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
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
      <Link href={cta.href}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-full px-6 py-3 rounded-lg font-semibold",
            "bg-gradient-to-r",
            colors.gradient,
            "text-white flex items-center justify-center gap-2",
            "transition-all duration-300"
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
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        {value.includes('+') ? `${displayValue.toLocaleString()}+` : value}
      </div>
      <div className="text-gray-400 text-sm md:text-base">{label}</div>
    </motion.div>
  )
}

// Main Component
export function ManifestoHomepage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Navigation />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-pink-900/20" />
          <motion.div
            className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block text-white">The Future of Work</span>
              <span className="block text-white">Isn't AI Replacing People.</span>
            </motion.h1>

            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              It's People, Transformed and Unstoppable with AI.
            </motion.h2>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              The biggest risk isn't AI. It's people left behind. We transform workforces from fragile to future-proof by unlocking human adaptability, embedding new behaviors, and accelerating change with AI.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/#chat">
                <Button
                  variant="gradient"
                  size="lg"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-2xl"
                  icon={<Rocket className="w-5 h-5" />}
                >
                  Measure Your Workforce Adaptability
                </Button>
              </Link>
              <Link href="/process">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-8 py-4"
                  icon={<Lightbulb className="w-5 h-5" />}
                >
                  Explore The Human Glue Approach
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Problem Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="block text-white">The Biggest Risk Isn't AI.</span>
              <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                It's People Left Behind.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Work is evolving faster than humans can keep up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Shield className="w-8 h-8" />, text: "Change management is broken, built for a slower era" },
              { icon: <TrendingUp className="w-8 h-8" />, text: "Workshops fade. Training gets ignored. Consultants stop short." },
              { icon: <Users className="w-8 h-8" />, text: "Employees wonder if they fit in an AI-driven future" },
              { icon: <Target className="w-8 h-8" />, text: "Meanwhile, leaders improvise without a transformation playbook" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all"
              >
                <div className="text-red-400 mb-4">{item.icon}</div>
                <p className="text-gray-300 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl border border-red-500/30 p-8 md:p-12 text-center"
          >
            <p className="text-2xl md:text-4xl font-bold text-white">
              "The biggest risk isn't AI. It's people left behind."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 md:py-32 relative bg-gradient-to-b from-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
              Transformation Only Succeeds<br />When People Succeed
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                To empower a future where every workforce is built on adaptability—where Humans + AI work stronger and smarter together.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                We transform workforces from fragile to future-proof by unlocking human adaptability, embedding new behaviors, and accelerating change with AI.
              </p>
            </motion.div>
          </div>

          {/* Before/After Transformation Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30 p-8 md:p-12"
          >
            <h3 className="text-3xl font-bold text-center text-white mb-12">What Transformation Looks Like</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              <TransformationMetric value="10,000+" label="Employees Transformed" delay={0.1} />
              <TransformationMetric value="500+" label="Leaders Reframed" delay={0.2} />
              <TransformationMetric value="85%" label="Behavior Success Rate" delay={0.3} />
              <TransformationMetric value="3.5x" label="ROI on Transformation" delay={0.4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="py-20 md:py-32 relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
              How Human Glue Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Three integrated pillars that transform your workforce from fragile to future-proof
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <PillarCard
              pillar="adaptability"
              icon={<Brain className="w-8 h-8" />}
              headline="The Adaptability Engine"
              description="Measure what matters: not just your tech readiness, but your people's adaptability."
              features={[
                "Assess every leader and employee on change readiness",
                "Reframe thinking from fear of AI to confidence in change",
                "Track behavior shifts in real-time",
                "Get your custom transformation roadmap"
              ]}
              cta={{ text: "Start Assessment", href: "/#chat" }}
              delay={0.1}
            />

            <PillarCard
              pillar="coaching"
              icon={<Zap className="w-8 h-8" />}
              headline="Human + AI Coaching"
              description="Workshops spark change. AI reinforcement + human coaching make it stick."
              features={[
                "Expert-led masterclasses on adaptability & AI",
                "Daily AI nudges that reinforce new behaviors",
                "1:1 human coaching for deeper transformation",
                "Community support & peer accountability"
              ]}
              cta={{ text: "Explore Programs", href: "/solutions" }}
              delay={0.2}
            />

            <PillarCard
              pillar="marketplace"
              icon={<Users className="w-8 h-8" />}
              headline="The Human Glue Talent Marketplace"
              description="A curated bench of vetted specialists—not a commodity gig platform."
              features={[
                "Transformation experts ranked for adaptability impact",
                "Culture-fit matching, not just skills matching",
                "Embedded teams for sustained change",
                "Measure impact on behaviors, not just deliverables"
              ]}
              cta={{ text: "Find Your Expert", href: "/solutions" }}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 relative bg-gradient-to-b from-gray-900 to-black">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="block text-white">We Don't Just Train.</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                We Future-Proof.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "People First, AI Accelerated",
                description: "We focus on transforming humans, not just plugging in technology."
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Transformation That Sticks",
                description: "Behaviors are reinforced until they become culture."
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Premium Expertise on Demand",
                description: "Curated talent to scale impact when you need it."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Resilient & Future-Proof",
                description: "Workforces ready for whatever comes next."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Exit Value",
                description: "Organizations built on adaptability become stronger, faster, and more valuable."
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Measurable Impact",
                description: "Track behavior change, not just completion rates."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-8 hover:border-blue-500/30 transition-all group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-32 relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
              The Results Speak for Themselves
            </h2>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30 p-8 md:p-12 mb-16 text-center"
          >
            <p className="text-2xl md:text-3xl font-semibold text-white mb-6 italic">
              "We didn't just implement AI. We transformed how our people think about change."
            </p>
            <p className="text-gray-400 text-lg">
              — CTO, Fortune 500 Manufacturing
            </p>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8">
            <TransformationMetric value="10,000+" label="Employees Transformed" delay={0.1} />
            <TransformationMetric value="500+" label="Leaders Reframed" delay={0.2} />
            <TransformationMetric value="85%" label="Behavior Embedding Success" delay={0.3} />
            <TransformationMetric value="40%" label="Increase in Change Adaptability" delay={0.4} />
            <TransformationMetric value="3.5x" label="ROI on Transformation" delay={0.5} />
          </div>
        </div>
      </section>

      {/* Final Rally */}
      <section className="py-20 md:py-32 relative bg-gradient-to-b from-black via-blue-900/20 to-cyan-900/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white">
              That's Human Glue.
            </h2>
            <p className="text-3xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              The Bond That Glues the Future Together.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/#chat">
                <Button
                  variant="gradient"
                  size="lg"
                  className="text-xl px-10 py-5 shadow-2xl"
                  icon={<Rocket className="w-6 h-6" />}
                >
                  Start Your Transformation Journey
                </Button>
              </Link>
              <Link href="/results">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-xl px-10 py-5"
                  icon={<Award className="w-6 h-6" />}
                >
                  Explore Case Studies
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
