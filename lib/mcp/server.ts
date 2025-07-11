import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { GoogleProvider } from './providers/google'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { MCPRequest, MCPResponse, AIModel } from './types'
import { modelConfigs } from './models'

export class MCPServer {
  private googleProvider?: GoogleProvider
  private openaiProvider?: OpenAIProvider
  private anthropicProvider?: AnthropicProvider
  private server: Server

  constructor() {
    // Initialize providers with API keys from environment
    if (process.env.GOOGLE_AI_API_KEY) {
      this.googleProvider = new GoogleProvider(process.env.GOOGLE_AI_API_KEY)
    }
    if (process.env.OPENAI_API_KEY) {
      this.openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY)
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicProvider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY)
    }

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'humanglue-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // Handle completion requests
    (this.server as any).setRequestHandler('completion', async (request: MCPRequest): Promise<MCPResponse> => {
      try {
        const { model, messages, temperature, maxTokens } = request.params
        const modelConfig = modelConfigs[model]

        if (!modelConfig) {
          return {
            error: {
              code: -32602,
              message: `Invalid model: ${model}`
            },
            id: request.id
          }
        }

        let result
        
        switch (modelConfig.provider) {
          case 'google':
            if (!this.googleProvider) {
              throw new Error('Google AI API key not configured')
            }
            result = await this.googleProvider.generateResponse(model, messages, temperature)
            break
            
          case 'openai':
            if (!this.openaiProvider) {
              throw new Error('OpenAI API key not configured')
            }
            result = await this.openaiProvider.generateResponse(model, messages, temperature, maxTokens)
            break
            
          case 'anthropic':
            if (!this.anthropicProvider) {
              throw new Error('Anthropic API key not configured')
            }
            result = await this.anthropicProvider.generateResponse(model, messages, temperature, maxTokens)
            break
            
          default:
            throw new Error(`Unknown provider: ${modelConfig.provider}`)
        }

        return {
          result: {
            content: result.content,
            model,
            usage: result.usage
          },
          id: request.id
        }
      } catch (error) {
        return {
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal error'
          },
          id: request.id
        }
      }
    })

    // Handle model listing
    (this.server as any).setRequestHandler('listModels', async (request: any) => {
      return {
        result: {
          models: Object.entries(modelConfigs).map(([id, config]) => ({
            id,
            name: config.name,
            provider: config.provider,
            description: config.description,
            capabilities: config.capabilities,
            maxTokens: config.maxTokens
          }))
        },
        id: request.id
      }
    })
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('MCP Server started')
  }
}