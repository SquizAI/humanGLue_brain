#!/usr/bin/env node

/**
 * Knowledge Base Ingestion Script
 * Validates and tests the knowledge base
 */

import { loadAllDocuments } from '../lib/knowledge/index.js'
import { searchKnowledge, tokenize } from '../lib/rag/retrieval.js'

console.log('🔍 Human Glue Knowledge Base Ingestion\n')

// Load all documents
console.log('📚 Loading knowledge documents...')
const documents = loadAllDocuments()

console.log(`✅ Loaded ${documents.length} documents\n`)

// Count by type
const typeCounts = documents.reduce((acc, doc) => {
  acc[doc.type] = (acc[doc.type] || 0) + 1
  return acc
}, {} as Record<string, number>)

console.log('📊 Document Breakdown:')
Object.entries(typeCounts).forEach(([type, count]) => {
  console.log(`   ${type}: ${count}`)
})

// Test searches
console.log('\n🧪 Testing search functionality...\n')

const testQueries = [
  'change management courses',
  'AI transformation experts',
  'leadership workshops',
  'assessment tools',
  'coaching for teams'
]

testQueries.forEach(query => {
  console.log(`Query: "${query}"`)
  const results = searchKnowledge(query, documents, 3)

  if (results.length === 0) {
    console.log('  ⚠️  No results found')
  } else {
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.document.title} (${result.document.type})`)
      console.log(`     Score: ${result.score.toFixed(3)}`)
      console.log(`     Matched: ${result.matchedTerms.join(', ')}`)
    })
  }
  console.log('')
})

// Token statistics
console.log('📈 Token Statistics:')
const allTokens = documents.flatMap(doc =>
  tokenize(`${doc.title} ${doc.content}`)
)
const uniqueTokens = new Set(allTokens)

console.log(`   Total tokens: ${allTokens.length}`)
console.log(`   Unique tokens: ${uniqueTokens.size}`)
console.log(`   Avg tokens per doc: ${Math.round(allTokens.length / documents.length)}`)

console.log('\n✅ Knowledge base is ready!')
console.log('   Run: npm run dev to start the application\n')
