'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { AssessmentDimension } from '../../lib/assessment/dimensions'
import { useVapi } from '../../hooks/useVapi'
import { createAssessmentConfig, VAPI_PUBLIC_KEY } from '../../lib/voice/vapiConfig'

interface VoiceAssessmentProps {
  dimensions: AssessmentDimension[]
  onComplete: (responses: Map<string, any>) => void
  onCancel: () => void
  userData: {
    name?: string
    company?: string
    email?: string
  }
}

export function VoiceAssessment({
  onComplete,
  onCancel,
  userData
}: VoiceAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [organizationInfo, setOrganizationInfo] = useState<any>(userData)
  const [assessmentResults, setAssessmentResults] = useState<any>(null)

  const { vapi, isLoading, error, startAssessment, stopAssessment, assessmentState } = useVapi(VAPI_PUBLIC_KEY, {
    onCallStart: () => {
      console.log('Assessment call started')
      setCurrentQuestion('Welcome! Let\'s begin your AI maturity assessment.')
    },
    onCallEnd: () => {
      console.log('Assessment call ended')
      if (assessmentResults) {
        onComplete(new Map(Object.entries(assessmentResults.responses || {})))
      }
    },
    onMessage: (message) => {
      console.log('Voice message:', message)
      
      // Handle function calls from voice assistant
      if (message.type === 'function-call') {
        const { functionCall } = message
        
        if (functionCall.name === 'store_organization_info') {
          setOrganizationInfo({ ...organizationInfo, ...functionCall.parameters })
        }
        
        if (functionCall.name === 'advance_assessment') {
          const { nextQuestion } = functionCall.parameters
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion.text)
          }
        }
        
        if (functionCall.name === 'generate_maturity_report') {
          setAssessmentResults(functionCall.parameters)
        }
      }
      
      // Handle transcript updates for current question context
      if (message.type === 'transcript' && message.transcript) {
        console.log('User said:', message.transcript)
      }
    },
    onAssessmentUpdate: (data) => {
      console.log('Assessment update:', data)
      
      if (data.type === 'assessment_complete') {
        setAssessmentResults(data)
        setTimeout(() => {
          onComplete(new Map(Object.entries(data.responses || {})))
        }, 2000)
      }
    },
    onError: (error) => {
      console.error('Voice assessment error:', error)
    }
  })

  const handleStartAssessment = useCallback(async () => {
    try {
      await startAssessment()
    } catch (error) {
      console.error('Failed to start assessment:', error)
    }
  }, [startAssessment])

  const handleStopAssessment = useCallback(() => {
    stopAssessment()
    onCancel()
  }, [stopAssessment, onCancel])

  const toggleMute = useCallback(() => {
    if (vapi && assessmentState.isActive) {
      vapi.setMuted(!vapi.isMuted)
    }
  }, [vapi, assessmentState.isActive])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-400">Initializing voice assistant...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Voice Assessment</h2>
        <p className="text-gray-400">
          Let's have a conversation about your AI readiness. This is faster and more natural than typing.
        </p>
      </div>

      {/* Main Voice Interface */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
        {/* Connection Status */}
        <div className="flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            {assessmentState.isActive ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Connected & Recording</span>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span className="text-gray-400 font-medium">Ready to Connect</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Visualization */}
        <div className="relative h-32 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {assessmentState.isActive && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full"
              />
            )}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              {vapi?.isMuted ? <VolumeX className="w-8 h-8 text-white" /> : <Volume2 className="w-8 h-8 text-white" />}
            </div>
          </div>
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-gray-800/50 rounded-xl"
          >
            <p className="text-gray-300 text-center italic">"{currentQuestion}"</p>
          </motion.div>
        )}

        {/* Progress Bar */}
        {assessmentState.isActive && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Assessment Progress</span>
              <span>{assessmentState.responses.size} / {assessmentState.progress.total} responses</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${(assessmentState.responses.size / assessmentState.progress.total) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Category: {assessmentState.progress.currentCategory}</span>
              <span>{Math.round((assessmentState.responses.size / assessmentState.progress.total) * 100)}% Complete</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Organization Info Display */}
        {organizationInfo?.company && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">Assessment for:</h4>
                <p className="text-white">{organizationInfo.company}</p>
                {organizationInfo.userName && (
                  <p className="text-sm text-gray-400">Contact: {organizationInfo.userName}</p>
                )}
              </div>
              {organizationInfo.industry && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Industry</p>
                  <p className="text-sm text-gray-300">{organizationInfo.industry}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!assessmentState.isActive ? (
            <button
              onClick={handleStartAssessment}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              {isLoading ? 'Starting...' : 'Start Voice Assessment'}
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={cn(
                  "p-4 rounded-xl transition-all",
                  vapi?.isMuted
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                {vapi?.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleStopAssessment}
                className="px-6 py-4 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all flex items-center gap-3"
              >
                <PhoneOff className="w-5 h-5" />
                End Assessment
              </button>
            </>
          )}
        </div>

        {/* Instructions & Results */}
        {!assessmentState.isActive && !assessmentResults ? (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>🎤 Ensure your microphone is enabled and you're in a quiet environment.</p>
            <p>⏱️ The assessment takes approximately 15-20 minutes.</p>
            <p>📊 You'll receive a detailed maturity report with personalized recommendations.</p>
          </div>
        ) : assessmentResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-medium text-green-400">Assessment Complete!</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Excellent work! Your comprehensive AI maturity assessment has been completed successfully.
              You'll see your detailed results and personalized roadmap shortly.
            </p>
            {assessmentResults.maturityLevel !== undefined && (
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Your AI Maturity Level</p>
                <p className="text-2xl font-bold text-blue-400">{assessmentResults.maturityLevel}/9</p>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>

      {/* Alternative Options */}
      {!assessmentState.isActive && !assessmentResults && (
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Prefer to type? Switch to text assessment
          </button>
        </div>
      )}
    </motion.div>
  )
}