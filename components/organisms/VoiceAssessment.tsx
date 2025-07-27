'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { AssessmentDimension } from '../../lib/assessment/dimensions'

// Vapi Configuration
const ASSESSMENT_ASSISTANT_ID = 'bc8faa11-a790-4e06-8cbd-4083edd460d4'
const PHONE_NUMBER_ID = 'eb3b2751-1c4d-4dcd-85a4-0bfce22686d0' // +1 (817) 761-5671

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
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [responses] = useState(new Map<string, any>())
  const [error, setError] = useState<string | null>(null)
  const [callId, setCallId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)

  // Poll call status when connected
  useEffect(() => {
    if (!callId || !isConnected) return

    const pollInterval = setInterval(async () => {
      try {
        // In a real implementation, we'd poll the call status
        // For now, we'll simulate progress
        setProgress(prev => Math.min(prev + 2, 100))
      } catch (error) {
        console.error('Error polling call status:', error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [callId, isConnected])

  const startAssessment = async () => {
    if (isConnecting || isConnected) return

    if (!phoneNumber.trim()) {
      setShowPhoneInput(true)
      return
    }

    setIsConnecting(true)
    setError(null)
    setIsLoading(true)

    try {
      // For now, simulate the call creation
      // In production, this would integrate with the Vapi Web SDK or server-side MCP tools
      const simulatedCallId = `assessment_call_${Date.now()}`
      
      setCallId(simulatedCallId)
      setIsConnected(true)
      setIsConnecting(false)
      setCurrentQuestion(`Assessment call initiated to ${phoneNumber}. Our AI assistant will call you shortly to begin the assessment.`)
      
      // Simulate call status updates
      setTimeout(() => {
        setCurrentQuestion('Connected! The assessment will begin in a moment.')
      }, 3000)
      
    } catch (err) {
      console.error('Failed to start assessment:', err)
      setError('Failed to start voice assessment. Please check the phone number and try again.')
      setIsConnecting(false)
    } finally {
      setIsLoading(false)
    }
  }

  const endAssessment = async () => {
    if (!isConnected) return

    try {
      setIsConnected(false)
      setCallId(null)
      setCurrentQuestion('')
    } catch (err) {
      console.error('Failed to end assessment:', err)
    }
  }

  const toggleMute = () => {
    if (!isConnected) return
    setIsMuted(!isMuted)
  }

  const handleComplete = () => {
    endAssessment()
    onComplete(responses)
  }

  // Simulate assessment completion after some time
  useEffect(() => {
    if (isConnected && progress >= 100) {
      setTimeout(handleComplete, 2000)
    }
  }, [isConnected, progress])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
            {isConnected ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Connected</span>
              </motion.div>
            ) : isConnecting ? (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-blue-400 font-medium">Connecting...</span>
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
                <span className="text-gray-400 font-medium">Not Connected</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Visualization */}
        <div className="relative h-32 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {isConnected && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full"
              />
            )}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-white" />
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
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

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

        {/* Phone Number Input */}
        {showPhoneInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-800/50 rounded-xl"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number for Assessment Call
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setShowPhoneInput(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We'll call this number to conduct your AI assessment. Standard call rates may apply.
            </p>
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isConnected && !isConnecting ? (
            <button
              onClick={startAssessment}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-3"
            >
              <Phone className="w-5 h-5" />
              {phoneNumber ? 'Call Me for Assessment' : 'Start Voice Assessment'}
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={cn(
                  "p-4 rounded-xl transition-all",
                  isMuted
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={endAssessment}
                className="px-6 py-4 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all flex items-center gap-3"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        {!isConnected && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Ensure your microphone is enabled and you're in a quiet environment.</p>
            <p>The assessment takes approximately 10-15 minutes.</p>
          </div>
        )}
      </div>

      {/* Alternative Options */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            endAssessment()
            onCancel()
          }}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Prefer to type? Switch to text assessment
        </button>
      </div>
    </motion.div>
  )
}