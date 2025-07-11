'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Text, Icon } from '../atoms'
import { TypingDots, Card } from '../molecules'
import { ChatMessage, ModelSelector, ChatInput } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { AIModel } from '../../lib/mcp/types'
import { chatFlow } from '../../lib/chatFlow'
import { api } from '../../services/api'
import { modelConfigs } from '../../lib/mcp/models'

export interface ChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
  userData: any
}

export function ChatInterface({ onStateChange, userData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-sonnet-4')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Start the conversation
    setTimeout(() => {
      startConversation()
    }, 1000)
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

    try {
      // If in initial state, use local chat flow
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
        // Use AI model for more complex interactions
        const response = await api.sendChatMessage({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `You are the Human Glue AI assistant helping ${userData.name} from ${userData.company}. 
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
    <Card
      variant="elevated"
      padding="lg"
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-humanglue-blue/10">
            <Icon icon={Sparkles} size="md" color="var(--humanglue-blue)" />
          </div>
          <div>
            <Text weight="semibold" size="lg">Human Glue Assistant</Text>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Text variant="caption" size="xs">Active</Text>
            </div>
          </div>
        </div>
        
        {process.env.NEXT_PUBLIC_ENABLE_MODEL_SELECTOR === 'true' && (
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        )}
      </div>

      <div className="h-96 overflow-y-auto mb-4 space-y-4 px-2">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              modelName={message.role === 'assistant' && currentState !== 'initial' && currentState !== 'greeting' ? modelName : undefined}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-center gap-2 px-4 py-2">
            <TypingDots size="md" />
            <Text variant="caption" size="xs">AI is thinking...</Text>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        placeholder="Type your message..."
      />
    </Card>
  )
}