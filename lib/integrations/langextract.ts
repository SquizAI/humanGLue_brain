/**
 * LangExtract Integration
 *
 * Provides language detection and metadata extraction from URLs.
 * Used in the data enrichment pipeline to understand company websites,
 * extract key information, and detect primary languages.
 *
 * Docs: https://langextract.com/nodejs-sdk
 */

import { LangExtract } from 'langextract'

let client: LangExtract | null = null

/**
 * Get or create LangExtract client (singleton)
 */
function getClient(): LangExtract {
  if (client) {
    return client
  }

  const apiKey = process.env.LANGEXTRACT_API_KEY

  if (!apiKey) {
    throw new Error('LANGEXTRACT_API_KEY environment variable is not set')
  }

  client = new LangExtract(apiKey)
  console.log('[LangExtract] Client initialized')

  return client
}

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
 * Detect language of a webpage
 */
export async function detectLanguage(url: string): Promise<LanguageDetectionResult> {
  try {
    const client = getClient()
    const result = await client.detectLanguage({ url })

    return {
      language: result.language,
      confidence: result.confidence,
      languages: result.languages || []
    }
  } catch (error) {
    console.error('[LangExtract] Language detection failed:', error)
    throw new Error(`Failed to detect language: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract metadata from a webpage
 */
export async function extractMetadata(url: string): Promise<PageMetadata> {
  try {
    const client = getClient()
    const result = await client.extract({ url })

    return {
      title: result.title,
      description: result.description,
      image: result.image,
      canonical: result.canonical,
      keywords: result.keywords,
      language: result.language,
      text: result.text,
    }
  } catch (error) {
    console.error('[LangExtract] Metadata extraction failed:', error)
    throw new Error(`Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract key information from a company website
 *
 * This combines language detection and metadata extraction
 * to build a comprehensive profile of the company's web presence.
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
  try {
    // Run both extractions in parallel
    const [metadata, language] = await Promise.all([
      extractMetadata(url),
      detectLanguage(url)
    ])

    // Derive insights from the extracted data
    const hasInternationalPresence = language.languages.length > 1
    const primaryMarkets = language.languages
      .filter(l => l.confidence > 0.1)
      .map(l => l.name)

    // Simple content quality heuristic
    const textLength = metadata.text?.length || 0
    const hasDescription = !!metadata.description
    const hasImage = !!metadata.image

    let contentQuality: 'high' | 'medium' | 'low' = 'low'
    if (textLength > 500 && hasDescription && hasImage) {
      contentQuality = 'high'
    } else if (textLength > 200 || hasDescription) {
      contentQuality = 'medium'
    }

    return {
      metadata,
      language,
      insights: {
        hasInternationalPresence,
        primaryMarkets,
        contentQuality
      }
    }
  } catch (error) {
    console.error('[LangExtract] Company website analysis failed:', error)
    throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Batch analyze multiple URLs
 */
export async function batchAnalyzeUrls(urls: string[]): Promise<Array<{
  url: string
  metadata?: PageMetadata
  language?: LanguageDetectionResult
  error?: string
}>> {
  const results = await Promise.allSettled(
    urls.map(async url => {
      const [metadata, language] = await Promise.all([
        extractMetadata(url).catch(e => undefined),
        detectLanguage(url).catch(e => undefined)
      ])

      return { url, metadata, language }
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    return {
      url: urls[index],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
    }
  })
}
