'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Check,
  RefreshCw,
} from 'lucide-react'
import Image from 'next/image'

export interface ImageGeneratorProps {
  /** Current image URL */
  currentImage?: string
  /** Callback when an image is selected */
  onImageSelect: (imageUrl: string) => void
  /** Content title for context (e.g., course title) */
  contentTitle?: string
  /** Type of content being created */
  contentType?: 'course' | 'workshop' | 'banner' | 'icon' | 'profile'
  /** Whether to show the component inline or as a modal */
  mode?: 'inline' | 'modal'
  /** If modal mode, whether the modal is open */
  isOpen?: boolean
  /** Close handler for modal mode */
  onClose?: () => void
}

type ImageStyle = 'professional' | 'illustration' | 'abstract' | 'minimalist' | 'realistic'
type ImageProvider = 'openai' | 'gemini'

interface GeneratedImage {
  url: string
  provider: string
  prompt: string
}

export function ImageGenerator({
  currentImage,
  onImageSelect,
  contentTitle = '',
  contentType = 'course',
  mode = 'inline',
  isOpen = true,
  onClose,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<ImageStyle>('professional')
  const [provider, setProvider] = useState<ImageProvider>('openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const styles: { value: ImageStyle; label: string; description: string }[] = [
    { value: 'professional', label: 'Professional', description: 'Clean, corporate style' },
    { value: 'illustration', label: 'Illustration', description: 'Digital art, vibrant' },
    { value: 'abstract', label: 'Abstract', description: 'Geometric, modern' },
    { value: 'minimalist', label: 'Minimalist', description: 'Simple, elegant' },
    { value: 'realistic', label: 'Realistic', description: 'Photo-like, detailed' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: contentType,
          style,
          provider,
          size: contentType === 'banner' ? '1792x1024' : '1024x1024',
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate image')
      }

      const newImage: GeneratedImage = {
        url: result.data.imageUrl,
        provider: result.data.provider,
        prompt: result.data.prompt,
      }

      setGeneratedImages((prev) => [newImage, ...prev.slice(0, 4)])
      setSelectedImage(newImage.url)
    } catch (err) {
      console.error('Image generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelect = () => {
    if (selectedImage) {
      onImageSelect(selectedImage)
      if (mode === 'modal' && onClose) {
        onClose()
      }
    }
  }

  const generateSuggestedPrompt = () => {
    const typePrompts: Record<string, string> = {
      course: `Educational thumbnail for "${contentTitle || 'AI Learning Course'}" showing knowledge, growth, and professional development`,
      workshop: `Interactive workshop scene for "${contentTitle || 'Hands-on Workshop'}" with collaborative learning and practical skills`,
      banner: `Hero banner for "${contentTitle || 'Feature'}" with modern, eye-catching design`,
      icon: `Simple icon representing "${contentTitle || 'Feature'}"`,
      profile: `Professional headshot placeholder with abstract human silhouette`,
    }
    setPrompt(typePrompts[contentType] || typePrompts.course)
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--hg-text-primary)' }}>
              AI Image Generator
            </h3>
            <p className="text-sm" style={{ color: 'var(--hg-text-muted)' }}>
              Generate custom images with DALL-E or Gemini
            </p>
          </div>
        </div>
        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--hg-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Current Image Preview */}
      {currentImage && !selectedImage && (
        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--hg-border-color)' }}>
          <div className="aspect-video relative">
            <Image
              src={currentImage}
              alt="Current image"
              fill
              className="object-cover"
              unoptimized={currentImage.startsWith('data:')}
            />
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs bg-black/50 text-white">
            Current Image
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
            Describe your image
          </label>
          <button
            onClick={generateSuggestedPrompt}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: 'var(--hg-cyan-text)' }}
          >
            <Wand2 className="w-3 h-3" />
            Suggest prompt
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 resize-none"
          style={{
            borderColor: 'var(--hg-border-color)',
            color: 'var(--hg-text-primary)',
          }}
        />
      </div>

      {/* Style & Provider Selection */}
      <div className="grid grid-cols-2 gap-4">
        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
            Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  style === s.value ? 'border-cyan-500 bg-cyan-500/10' : ''
                }`}
                style={{
                  borderColor: style === s.value ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
            AI Provider
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setProvider('openai')}
              className={`w-full px-3 py-2 rounded-lg border text-left transition-all ${
                provider === 'openai' ? 'border-cyan-500 bg-cyan-500/10' : ''
              }`}
              style={{
                borderColor: provider === 'openai' ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
              }}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
                OpenAI DALL-E 3
              </div>
              <div className="text-xs" style={{ color: 'var(--hg-text-muted)' }}>
                Best quality
              </div>
            </button>
            <button
              onClick={() => setProvider('gemini')}
              className={`w-full px-3 py-2 rounded-lg border text-left transition-all ${
                provider === 'gemini' ? 'border-cyan-500 bg-cyan-500/10' : ''
              }`}
              style={{
                borderColor: provider === 'gemini' ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
              }}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
                Google Gemini Imagen
              </div>
              <div className="text-xs" style={{ color: 'var(--hg-text-muted)' }}>
                Alternative option
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, var(--hg-cyan-border) 0%, #06b6d4 100%)',
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Image
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--hg-text-primary)' }}>
              Generated Images
            </label>
            <button
              onClick={() => setGeneratedImages([])}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
              style={{ color: 'var(--hg-text-muted)' }}
            >
              <RefreshCw className="w-3 h-3" />
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video group ${
                  selectedImage === img.url ? 'border-cyan-500 ring-2 ring-cyan-500/50' : ''
                }`}
                style={{
                  borderColor: selectedImage === img.url ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                }}
              >
                <Image
                  src={img.url}
                  alt={`Generated image ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={img.url.startsWith('data:')}
                />
                {selectedImage === img.url && (
                  <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-cyan-400" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs bg-black/60 text-white">
                  {img.provider}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Selected Image Button */}
      {selectedImage && (
        <button
          onClick={handleSelect}
          className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
        >
          <ImageIcon className="w-5 h-5" />
          Use Selected Image
        </button>
      )}
    </div>
  )

  if (mode === 'modal') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6"
              style={{
                backgroundColor: 'var(--hg-bg-card)',
                borderColor: 'var(--hg-border-color)',
              }}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: 'var(--hg-bg-card)',
        borderColor: 'var(--hg-border-color)',
      }}
    >
      {content}
    </div>
  )
}

export default ImageGenerator
