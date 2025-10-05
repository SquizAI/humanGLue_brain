/**
 * Vapi Assessment Workflow Test
 * This file can be used to test the Vapi integration without needing the full UI
 */

import { createAssessmentConfig } from './vapiConfig'
import { assessmentDimensions } from '../assessment/dimensions'

// Mock test to validate configuration
export function testVapiConfig() {
  console.log('Testing Vapi Configuration...')
  
  try {
    const config = createAssessmentConfig()
    
    // Validate required fields
    const requiredFields = ['model', 'voice', 'firstMessage', 'functions'] as const
    const missing = requiredFields.filter(field => !(config as any)[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    
    // Validate functions
    const expectedFunctions = [
      'process_assessment_response',
      'advance_assessment', 
      'store_organization_info',
      'generate_maturity_report'
    ]
    
    const configFunctions = config.functions.map(f => f.name)
    const missingFunctions = expectedFunctions.filter(fn => !configFunctions.includes(fn))
    
    if (missingFunctions.length > 0) {
      throw new Error(`Missing functions: ${missingFunctions.join(', ')}`)
    }
    
    // Validate assessment dimensions
    if (assessmentDimensions.length !== 23) {
      throw new Error(`Expected 23 dimensions, found ${assessmentDimensions.length}`)
    }
    
    const categories = ['technical', 'human', 'business', 'ai_adoption']
    const dimensionsByCategory = categories.map(cat => 
      assessmentDimensions.filter(d => d.category === cat)
    )
    
    console.log('✅ Configuration validation passed!')
    console.log(`📊 Total dimensions: ${assessmentDimensions.length}`)
    console.log(`📋 Categories: ${categories.join(', ')}`)
    console.log(`🔧 Functions: ${configFunctions.join(', ')}`)
    
    dimensionsByCategory.forEach((dims, index) => {
      console.log(`  ${categories[index]}: ${dims.length} dimensions`)
    })
    
    return { success: true, config }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Configuration validation failed:', message)
    return { success: false, error: message }
  }
}

// Test assessment flow structure
export function testAssessmentFlow() {
  console.log('\nTesting Assessment Flow Structure...')
  
  try {
    const totalQuestions = assessmentDimensions.reduce((total, dim) => total + dim.questions.length, 0)
    
    // Validate question types
    const questionTypes = new Set()
    const questionIds = new Set()
    
    assessmentDimensions.forEach(dimension => {
      dimension.questions.forEach(question => {
        questionTypes.add(question.type)
        
        if (questionIds.has(question.id)) {
          throw new Error(`Duplicate question ID: ${question.id}`)
        }
        questionIds.add(question.id)
        
        // Validate question structure
        if (!question.text || !question.type || question.weight === undefined) {
          throw new Error(`Invalid question structure: ${question.id}`)
        }
        
        // Validate multiple choice questions have options
        if (question.type === 'multiple_choice' && (!question.options || question.options.length === 0)) {
          throw new Error(`Multiple choice question missing options: ${question.id}`)
        }
      })
    })
    
    console.log('✅ Assessment flow validation passed!')
    console.log(`❓ Total questions: ${totalQuestions}`)
    console.log(`🏷️  Question types: ${Array.from(questionTypes).join(', ')}`)
    console.log(`🔑 Unique question IDs: ${questionIds.size}`)
    
    return { success: true, totalQuestions, questionTypes: Array.from(questionTypes) }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Assessment flow validation failed:', message)
    return { success: false, error: message }
  }
}

// Run all tests
export function runAllTests() {
  console.log('🧪 Running Vapi Assessment Tests...\n')
  
  const configTest = testVapiConfig()
  const flowTest = testAssessmentFlow()
  
  const allPassed = configTest.success && flowTest.success
  
  console.log(`\n${allPassed ? '🎉' : '💥'} Test Results: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`)
  
  if (allPassed) {
    console.log('\n✨ Vapi assessment workflow is ready for deployment!')
    console.log('📝 Next steps:')
    console.log('  1. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variable')
    console.log('  2. Test with actual voice calls')
    console.log('  3. Monitor function calls and responses')
  }
  
  return { allPassed, results: { configTest, flowTest } }
}

// Example usage:
// import { runAllTests } from './lib/voice/vapiTest'
// runAllTests()