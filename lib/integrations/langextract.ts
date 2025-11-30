/**
 * LangExtract Integration
 *
 * Provides structured information extraction from text using LLMs.
 * Used in the data enrichment pipeline to extract key information from
 * company descriptions, bios, and other text content.
 *
 * Docs: https://github.com/google/langextract
 */

import { extract } from 'langextract'

export interface LanguageDetectionResult {
  /** Primary language code (ISO 639-1) */
  language: string
  /** Confidence score (0-1) */
  confidence: number
  /** All detected languages with scores */
  languages: Array<{
    code: string
    name: string
    confidence: number
  }>
}

export interface PageMetadata {
  /** Page title */
  title?: string
  /** Meta description */
  description?: string
  /** Open Graph image */
  image?: string
  /** Canonical URL */
  canonical?: string
  /** Detected keywords */
  keywords?: string[]
  /** Page language */
  language?: string
  /** Extracted text content */
  text?: string
}

/**
 * Extract structured information from text using LangExtract
 */
export async function extractFromText(text: string, promptDescription?: string): Promise<unknown> {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('No API key available for LangExtract (OPENAI_API_KEY or GEMINI_API_KEY required)')
    }

    const modelType = process.env.OPENAI_API_KEY ? 'openai' : 'gemini'

    const result = await extract(text, {
      promptDescription,
      apiKey,
      modelType,
    })

    return result
  } catch (error) {
    console.error('[LangExtract] Extraction failed:', error)
    throw new Error(`Failed to extract: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Detect language of text (simple heuristic - langextract doesn't do language detection)
 * This is a placeholder that returns a default result
 */
export async function detectLanguage(url: string): Promise<LanguageDetectionResult> {
  // LangExtract doesn't actually do language detection
  // Return a default English result
  console.warn('[LangExtract] Language detection not supported - returning default English')
  return {
    language: 'en',
    confidence: 1.0,
    languages: [{ code: 'en', name: 'English', confidence: 1.0 }]
  }
}

/**
 * Extract metadata from text content (placeholder)
 * LangExtract is for structured extraction, not web scraping
 */
export async function extractMetadata(url: string): Promise<PageMetadata> {
  // LangExtract doesn't do web scraping
  // Return empty metadata
  console.warn('[LangExtract] Web metadata extraction not supported')
  return {}
}

/**
 * Analyze company information from text description
 */
export async function analyzeCompanyText(description: string): Promise<{
  metadata: PageMetadata
  language: LanguageDetectionResult
  insights: {
    hasInternationalPresence: boolean
    primaryMarkets: string[]
    contentQuality: 'high' | 'medium' | 'low'
  }
}> {
  try {
    const language = await detectLanguage('')

    // Simple content quality heuristic
    const textLength = description.length
    let contentQuality: 'high' | 'medium' | 'low' = 'low'
    if (textLength > 500) {
      contentQuality = 'high'
    } else if (textLength > 200) {
      contentQuality = 'medium'
    }

    return {
      metadata: { text: description },
      language,
      insights: {
        hasInternationalPresence: false,
        primaryMarkets: ['English'],
        contentQuality
      }
    }
  } catch (error) {
    console.error('[LangExtract] Company text analysis failed:', error)
    throw new Error(`Failed to analyze text: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Analyze company website (placeholder - redirects to text analysis)
 * @deprecated Use analyzeCompanyText instead - LangExtract doesn't do web scraping
 */
export async function analyzeCompanyWebsite(url: string): Promise<{
  metadata: PageMetadata
  language: LanguageDetectionResult
  insights: {
    hasInternationalPresence: boolean
    primaryMarkets: string[]
    contentQuality: 'high' | 'medium' | 'low'
  }
}> {
  console.warn('[LangExtract] Web analysis not supported - returning placeholder')
  return analyzeCompanyText(`Website: ${url}`)
}

/**
 * Batch analyze multiple URLs (placeholder)
 * @deprecated LangExtract doesn't do web scraping
 */
export async function batchAnalyzeUrls(urls: string[]): Promise<Array<{
  url: string
  metadata?: PageMetadata
  language?: LanguageDetectionResult
  error?: string
}>> {
  return urls.map(url => ({
    url,
    metadata: {},
    language: { language: 'en', confidence: 1.0, languages: [] },
  }))
}
