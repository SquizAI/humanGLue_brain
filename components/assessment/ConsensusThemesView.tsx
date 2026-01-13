'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronDown, ChevronUp, Quote, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ConsensusTheme, Sentiment, InterviewQuote } from './types'

export interface ConsensusThemesViewProps {
  /** Array of consensus themes to display */
  themes: ConsensusTheme[]
  /** Title for the section */
  title?: string
  /** Maximum number of themes to show initially */
  initialVisibleCount?: number
  /** Whether to show quote count badges */
  showQuoteCounts?: boolean
  /** Custom className */
  className?: string
}

const getSentimentIcon = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return TrendingDown
    default:
      return Minus
  }
}

const getSentimentClasses = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        icon: 'text-green-400',
        badge: 'bg-green-500/20 text-green-400',
      }
    case 'negative':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-400',
        badge: 'bg-red-500/20 text-red-400',
      }
    default:
      return {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        icon: 'text-gray-400',
        badge: 'bg-gray-500/20 text-gray-400',
      }
  }
}

interface ThemeCardProps {
  theme: ConsensusTheme
  index: number
  showQuoteCounts: boolean
}

function ThemeCard({ theme, index, showQuoteCounts }: ThemeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sentimentClasses = getSentimentClasses(theme.sentiment)
  const SentimentIcon = getSentimentIcon(theme.sentiment)
  const mentionPercentage = Math.round((theme.mentionCount / theme.totalInterviews) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        sentimentClasses.border,
        sentimentClasses.bg
      )}
    >
      {/* Theme Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            'p-2 rounded-lg mt-0.5',
            sentimentClasses.bg
          )}>
            <SentimentIcon className={cn('w-4 h-4', sentimentClasses.icon)} />
          </div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-white font-diatype">
                {theme.title}
              </h4>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-diatype',
                sentimentClasses.badge
              )}>
                {theme.sentiment}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-diatype mt-1">
              {theme.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {/* Mention Stats */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-sm font-semibold text-white font-diatype">
                {theme.mentionCount}/{theme.totalInterviews}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-diatype">
              {mentionPercentage}% mentioned
            </p>
          </div>
          {showQuoteCounts && theme.quotes.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
              <Quote className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-diatype">
                {theme.quotes.length}
              </span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Theme Progress Bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${mentionPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={cn(
              'h-full rounded-full',
              theme.sentiment === 'positive'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : theme.sentiment === 'negative'
                ? 'bg-gradient-to-r from-red-500 to-rose-500'
                : 'bg-gradient-to-r from-gray-500 to-gray-400'
            )}
          />
        </div>
      </div>

      {/* Expanded Quotes */}
      <AnimatePresence>
        {isExpanded && theme.quotes.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-diatype flex items-center gap-2">
                <Quote className="w-4 h-4" />
                Supporting Quotes
              </h5>
              {theme.quotes.map((quote, idx) => (
                <QuoteItem key={idx} quote={quote} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface QuoteItemProps {
  quote: InterviewQuote
}

function QuoteItem({ quote }: QuoteItemProps) {
  const sentimentClasses = getSentimentClasses(quote.sentiment)

  return (
    <div className={cn(
      'p-3 rounded-lg border-l-2',
      quote.sentiment === 'positive'
        ? 'bg-green-500/5 border-green-500'
        : quote.sentiment === 'negative'
        ? 'bg-red-500/5 border-red-500'
        : 'bg-white/5 border-gray-500'
    )}>
      <p className="text-sm text-gray-300 font-diatype italic">
        &ldquo;{quote.quote}&rdquo;
      </p>
      <p className="text-xs text-gray-500 font-diatype mt-1">
        - {quote.speaker}
      </p>
    </div>
  )
}

export function ConsensusThemesView({
  themes,
  title = 'Consensus Themes',
  initialVisibleCount = 5,
  showQuoteCounts = true,
  className,
}: ConsensusThemesViewProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleThemes = showAll ? themes : themes.slice(0, initialVisibleCount)
  const hasMore = themes.length > initialVisibleCount

  // Group themes by sentiment for summary
  const sentimentCounts = themes.reduce(
    (acc, theme) => {
      acc[theme.sentiment]++
      return acc
    },
    { positive: 0, negative: 0, neutral: 0 } as Record<Sentiment, number>
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            {title}
          </h3>
          <p className="text-xs text-gray-400 font-diatype mt-1">
            {themes.length} themes identified across interviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-diatype">
            {sentimentCounts.positive} positive
          </span>
          <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-diatype">
            {sentimentCounts.negative} negative
          </span>
          <span className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-400 text-xs font-diatype">
            {sentimentCounts.neutral} neutral
          </span>
        </div>
      </div>

      {/* Theme Cards */}
      <div className="space-y-3">
        {visibleThemes.map((theme, index) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            index={index}
            showQuoteCounts={showQuoteCounts}
          />
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all font-diatype text-sm flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {themes.length - initialVisibleCount} More Themes
            </>
          )}
        </motion.button>
      )}
    </div>
  )
}

export default ConsensusThemesView
