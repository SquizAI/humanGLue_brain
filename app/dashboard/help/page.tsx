'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle, Search, Book, Video, MessageCircle, Mail,
  ExternalLink, ChevronRight, FileText, Lightbulb
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/utils/cn'

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface Resource {
  title: string
  description: string
  icon: React.ReactNode
  link: string
  external?: boolean
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'courses', label: 'Courses' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'billing', label: 'Billing' },
    { id: 'technical', label: 'Technical' },
  ]

  const faqs: FAQItem[] = [
    {
      question: 'How do I get started with HumanGlue?',
      answer: 'Start by completing your profile in Settings, then take your first AI Maturity Assessment. Based on your results, we\'ll recommend a personalized learning path with courses and workshops tailored to your needs.',
      category: 'getting-started'
    },
    {
      question: 'How do I enroll in a course?',
      answer: 'Browse the course library from your dashboard, click on any course that interests you, and click "Enroll Now". You\'ll have immediate access to all course materials and can start learning at your own pace.',
      category: 'courses'
    },
    {
      question: 'What is an AI Maturity Assessment?',
      answer: 'Our AI Maturity Assessment evaluates your organization\'s readiness for AI transformation across multiple dimensions including technology, culture, skills, and processes. It provides a comprehensive score and actionable recommendations.',
      category: 'assessments'
    },
    {
      question: 'How often can I take assessments?',
      answer: 'The frequency depends on your plan. Individual plans include 1 assessment per quarter, Team plans include 4 per quarter, and Enterprise plans have unlimited assessments.',
      category: 'assessments'
    },
    {
      question: 'Can I change my subscription plan?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time from the Billing page. Changes take effect immediately, and we\'ll prorate any charges or credits to your account.',
      category: 'billing'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans.',
      category: 'billing'
    },
    {
      question: 'How do I track my team\'s progress?',
      answer: 'Team and Enterprise plan subscribers can access the Team Analytics dashboard, which shows comprehensive progress tracking, course completion rates, assessment scores, and engagement metrics for all team members.',
      category: 'courses'
    },
    {
      question: 'What browsers are supported?',
      answer: 'HumanGlue works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date for the best experience.',
      category: 'technical'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure reset link. The link expires after 24 hours for security.',
      category: 'getting-started'
    },
    {
      question: 'Can I download course materials?',
      answer: 'Yes! Most courses include downloadable resources like PDFs, templates, and worksheets. Look for the download icon next to each resource in the course materials.',
      category: 'courses'
    },
  ]

  const resources: Resource[] = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials',
      icon: <Book className="w-6 h-6" />,
      link: '/docs',
    },
    {
      title: 'Video Tutorials',
      description: 'Learn through step-by-step videos',
      icon: <Video className="w-6 h-6" />,
      link: '/tutorials',
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: <MessageCircle className="w-6 h-6" />,
      link: 'https://community.humanglue.ai',
      external: true,
    },
    {
      title: 'Best Practices',
      description: 'Tips for getting the most out of HumanGlue',
      icon: <Lightbulb className="w-6 h-6" />,
      link: '/best-practices',
    },
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Help Center</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Quick Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              target={resource.external ? '_blank' : undefined}
              rel={resource.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  {resource.icon}
                </div>
                {resource.external && (
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <h3 className="font-semibold text-white mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-400">{resource.description}</p>
            </motion.a>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-colors"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full px-6 py-4 flex items-start justify-between text-left"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-white mb-1">
                        {faq.question}
                      </h3>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {categories.find(c => c.id === faq.category)?.label}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedFAQ === index ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-1"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-8 text-center">
          <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Still Need Help?
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Start Live Chat
            </Button>
            <Button variant="secondary" size="lg" className="gap-2">
              <Mail className="w-5 h-5" />
              Email Support
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Average response time: Under 2 hours
          </p>
        </div>
      </div>
    </div>
  )
}
