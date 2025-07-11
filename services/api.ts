import { AIModel } from '../lib/mcp/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

export interface ChatRequest {
  model: AIModel
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  content: string
  model: AIModel
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  provider: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  available: boolean
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

class APIService {
  private retryCount = 3
  private retryDelay = 1000 // Start with 1 second

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    retries = this.retryCount
  ): Promise<T> {
    const url = `${API_BASE_URL}/api/${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        // Handle specific error cases
        if (response.status === 503) {
          throw new APIError(
            'AI service is temporarily unavailable. Please try again in a moment.',
            response.status,
            'SERVICE_UNAVAILABLE',
            errorData
          )
        }
        
        if (response.status === 429) {
          throw new APIError(
            'Too many requests. Please slow down and try again.',
            response.status,
            'RATE_LIMITED',
            errorData
          )
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new APIError(
            'Authentication failed. Please check your API configuration.',
            response.status,
            'AUTH_ERROR',
            errorData
          )
        }
        
        throw new APIError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          'REQUEST_FAILED',
          errorData
        )
      }

      return response.json()
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (retries > 0) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (this.retryCount - retries + 1)))
          return this.request<T>(endpoint, options, retries - 1)
        }
        
        throw new APIError(
          'Unable to connect to the server. Please check your internet connection.',
          undefined,
          'NETWORK_ERROR'
        )
      }
      
      // Re-throw API errors
      if (error instanceof APIError) {
        throw error
      }
      
      // Handle other errors
      throw new APIError(
        'An unexpected error occurred. Please try again.',
        undefined,
        'UNKNOWN_ERROR',
        error
      )
    }
  }

  async getAvailableModels(): Promise<{ models: ModelInfo[] }> {
    try {
      return await this.request('chat')
    } catch (error) {
      // Return empty models list on error
      console.error('Failed to fetch models:', error)
      return { models: [] }
    }
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    // Validate request
    if (!request.model) {
      throw new APIError('Model selection is required', 400, 'INVALID_REQUEST')
    }
    
    if (!request.messages || request.messages.length === 0) {
      throw new APIError('Messages are required', 400, 'INVALID_REQUEST')
    }
    
    return this.request('chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
}

export const api = new APIService()