export type ChatState = 
  | 'initial'
  | 'greeting'
  | 'discovery'
  | 'assessment'
  | 'voiceAssessment'
  | 'solution'
  | 'booking'
  | 'completed'
  | 'collectingBasicInfo'
  | 'collectingCompanyInfo'
  | 'collectingChallenges'
  | 'collectingContactInfo'
  | 'performingAnalysis'

export type UIState = 
  | 'default'
  | 'welcoming'
  | 'exploring'
  | 'analyzing'
  | 'presenting'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect'
  options?: string[]
  next?: string
}