'use client'

import { motion } from 'framer-motion'
import { Quote, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { InterviewQuote, Sentiment } from './types'

export interface InterviewQuoteCardProps {
  /** Quote data to display */
  quote: InterviewQuote
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show sentiment indicator */
  showSentiment?: boolean
  /** Whether to highlight the quote */
  highlighted?: boolean
  /** Animation delay */
  animationDelay?: number
  /** Custom className */
  className?: string
}

const getSentimentConfig = (sentiment: Sentiment) => {
  const configs = {
    positive: {
      bg: 'bg-green-500/5',
      border: 'border-green-500',
      borderLight: 'border-green-500/30',
      icon: TrendingUp,
      iconClass: 'text-green-400',
      badge: 'bg-green-500/20 text-green-400',
      label: 'Positive',
    },
    negative: {
      bg: 'bg-red-500/5',
      border: 'border-red-500',
      borderLight: 'border-red-500/30',
      icon: TrendingDown,
      iconClass: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
      label: 'Negative',
    },
    neutral: {
      bg: 'bg-white/5',
      border: 'border-gray-500',
      borderLight: 'border-gray-500/30',
      icon: Minus,
      iconClass: 'text-gray-400',
      badge: 'bg-gray-500/20 text-gray-400',
      label: 'Neutral',
    },
  }
  return configs[sentiment]
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  const classes = {
    sm: {
      padding: 'p-3',
      text: 'text-sm',
      speaker: 'text-xs',
      icon: 'w-3 h-3',
      quoteIcon: 'w-4 h-4',
    },
    md: {
      padding: 'p-4',
      text: 'text-base',
      speaker: 'text-sm',
      icon: 'w-4 h-4',
      quoteIcon: 'w-5 h-5',
    },
    lg: {
      padding: 'p-6',
      text: 'text-lg',
      speaker: 'text-base',
      icon: 'w-5 h-5',
      quoteIcon: 'w-6 h-6',
    },
  }
  return classes[size]
}

export function InterviewQuoteCard({
  quote,
  size = 'md',
  showSentiment = true,
  highlighted = false,
  animationDelay = 0,
  className,
}: InterviewQuoteCardProps) {
  const sentimentConfig = getSentimentConfig(quote.sentiment)
  const sizeClasses = getSizeClasses(size)
  const SentimentIcon = sentimentConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={cn(
        'rounded-xl border-l-2 transition-all',
        sizeClasses.padding,
        sentimentConfig.bg,
        sentimentConfig.border,
        highlighted && 'ring-2 ring-cyan-500/20',
        className
      )}
    >
      {/* Quote Content */}
      <div className="flex gap-3">
        <Quote className={cn(
          'flex-shrink-0 mt-1 text-gray-500',
          sizeClasses.quoteIcon
        )} />
        <div className="flex-1">
          <p className={cn(
            'text-gray-300 font-diatype italic leading-relaxed',
            sizeClasses.text
          )}>
            &ldquo;{quote.quote}&rdquo;
          </p>

          {/* Speaker & Sentiment Row */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <User className={cn('text-gray-500', sizeClasses.icon)} />
              <span className={cn(
                'text-gray-400 font-diatype',
                sizeClasses.speaker
              )}>
                {quote.speaker}
              </span>
            </div>

            {showSentiment && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-diatype',
                sentimentConfig.badge
              )}>
                <SentimentIcon className="w-3 h-3" />
                {sentimentConfig.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export interface QuoteGridProps {
  /** Array of quotes to display */
  quotes: InterviewQuote[]
  /** Number of columns */
  columns?: 1 | 2 | 3
  /** Size variant for all quotes */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show sentiment indicators */
  showSentiment?: boolean
  /** Maximum number of quotes to show */
  maxQuotes?: number
  /** Custom className */
  className?: string
}

export function QuoteGrid({
  quotes,
  columns = 2,
  size = 'md',
  showSentiment = true,
  maxQuotes,
  className,
}: QuoteGridProps) {
  const displayQuotes = maxQuotes ? quotes.slice(0, maxQuotes) : quotes

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {displayQuotes.map((quote, index) => (
        <InterviewQuoteCard
          key={index}
          quote={quote}
          size={size}
          showSentiment={showSentiment}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  )
}

export interface QuoteCarouselProps {
  /** Array of quotes to display */
  quotes: InterviewQuote[]
  /** Auto-scroll interval in ms (0 to disable) */
  autoScrollInterval?: number
  /** Size variant */
  size?: 'md' | 'lg'
  /** Custom className */
  className?: string
}

export function QuoteCarousel({
  quotes,
  autoScrollInterval = 0,
  size = 'lg',
  className,
}: QuoteCarouselProps) {
  // For a full carousel implementation, you'd add state for current index
  // and auto-scroll logic. This is a simplified version showing one quote at a time.

  return (
    <div className={cn('relative', className)}>
      {quotes.length > 0 && (
        <InterviewQuoteCard
          quote={quotes[0]}
          size={size}
          showSentiment={true}
          highlighted={true}
        />
      )}
      {quotes.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === 0
                  ? 'bg-cyan-400 w-4'
                  : 'bg-gray-600 hover:bg-gray-500'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default InterviewQuoteCard
