/**
 * Assessment Questions Index
 *
 * Central export for all assessment question banks:
 *
 * 1. GlueIQ Assessment - Individual AI adaptability (30 questions, 5 dimensions)
 * 2. Organizational AI Maturity - Enterprise assessment (69 questions, 23 dimensions)
 * 3. Team AI Skills Inventory - Quick team pulse (20 questions, 4 categories)
 *
 * Total: 119 questions across all assessments
 */

// GlueIQ Assessment (Individual)
export {
  glueiqQuestions,
  glueiqDimensions,
  glueiqAssessmentConfig,
  type GlueIQQuestion,
} from './glueiq-questions'

// Organizational AI Maturity Assessment
export {
  orgMaturityQuestions,
  orgMaturityCategories,
  orgMaturityDimensions,
  orgMaturityAssessmentConfig,
  type OrgMaturityQuestion,
} from './org-maturity-questions'

// Team AI Skills Inventory
export {
  teamSkillsQuestions,
  teamSkillsCategories,
  teamSkillsAssessmentConfig,
  type TeamSkillsQuestion,
} from './team-skills-questions'

// Assessment type definitions
export type AssessmentType = 'glueiq' | 'org-maturity' | 'team-skills'

export interface AssessmentConfig {
  id: string
  name: string
  description: string
  shortDescription: string
  estimatedMinutes: number
  totalQuestions: number
  version: string
  isActive: boolean
}

// All assessment configurations
import { glueiqAssessmentConfig } from './glueiq-questions'
import { orgMaturityAssessmentConfig } from './org-maturity-questions'
import { teamSkillsAssessmentConfig } from './team-skills-questions'

export const allAssessmentConfigs: Record<AssessmentType, AssessmentConfig> = {
  'glueiq': glueiqAssessmentConfig,
  'org-maturity': orgMaturityAssessmentConfig,
  'team-skills': teamSkillsAssessmentConfig,
}

// All questions combined for database seeding
import { glueiqQuestions } from './glueiq-questions'
import { orgMaturityQuestions } from './org-maturity-questions'
import { teamSkillsQuestions } from './team-skills-questions'

export const allQuestions = {
  glueiq: glueiqQuestions,
  'org-maturity': orgMaturityQuestions,
  'team-skills': teamSkillsQuestions,
}

// Question counts for reference
export const questionCounts = {
  glueiq: glueiqQuestions.length,
  'org-maturity': orgMaturityQuestions.length,
  'team-skills': teamSkillsQuestions.length,
  total: glueiqQuestions.length + orgMaturityQuestions.length + teamSkillsQuestions.length,
}

// Helper to get assessment by type
export function getAssessmentConfig(type: AssessmentType): AssessmentConfig {
  return allAssessmentConfigs[type]
}

// Helper to get questions by assessment type
export function getAssessmentQuestions(type: AssessmentType) {
  return allQuestions[type]
}
