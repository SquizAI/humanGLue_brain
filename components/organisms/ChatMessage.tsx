'use client'

import { motion } from 'framer-motion'
import { User, Bot, CheckCircle, AlertCircle, TrendingUp, Users, Calendar, DollarSign, BarChart3, FileText, Lightbulb, ArrowRight } from 'lucide-react'
import { Icon, Text, Badge } from '../atoms'
import { Card } from '../molecules'
import { Message } from '../../lib/types'
import { cn } from '../../utils/cn'
import { ReactNode, useMemo } from 'react'

export interface ChatMessageProps {
  message: Message
  modelName?: string
}

// Structured content types
interface StructuredContent {
  type: 'text' | 'list' | 'metric' | 'action' | 'insight' | 'timeline' | 'comparison'
  content: any
}

// Parse message content for structured elements
function parseStructuredContent(content: string): StructuredContent[] {
  const sections: StructuredContent[] = []
  
  // Check for metrics pattern (e.g., "40% faster" or "$2.5M savings")
  const metricPattern = /(\d+%|\$[\d.]+[MKB]?)\s+([^.!?]+)/g
  
  // Check for bullet points
  const bulletPattern = /^[•\-\*]\s+(.+)$/gm
  
  // Check for numbered lists
  const numberedPattern = /^\d+\.\s+(.+)$/gm
  
  // Check for action items (starting with verbs like "Schedule", "Review", "Contact")
  const actionPattern = /^(Schedule|Review|Contact|Book|Start|Create|Implement|Analyze|Prepare|Submit)\s+(.+)$/gm
  
  // Check for insights (starting with "Key insight:", "Note:", "Important:")
  const insightPattern = /^(Key insight|Note|Important|Tip|Remember):\s*(.+)$/gmi
  
  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/)
  
  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim()
    
    // Check if it's a list
    const bullets = trimmed.match(bulletPattern)
    const numbered = trimmed.match(numberedPattern)
    
    if (bullets || numbered) {
      const items = trimmed.split('\n').map(line => 
        line.replace(/^[•\-\*\d+\.]\s+/, '').trim()
      ).filter(Boolean)
      
      sections.push({
        type: 'list',
        content: { items, ordered: !!numbered }
      })
    }
    // Check for metrics
    else if (metricPattern.test(trimmed)) {
      const matches = Array.from(trimmed.matchAll(metricPattern))
      if (matches.length > 0) {
        sections.push({
          type: 'metric',
          content: matches.map(match => ({
            value: match[1],
            label: match[2].trim()
          }))
        })
      }
    }
    // Check for actions
    else if (actionPattern.test(trimmed)) {
      const matches = Array.from(trimmed.matchAll(actionPattern))
      sections.push({
        type: 'action',
        content: matches.map(match => ({
          verb: match[1],
          task: match[2].trim()
        }))
      })
    }
    // Check for insights
    else if (insightPattern.test(trimmed)) {
      const match = trimmed.match(insightPattern)
      if (match) {
        sections.push({
          type: 'insight',
          content: {
            label: match[1],
            text: match[2].trim()
          }
        })
      }
    }
    // Default to text
    else if (trimmed) {
      sections.push({
        type: 'text',
        content: trimmed
      })
    }
  })
  
  return sections
}

// Render structured content with beautiful styling
function StructuredContentRenderer({ section }: { section: StructuredContent }) {
  switch (section.type) {
    case 'list':
      return (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="my-3"
        >
          <ul className="space-y-2">
            {section.content.items.map((item: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <div className="mt-1 flex-shrink-0">
                  {section.content.ordered ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-semibold text-blue-400">
                      {index + 1}
                    </div>
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-gray-100 leading-relaxed flex-1">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )
      
    case 'metric':
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {section.content.map((metric: any, index: number) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-300">{metric.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )
      
    case 'action':
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-4 space-y-2"
        >
          {section.content.map((action: any, index: number) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-blue-400">{action.verb}</span>
                <span className="text-gray-200 ml-2">{action.task}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </motion.div>
          ))}
        </motion.div>
      )
      
    case 'insight':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-400 text-sm mb-1">{section.content.label}</div>
              <div className="text-gray-100 leading-relaxed">{section.content.text}</div>
            </div>
          </div>
        </motion.div>
      )
      
    case 'text':
    default:
      return (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-100 leading-relaxed my-2"
        >
          {section.content}
        </motion.p>
      )
  }
}

export function ChatMessage({ message, modelName }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  // Parse structured content for assistant messages
  const structuredSections = useMemo(() => {
    if (isUser) return null
    return parseStructuredContent(message.content)
  }, [message.content, isUser])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <motion.div 
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      )}
      
      <div className={cn('max-w-lg flex flex-col gap-1', isUser && 'items-end')}>
        <motion.div
          className={cn(
            'px-5 py-4 rounded-2xl shadow-xl',
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm'
              : 'bg-gray-800/90 backdrop-blur-md text-white rounded-bl-sm border border-gray-700'
          )}
          whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {isUser ? (
            <Text 
              size="sm" 
              className="text-white font-medium leading-relaxed"
            >
              {message.content}
            </Text>
          ) : (
            <div className="space-y-1">
              {structuredSections?.map((section, index) => (
                <StructuredContentRenderer key={index} section={section} />
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn("text-xs text-gray-500 mt-1", isUser && "text-right")}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <motion.div 
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <User className="w-5 h-5 text-gray-300" />
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}