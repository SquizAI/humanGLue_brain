/**
 * Knowledge Base Index
 * Centralized type definitions and exports for the RAG system
 */

export interface KnowledgeDocument {
  id: string
  type: 'course' | 'workshop' | 'expert' | 'resource' | 'feature'
  title: string
  content: string
  metadata: {
    category?: string
    tags?: string[]
    level?: string
    url?: string
    instructor?: string
    duration?: string
    price?: number
    expertise?: string[]
    industry?: string[]
    availability?: string
  }
  embedding?: number[] // For future vector search
}

export interface SearchResult {
  document: KnowledgeDocument
  score: number
  matchedTerms: string[]
}

export interface KnowledgeIndex {
  documents: KnowledgeDocument[]
  keywords: Map<string, Set<string>> // keyword -> document IDs
  tfidf: Map<string, Map<string, number>> // term -> (docId -> score)
  lastUpdated: string
}

// Import knowledge sources
import coursesData from './courses.json'
import workshopsData from './workshops.json'
import expertsData from './experts.json'
import resourcesData from './resources.json'
import featuresData from './features.json'

export const courses = coursesData as KnowledgeDocument[]
export const workshops = workshopsData as KnowledgeDocument[]
export const experts = expertsData as KnowledgeDocument[]
export const resources = resourcesData as KnowledgeDocument[]
export const features = featuresData as KnowledgeDocument[]

/**
 * Load all knowledge documents
 */
export function loadAllDocuments(): KnowledgeDocument[] {
  return [
    ...courses,
    ...workshops,
    ...experts,
    ...resources,
    ...features
  ]
}
