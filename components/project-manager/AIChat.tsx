'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useMindReasoner, useProjectNotes, useRoadmapItems, ProjectNote, RoadmapItem } from '@/lib/hooks/useProjectManager'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Settings,
  Brain,
  Lightbulb,
  AlertCircle,
  Database,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: string
  feeling?: string
  saying?: string
  acting?: string
}

interface AIChatProps {
  mindId?: string
}

const suggestedPrompts = [
  'What are the key priorities for this sprint?',
  'Analyze the blocked tasks and suggest solutions',
  'How can we improve team velocity?',
  'Summarize the current project status',
  'What dependencies should we address first?',
]

// Helper function to build project context summary for AI
function buildProjectContext(notes: ProjectNote[], roadmapItems: RoadmapItem[]): string {
  // Task statistics
  const totalTasks = notes.length
  const completedTasks = notes.filter(n => n.status === 'done' || n.status === 'completed').length
  const blockedTasks = notes.filter(n => n.status === 'blocked').length
  const inProgressTasks = notes.filter(n => n.status === 'in_progress' || n.status === 'progress' || n.status === 'active').length
  const todoTasks = notes.filter(n => n.status === 'todo' || n.status === 'backlog').length
  const reviewTasks = notes.filter(n => n.status === 'review').length

  // Priority breakdown
  const criticalTasks = notes.filter(n => n.priority === 'critical')
  const highPriorityTasks = notes.filter(n => n.priority === 'high')

  // Current sprint priorities (high/critical tasks that are in progress or todo)
  const sprintPriorities = notes.filter(n =>
    (n.priority === 'critical' || n.priority === 'high') &&
    (n.status === 'in_progress' || n.status === 'progress' || n.status === 'todo' || n.status === 'active')
  )

  // Roadmap statistics
  const totalRoadmapItems = roadmapItems.length
  const roadmapInProgress = roadmapItems.filter(r => r.status === 'in_progress' || r.status === 'progress' || r.status === 'active').length
  const roadmapCompleted = roadmapItems.filter(r => r.status === 'completed' || r.status === 'done').length
  const roadmapBlocked = roadmapItems.filter(r => r.status === 'blocked').length

  // Upcoming deadlines (next 7 days)
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = roadmapItems.filter(r => {
    if (!r.end_date) return false
    const endDate = new Date(r.end_date)
    return endDate >= now && endDate <= nextWeek
  })

  // Recent activity (last 24 hours)
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const recentNotes = notes.filter(n => new Date(n.updated_at) >= last24Hours).length
  const recentRoadmap = roadmapItems.filter(r => new Date(r.updated_at) >= last24Hours).length

  // Build context string
  let context = `=== PROJECT CONTEXT ===\n\n`

  context += `TASK OVERVIEW:\n`
  context += `- Total Tasks: ${totalTasks}\n`
  context += `- Completed: ${completedTasks} (${totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0}%)\n`
  context += `- In Progress: ${inProgressTasks}\n`
  context += `- To Do: ${todoTasks}\n`
  context += `- In Review: ${reviewTasks}\n`
  context += `- Blocked: ${blockedTasks}\n\n`

  context += `PRIORITY BREAKDOWN:\n`
  context += `- Critical: ${criticalTasks.length}\n`
  context += `- High: ${highPriorityTasks.length}\n`
  context += `- Medium: ${notes.filter(n => n.priority === 'medium').length}\n`
  context += `- Low: ${notes.filter(n => n.priority === 'low').length}\n\n`

  if (sprintPriorities.length > 0) {
    context += `CURRENT SPRINT PRIORITIES (High/Critical, Active/Todo):\n`
    sprintPriorities.slice(0, 5).forEach(task => {
      context += `- [${task.priority.toUpperCase()}] ${task.title} (${task.status})\n`
    })
    if (sprintPriorities.length > 5) {
      context += `  ... and ${sprintPriorities.length - 5} more\n`
    }
    context += '\n'
  }

  if (blockedTasks > 0) {
    const blockedList = notes.filter(n => n.status === 'blocked')
    context += `BLOCKED TASKS:\n`
    blockedList.slice(0, 3).forEach(task => {
      context += `- ${task.title}${task.content ? `: ${task.content.substring(0, 100)}...` : ''}\n`
    })
    if (blockedList.length > 3) {
      context += `  ... and ${blockedList.length - 3} more blocked\n`
    }
    context += '\n'
  }

  context += `ROADMAP STATUS:\n`
  context += `- Total Items: ${totalRoadmapItems}\n`
  context += `- In Progress: ${roadmapInProgress}\n`
  context += `- Completed: ${roadmapCompleted}\n`
  context += `- Blocked: ${roadmapBlocked}\n\n`

  if (upcomingDeadlines.length > 0) {
    context += `UPCOMING DEADLINES (Next 7 Days):\n`
    upcomingDeadlines.forEach(item => {
      const endDate = new Date(item.end_date!)
      context += `- ${item.title}: ${endDate.toLocaleDateString()} (${item.progress}% complete)\n`
    })
    context += '\n'
  }

  context += `RECENT ACTIVITY (Last 24 Hours):\n`
  context += `- Tasks Updated: ${recentNotes}\n`
  context += `- Roadmap Items Updated: ${recentRoadmap}\n`

  context += `\n=== END CONTEXT ===\n`

  return context
}

export function AIChat({ mindId = 'default' }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI project assistant powered by Mind Reasoner. I have access to your project context including tasks, roadmap items, and deadlines. I can help you analyze tasks, suggest priorities, and provide insights about your project. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { simulate, loading, error } = useMindReasoner()
  const { notes, loading: notesLoading } = useProjectNotes()
  const { items: roadmapItems, loading: roadmapLoading } = useRoadmapItems()

  // Memoize context summary to avoid recalculating on every render
  const contextSummary = useMemo(() => {
    if (notesLoading || roadmapLoading) return null
    return buildProjectContext(notes, roadmapItems)
  }, [notes, roadmapItems, notesLoading, roadmapLoading])

  // Context indicator stats
  const contextStats = useMemo(() => ({
    tasksCount: notes.length,
    roadmapCount: roadmapItems.length,
    blockedCount: notes.filter(n => n.status === 'blocked').length,
    isLoading: notesLoading || roadmapLoading
  }), [notes, roadmapItems, notesLoading, roadmapLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      // Build full message with project context
      let fullMessage = input.trim()

      if (contextSummary) {
        fullMessage = `${contextSummary}\n\nUser Question: ${input.trim()}`
      }

      const response = await simulate(mindId, fullMessage)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response?.summary || response?.saying || "I've analyzed your request. Let me provide some insights based on the project context.",
        timestamp: new Date(),
        thinking: response?.thinking,
        feeling: response?.feeling,
        saying: response?.saying,
        acting: response?.acting,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      // If Mind Reasoner fails, provide a fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm currently unable to connect to the Mind Reasoner API. However, I can still help you with general project management questions. Please try again or ask a different question.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallbackMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
            <p className="text-sm text-slate-400">Powered by Mind Reasoner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Context Indicator */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
              contextStats.isLoading
                ? 'bg-slate-800 text-slate-500'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            )}
            title={contextStats.isLoading ? 'Loading project context...' : `AI has context of ${contextStats.tasksCount} tasks, ${contextStats.roadmapCount} roadmap items`}
          >
            <Database size={14} className={contextStats.isLoading ? 'animate-pulse' : ''} />
            {contextStats.isLoading ? (
              <span>Loading context...</span>
            ) : (
              <span>
                {contextStats.tasksCount} tasks, {contextStats.roadmapCount} roadmap
                {contextStats.blockedCount > 0 && (
                  <span className="text-amber-400 ml-1">({contextStats.blockedCount} blocked)</span>
                )}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              showInsights
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            <Lightbulb size={16} />
            Show Insights
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-700/50 p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div className={cn(
                'max-w-[80%] rounded-xl p-4',
                message.role === 'user'
                  ? 'bg-cyan-500/20 text-white'
                  : 'bg-slate-800/80 text-slate-200'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Insights Panel */}
                {showInsights && message.role === 'assistant' && (message.thinking || message.feeling || message.acting) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-slate-700/50 space-y-2"
                  >
                    {message.thinking && (
                      <div className="text-xs">
                        <span className="text-cyan-400 font-medium">Thinking: </span>
                        <span className="text-slate-400">{message.thinking}</span>
                      </div>
                    )}
                    {message.feeling && (
                      <div className="text-xs">
                        <span className="text-pink-400 font-medium">Feeling: </span>
                        <span className="text-slate-400">{message.feeling}</span>
                      </div>
                    )}
                    {message.acting && (
                      <div className="text-xs">
                        <span className="text-green-400 font-medium">Acting: </span>
                        <span className="text-slate-400">{message.acting}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1 text-slate-500 hover:text-white transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <RefreshCw size={14} className="animate-spin" />
                Thinking...
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              className="px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your project..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors',
              input.trim() && !loading
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-slate-700 text-slate-500'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
