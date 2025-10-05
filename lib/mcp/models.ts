import { AIModel, ModelConfig } from './types'

export const modelConfigs: Record<AIModel, ModelConfig> = {
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    modelId: 'gemini-2.5-pro',
    description: 'Advanced reasoning and complex task handling',
    capabilities: ['reasoning', 'analysis', 'coding', 'creative'],
    maxTokens: 8192
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    modelId: 'gemini-2.5-flash',
    description: 'Fast responses for quick tasks',
    capabilities: ['quick-response', 'summarization', 'simple-tasks'],
    maxTokens: 4096
  },
  'gpt-4o-latest': {
    name: 'GPT-4o Latest',
    provider: 'openai',
    modelId: 'gpt-4o',
    description: 'OpenAI\'s most capable model',
    capabilities: ['reasoning', 'analysis', 'coding', 'creative', 'vision'],
    maxTokens: 128000
  },
  'o3': {
    name: 'O3',
    provider: 'openai',
    modelId: 'o3',
    description: 'OpenAI\'s newest reasoning model',
    capabilities: ['advanced-reasoning', 'complex-analysis', 'problem-solving'],
    maxTokens: 100000
  },
  'claude-opus-4': {
    name: 'Claude Opus 4',
    provider: 'anthropic',
    modelId: 'claude-opus-4-20250514',
    description: 'Anthropic\'s most powerful model',
    capabilities: ['reasoning', 'analysis', 'coding', 'creative', 'detailed-responses'],
    maxTokens: 200000
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    description: 'Balanced performance and efficiency',
    capabilities: ['balanced', 'coding', 'analysis', 'creative'],
    maxTokens: 200000
  },
  'claude-sonnet-4.5': {
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    description: 'Latest Sonnet with enhanced reasoning and speed',
    capabilities: ['reasoning', 'coding', 'analysis', 'creative', 'fast-response'],
    maxTokens: 200000
  }
}