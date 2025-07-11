import { Handler } from '@netlify/functions'
import { GoogleProvider } from '../../lib/mcp/providers/google'
import { OpenAIProvider } from '../../lib/mcp/providers/openai'
import { AnthropicProvider } from '../../lib/mcp/providers/anthropic'
import { AIModel } from '../../lib/mcp/types'
import { modelConfigs } from '../../lib/mcp/models'

// Initialize providers
const providers = {
  google: process.env.GOOGLE_AI_API_KEY ? new GoogleProvider(process.env.GOOGLE_AI_API_KEY) : null,
  openai: process.env.OPENAI_API_KEY ? new OpenAIProvider(process.env.OPENAI_API_KEY) : null,
  anthropic: process.env.ANTHROPIC_API_KEY ? new AnthropicProvider(process.env.ANTHROPIC_API_KEY) : null,
}

export const handler: Handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Handle GET - return available models
  if (event.httpMethod === 'GET') {
    const availableModels = Object.entries(modelConfigs)
      .filter(([_, config]) => providers[config.provider] !== null)
      .map(([id, config]) => ({
        id,
        name: config.name,
        provider: config.provider,
        description: config.description,
        capabilities: config.capabilities,
        available: true
      }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ models: availableModels })
    }
  }

  // Handle POST - process chat request
  if (event.httpMethod === 'POST') {
    try {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Request body is required' })
        }
      }

      const body = JSON.parse(event.body)
      const { model, messages, temperature, maxTokens } = body

      // Validate model
      const modelConfig = modelConfigs[model as AIModel]
      if (!modelConfig) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Invalid model: ${model}` })
        }
      }

      // Get the appropriate provider
      const provider = providers[modelConfig.provider]
      if (!provider) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ 
            error: `${modelConfig.provider} provider not configured. Please add API key.` 
          })
        }
      }

      // Generate response
      const result = await provider.generateResponse(
        model as AIModel,
        messages,
        temperature,
        maxTokens
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          content: result.content,
          model,
          usage: result.usage,
          provider: modelConfig.provider
        })
      }

    } catch (error) {
      console.error('Chat API error:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Internal server error' 
        })
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
}