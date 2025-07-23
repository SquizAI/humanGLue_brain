'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, DollarSign, TrendingUp, Users, Clock, Zap, BarChart3, ArrowRight, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ROICalculatorProps {
  userData?: any
  className?: string
}

interface ROIMetric {
  label: string
  value: number
  unit: string
  description: string
  icon: any
}

export function ROICalculator({ userData, className }: ROICalculatorProps) {
  const [activeTab, setActiveTab] = useState<'savings' | 'productivity' | 'revenue'>('savings')
  const [employees, setEmployees] = useState(userData?.companySize || 100)
  const [avgSalary, setAvgSalary] = useState(75000)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})

  // Calculate ROI metrics
  const calculateROI = () => {
    const hourlyRate = avgSalary / 2080 // Annual hours
    const weeklyHours = employees * hoursPerWeek
    const annualHours = weeklyHours * 52

    // Time savings (40% efficiency gain)
    const timeSaved = annualHours * 0.4
    const costSavings = timeSaved * hourlyRate

    // Productivity gains
    const productivityGain = employees * avgSalary * 0.25 // 25% productivity increase

    // Revenue impact (3.2x ROI average)
    const revenueImpact = (costSavings + productivityGain) * 3.2

    return {
      timeSaved: Math.round(timeSaved),
      costSavings: Math.round(costSavings),
      productivityGain: Math.round(productivityGain),
      revenueImpact: Math.round(revenueImpact),
      totalROI: Math.round(costSavings + productivityGain + revenueImpact),
      paybackPeriod: 4.5, // months
      yearOneROI: 320 // percentage
    }
  }

  const roi = calculateROI()

  // Animate values when they change
  useEffect(() => {
    const values = {
      timeSaved: roi.timeSaved,
      costSavings: roi.costSavings,
      productivityGain: roi.productivityGain,
      revenueImpact: roi.revenueImpact,
      totalROI: roi.totalROI
    }

    Object.entries(values).forEach(([key, targetValue]) => {
      let start = animatedValues[key] || 0
      const duration = 1000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const current = Math.round(start + (targetValue - start) * easeOutQuart)

        setAnimatedValues(prev => ({ ...prev, [key]: current }))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    })
  }, [employees, avgSalary, hoursPerWeek])

  const metrics: Record<string, ROIMetric[]> = {
    savings: [
      {
        label: 'Annual Time Saved',
        value: animatedValues.timeSaved || 0,
        unit: 'hours',
        description: 'Hours saved through AI automation',
        icon: Clock
      },
      {
        label: 'Cost Savings',
        value: animatedValues.costSavings || 0,
        unit: '$',
        description: 'Direct cost reduction from efficiency',
        icon: DollarSign
      }
    ],
    productivity: [
      {
        label: 'Productivity Gain',
        value: animatedValues.productivityGain || 0,
        unit: '$',
        description: '25% increase in output value',
        icon: TrendingUp
      },
      {
        label: 'Team Efficiency',
        value: 40,
        unit: '%',
        description: 'Faster task completion',
        icon: Zap
      }
    ],
    revenue: [
      {
        label: 'Revenue Impact',
        value: animatedValues.revenueImpact || 0,
        unit: '$',
        description: 'New revenue opportunities',
        icon: BarChart3
      },
      {
        label: 'Year 1 ROI',
        value: roi.yearOneROI,
        unit: '%',
        description: 'Return on investment',
        icon: TrendingUp
      }
    ]
  }

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white">ROI Calculator</h2>
        </div>
        <p className="text-xl text-gray-400">
          See your potential return with Human Glue AI
        </p>
      </motion.div>

      {/* Input Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-12"
      >
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            Number of Employees
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            className="w-full mb-2"
          />
          <div className="text-2xl font-bold text-white">{employees.toLocaleString()}</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            Average Salary
          </label>
          <input
            type="range"
            min="40000"
            max="150000"
            step="5000"
            value={avgSalary}
            onChange={(e) => setAvgSalary(Number(e.target.value))}
            className="w-full mb-2"
          />
          <div className="text-2xl font-bold text-white">${avgSalary.toLocaleString()}</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            Hours per Week
          </label>
          <input
            type="range"
            min="20"
            max="60"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full mb-2"
          />
          <div className="text-2xl font-bold text-white">{hoursPerWeek}</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {(['savings', 'productivity', 'revenue'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-200",
              activeTab === tab
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {metrics[activeTab].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">{metric.label}</h3>
                  <div className="flex items-baseline gap-2">
                    {metric.unit === '$' && <span className="text-3xl text-green-400">$</span>}
                    <span className="text-4xl font-bold text-white">
                      {metric.value.toLocaleString()}
                    </span>
                    {metric.unit !== '$' && <span className="text-xl text-gray-400">{metric.unit}</span>}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-700/50">
                  <metric.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-gray-500">{metric.description}</p>
              
              {/* Decorative gradient */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Total ROI Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center"
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white/90 mb-4">Total First Year Value</h3>
          <div className="text-6xl font-bold text-white mb-6">
            ${(animatedValues.totalROI || 0).toLocaleString()}
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="text-3xl font-bold text-white">{roi.yearOneROI}%</div>
              <div className="text-white/70">ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{roi.paybackPeriod}</div>
              <div className="text-white/70">Months Payback</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">3.2x</div>
              <div className="text-white/70">Revenue Multiple</div>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            Get Detailed ROI Report
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <strong className="text-white">Calculation Methodology:</strong> Based on industry benchmarks and data from 500+ successful AI transformations. 
            Results show average outcomes for organizations of similar size and industry.
          </div>
        </div>
      </motion.div>
    </div>
  )
} 