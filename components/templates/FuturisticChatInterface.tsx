'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Cpu, Zap, Activity, Bot } from 'lucide-react'
import { Text, Icon, Badge } from '../atoms'
import { TypingDots, Card } from '../molecules'
import { ChatMessage, ModelSelector, ChatInput } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { AIModel } from '../../lib/mcp/types'
import { chatFlow } from '../../lib/chatFlow'
import { api } from '../../services/api'
import { modelConfigs } from '../../lib/mcp/models'

export interface FuturisticChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
  userData: any
}

export function FuturisticChatInterface({ onStateChange, userData }: FuturisticChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-sonnet-4')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState({ messages: 0, tokens: 0 })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setTimeout(() => {
      startConversation()
    }, 1500)
  }, [])

  const startConversation = () => {
    setIsTyping(true)
    setTimeout(() => {
      const greeting = chatFlow.getGreeting()
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }])
      setIsTyping(false)
      setCurrentState('greeting')
      onStateChange('greeting')
    }, 2000)
  }

  const handleSend = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)
    setStats(prev => ({ ...prev, messages: prev.messages + 1 }))

    try {
      if (currentState === 'initial' || currentState === 'greeting') {
        const response = chatFlow.processResponse(currentState, input, userData)
        
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, assistantMessage])
          setIsTyping(false)

          if (response.nextState) {
            setCurrentState(response.nextState)
            onStateChange(response.nextState, response.data)
          }
        }, 1500)
      } else {
        const response = await api.sendChatMessage({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `You are the HMN AI assistant helping ${userData.name} from ${userData.company}. 
                       They are a ${userData.role} dealing with ${userData.challenge}. 
                       Company size: ${userData.size} employees.
                       Provide helpful, personalized advice about organizational transformation.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7
        })

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        
        if (response.usage) {
          setStats(prev => ({ 
            ...prev, 
            tokens: prev.tokens + (response.usage?.totalTokens || 0)
          }))
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setIsTyping(false)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please make sure API keys are configured.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const modelName = modelConfigs[selectedModel]?.name

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        className="glass rounded-3xl p-6 mb-4 border border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-cyan/20 border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-8 h-8 text-neon-blue" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
                HMN AI
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <Text variant="caption" size="xs" className="text-gray-400">Online</Text>
                </div>
                <Badge variant="default" size="sm" className="bg-white/5 border border-white/10">
                  {stats.messages} messages
                </Badge>
                <Badge variant="default" size="sm" className="bg-white/5 border border-white/10">
                  {stats.tokens.toLocaleString()} tokens
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Activity Indicator */}
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
              animate={{ opacity: isTyping ? 1 : 0.5 }}
            >
              <Activity className={`w-4 h-4 ${isTyping ? 'text-neon-blue animate-pulse' : 'text-gray-500'}`} />
              <Text size="xs" className="text-gray-400">
                {isTyping ? 'Processing' : 'Idle'}
              </Text>
            </motion.div>
            
            {process.env.NEXT_PUBLIC_ENABLE_MODEL_SELECTOR === 'true' && (
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        className="glass rounded-3xl p-6 border border-white/10 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Holographic overlay */}
        <div className="absolute inset-0 holographic opacity-5 pointer-events-none" />
        
        {/* Messages Container */}
        <div className="h-[500px] overflow-y-auto mb-6 space-y-4 relative z-10">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChatMessage 
                  message={message}
                  modelName={message.role === 'assistant' && currentState !== 'initial' && currentState !== 'greeting' ? modelName : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-2 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                <Bot className="w-5 h-5 text-neon-blue" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                <TypingDots size="sm" />
                <Text variant="caption" size="xs" className="text-gray-400 ml-2">
                  AI is thinking...
                </Text>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="relative z-10">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <ChatInput
            onSend={handleSend}
            disabled={isTyping}
            placeholder="Ask me anything about organizational transformation..."
            className="pt-4"
          />
        </div>

        {/* Status Bar */}
        <motion.div 
          className="flex items-center justify-between mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-500" />
              <Text size="xs" className="text-gray-500">
                Model: {modelName}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <Text size="xs" className="text-gray-500">
                Response time: ~2s
              </Text>
            </div>
          </div>
          
          <Text size="xs" className="text-gray-500">
            Powered by HMN AI • July 2025
          </Text>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}