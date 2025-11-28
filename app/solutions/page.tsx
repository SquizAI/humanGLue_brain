'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Users,
  Layers,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
  Building2,
  Heart,
  Network,
  Settings
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer'
import { Button } from '@/components/atoms'
import { AskAIButton, AskAboutSolution } from '@/components/molecules'

const solutions = [
  {
    icon: Brain,
    title: "AI Assessment Tool",
    tagline: "See What Others Can't",
    description: "Our proprietary AI platform goes beyond traditional surveys to reveal the hidden dynamics shaping your organization",
    keyFeatures: [
      {
        title: "Multi-Dimensional Analysis",
        description: "Evaluates leadership effectiveness, cultural cohesion, employee experience, and innovation capability"
      },
      {
        title: "Advanced AI Capabilities",
        description: "Natural language processing, sentiment analysis, and predictive modeling uncover insights humans might miss"
      },
      {
        title: "Real-Time Insights",
        description: "Dynamic dashboards and heat maps visualize your organizational health as data flows in"
      },
      {
        title: "Predictive Analytics",
        description: "Forecast engagement trends, turnover risks, and performance trajectories before they impact your business"
      }
    ],
    capabilities: [
      "Pattern Recognition",
      "Sentiment Analysis", 
      "Predictive Modeling",
      "Benchmark Comparison",
      "Custom Reporting"
    ],
    image: "/solutions/ai-assessment-openai.png"
  },
  {
    icon: Users,
    title: "Strategic Workshops",
    tagline: "Turn Insights Into Action",
    description: "Expert-facilitated sessions that validate AI findings and build consensus on your transformation journey",
    keyFeatures: [
      {
        title: "Structured Facilitation",
        description: "Full-day workshops with 15-25 diverse participants following our proven 6-phase methodology"
      },
      {
        title: "Stakeholder Alignment",
        description: "Bridge the gap between data insights and lived experiences to ensure buy-in at all levels"
      },
      {
        title: "Priority Setting",
        description: "Impact vs. effort mapping helps identify your top 3-5 transformation initiatives"
      },
      {
        title: "Action Planning",
        description: "Leave with clear 90-day roadmaps, assigned ownership, and success metrics"
      }
    ],
    capabilities: [
      "Executive Sessions",
      "Virtual Formats",
      "Team Workshops",
      "Change Readiness",
      "Consensus Building"
    ],
    image: "/solutions/strategic-workshops-openai.png"
  },
  {
    icon: Layers,
    title: "Human Glue Toolbox",
    tagline: "Implementation Made Simple",
    description: "60+ practical tools and frameworks across 5 organizational areas to turn your vision into reality",
    keyFeatures: [
      {
        title: "Comprehensive Resources",
        description: "From organizational network analysis to culture activation kits - everything you need in one place"
      },
      {
        title: "Customizable Frameworks",
        description: "Adapt our proven tools to your unique context with implementation guides and templates"
      },
      {
        title: "Five Core Categories",
        description: "Structure & Alignment, Leadership Development, Employee Experience, Culture & Values, Change Management"
      },
      {
        title: "Continuous Support",
        description: "Regular updates, best practices, and community access ensure sustainable transformation"
      }
    ],
    capabilities: [
      "Role Clarity Framework",
      "Journey Mapping",
      "Culture Activation",
      "Change Playbooks",
      "Progress Tracking"
    ],
    image: "/solutions/toolbox-openai.png"
  }
]

const toolboxCategories = [
  {
    icon: Building2,
    title: "Organizational Structure & Alignment",
    tools: ["Organizational Network Analysis", "Role Clarity Framework", "Decision Rights Matrix", "Team Charter Builder"]
  },
  {
    icon: Target,
    title: "Leadership & Management Development",
    tools: ["Leadership Capability Builder", "360 Feedback Tools", "Coaching Frameworks", "Performance Enablement"]
  },
  {
    icon: Heart,
    title: "Employee Experience & Engagement",
    tools: ["Journey Mapping Kit", "Pulse Survey Builder", "Recognition Framework", "Wellbeing Toolkit"]
  },
  {
    icon: Network,
    title: "Culture & Values Integration",
    tools: ["Culture Definition Kit", "Values Activation Guide", "Behavior Change Tools", "Story Collection Framework"]
  },
  {
    icon: Settings,
    title: "Change Management & Transformation",
    tools: ["Change Readiness Assessment", "Communication Playbook", "Resistance Management", "Adoption Tracking"]
  }
]

export default function SolutionsPage() {
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
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-diatype">Integrated AI + Human Approach</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-gendy leading-tight">
              Our Solutions
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-diatype max-w-3xl mx-auto">
              Three powerful components that work together to strengthen the human connections driving your organization's performance, innovation, and resilience
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

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`mb-32 ${index === solutions.length - 1 ? 'mb-0' : ''}`}
            >
              <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-8"
                  >
                    <solution.icon className="w-10 h-10 text-purple-400" />
                  </motion.div>

                  <h2 className="text-5xl font-bold text-white mb-4 font-gendy">{solution.title}</h2>
                  <p className="text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 font-gendy">
                    {solution.tagline}
                  </p>
                  <p className="text-lg text-gray-300 mb-8 leading-relaxed font-diatype">
                    {solution.description}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-6 mb-8">
                    {solution.keyFeatures.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 font-gendy">{feature.title}</h4>
                          <p className="text-gray-400 text-sm font-diatype">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {solution.capabilities.map((capability, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 font-diatype"
                      >
                        {capability}
                      </motion.span>
                    ))}
                  </div>

                  {/* Ask AI About This Solution */}
                  <div className="flex gap-3">
                    <AskAboutSolution
                      solutionId={index === 0 ? 'assessment' : index === 1 ? 'workshops' : 'toolbox'}
                    />
                    <AskAIButton
                      topic={solution.title}
                      question="How much does this solution cost and what's the typical ROI?"
                      context={{ page: 'solutions', solutionId: solution.title }}
                      variant="inline"
                      label="Ask about pricing"
                    />
                  </div>
                </div>

                {/* Image */}
                <motion.div
                  className={index % 2 === 1 ? 'lg:col-start-1' : ''}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-[600px] rounded-2xl overflow-hidden border border-white/10">
                    <Image
                      src={solution.image}
                      alt={solution.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

                    {/* Floating Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-8 left-8 right-8"
                    >
                      <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400 mb-1 font-diatype">Enhanced with</p>
                            <p className="text-lg font-semibold text-white font-gendy">Human Glue AI</p>
                          </div>
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Toolbox Deep Dive */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-transparent" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Layers className="w-16 h-16 mx-auto mb-6 text-purple-400" />
            <h2 className="text-4xl font-bold text-white mb-4 font-gendy">
              The Human Glue Toolbox
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-diatype">
              60+ practical tools organized into 5 categories to address every aspect of organizational transformation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolboxCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <category.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.tools.map((tool, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300 font-diatype">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {tool}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-purple-400" />
            <h2 className="text-4xl font-bold text-white mb-4 font-gendy">
              The Power of Integration
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-diatype">
              Our solutions work together seamlessly to create a comprehensive transformation ecosystem
            </p>
          </motion.div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  step: "1",
                  title: "Assess",
                  description: "AI reveals your organizational truth",
                  icon: Brain
                },
                {
                  step: "2",
                  title: "Align",
                  description: "Workshops build consensus and commitment",
                  icon: Users
                },
                {
                  step: "3",
                  title: "Act",
                  description: "Toolbox enables sustainable change",
                  icon: Layers
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border-2 border-purple-500/30"
                  >
                    <span className="text-3xl font-bold text-white font-gendy">{item.step}</span>
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-3 font-gendy">{item.title}</h3>
                  <p className="text-gray-300 font-diatype">{item.description}</p>
                </motion.div>
              ))}
            </div>
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
            className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-12 md:p-16 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gendy">
                Experience the Human Glue Difference
              </h2>

              <p className="text-xl text-gray-300 mb-8 font-diatype">
                Discover how our integrated solutions can transform your organization
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
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}