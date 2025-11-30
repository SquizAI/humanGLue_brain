'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Lock, Sparkles, Target, TrendingUp, Users, Brain, Zap, BarChart3, Building2, Calendar, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

interface RoadmapStep {
  id: string
  title: string
  description: string
  icon: any
  status: 'locked' | 'current' | 'completed'
  metrics?: {
    label: string
    value: string
  }[]
  duration?: string
}

interface DynamicRoadmapProps {
  currentStep: number
  userData?: any
  className?: string
}

export function DynamicRoadmap({ currentStep, userData, className }: DynamicRoadmapProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)
  const [animatedMetrics, setAnimatedMetrics] = useState<Record<string, number>>({})

  const steps: RoadmapStep[] = [
    {
      id: 'assessment',
      title: 'AI Readiness Assessment',
      description: 'Comprehensive evaluation of your organization\'s current state',
      icon: Brain,
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'locked',
      metrics: [
        { label: 'Analysis Time', value: '5 min' },
        { label: 'Data Points', value: '50+' }
      ],
      duration: 'Week 1'
    },
    {
      id: 'strategy',
      title: 'Custom Strategy Development',
      description: 'Tailored transformation roadmap for your specific needs',
      icon: Target,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'locked',
      metrics: [
        { label: 'ROI Projection', value: userData?.estimatedROI || '3.2x' },
        { label: 'Time to Value', value: userData?.timeframe || '90 days' }
      ],
      duration: 'Week 2-3'
    },
    {
      id: 'implementation',
      title: 'Phased Implementation',
      description: 'Step-by-step deployment with minimal disruption',
      icon: Zap,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'locked',
      metrics: [
        { label: 'Quick Wins', value: '5-7' },
        { label: 'Risk Score', value: 'Low' }
      ],
      duration: 'Month 1-3'
    },
    {
      id: 'adoption',
      title: 'Team Adoption & Training',
      description: 'Comprehensive training and change management',
      icon: Users,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'locked',
      metrics: [
        { label: 'Adoption Rate', value: '95%+' },
        { label: 'Training Hours', value: '40' }
      ],
      duration: 'Month 2-4'
    },
    {
      id: 'optimization',
      title: 'Continuous Optimization',
      description: 'Ongoing refinement and scaling of AI capabilities',
      icon: TrendingUp,
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'locked',
      metrics: [
        { label: 'Efficiency Gain', value: '40%+' },
        { label: 'Cost Savings', value: '$2.5M' }
      ],
      duration: 'Month 4+'
    }
  ]

  // Animate metrics when they become visible
  useEffect(() => {
    steps.forEach((step, index) => {
      if (index <= currentStep) {
        setTimeout(() => {
          setAnimatedMetrics(prev => ({
            ...prev,
            [step.id]: 100
          }))
        }, index * 200)
      }
    })
  }, [currentStep])

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "tween",
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-white mb-4 font-gendy">
          Your AI Transformation Roadmap
        </h2>
        <p className="text-xl text-gray-400 font-diatype">
          {userData?.company ? `Customized for ${userData.company}` : 'A proven path to AI excellence'}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="relative mb-16">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 bg-gray-800 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{
                type: "tween",
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            />
          </div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "tween",
                delay: index * 0.08,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer",
                  step.status === 'completed' ? "bg-green-500" :
                  step.status === 'current' ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                  "bg-gray-800 border-2 border-gray-700"
                )}
                whileHover={{
                  scale: 1.1,
                  transition: { type: "tween", duration: 0.2, ease: "easeOut" }
                }}
                animate={step.status === 'current' ? {
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                  ]
                } : {}}
                transition={step.status === 'current' ? {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeOut"
                } : {}}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : step.status === 'current' ? (
                  <step.icon className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </motion.div>
              <span className={cn(
                "mt-2 text-sm font-medium font-diatype",
                step.status === 'locked' ? "text-gray-600" : "text-white"
              )}>
                {step.duration}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step Details */}
      <div className="grid gap-6 mb-12">
        <AnimatePresence mode="sync">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: step.status !== 'locked' ? 1 : 0.4,
                y: 0
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: "tween",
                delay: index * 0.06,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{
                y: -4,
                transition: { type: "tween", duration: 0.2, ease: "easeOut" }
              }}
              className={cn(
                "relative overflow-hidden rounded-2xl border",
                step.status === 'current' ?
                  "border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" :
                step.status === 'completed' ?
                  "border-green-500/30 bg-green-500/5" :
                  "border-gray-800 bg-gray-900/50"
              )}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={cn(
                        "p-3 rounded-xl",
                        step.status === 'current' ?
                          "bg-gradient-to-br from-blue-500 to-cyan-500" :
                        step.status === 'completed' ?
                          "bg-green-500" :
                          "bg-gray-800"
                      )}
                      whileHover={{
                        scale: 1.05,
                        rotate: [0, -5, 5, 0],
                        transition: { type: "tween", duration: 0.3, ease: "easeInOut" }
                      }}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 font-gendy">
                        {step.title}
                        {step.status === 'current' && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 font-diatype"
                          >
                            In Progress
                          </motion.span>
                        )}
                      </h3>
                      <p className="text-gray-400 mt-1 font-diatype">{step.description}</p>
                    </div>
                  </div>
                  {step.status === 'completed' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </motion.div>
                  )}
                </div>

                {/* Metrics */}
                {step.metrics && step.status !== 'locked' && (
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "tween",
                      delay: 0.15,
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    {step.metrics.map((metric, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "tween",
                          delay: 0.2 + idx * 0.05,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        whileHover={{
                          y: -2,
                          transition: { type: "tween", duration: 0.2, ease: "easeOut" }
                        }}
                        className="text-center p-3 rounded-lg bg-gray-800/50"
                      >
                        <div className="text-2xl font-bold text-white font-gendy">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-diatype">
                          {metric.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Progress indicator for current step */}
                {step.status === 'current' && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "tween",
                      delay: 0.3,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-diatype">Progress</span>
                      <span className="text-white font-diatype">
                        {Math.round((animatedMetrics[step.id] || 0))}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${animatedMetrics[step.id] || 0}%` }}
                        transition={{
                          type: "tween",
                          duration: 1.2,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Decorative elements */}
              {step.status === 'current' && (
                <motion.div
                  className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      {currentStep >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "tween",
            delay: 0.4,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium cursor-pointer font-diatype"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)",
              transition: { type: "tween", duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.98,
              transition: { type: "tween", duration: 0.1 }
            }}
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {currentStep === steps.length - 1
                ? 'Transformation Complete!'
                : `${steps.length - currentStep - 1} steps remaining`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 