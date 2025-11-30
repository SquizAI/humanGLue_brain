'use client'

import { useState } from 'react'
import { Phone, Loader2 } from 'lucide-react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { motion, AnimatePresence } from 'framer-motion'

interface CallMeButtonProps {
  defaultPhoneNumber?: string
  buttonText?: string
  className?: string
}

export function CallMeButton({ 
  defaultPhoneNumber = '', 
  buttonText = 'Start Assessment Call',
  className = ''
}: CallMeButtonProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber)
  const [isLoading, setIsLoading] = useState(false)
  const [showInput, setShowInput] = useState(!defaultPhoneNumber)
  const [callStatus, setCallStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const initiateCall = async () => {
    if (!phoneNumber.trim()) {
      setShowInput(true)
      return
    }

    setIsLoading(true)
    setCallStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/vapi/create-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create call')
      }

      setCallStatus('success')
      setMessage(`Call initiated! We're calling ${phoneNumber} now.`)
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setCallStatus('idle')
        setMessage('')
      }, 5000)

    } catch (error) {
      console.error('Error initiating call:', error)
      setCallStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to initiate call')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence mode="wait">
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-300">
              Enter your phone number for the assessment call
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="flex-1"
                disabled={isLoading}
              />
              {defaultPhoneNumber && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowInput(false)
                    setPhoneNumber(defaultPhoneNumber)
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={initiateCall}
        disabled={isLoading}
        className={`relative overflow-hidden group ${
          callStatus === 'success' 
            ? 'bg-green-600 hover:bg-green-700' 
            : callStatus === 'error'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
        }`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Initiating Call...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              {buttonText}
            </>
          )}
        </span>
        
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20"
          initial={false}
          animate={{ scale: isLoading ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
        />
      </Button>

      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm ${
              callStatus === 'success' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}