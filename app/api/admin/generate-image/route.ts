/**
 * Admin Image Generation API
 * POST /api/admin/generate-image - Generate an image using AI (OpenAI DALL-E or Gemini)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for image generation request
const generateImageSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(1000),
  type: z.enum(['course', 'workshop', 'banner', 'icon', 'profile']).default('course'),
  style: z.enum(['realistic', 'illustration', 'abstract', 'professional', 'minimalist']).default('professional'),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  provider: z.enum(['openai', 'gemini']).default('openai'),
})

interface OpenAIImageResponse {
  data: Array<{
    url?: string
    b64_json?: string
  }>
}

interface GeminiImageResponse {
  images: Array<{
    bytesBase64Encoded: string
    mimeType: string
  }>
}

/**
 * Generate a styled prompt based on the content type and style
 */
function buildPrompt(basePrompt: string, type: string, style: string): string {
  const styleModifiers: Record<string, string> = {
    realistic: 'photorealistic, high-quality photograph, detailed, natural lighting',
    illustration: 'digital illustration, clean vector art, vibrant colors',
    abstract: 'abstract art, geometric shapes, modern, artistic',
    professional: 'professional, clean, corporate style, modern design, polished',
    minimalist: 'minimalist, simple, clean design, negative space, elegant',
  }

  const typeModifiers: Record<string, string> = {
    course: 'educational, learning, knowledge, professional development',
    workshop: 'hands-on, interactive, collaborative, practical session',
    banner: 'wide format, hero image, eye-catching, promotional',
    icon: 'simple, symbolic, easily recognizable, square format',
    profile: 'portrait style, professional headshot, approachable',
  }

  const styleDesc = styleModifiers[style] || styleModifiers.professional
  const typeDesc = typeModifiers[type] || typeModifiers.course

  return `${basePrompt}. Style: ${styleDesc}. Context: ${typeDesc}. No text or watermarks. High quality, 4K resolution.`
}

/**
 * Generate image using OpenAI DALL-E 3
 */
async function generateWithOpenAI(
  prompt: string,
  size: string
): Promise<{ url: string; provider: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('OpenAI API error:', errorData)
    throw new Error(errorData?.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data: OpenAIImageResponse = await response.json()

  if (!data.data?.[0]?.url) {
    throw new Error('No image URL returned from OpenAI')
  }

  return {
    url: data.data[0].url,
    provider: 'openai',
  }
}

/**
 * Generate image using Google Gemini Imagen
 */
async function generateWithGemini(
  prompt: string,
  _size: string
): Promise<{ url: string; provider: string; base64?: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  // Use Imagen 3 model for image generation
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: _size.includes('1792x1024') ? '16:9' : _size.includes('1024x1792') ? '9:16' : '1:1',
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Gemini API error:', errorData)

    // Fall back to OpenAI if Gemini fails
    console.log('Falling back to OpenAI...')
    return generateWithOpenAI(prompt, _size)
  }

  const data: GeminiImageResponse = await response.json()

  if (!data.images?.[0]?.bytesBase64Encoded) {
    throw new Error('No image returned from Gemini')
  }

  // Return base64 data URL for Gemini images
  const base64 = data.images[0].bytesBase64Encoded
  const mimeType = data.images[0].mimeType || 'image/png'

  return {
    url: `data:${mimeType};base64,${base64}`,
    provider: 'gemini',
    base64,
  }
}

/**
 * POST /api/admin/generate-image
 * Generate an image using AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || !['admin', 'super_admin_full', 'instructor', 'expert'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin or instructor access required' } },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = generateImageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { prompt, type, style, size, provider } = validation.data

    // Build the enhanced prompt
    const enhancedPrompt = buildPrompt(prompt, type, style)
    console.log(`[Image Generation] Provider: ${provider}, Type: ${type}, Style: ${style}`)
    console.log(`[Image Generation] Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`)

    // Generate image based on provider
    let result: { url: string; provider: string; base64?: string }

    if (provider === 'gemini') {
      result = await generateWithGemini(enhancedPrompt, size)
    } else {
      result = await generateWithOpenAI(enhancedPrompt, size)
    }

    // Log generation for audit
    console.log(`[Image Generation] Success! Provider: ${result.provider}`)

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.url,
        provider: result.provider,
        prompt: enhancedPrompt,
        settings: { type, style, size },
      },
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate image',
        },
      },
      { status: 500 }
    )
  }
}
