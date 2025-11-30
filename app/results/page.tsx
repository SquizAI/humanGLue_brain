'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Building2,
  Users,
  Brain,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle,
  Activity,
  Globe,
  Shield,
  Heart,
  Rocket,
  Search,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer'
import { Button } from '@/components/atoms'

const expectedOutcomes = [
  {
    category: "Employee Engagement",
    icon: Heart,
    description: "Deeper understanding of what truly drives your people",
    insights: [
      "Identify hidden engagement drivers through AI analysis",
      "Uncover sentiment patterns across teams and departments",
      "Predict and prevent turnover before it happens",
      "Build stronger connections between teams"
    ]
  },
  {
    category: "Leadership Effectiveness", 
    icon: Target,
    description: "Transform managers into leaders who inspire",
    insights: [
      "Reveal leadership blind spots with 360-degree AI insights",
      "Align leadership behaviors with organizational values",
      "Develop personalized leadership development paths",
      "Create cascading accountability throughout the organization"
    ]
  },
  {
    category: "Organizational Agility",
    icon: Zap,
    description: "Build the adaptability to thrive in change",
    insights: [
      "Map informal networks and influence patterns",
      "Identify structural barriers to collaboration",
      "Optimize decision-making processes",
      "Enhance innovation capacity across teams"
    ]
  },
  {
    category: "Cultural Transformation",
    icon: Globe,
    description: "Align culture with strategy for sustainable success",
    insights: [
      "Decode your actual culture vs. aspirational culture",
      "Identify cultural champions and change agents",
      "Build shared values that drive performance",
      "Create rituals and practices that reinforce desired behaviors"
    ]
  }
]

const transformationStages = [
  {
    stage: "Discovery",
    description: "Uncover your organizational truth",
    icon: Search,
    outcomes: ["Baseline metrics established", "Key challenges identified", "Stakeholders aligned"]
  },
  {
    stage: "Insight",
    description: "AI reveals hidden patterns",
    icon: Brain,
    outcomes: ["Data-driven insights generated", "Priorities clarified", "Opportunities mapped"]
  },
  {
    stage: "Alignment",
    description: "Build consensus and commitment",
    icon: Users,
    outcomes: ["Leadership aligned", "Vision shared", "Roadmap created"]
  },
  {
    stage: "Action",
    description: "Implement targeted changes",
    icon: Rocket,
    outcomes: ["Tools deployed", "Progress tracked", "Quick wins achieved"]
  },
  {
    stage: "Evolution",
    description: "Sustain and scale transformation",
    icon: Activity,
    outcomes: ["Culture shifted", "Capabilities built", "Results measured"]
  }
]

const industryApplications = [
  {
    industry: "Technology",
    icon: "💻",
    challenges: ["Rapid scaling", "Remote workforce", "Innovation pressure"],
    solutions: ["Engineering culture optimization", "Cross-team collaboration", "Innovation frameworks"]
  },
  {
    industry: "Financial Services",
    icon: "🏦", 
    challenges: ["Regulatory compliance", "Digital transformation", "Risk management"],
    solutions: ["Cultural risk assessment", "Change readiness evaluation", "Leadership alignment"]
  },
  {
    industry: "Healthcare",
    icon: "🏥",
    challenges: ["Burnout prevention", "Patient experience", "Cross-functional coordination"],
    solutions: ["Wellbeing frameworks", "Team effectiveness", "Communication optimization"]
  },
  {
    industry: "Professional Services",
    icon: "💼",
    challenges: ["Talent retention", "Client satisfaction", "Knowledge management"],
    solutions: ["Career pathway design", "Client team alignment", "Knowledge sharing systems"]
  }
]

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 mb-6">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300 font-diatype">Measurable Transformation</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-gendy leading-tight">
              Expected Results
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-diatype max-w-3xl mx-auto">
              Discover what's possible when AI-powered insights meet expert implementation to transform your organization
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="shadow-lg">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/?chat=true">
                <Button variant="secondary" size="lg">
                  Take Assessment
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Transformation Journey */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-gendy">
              Your Transformation Journey
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-diatype">
              A proven path from insight to impact, tailored to your organization's unique needs
            </p>
          </motion.div>

          {/* Journey Timeline */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-cyan-500 hidden lg:block" />

            <div className="space-y-16">
              {transformationStages.map((stage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
                >
                  {/* Stage number */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold z-10 font-gendy"
                  >
                    {index + 1}
                  </motion.div>

                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-cyan-500/30 transition-all"
                    >
                      <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'justify-end' : ''}`}>
                        <h3 className="text-2xl font-bold text-white font-gendy">{stage.stage}</h3>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                        >
                          <stage.icon className="w-6 h-6 text-cyan-400" />
                        </motion.div>
                      </div>
                      <p className="text-gray-300 mb-4 font-diatype">{stage.description}</p>
                      <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'justify-end' : ''}`}>
                        {stage.outcomes.map((outcome, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-diatype">
                            {outcome}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expected Outcomes */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-800/30 to-transparent">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Target className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
            <h2 className="text-4xl font-bold text-white mb-4">
              What You Can Expect
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Real transformation across four critical dimensions of organizational health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {expectedOutcomes.map((outcome, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                  >
                    <outcome.icon className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{outcome.category}</h3>
                    <p className="text-gray-300">{outcome.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {outcome.insights.map((insight, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.1 }}
                      className="flex items-start gap-3 text-sm text-gray-300"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Industry-Specific Impact
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Tailored solutions addressing unique challenges across sectors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {industryApplications.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{industry.icon}</span>
                    <h3 className="text-xl font-semibold text-white">{industry.industry}</h3>
                  </div>
                  <Shield className="w-6 h-6 text-gray-600" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Challenges</h4>
                    <div className="flex flex-wrap gap-2">
                      {industry.challenges.map((challenge, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Our Solutions</h4>
                    <div className="flex flex-wrap gap-2">
                      {industry.solutions.map((solution, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-300">
                          {solution}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Framework */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-800/30 to-transparent">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-6 text-green-400" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Measuring Your Success
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Clear metrics and frameworks to track your transformation journey
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Leading Indicators",
                icon: TrendingUp,
                metrics: [
                  "Employee sentiment trends",
                  "Leadership effectiveness scores",
                  "Collaboration patterns",
                  "Innovation metrics"
                ]
              },
              {
                title: "Business Outcomes",
                icon: Target,
                metrics: [
                  "Productivity improvements",
                  "Retention rates",
                  "Customer satisfaction",
                  "Speed to market"
                ]
              },
              {
                title: "Financial Impact",
                icon: DollarSign,
                metrics: [
                  "Cost savings",
                  "Revenue growth",
                  "ROI calculation",
                  "Efficiency gains"
                ]
              }
            ].map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-8 border border-gray-700"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center"
                >
                  <category.icon className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white text-center mb-6">{category.title}</h3>
                <ul className="space-y-2">
                  {category.metrics.map((metric, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-12 md:p-16 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gendy">
                Your Transformation Starts Today
              </h2>

              <p className="text-xl text-gray-300 mb-8 font-diatype">
                Join forward-thinking organizations using AI-powered insights to build stronger, more resilient cultures
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button variant="gradient" size="lg" className="shadow-lg">
                    Calculate Your ROI
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/?chat=true">
                  <Button variant="secondary" size="lg">
                    Take Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}