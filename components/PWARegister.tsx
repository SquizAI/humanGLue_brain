'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, RefreshCw } from 'lucide-react'

export function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [updateWaiting, setUpdateWaiting] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateWaiting(true)
                  setShowUpdatePrompt(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Listen for install prompt - DISABLED FOR NOW (app coming in future)
    // const handleBeforeInstallPrompt = (e: any) => {
    //   e.preventDefault()
    //   setDeferredPrompt(e)
    //
    //   // Check if app is already installed
    //   if (!window.matchMedia('(display-mode: standalone)').matches) {
    //     // Show install prompt after a delay
    //     setTimeout(() => {
    //       setShowInstallPrompt(true)
    //     }, 30000) // 30 seconds
    //   }
    // }

    // window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // return () => {
    //   window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    // }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleUpdate = () => {
    if (!updateWaiting) return

    // Tell SW to skip waiting
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
    
    // Reload page
    window.location.reload()
  }

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-gray-900 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Install Human Glue
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Install our app for a faster, native experience with offline support.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleInstall}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Install App
                    </button>
                    <button
                      onClick={() => setShowInstallPrompt(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-gray-900 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <button
                onClick={() => setShowUpdatePrompt(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Update Available
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    A new version of Human Glue is available with improvements and bug fixes.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Update Now
                    </button>
                    <button
                      onClick={() => setShowUpdatePrompt(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}