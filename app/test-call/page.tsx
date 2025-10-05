'use client'

import { CallMeButton } from '../../components/molecules/CallMeButton'
import { motion } from 'framer-motion'
import { Phone, Mic, Clock, CheckCircle } from 'lucide-react'

export default function TestCallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Test AI Maturity Assessment Call
            </h1>
            <p className="text-xl text-gray-300">
              Experience our voice-guided AI maturity assessment
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
            <div className="space-y-6">
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4">
                  <Mic className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-medium text-white">Voice Guided</h3>
                  <p className="text-sm text-gray-400">Natural conversation</p>
                </div>
                <div className="text-center p-4">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="font-medium text-white">15-20 Minutes</h3>
                  <p className="text-sm text-gray-400">Comprehensive assessment</p>
                </div>
                <div className="text-center p-4">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-medium text-white">23 Dimensions</h3>
                  <p className="text-sm text-gray-400">Complete analysis</p>
                </div>
              </div>

              {/* Call Button */}
              <div className="text-center">
                <CallMeButton 
                  defaultPhoneNumber="+19179221928"
                  buttonText="Call Me Now for Assessment"
                  className="max-w-md mx-auto"
                />
              </div>

              {/* Instructions */}
              <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <h3 className="font-medium text-blue-300 mb-2">How it works:</h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Click the button above or enter your phone number</li>
                  <li>2. You'll receive a call within seconds</li>
                  <li>3. Our AI assistant will guide you through the assessment</li>
                  <li>4. Answer questions naturally in conversation</li>
                  <li>5. Receive your maturity report after completion</li>
                </ol>
              </div>

              {/* Test Numbers */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Test with: +19179221928</p>
                <p className="mt-2">Ensure you have:</p>
                <ul className="mt-1">
                  <li>• VAPI_API_KEY in .env.local</li>
                  <li>• VAPI_PHONE_NUMBER_ID in .env.local</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <a 
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}