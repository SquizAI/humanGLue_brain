'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useChat } from '../../lib/contexts/ChatContext'

export interface AskAIButtonProps {
  /** The topic or feature being asked about */
  topic: string
  /** The pre-populated question to ask */
  question: string
  /** Context about where the button is placed */
  context?: {
    page?: string
    solutionId?: string
    category?: string
    data?: Record<string, any>
  }
  /** Visual variant */
  variant?: 'default' | 'inline' | 'floating' | 'minimal'
  /** Optional custom label */
  label?: string
  /** Size */
  size?: 'sm' | 'md' | 'lg'
}

export function AskAIButton({
  topic,
  question,
  context,
  variant = 'default',
  label,
  size = 'md'
}: AskAIButtonProps) {
  const { openChatWithMessage } = useChat()

  const handleClick = () => {
    // Open chat with pre-populated question and context
    openChatWithMessage(question, {
      topic,
      pageContext: context
    })
  }

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Minimal variant - just an icon button
  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all ${sizeClasses[size]}`}
        title={`Ask about ${topic}`}
      >
        <MessageCircle className={iconSizes[size]} />
      </motion.button>
    )
  }

  // Inline variant - subtle integration
  if (variant === 'inline') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ x: 2 }}
        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium group"
      >
        <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        <span className="underline decoration-cyan-500/30 hover:decoration-cyan-400/50">
          {label || `Ask about ${topic}`}
        </span>
      </motion.button>
    )
  }

  // Floating variant - prominent CTA
  if (variant === 'floating') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all font-semibold ${sizeClasses[size]}`}
      >
        <div className="relative">
          <MessageCircle className={iconSizes[size]} />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-white rounded-full blur-sm"
          />
        </div>
        <span>{label || `Ask about ${topic}`}</span>
      </motion.button>
    )
  }

  // Default variant - balanced button
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-cyan-500/30 transition-all font-medium group ${sizeClasses[size]}`}
    >
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
        <MessageCircle className={iconSizes[size]} />
      </div>
      <span>{label || `Ask about ${topic}`}</span>
      <Sparkles className={`${iconSizes[size]} text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.button>
  )
}

// Convenience component for quick placement
export function AskAboutSolution({ solutionId }: { solutionId: 'assessment' | 'workshops' | 'toolbox' }) {
  const solutionData = {
    assessment: {
      topic: 'AI Maturity Assessment',
      question: 'How does your AI Maturity Assessment work and what will I learn from it?'
    },
    workshops: {
      topic: 'Workshops & Training',
      question: 'Tell me about your workshops and how they help with AI transformation'
    },
    toolbox: {
      topic: 'The Toolbox',
      question: 'What\'s included in the HMN Toolbox and how can I use it?'
    }
  }

  const data = solutionData[solutionId]

  return (
    <AskAIButton
      topic={data.topic}
      question={data.question}
      context={{ page: 'solutions', solutionId }}
      variant="default"
    />
  )
}
