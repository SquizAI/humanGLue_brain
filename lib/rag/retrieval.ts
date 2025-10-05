/**
 * RAG Retrieval System
 * Keyword-based document retrieval with TF-IDF scoring
 */

import { KnowledgeDocument, SearchResult } from '../knowledge'

// Stopwords to filter out (common words that don't add semantic value)
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'you', 'your', 'our', 'we', 'this',
  'can', 'have', 'or', 'not', 'but', 'what', 'if', 'how', 'when'
])

/**
 * Tokenize and normalize text for indexing and searching
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ') // Remove special chars except hyphens
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token))
}

/**
 * Calculate term frequency for a document
 */
function calculateTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  const totalTokens = tokens.length

  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1)
  })

  // Normalize by total tokens
  tf.forEach((count, term) => {
    tf.set(term, count / totalTokens)
  })

  return tf
}

/**
 * Calculate inverse document frequency across all documents
 */
function calculateIDF(documents: KnowledgeDocument[]): Map<string, number> {
  const idf = new Map<string, number>()
  const docCount = documents.length
  const termDocCount = new Map<string, number>()

  // Count how many documents contain each term
  documents.forEach(doc => {
    const text = `${doc.title} ${doc.content} ${Object.values(doc.metadata).join(' ')}`
    const tokens = new Set(tokenize(text))

    tokens.forEach(token => {
      termDocCount.set(token, (termDocCount.get(token) || 0) + 1)
    })
  })

  // Calculate IDF: log(total docs / docs containing term)
  termDocCount.forEach((count, term) => {
    idf.set(term, Math.log(docCount / count))
  })

  return idf
}

/**
 * Calculate TF-IDF score for a document given a query
 */
function calculateTFIDF(
  queryTokens: string[],
  docTokens: string[],
  idf: Map<string, number>
): number {
  const docTF = calculateTermFrequency(docTokens)
  let score = 0

  queryTokens.forEach(token => {
    const tf = docTF.get(token) || 0
    const idfScore = idf.get(token) || 0
    score += tf * idfScore
  })

  return score
}

/**
 * Boost score based on metadata matches
 */
function applyMetadataBoost(
  doc: KnowledgeDocument,
  queryTokens: string[],
  baseScore: number
): number {
  let boost = 1.0

  // Title match boost (3x)
  const titleTokens = tokenize(doc.title)
  const titleMatches = queryTokens.filter(qt => titleTokens.includes(qt)).length
  if (titleMatches > 0) {
    boost += 2.0 * (titleMatches / queryTokens.length)
  }

  // Tag match boost (2x)
  if (doc.metadata.tags) {
    const tagText = doc.metadata.tags.join(' ').toLowerCase()
    const tagMatches = queryTokens.filter(qt => tagText.includes(qt)).length
    if (tagMatches > 0) {
      boost += 1.0 * (tagMatches / queryTokens.length)
    }
  }

  // Category match boost (1.5x)
  if (doc.metadata.category) {
    const categoryMatches = queryTokens.filter(qt =>
      doc.metadata.category?.toLowerCase().includes(qt)
    ).length
    if (categoryMatches > 0) {
      boost += 0.5
    }
  }

  // Type-specific boost
  if (doc.type === 'course' && queryTokens.some(t => ['course', 'learn', 'training', 'class'].includes(t))) {
    boost += 0.3
  }
  if (doc.type === 'workshop' && queryTokens.some(t => ['workshop', 'session', 'event'].includes(t))) {
    boost += 0.3
  }
  if (doc.type === 'expert' && queryTokens.some(t => ['expert', 'consultant', 'coach', 'advisor'].includes(t))) {
    boost += 0.3
  }

  return baseScore * boost
}

/**
 * Find matching terms between query and document
 */
function findMatchedTerms(queryTokens: string[], docTokens: string[]): string[] {
  const docTokenSet = new Set(docTokens)
  return queryTokens.filter(token => docTokenSet.has(token))
}

/**
 * Search knowledge base and return ranked results
 */
export function searchKnowledge(
  query: string,
  documents: KnowledgeDocument[],
  limit: number = 10
): SearchResult[] {
  const queryTokens = tokenize(query)

  if (queryTokens.length === 0) {
    return []
  }

  // Calculate IDF for the document collection
  const idf = calculateIDF(documents)

  // Score each document
  const results: SearchResult[] = documents.map(doc => {
    const docText = `${doc.title} ${doc.content} ${Object.values(doc.metadata).join(' ')}`
    const docTokens = tokenize(docText)

    // Calculate base TF-IDF score
    const baseScore = calculateTFIDF(queryTokens, docTokens, idf)

    // Apply metadata boosts
    const finalScore = applyMetadataBoost(doc, queryTokens, baseScore)

    // Find matched terms for highlighting
    const matchedTerms = findMatchedTerms(queryTokens, docTokens)

    return {
      document: doc,
      score: finalScore,
      matchedTerms
    }
  })

  // Filter out zero scores and sort by score descending
  return results
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Rank results by relevance (already done in searchKnowledge, but exposed for flexibility)
 */
export function rankResults(results: SearchResult[], query: string): SearchResult[] {
  // Results are already ranked by TF-IDF score
  // This function can be extended for additional ranking signals
  return results
}

/**
 * Get top N documents for a query
 */
export function getTopDocuments(
  query: string,
  documents: KnowledgeDocument[],
  limit: number = 5
): KnowledgeDocument[] {
  const results = searchKnowledge(query, documents, limit)
  return results.map(r => r.document)
}

/**
 * Format search results for RAG context
 */
export function formatResultsForContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant knowledge found.'
  }

  return results
    .map((result, index) => {
      const doc = result.document
      return `[${index + 1}] ${doc.title} (${doc.type})
${doc.content.substring(0, 300)}${doc.content.length > 300 ? '...' : ''}
Source: ${doc.metadata.url || 'N/A'}
`
    })
    .join('\n---\n\n')
}

/**
 * Extract citations from search results
 */
export function extractCitations(results: SearchResult[]): Array<{
  title: string
  type: string
  url: string
}> {
  return results.map(result => ({
    title: result.document.title,
    type: result.document.type,
    url: result.document.metadata.url || '#'
  }))
}
