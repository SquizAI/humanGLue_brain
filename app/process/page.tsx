'use client'

import { ResponsiveLayout } from '../../components/templates/ResponsiveLayout'
import { HeroSection } from '../../components/templates/HeroSection'
import { motion } from 'framer-motion'
import { 
  Search,
  Brain,
  Users,
  Rocket,
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  Layers,
  Shield,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const processPhases = [
  {
    phase: "Assessment Phase",
    icon: Brain,
    color: "blue",
    description: "AI-powered data collection and analysis from multiple sources",
    details: [
      "Deploy multi-dimensional assessment across your organization",
      "Leverage NLP and machine learning for deep insights",
      "Analyze patterns in leadership, culture, and employee experience",
      "Generate predictive models for organizational health"
    ],
    outcomes: [
      "Comprehensive organizational health report",
      "Prioritized recommendations",
      "Predictive insights"
    ]
  },
  {
    phase: "Insight Generation",
    icon: Sparkles,
    color: "cyan",
    description: "Pattern recognition and predictive modeling to identify key challenges",
    details: [
      "Advanced analytics reveal hidden organizational dynamics",
      "Sentiment analysis uncovers employee perspectives",
      "Identify critical skills gaps and talent opportunities",
      "Benchmark against industry best practices"
    ],
    outcomes: [
      "Heat maps and visualizations",
      "Gap analysis reports",
      "Opportunity identification"
    ]
  },
  {
    phase: "Workshop Validation",
    icon: Users,
    color: "green",
    description: "Stakeholder engagement to validate findings and build consensus",
    details: [
      "Full-day structured facilitation with 15-25 diverse participants",
      "Validate AI findings with lived experiences",
      "Build consensus on transformation priorities",
      "Create shared vision for organizational future"
    ],
    outcomes: [
      "Validated priorities",
      "Leadership alignment",
      "Change readiness assessment"
    ]
  },
  {
    phase: "Action Planning",
    icon: Target,
    color: "amber",
    description: "Development of implementation roadmaps with clear ownership",
    details: [
      "Impact vs. effort mapping for strategic focus",
      "Identify top 3-5 transformation initiatives",
      "Assign clear ownership and accountability",
      "Define success metrics and milestones"
    ],
    outcomes: [
      "90-day action plan",
      "Transformation roadmap",
      "Success metrics framework"
    ]
  },
  {
    phase: "Implementation",
    icon: Rocket,
    color: "red",
    description: "Deployment of toolbox resources with ongoing support",
    details: [
      "Access to 60+ tools across 5 organizational areas",
      "Customizable frameworks and templates",
      "Change management support",
      "Progress tracking and optimization"
    ],
    outcomes: [
      "Deployed tools and resources",
      "Capability building",
      "Sustainable change"
    ]
  }
]

export default function ProcessPage() {
  return (
    <ResponsiveLayout backgroundState="analyzing">
      {/* Hero Section with unique background */}
      <HeroSection 
        backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2560"
        overlayOpacity={0.3}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-amber-500/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="container max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">AI + Human Expertise</span>
            </motion.div>
            
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6">
              Our Process
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              A proven methodology that combines cutting-edge AI with deep organizational 
              development expertise to drive sustainable transformation
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </HeroSection>

      {/* Process Journey */}
      <section className="py-20 px-6 relative">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              The HMN Journey
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              From assessment to action, our integrated approach ensures insights translate into sustainable change
            </p>
          </motion.div>

          {/* Process Cards */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-amber-500 hidden lg:block" />

            <div className="space-y-16">
              {processPhases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Phase Number */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute -left-1 lg:left-5 top-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
                  >
                    {index + 1}
                  </motion.div>

                  <div className={`lg:ml-16 ${index % 2 === 0 ? 'lg:mr-0' : 'lg:ml-auto lg:max-w-[calc(100%-4rem)]'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`
                            p-4 rounded-xl flex-shrink-0
                            ${phase.color === 'blue' ? 'bg-blue-500/20' : ''}
                            ${phase.color === 'cyan' ? 'bg-cyan-500/20' : ''}
                            ${phase.color === 'green' ? 'bg-green-500/20' : ''}
                            ${phase.color === 'amber' ? 'bg-amber-500/20' : ''}
                            ${phase.color === 'red' ? 'bg-red-500/20' : ''}
                          `}
                        >
                          <phase.icon className={`
                            w-8 h-8
                            ${phase.color === 'blue' ? 'text-blue-400' : ''}
                            ${phase.color === 'cyan' ? 'text-cyan-400' : ''}
                            ${phase.color === 'green' ? 'text-green-400' : ''}
                            ${phase.color === 'amber' ? 'text-amber-400' : ''}
                            ${phase.color === 'red' ? 'text-red-400' : ''}
                          `} />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-3">{phase.phase}</h3>
                          <p className="text-gray-300 mb-6">{phase.description}</p>

                          {/* Details */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Activities</h4>
                            <ul className="space-y-2">
                              {phase.details.map((detail, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start gap-2 text-sm text-gray-300"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  {detail}
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          {/* Outcomes */}
                          <div className="flex flex-wrap gap-2">
                            {phase.outcomes.map((outcome, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
                              >
                                {outcome}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Approach */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-800/30 to-transparent">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Shield className="w-12 h-12 mx-auto mb-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Our Process Works
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              The HMN methodology bridges the gap between data insights and practical implementation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description: "Advanced analytics reveal patterns human observation might miss",
                features: ["Machine Learning", "NLP Analysis", "Predictive Modeling"]
              },
              {
                icon: Users,
                title: "Human Validation",
                description: "Expert facilitation ensures buy-in and contextual understanding",
                features: ["Stakeholder Engagement", "Consensus Building", "Change Readiness"]
              },
              {
                icon: Layers,
                title: "Practical Implementation",
                description: "Comprehensive toolbox translates insights into sustainable action",
                features: ["60+ Tools", "Custom Frameworks", "Ongoing Support"]
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center"
                >
                  <item.icon className="w-8 h-8 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">{item.title}</h3>
                <p className="text-gray-300 text-center mb-6">{item.description}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {item.features.map((feature, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Visual */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <BarChart3 className="w-12 h-12 mx-auto mb-6 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Flexible Timeline
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our process adapts to your organization's unique needs and pace of change
            </p>
          </motion.div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 rounded-2xl p-8 border border-gray-700">
            <div className="grid md:grid-cols-5 gap-4">
              {processPhases.map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative">
                    {i < processPhases.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 -translate-y-1/2" />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30"
                    >
                      <phase.icon className="w-8 h-8 text-blue-400" />
                    </motion.div>
                  </div>
                  <h4 className="text-sm font-medium text-white">{phase.phase}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Start with our AI-powered assessment to uncover your organization's hidden potential
          </p>
          <Link href="/#chat">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-3"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </ResponsiveLayout>
  )
}