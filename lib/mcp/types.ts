export type AIModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gpt-4o-latest'
  | 'o3'
  | 'claude-opus-4'
  | 'claude-sonnet-4'
  | 'claude-sonnet-4.5'

export interface MCPRequest {
  method: string
  params: {
    model: AIModel
    messages: Array<{
      role: 'user' | 'assistant' | 'system'
      content: string
    }>
    temperature?: number
    maxTokens?: number
  }
  id: string | number
}

export interface MCPResponse {
  result?: {
    content: string
    model: AIModel
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }
  error?: {
    code: number
    message: string
  }
  id: string | number
}

export interface ModelConfig {
  name: string
  provider: 'google' | 'openai' | 'anthropic'
  modelId: string
  description: string
  capabilities: string[]
  maxTokens: number
}