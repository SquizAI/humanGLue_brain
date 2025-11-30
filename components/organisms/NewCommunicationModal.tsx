'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Newspaper,
  Mail,
  Share2,
  Calendar,
  Sparkles,
  Loader2,
  Clock,
  X,
} from 'lucide-react'

type CommunicationType = 'newsletter' | 'email' | 'social' | 'workshop'
type NewsletterTier = 'master' | 'tailored' | 'organization'

interface AudienceSegment {
  id: string
  name: string
  description: string
  count: number
  criteria: string[]
  icon: React.ReactNode
}

interface NewCommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  audienceSegments: AudienceSegment[]
}

const getTierColor = (tier?: NewsletterTier) => {
  switch (tier) {
    case 'master': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
    case 'tailored': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
    case 'organization': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' }
    default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
  }
}

export function NewCommunicationModal({ isOpen, onClose, audienceSegments }: NewCommunicationModalProps) {
  const [formData, setFormData] = useState({
    type: 'newsletter' as CommunicationType,
    tier: 'master' as NewsletterTier | undefined,
    title: '',
    subject: '',
    content: '',
    audience: 'all',
    scheduleDate: '',
    scheduleTime: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTypeChange = (type: CommunicationType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      tier: type === 'newsletter' ? 'master' : undefined,
    }))
  }

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const templates = {
      newsletter: {
        title: 'AI-Generated Newsletter: Innovation Insights',
        subject: 'Your Monthly AI Transformation Update',
        content: `# Innovation Insights

Dear Subscriber,

This month's newsletter brings you cutting-edge insights into AI transformation trends, emerging technologies, and strategic recommendations for forward-thinking leaders.

## Key Topics:
- Enterprise AI Adoption Patterns
- Emerging Technologies in 2025
- Strategic Implementation Frameworks
- Success Stories from Industry Leaders

Stay ahead of the curve with actionable insights tailored to your industry.

Best regards,
The HumanGlue Team`,
      },
      email: {
        title: 'AI-Generated Outreach Email',
        subject: 'Exclusive Invitation: Join Our Expert Network',
        content: `Dear [Name],

I hope this message finds you well. I've been following your impressive work in [field], particularly your recent [achievement/publication].

We're building a network of forward-thinking experts to shape the future of AI transformation, and your expertise would be invaluable.

Would you be interested in a brief conversation to explore potential collaboration?

Looking forward to connecting,
[Your Name]`,
      },
      social: {
        title: 'AI-Generated Social Post',
        subject: '',
        content: `Exciting News!

We're thrilled to announce [product/feature/event] that will transform how organizations approach AI adoption.

Key benefits:
- Streamlined workflows
- Enhanced decision-making
- Measurable ROI

Learn more: [link]

#AI #Innovation #DigitalTransformation`,
      },
      workshop: {
        title: 'AI-Generated Workshop Announcement',
        subject: 'Limited Seats: AI Strategy Workshop - [Month] Cohort',
        content: `# AI Strategy Workshop

Join our hands-on workshop designed for executives and decision-makers ready to accelerate their AI transformation journey.

## What You'll Learn:
- Develop your organization's AI roadmap
- Identify high-impact use cases
- Navigate implementation challenges
- Build internal capabilities

**Date:** [TBD]
**Format:** Interactive, hybrid
**Duration:** 2 days

Reserve your seat today - limited availability!`,
      },
    }

    const template = templates[formData.type]
    setFormData((prev) => ({
      ...prev,
      ...template,
    }))

    setIsGenerating(false)
  }

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData)
    // TODO: Implement save draft logic
    onClose()
  }

  const handleSchedule = () => {
    console.log('Scheduling communication:', formData)
    // TODO: Implement schedule logic
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                  <Plus className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">New Communication</h2>
                  <p className="text-sm text-gray-400">Create and schedule your next outreach</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Communication Type */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-3 block">Communication Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: 'newsletter' as const, label: 'Newsletter', icon: <Newspaper className="w-5 h-5" /> },
                    { type: 'email' as const, label: 'Email', icon: <Mail className="w-5 h-5" /> },
                    { type: 'social' as const, label: 'Social Post', icon: <Share2 className="w-5 h-5" /> },
                    { type: 'workshop' as const, label: 'Workshop', icon: <Calendar className="w-5 h-5" /> },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleTypeChange(item.type)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        formData.type === item.type
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Tier Selection */}
              {formData.type === 'newsletter' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm text-gray-400 font-medium mb-3 block">Newsletter Tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { tier: 'master' as const, label: 'Master', desc: 'Broad audience' },
                      { tier: 'tailored' as const, label: 'Hyper-Tailored', desc: 'Industry-specific' },
                      { tier: 'organization' as const, label: 'Organization', desc: 'Client-specific' },
                    ].map((item) => (
                      <button
                        key={item.tier}
                        onClick={() => setFormData((prev) => ({ ...prev, tier: item.tier }))}
                        className={`p-4 rounded-xl border transition-all ${
                          formData.tier === item.tier
                            ? `${getTierColor(item.tier).bg} ${getTierColor(item.tier).border} ${getTierColor(item.tier).text} border`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs opacity-70 mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Title */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter communication title..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Subject Line (for email/newsletter) */}
              {(formData.type === 'newsletter' || formData.type === 'email' || formData.type === 'workshop') && (
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 font-medium">Content</label>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Generate
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your content here... (Markdown supported)"
                  rows={12}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none font-mono text-sm"
                />
              </div>

              {/* Audience Selection */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Target Audience</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {audienceSegments.map((segment) => (
                    <option key={segment.id} value={segment.id} className="bg-gray-900">
                      {segment.name} ({segment.count.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Schedule Date</label>
                  <input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Schedule Time</label>
                  <input
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-6 flex gap-3 z-10">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex-1 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={handleSchedule}
                disabled={!formData.title || !formData.content}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {formData.scheduleDate ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
