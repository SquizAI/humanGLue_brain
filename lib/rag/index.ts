/**
 * RAG System Entry Point
 * Main interface for retrieval-augmented generation
 */

import { loadAllDocuments, KnowledgeDocument } from '../knowledge'
import {
  searchKnowledge,
  getTopDocuments,
  formatResultsForContext,
  extractCitations
} from './retrieval'

// Cache for loaded documents
let documentsCache: KnowledgeDocument[] | null = null

/**
 * Initialize the RAG system by loading all knowledge documents
 */
export function initializeRAG(): void {
  if (!documentsCache) {
    documentsCache = loadAllDocuments()
    console.log(`RAG System initialized with ${documentsCache.length} documents`)
  }
}

/**
 * Search the knowledge base and return formatted context for AI
 */
export function retrieveContext(query: string, limit: number = 5): {
  context: string
  citations: Array<{ title: string; type: string; url: string }>
  documentCount: number
} {
  // Ensure documents are loaded
  if (!documentsCache) {
    initializeRAG()
  }

  // Search knowledge base
  const results = searchKnowledge(query, documentsCache!, limit)

  // Format for AI context
  const context = formatResultsForContext(results)
  const citations = extractCitations(results)

  return {
    context,
    citations,
    documentCount: results.length
  }
}

/**
 * Get recommended resources based on user context
 */
export function getRecommendations(
  userContext: {
    maturityScore?: number
    maturityLevel?: string
    challenges?: string[]
    industry?: string
  },
  limit: number = 3
): KnowledgeDocument[] {
  if (!documentsCache) {
    initializeRAG()
  }

  // Build query from user context
  const queryParts: string[] = []

  if (userContext.maturityLevel) {
    queryParts.push(userContext.maturityLevel)
  }

  if (userContext.challenges && userContext.challenges.length > 0) {
    queryParts.push(...userContext.challenges)
  }

  if (userContext.industry) {
    queryParts.push(userContext.industry)
  }

  const query = queryParts.join(' ')

  return getTopDocuments(query, documentsCache!, limit)
}

/**
 * Search for specific content types
 */
export function searchByType(
  query: string,
  type: 'course' | 'workshop' | 'expert' | 'resource' | 'feature',
  limit: number = 5
): KnowledgeDocument[] {
  if (!documentsCache) {
    initializeRAG()
  }

  const filteredDocs = documentsCache!.filter(doc => doc.type === type)
  return getTopDocuments(query, filteredDocs, limit)
}

// Export retrieval functions
export { searchKnowledge, getTopDocuments, formatResultsForContext, extractCitations }
