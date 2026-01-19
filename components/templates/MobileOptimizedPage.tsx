'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileChatInterface } from './MobileChatInterface'
import {
  Sparkles,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function MobileOptimizedPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const suggestions = [
    "What's HMN?",
    "How can AI help my team?",
    "Show me pricing",
    "Schedule a demo"
  ]

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Simulate AI typing
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thanks for your message! I'm here to help you understand how HMN can transform your organization. What specific aspect would you like to explore?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Minimal and Clean */}
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/HumnaGlue_logo_white_blue.png"
            alt="HMN"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1.5 bg-brand-cyan rounded-full text-sm font-medium flex items-center gap-1 text-brand-dark"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content - Optimized for Mobile */}
      <main className="pb-24">
        {/* Hero Section - Compact */}
        <section className="px-4 py-8 bg-gradient-to-b from-blue-900/20 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-xs text-brand-cyan">AI-Powered Transformation</span>
            </div>

            <h1 className="text-3xl font-bold mb-6 leading-tight">
              Disruption is here.<br />
              What you do next matters.
            </h1>

            {/* Welcome Card */}
            <div className="bg-gray-900 rounded-xl p-5 mb-6">
              <p className="text-sm text-gray-300 mb-4">
                Welcome to HMN. We guide Fortune 1000 companies of tomorrow, today.
              </p>
              <p className="text-sm text-gray-300 mb-3">
                Let's start with your first name
              </p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full px-4 py-2 bg-brand-cyan rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-brand-dark"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chris</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-6 bg-gray-900/50">
          <h2 className="text-xl font-bold mb-4">
            Beneath the buzzwords lies a hard truth: Work is breaking. So are the people doing it.
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                percentage: "75%",
                stat: "54% of companies can't connect innovation to impact. Only 6% of execs are satisfied with their innovation performance."
              },
              {
                percentage: "6%",
                stat: "54% of companies can't connect innovation to impact. Only 6% of execs are satisfied with their innovation performance."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 mx-auto mb-2 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-cyan to-brand-cyan" />
                </div>
                <div className="text-3xl font-bold text-brand-cyan mb-2">{item.percentage}</div>
                <p className="text-xs text-gray-300">{item.stat}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-brand-cyan text-xs">
            Pro tip: It's not just a productivity crisis. It's a purpose crisis.
          </p>
        </section>

        {/* Solutions Section */}
        <section className="px-4 py-6">
          <h2 className="text-2xl font-bold mb-3">The HMN Solution</h2>
          <p className="text-sm text-gray-300 mb-6">
            Our Adaptation Accelerator blends diagnostic assessments, leadership coaching, AI fluency, and culture design into a powerful new model for future-ready transformation. Your Strategy for the Human + AI Era.
          </p>

          <div className="space-y-4">
            {[
              {
                title: 'Human Intellect + AI Dynamics',
                description: 'Accelerate adoption while elevating human value. We help people embrace tech without losing what makes them irreplaceable.'
              },
              {
                title: 'Performance + Belonging',
                description: 'Engagement, retention, and generational trust aren\'t perks, they\'re performance drivers. We measure what matters most.'
              },
              {
                title: 'Future-Proof Roadmaps',
                description: 'We align your goals with fast-evolving realities like AI, Agents, new work models, so your team is ready for what\'s next.'
              }
            ].map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl p-5"
              >
                <h3 className="font-bold mb-3 text-base">{solution.title}</h3>
                <p className="text-sm text-gray-300 mb-3">{solution.description}</p>
                <button className="text-brand-cyan text-sm font-semibold">
                  Learn More →
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Adapt. Thrive. Lead Section */}
        <section className="px-4 py-12 bg-brand-cyan">
          <div className="mb-8">
            <div className="flex justify-center items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-brand-cyan to-brand-cyan" />
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">
            Adapt.<br />Thrive.<br />Lead.
          </h2>

          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-brand-cyan to-pink-400" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-orange-400" />
            </div>
          </div>

          <p className="text-center text-gray-900 text-sm max-w-md mx-auto">
            In a world transformed by AI, <span className="text-white font-semibold">hmn</span> gives leaders and teams the edge, equipping them to drive progress, not just keep pace.
          </p>
        </section>

        {/* Footer */}
        <section className="px-4 py-8 bg-black">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-gray-400">hmn</p>
            <div className="text-gray-400">
              <p className="text-sm font-semibold mb-2">Made in Miami</p>
              <p className="text-sm">+1 (937) 922-3928</p>
              <p className="text-sm">hello@behmn.com</p>
            </div>
          </div>
        </section>
      </main>


      {/* Mobile Chat Interface */}
      <MobileChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        suggestions={suggestions}
        isTyping={isTyping}
      />
    </div>
  )
}