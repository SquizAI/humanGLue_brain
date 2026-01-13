'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function TestSEOPage() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    setCurrentUrl(window.location.origin)
  }, [])

  const handleImageError = (imageName: string) => {
    setImageError(prev => ({ ...prev, [imageName]: true }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SEO Preview</h1>
        
        <div className="space-y-8">
          {/* Open Graph Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Open Graph Preview (Facebook/LinkedIn)</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-2xl">
              {imageError['og'] ? (
                <div className="w-full h-[315px] bg-gray-200 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <p className="mb-2">Failed to load image</p>
                    <p className="text-sm">Try using direct URL:</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">/og-image.png</code>
                  </div>
                </div>
              ) : (
                <Image
                  src="/og-image.png"
                  alt="Open Graph Preview"
                  width={1200}
                  height={630}
                  className="w-full h-auto"
                  onError={() => handleImageError('og')}
                  priority
                />
              )}
              <div className="p-4 bg-gray-100 text-gray-900">
                <div className="text-xs text-gray-500 uppercase">{currentUrl}</div>
                <h3 className="font-bold text-lg mt-1">HMN - AI-Powered Organizational Transformation</h3>
                <p className="text-sm text-gray-600 mt-1">Transform your organization with AI-powered insights. Strengthen the human connections that drive performance, innovation, and resilience.</p>
              </div>
            </div>
          </div>

          {/* Twitter Card Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Twitter Card Preview</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-xl">
              <Image
                src="/twitter-image.png"
                alt="Twitter Card Preview"
                width={1200}
                height={630}
                className="w-full h-auto"
              />
              <div className="p-4 bg-gray-100 text-gray-900">
                <h3 className="font-bold">HMN - AI-Powered Organizational Transformation</h3>
                <p className="text-sm text-gray-600 mt-1">Transform your organization with AI-powered insights. Strengthen human connections that drive performance.</p>
                <div className="text-xs text-gray-500 mt-2">{currentUrl}</div>
              </div>
            </div>
          </div>

          {/* Favicon Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Favicon Preview</h2>
            <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-2">16x16</p>
                <Image src="/favicon-16x16.png" alt="Favicon 16x16" width={16} height={16} />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">32x32</p>
                <Image src="/favicon-32x32.png" alt="Favicon 32x32" width={32} height={32} />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Apple Touch Icon</p>
                <Image src="/apple-touch-icon.png" alt="Apple Touch Icon" width={60} height={60} className="rounded-lg" />
              </div>
            </div>
          </div>

          {/* Direct Image Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Direct Image Test (without Next.js Image)</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">OG Image (direct):</p>
                <img src="/og-image.png" alt="OG Direct" className="max-w-md border border-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Full URL test:</p>
                <img src={`${currentUrl}/og-image.png`} alt="OG Full URL" className="max-w-md border border-gray-700" />
              </div>
            </div>
          </div>

          {/* Share Links */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Share Links</h2>
            <div className="flex gap-4">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Share on Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('Check out HMN - AI-Powered Organizational Transformation')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 