'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Brain, X, Minimize2, Maximize2, Mic, MessageSquare, RotateCcw, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react'

// Counter for generating unique IDs within the same millisecond
let messageIdCounter = 0

/**
 * Generate a unique message ID that won't collide even if called rapidly
 */
function generateMessageId(prefix = 'msg'): string {
  messageIdCounter = (messageIdCounter + 1) % 10000
  return `${prefix}-${Date.now()}-${messageIdCounter}-${Math.random().toString(36).substr(2, 5)}`
}
import { Text } from '../atoms'
import { Card, QuickResponse } from '../molecules'
import { ChatMessage, VoiceAssessment } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { EnhancedChatFlow } from '../../lib/enhancedChatFlow'
import { assessmentDimensions } from '../../lib/assessment/dimensions'
import { cn } from '../../utils/cn'
import { AIChatService } from '../../lib/aiChatService'
import { AIToolHandler } from '../../lib/aiToolHandler'
import { useChat } from '../../lib/contexts/ChatContext'
import { getPersonalizedGreeting, trackEngagement, PersonalizedGreeting } from '../../lib/utils/personalization'
import { useChatProgress } from '../../lib/hooks/useChatProgress'
import { useDataEnrichment } from '../../lib/hooks/useDataEnrichment'

export interface UnifiedChatSystemProps {
  isHeroVisible: boolean
  className?: string
  onShowROI?: () => void
  onShowRoadmap?: () => void
  isMobileSticky?: boolean
}

export function UnifiedChatSystem({ isHeroVisible, className, onShowROI, onShowRoadmap, isMobileSticky = false }: UnifiedChatSystemProps) {
  const {
    messages,
    setMessages,
    chatState: currentState,
    onChatStateChange,
    suggestions,
    setSuggestions,
    userData: contextUserData
  } = useChat()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // currentState, messages, suggestions are now from context
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const [showVoiceToggle, setShowVoiceToggle] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [showChatPrompt, setShowChatPrompt] = useState(false)
  // Initialize with proper assessment greeting to avoid hydration mismatch
  const [personalizedGreeting, setPersonalizedGreeting] = useState<PersonalizedGreeting>({
    greeting: "Welcome. I'm your AI transformation advisor. I can help you:",
    context: "• Assess your AI Capability\n• Determine Your AI Upskilling Needs\n• Calculate ROI for AI initiatives\n\nLet's start with your first name:",
    suggestions: [] as string[]
  })
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef(contextUserData || {})
  const chatFlow = useRef(new EnhancedChatFlow())
  const aiChatService = useRef(new AIChatService())
  const aiToolHandler = useRef(new AIToolHandler({
    onShowROI: () => {
      console.log('Show ROI Calculator')
      onShowROI?.()
    },
    onScheduleDemo: () => {
      console.log('Schedule Demo')
      window.open('https://calendly.com/alex-behmn/discovery-call', '_blank')
    },
    onStartAssessment: () => {
      console.log('Start Assessment')
      onShowRoadmap?.()
      onChatStateChange('greeting')
    },
    onNavigate: (page: string) => {
      window.location.href = `/${page}`
    }
  }))

  // Chat progress hook
  const {
    saveProgress,
    loadProgress,
    clearProgress,
    abandonmentDetected,
    resetAbandonmentFlag
  } = useChatProgress(messages, localUserData.current, currentState)

  // Data enrichment hook
  const { enrich, loading: enrichmentLoading, enrichedData } = useDataEnrichment()

  // Update local userData when prop changes
  useEffect(() => {
    localUserData.current = contextUserData || {}
  }, [contextUserData])

  // Set personalized greeting after hydration (client-side only)
  useEffect(() => {
    setPersonalizedGreeting(getPersonalizedGreeting())
  }, [])

  // Show voice toggle when reaching assessment state
  useEffect(() => {
    setShowVoiceToggle(currentState === 'assessment')
  }, [currentState])

  const handleVoiceAssessmentComplete = (responses: Map<string, any>) => {
    // Convert voice responses to assessment data
    const assessmentData: any = {}
    responses.forEach((value, key) => {
      assessmentData[key] = value
    })

    // Add a message about completing voice assessment
    const completionMessage: Message = {
      id: generateMessageId('voice-complete'),
      role: 'assistant',
      content: 'Thank you for completing the voice assessment! I\'m now analyzing your responses to provide personalized recommendations.',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, completionMessage])

    // Update user data with assessment results
    const updatedUserData = { ...localUserData.current, voiceAssessmentData: assessmentData }
    localUserData.current = updatedUserData
    onChatStateChange('performingAnalysis', updatedUserData)
  }

  const handleVoiceAssessmentCancel = () => {
    onChatStateChange('assessment')
  }

  const switchToVoiceAssessment = () => {
    onChatStateChange('voiceAssessment', localUserData.current)
  }

  const resetConversation = () => {
    // Clear all chat state
    setMessages([])
    setInput('')
    setIsTyping(false)
    setSuggestions([])
    hasStarted.current = false
    setHasStartedChat(false)
    localUserData.current = {}

    // Clear all stored data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humanglue_chat_progress')
      localStorage.removeItem('humanglue_engagement_events')
      sessionStorage.removeItem('humanglue_exit_intent_shown')

      // Clear any assessment data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('assessment_')) {
          localStorage.removeItem(key)
        }
      })
    }

    // Reset to initial state
    onChatStateChange('initial', {})
    resetAbandonmentFlag()

    console.log('[Chat] Reset: All data cleared, starting fresh')

    // Immediately restart conversation with name prompt
    setTimeout(() => {
      startConversation()
    }, 100)
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  useEffect(() => {
    if (hasStarted.current && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, suggestions])

  // Also scroll when typing state changes (to show new content)
  useEffect(() => {
    if (!isTyping) {
      scrollToBottom()
    }
  }, [isTyping])

  // Smart auto-start with timing and visibility checks
  useEffect(() => {
    if (!hasStarted.current && messages.length === 0) {
      const autoStartTimer = setTimeout(() => {
        // Only start if user is still on page, hero is visible, and page has focus
        if (isHeroVisible && typeof document !== 'undefined' && document.hasFocus()) {
          startConversation()
          trackEngagement('chat_auto_started', { greeting: personalizedGreeting.greeting })
        }
      }, 3500) // 3.5 seconds after page load

      return () => clearTimeout(autoStartTimer)
    }
  }, [isHeroVisible])

  // Chat discovery prompt - show after 6 seconds if auto-start didn't trigger
  useEffect(() => {
    if (messages.length === 0 && !hasStarted.current) {
      const promptTimer = setTimeout(() => {
        // Only show if auto-start didn't succeed (check again after delay)
        if (!hasStarted.current && messages.length === 0) {
          setShowChatPrompt(true)
          trackEngagement('chat_prompt_shown')

          // Auto-dismiss after 8 seconds
          const dismissTimer = setTimeout(() => {
            setShowChatPrompt(false)
          }, 8000)

          return () => clearTimeout(dismissTimer)
        }
      }, 6000) // Increased to 6s to give auto-start time to complete

      return () => clearTimeout(promptTimer)
    } else {
      setShowChatPrompt(false)
    }
  }, [messages.length, hasStarted])

  // Check for saved progress on mount - only once per session
  useEffect(() => {
    // Only show recovery prompt if this is a fresh page load and hero is visible
    if (isHeroVisible && !hasStarted.current && messages.length === 0) {
      const savedProgress = loadProgress()
      if (savedProgress && savedProgress.messages.length > 0) {
        setShowRecoveryPrompt(true)
        trackEngagement('chat_recovery_offered', {
          savedMessages: savedProgress.messages.length,
          savedState: savedProgress.currentState
        })
      }
    }
  }, []) // Only run once on mount

  // Handle abandonment detection
  useEffect(() => {
    if (abandonmentDetected && messages.length > 0) {
      trackEngagement('chat_abandonment_detected', {
        messageCount: messages.length,
        state: currentState
      })
    }
  }, [abandonmentDetected])

  // Handle transition from hero to sidebar
  useEffect(() => {
    // Only show transition message when:
    // 1. Hero becomes invisible (user scrolled down)
    // 2. Haven't shown the transition message yet
    // 3. There are existing messages (user has started chatting)
    // 4. NOT during active question sequences (assessment, analysis states)
    const isInActiveQuestionSequence = currentState === 'assessment' ||
                                       currentState === 'performingAnalysis' ||
                                       currentState === 'voiceAssessment'

    // DISABLED: Auto-transition message removed per user request
    // if (!isHeroVisible && !hasTransitioned && messages.length > 0 && !isInActiveQuestionSequence) {
    //   setHasTransitioned(true)
    //   // Add a transition message when moving to sidebar
    //   const transitionMessage: Message = {
    //     id: 'transition-' + Date.now(),
    //     role: 'assistant',
    //     content: "I'm here in the sidebar if you need anything else! Feel free to ask questions or explore more options.",
    //     timestamp: new Date()
    //   }
    //   setMessages(prev => [...prev, transitionMessage])
    // }
  }, [isHeroVisible, hasTransitioned, currentState])

  const startConversation = () => {
    if (hasStarted.current) return
    hasStarted.current = true
    setHasStartedChat(true)

    // Show greeting with context (combines greeting + context into one message)
    const fullGreeting = personalizedGreeting.context
      ? `${personalizedGreeting.greeting}\n\n${personalizedGreeting.context}`
      : personalizedGreeting.greeting

    setMessages([{
      id: '1',
      role: 'assistant',
      content: fullGreeting,
      timestamp: new Date()
    }])
    onChatStateChange('greeting')

    // Set personalized suggestions if available
    if (personalizedGreeting.suggestions.length > 0) {
      setSuggestions(personalizedGreeting.suggestions)
    } else {
      setSuggestions([])
    }

    trackEngagement('conversation_started', {
      greetingType: personalizedGreeting.greeting
    })
  }

  const handleRecoverChat = (action: 'continue' | 'email' | 'browse') => {
    const savedProgress = loadProgress()
    if (!savedProgress) return

    switch (action) {
      case 'continue':
        // Restore saved state
        setMessages(savedProgress.messages)
        localUserData.current = savedProgress.userData
        onChatStateChange(savedProgress.currentState, savedProgress.userData)
        setShowRecoveryPrompt(false)
        hasStarted.current = true
        setHasStartedChat(true)
        trackEngagement('chat_recovered', {
          messageCount: savedProgress.messages.length
        })
        break

      case 'email':
        // TODO: Implement email link functionality
        setShowRecoveryPrompt(false)
        clearProgress()
        trackEngagement('chat_recovery_email_requested')
        break

      case 'browse':
        // Clear saved progress and start fresh
        setShowRecoveryPrompt(false)
        clearProgress()
        trackEngagement('chat_recovery_declined')
        break
    }
  }

  const handleAbandonmentAction = (action: 'continue' | 'email' | 'browse') => {
    resetAbandonmentFlag()

    if (action === 'email') {
      // Add a message asking for email
      const emailMessage: Message = {
        id: generateMessageId('email-request'),
        role: 'assistant',
        content: "I'd be happy to send you a link to continue this conversation later. What's your email address?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, emailMessage])
      trackEngagement('abandonment_email_requested')
    } else if (action === 'browse') {
      trackEngagement('abandonment_browsing_continued')
    } else {
      trackEngagement('abandonment_continue_now')
    }
  }

  const handleSend = async (inputText?: string) => {
    const messageText = inputText || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: generateMessageId('user'),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setSuggestions([])

    try {
      const response = await chatFlow.current.processResponse(currentState, messageText, localUserData.current)

      // Detect and handle tool calls if this is an AI response
      let finalMessage = response.message
      let toolExecuted = false

      if (response.isAIResponse) {
        const toolDetection = aiChatService.current.detectToolCall(response.message)

        if (toolDetection.hasTool && toolDetection.tool) {
          // Execute the tool
          const toolResult = await aiToolHandler.current.executeTool({
            name: toolDetection.tool,
            params: toolDetection.params
          })

          // Use cleaned response (without tool syntax)
          finalMessage = toolDetection.cleanedResponse
          toolExecuted = true

          // If tool has data to display, add it to the message
          if (toolResult.data) {
            // Format the tool data nicely
            if (toolResult.action === 'explain_solution') {
              const solution = toolResult.data
              finalMessage += `\n\n**${solution.title}**\n\n${solution.description}\n\n**Key Benefits:**\n${solution.benefits.map((b: string) => `• ${b}`).join('\n')}\n\n**Timeline:** ${solution.timeline}\n**Pricing:** ${solution.pricing}`
            } else if (toolResult.action === 'show_case_study') {
              const caseStudy = toolResult.data
              finalMessage += `\n\n**Company:** ${caseStudy.company}\n**Challenge:** ${caseStudy.challenge}\n**Solution:** ${caseStudy.solution}\n\n**Results:**\n${caseStudy.results.map((r: string) => `✓ ${r}`).join('\n')}`
            }
          }
        }
      }

      setTimeout(async () => {
        const assistantMessage: Message = {
          id: generateMessageId('assistant'),
          role: 'assistant',
          content: finalMessage,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)

        if (response.suggestions) {
          setSuggestions(response.suggestions)
        }

        // Attempt data enrichment after email is collected
        if (response.data?.email && response.data?.stage === 'phone') {
          try {
            const enrichmentResult = await enrich(response.data.email)

            if (enrichmentResult?.found && enrichmentResult.company) {
              // Add enrichment confirmation message
              setTimeout(() => {
                const enrichmentMessage: Message = {
                  id: generateMessageId('enrichment'),
                  role: 'assistant',
                  content: `I found that you're with **${enrichmentResult.company}**${enrichmentResult.industry ? ` in the ${enrichmentResult.industry} industry` : ''}${enrichmentResult.size ? ` (${enrichmentResult.size})` : ''}. Is that correct?`,
                  timestamp: new Date()
                }

                setMessages(prev => [...prev, enrichmentMessage])

                // Update suggestions for confirmation
                setSuggestions([
                  { text: "Yes, that's right" },
                  { text: "No, different company" }
                ])

                // Merge enriched data into user data
                const enrichedUserData = {
                  ...response.data,
                  company: enrichmentResult.company,
                  industry: enrichmentResult.industry,
                  companySize: enrichmentResult.size,
                  enrichmentSource: enrichmentResult.source
                }
                localUserData.current = enrichedUserData
                onChatStateChange(currentState, enrichedUserData)

                trackEngagement('data_enrichment_success', {
                  source: enrichmentResult.source,
                  company: enrichmentResult.company
                })
              }, 1000)
            } else {
              // Enrichment failed - ask for company name manually
              console.log('[Enrichment] No data found for domain, asking manually')
              setTimeout(() => {
                const fallbackMessage: Message = {
                  id: generateMessageId('fallback'),
                  role: 'assistant',
                  content: "I couldn't automatically find your company information. What's the name of your company?",
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, fallbackMessage])
                onChatStateChange('collectingCompanyInfo')
                trackEngagement('data_enrichment_fallback', { reason: 'no_data_found' })
              }, 1000)
            }
          } catch (error) {
            console.error('[Enrichment] Error:', error)
            // Enrichment error - ask for company name manually
            setTimeout(() => {
              const errorFallbackMessage: Message = {
                id: generateMessageId('error-fallback'),
                role: 'assistant',
                content: "What's the name of your company?",
                timestamp: new Date()
              }
              setMessages(prev => [...prev, errorFallbackMessage])
              onChatStateChange('collectingCompanyInfo')
              trackEngagement('data_enrichment_fallback', { reason: 'error' })
            }, 1000)
          }
        }

        if (response.nextState) {
          onChatStateChange(response.nextState)
          const updatedUserData = { ...localUserData.current, ...response.data }
          localUserData.current = updatedUserData
          onChatStateChange(response.nextState, updatedUserData)

          // Auto-scroll to assessment cards after second question (discovery state)
          // This happens after user provides name and moves to company selection
          if (response.nextState === 'discovery' && isHeroVisible) {
            setTimeout(() => {
              const assessmentSection = document.getElementById('ai-transformation')
              if (assessmentSection) {
                assessmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                trackEngagement('auto_scrolled_to_assessment')
              }
            }, 1500) // Wait for animation to complete
          }

          // Auto-trigger analysis after showing loading animation
          if (response.nextState === 'performingAnalysis') {
            setTimeout(async () => {
              setIsTyping(true)
              try {
                const analysisResponse = await chatFlow.current.processResponse(
                  'performingAnalysis',
                  'analyze',
                  updatedUserData
                )

                setTimeout(() => {
                  const analysisMessage: Message = {
                    id: generateMessageId('analysis'),
                    role: 'assistant',
                    content: analysisResponse.message,
                    timestamp: new Date()
                  }

                  setMessages(prev => [...prev, analysisMessage])
                  setIsTyping(false)

                  if (analysisResponse.suggestions) {
                    setSuggestions(analysisResponse.suggestions)
                  }

                  if (analysisResponse.nextState) {
                    onChatStateChange(analysisResponse.nextState)
                  }

                  // Save profile when analysis is complete
                  if (analysisResponse.profileAnalysis && analysisResponse.data?.analysis) {
                    saveProfile(updatedUserData, analysisResponse.profileAnalysis)
                  }
                }, 1000)
              } catch (error) {
                console.error('Analysis error:', error)
                setIsTyping(false)
              }
            }, 3500) // Wait for loading animation to complete
          }
        } else if (response.data) {
          const updatedUserData = { ...localUserData.current, ...response.data }
          localUserData.current = updatedUserData
          onChatStateChange(currentState, updatedUserData)
        }


        // Save profile when analysis is complete (for non-performingAnalysis states)
        if (response.profileAnalysis && response.data?.analysis && response.nextState !== 'performingAnalysis') {
          saveProfile(localUserData.current, response.profileAnalysis)
        }
      }, 1500)
    } catch (error) {
      console.error('Chat error:', error)
      setIsTyping(false)
    }
  }

  const saveProfile = async (userData: any, analysis: any) => {
    try {
      // Generate unique assessment ID
      const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const profile = {
        ...userData,
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstContact: new Date(),
        lastContact: new Date(),
        totalInteractions: messages.length,
        pagesVisited: ['homepage'],
        leadScore: analysis.scoring.fitScore,
        leadStage: analysis.scoring.fitScore > 80 ? 'hot' :
          analysis.scoring.fitScore > 60 ? 'warm' : 'cold',
        estimatedDealSize: analysis.predictions.dealSize,
        probabilityToClose: analysis.predictions.successProbability
      }

      // Create full assessment object for results page
      const assessmentData = {
        id: assessmentId,
        userData,
        analysis,
        createdAt: new Date().toISOString(),
        messages: messages.length
      }

      // Save to localStorage for immediate access
      localStorage.setItem(`assessment_${assessmentId}`, JSON.stringify(assessmentData))

      // Save profile to backend
      const profileResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (profileResponse.ok) {
        console.log('Profile saved successfully')
      } else {
        console.error('Failed to save profile:', await profileResponse.text())
      }

      // Send assessment email notification (via Netlify function)
      if (userData.email) {
        try {
          const resultsUrl = `${window.location.origin}/results/${assessmentId}`
          await fetch('/.netlify/functions/send-assessment-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: userData.email,
              name: userData.name,
              company: userData.company,
              assessmentId,
              score: analysis.scoring.fitScore,
              resultsUrl
            }),
          })
          console.log('Assessment email sent to:', userData.email)
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
          // Continue even if email fails - user can still access results
        }
      }

      // Redirect to results page
      window.location.href = `/results/${assessmentId}`
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Shared chat content component
  const chatContent = (
    <>
      {currentState === 'voiceAssessment' ? (
        <VoiceAssessment
          dimensions={assessmentDimensions}
          onComplete={handleVoiceAssessmentComplete}
          onCancel={handleVoiceAssessmentCancel}
          userData={{
            name: localUserData.current.name,
            company: localUserData.current.company,
            email: localUserData.current.email
          }}
        />
      ) : (
        <>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 space-y-4"
            >
              <div className="space-y-3">
                <p className="text-white text-base font-medium font-diatype">
                  {personalizedGreeting.greeting}
                </p>
                <p className="text-gray-400 text-sm font-diatype">
                  {personalizedGreeting.context}
                </p>
              </div>

              {/* Quick action buttons for personalized suggestions */}
              {personalizedGreeting.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {personalizedGreeting.suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSend(suggestion)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium font-diatype',
                        'bg-gray-800/50 border border-gray-700/50',
                        'text-gray-300 hover:text-white',
                        'hover:border-brand-cyan/50 hover:bg-gray-800',
                        'transition-all duration-200'
                      )}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-6"
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <Text size="sm" className="text-gray-400 font-diatype">Thinking...</Text>
              </div>
            </motion.div>
          )}

          {suggestions.length > 0 && !isTyping && messages.length > 0 && (
            <QuickResponse
              suggestions={suggestions}
              onSelect={handleSend}
              className="mb-4"
            />
          )}

          {/* Abandonment recovery prompt */}
          <AnimatePresence>
            {abandonmentDetected && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 rounded-xl bg-gradient-to-br from-brand-cyan/10 to-brand-cyan/10 border border-brand-cyan/20"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-white text-sm font-medium font-diatype mb-1">
                        Still there?
                      </p>
                      <p className="text-gray-400 text-xs font-diatype">
                        I noticed you might need a moment. How would you like to continue?
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAbandonmentAction('continue')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 transition-colors"
                      >
                        Continue now
                      </button>
                      <button
                        onClick={() => handleAbandonmentAction('email')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        Send me the link
                      </button>
                      <button
                        onClick={() => handleAbandonmentAction('browse')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        I'm just browsing
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </>
      )}
    </>
  )

  // Mobile sticky footer mode
  if (isMobileSticky) {
    const [isMobileExpanded, setIsMobileExpanded] = React.useState(true)
    const [isMobileChatVisible, setIsMobileChatVisible] = React.useState(true)

    // If chat is completely dismissed, don't render anything
    if (!isMobileChatVisible) {
      return null
    }

    return (
      <div className="w-full bg-gray-900/98 backdrop-blur-xl border-t-2 border-brand-cyan/30 shadow-2xl">
        {/* Mobile Chat Header - Always visible, optimized for touch */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {/* Left: Status indicator and title - tappable to expand/collapse */}
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex items-center gap-3 flex-1 text-left min-h-[44px] -ml-2 pl-2 pr-4 rounded-lg active:bg-white/5 transition-colors"
          >
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <div className="flex flex-col">
              <Text size="sm" className="font-semibold text-white font-diatype leading-tight">
                {currentState === 'performingAnalysis' ? 'Analyzing Your Responses' : 'AI Assessment'}
              </Text>
              <Text size="xs" className="text-gray-400 font-diatype">
                {isMobileExpanded ? 'Tap to minimize' : 'Tap to expand'}
              </Text>
            </div>
          </button>

          {/* Right: Action buttons with proper touch targets */}
          <div className="flex items-center gap-2">
            {/* Expand/Collapse button */}
            <button
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className={cn(
                'p-3 rounded-xl transition-all',
                'text-gray-400 hover:text-white',
                'active:bg-white/10 active:scale-95',
                'min-w-[44px] min-h-[44px]',
                'flex items-center justify-center'
              )}
              aria-label={isMobileExpanded ? 'Minimize chat' : 'Expand chat'}
            >
              {isMobileExpanded ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronUp className="w-6 h-6" />
              )}
            </button>

            {/* Close button - always visible */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMobileChatVisible(false)
              }}
              className={cn(
                'p-3 rounded-xl transition-all',
                'text-gray-400 hover:text-white',
                'active:bg-red-500/20 active:scale-95',
                'min-w-[44px] min-h-[44px]',
                'flex items-center justify-center'
              )}
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Expandable Chat Content */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 py-4">
                <div className="space-y-4">
                  {/* Scrollable messages area with optimized height */}
                  <div className="max-h-[35vh] overflow-y-auto overscroll-contain scroll-smooth
                                bg-black/30 rounded-2xl p-4 -mx-2">
                    {chatContent}
                  </div>

                  {/* Chat Input Area - Optimized for mobile typing */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        currentState === 'performingAnalysis'
                          ? 'Analysis in progress...'
                          : 'Type your message...'
                      }
                      disabled={isTyping || currentState === 'performingAnalysis'}
                      className={cn(
                        'flex-1 px-5 py-4 rounded-2xl font-diatype text-base',
                        'bg-gray-800/70 border-2 border-gray-700/50',
                        'text-white placeholder:text-gray-500',
                        'focus:outline-none focus:border-brand-cyan/70 focus:bg-gray-800',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-all duration-200',
                        'min-h-[52px]', // Larger touch target
                        'shadow-lg'
                      )}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping || currentState === 'performingAnalysis'}
                      className={cn(
                        'px-6 py-4 rounded-2xl font-semibold font-diatype text-base',
                        'bg-gradient-to-r from-brand-cyan to-blue-500',
                        'text-gray-900',
                        'hover:from-brand-cyan/90 hover:to-blue-500/90',
                        'active:scale-95',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                        'transition-all duration-200',
                        'min-w-[52px] min-h-[52px]', // Square touch target
                        'flex items-center justify-center',
                        'shadow-lg shadow-brand-cyan/25'
                      )}
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Desktop mode (hidden on mobile, only shows on lg screens and up)
  return (
    <motion.div
      initial={false}
      animate={{
        position: isHeroVisible ? 'relative' : 'fixed',
        right: isHeroVisible ? 'auto' : 0,
        bottom: isHeroVisible ? 'auto' : 0,
        top: isHeroVisible ? 'auto' : 0,
        width: isHeroVisible ? '100%' : '100%',
        maxWidth: isHeroVisible ? 600 : 480, // Hero: 600px, Sidebar: 480px
        height: isHeroVisible ? 'auto' : '100vh',
        zIndex: isHeroVisible ? 10 : 60
      }}
      transition={{
        type: "tween",
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={cn(
        isHeroVisible ? 'mx-auto' : 'hidden lg:block', // Hide desktop mode on mobile
        className
      )}
    >
      {/* Chat Discovery Prompt - appears above chat */}
      <AnimatePresence>
        {showChatPrompt && isHeroVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-24 right-0 z-50"
          >
            <div className="relative bg-gradient-to-br from-brand-cyan/20 to-brand-cyan/20 backdrop-blur-xl border border-brand-cyan/30 rounded-xl p-4 shadow-2xl max-w-[280px]">
              <button
                onClick={() => setShowChatPrompt(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-white text-sm font-semibold font-diatype">
                    Get AI-Powered Insights
                  </p>
                  <p className="text-gray-300 text-xs font-diatype leading-relaxed">
                    Chat with me to get your personalized transformation roadmap in just 5 minutes
                  </p>
                </div>
              </div>
              {/* Arrow pointer */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-brand-cyan/20 to-brand-cyan/20 border-r border-b border-brand-cyan/30 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Recovery Prompt - modal overlay */}
      <AnimatePresence>
        {showRecoveryPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-brand-cyan/30 rounded-xl p-6 max-w-[320px] shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-cyan/20">
                  <Sparkles className="w-5 h-5 text-brand-cyan" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-base font-semibold font-diatype mb-1">
                    Welcome back!
                  </h3>
                  <p className="text-gray-400 text-sm font-diatype">
                    I found your previous conversation. Would you like to continue where you left off?
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleRecoverChat('continue')}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-cyan text-white text-sm font-medium font-diatype hover:shadow-lg hover:shadow-brand-cyan/25 transition-all"
                >
                  Continue conversation
                </button>
                <button
                  onClick={() => handleRecoverChat('email')}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium font-diatype transition-all"
                >
                  Email me the link
                </button>
                <button
                  onClick={() => handleRecoverChat('browse')}
                  className="w-full px-4 py-2 text-gray-400 hover:text-gray-300 text-xs font-diatype transition-colors"
                >
                  Start fresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative flex flex-col transition-all duration-300 overflow-hidden",
          isHeroVisible
            ? "rounded-3xl border border-white/10 backdrop-blur-3xl bg-gray-900/60 shadow-2xl shadow-cyan-500/10 h-auto"
            : "h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl"
        )}
        style={isHeroVisible ? {
          boxShadow: '0 0 80px rgba(139, 92, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
        } : undefined}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b border-white/10 flex-shrink-0",
            isHeroVisible ? "px-4 py-3" : "p-4 bg-gray-900/80"
          )}
        >
          {isHeroVisible ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetConversation}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <div>
                  <h3 className="text-sm font-semibold text-white font-diatype">
                    {currentState === 'performingAnalysis' ? 'Analyzing Your Responses' : 'AI Assessment'}
                  </h3>
                  <p className="text-xs text-gray-400 font-diatype">Professional assessment interface</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetConversation}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className={cn(
            "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 min-h-0",
            isHeroVisible
              ? cn("px-4 sm:px-6 py-4 sm:py-5", isExpanded ? "max-h-[600px]" : "max-h-[320px] sm:max-h-[420px]")
              : "p-3 sm:p-4"
          )}
        >
          {chatContent}
        </div>

        {/* Input Area */}
        {currentState !== 'voiceAssessment' && (
          <div
            className={cn(
              "border-t border-white/10 bg-gray-900/80 flex-shrink-0",
              isHeroVisible ? "px-3 sm:px-5 py-2.5 sm:py-3 backdrop-blur-sm" : "p-3 sm:p-4"
            )}
          >
            <div className="flex items-center gap-2">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isTyping}
                className={cn(
                  'flex-1 rounded-lg text-sm font-diatype',
                  'bg-gray-800/50 border border-gray-700/50',
                  'focus:outline-none focus:border-brand-cyan/50 focus:bg-gray-800',
                  'placeholder:text-gray-500 text-white',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isHeroVisible ? 'px-3 sm:px-4 py-2 sm:py-2.5' : 'px-3 py-2'
                )}
              />
              <motion.button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'rounded-lg transition-all duration-200',
                  'bg-gradient-to-r from-brand-cyan to-brand-cyan',
                  'hover:shadow-lg hover:shadow-brand-cyan/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isHeroVisible ? 'p-2 sm:p-2.5' : 'p-2'
                )}
              >
                <Send className={cn('text-white', isHeroVisible ? 'w-4 h-4' : 'w-4 h-4')} />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
} 