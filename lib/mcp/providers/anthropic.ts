import Anthropic from '@anthropic-ai/sdk'
import { AIModel } from '../types'

export class AnthropicProvider {
  private anthropic: Anthropic

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey })
  }

  async generateResponse(
    model: AIModel,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    temperature?: number,
    maxTokens?: number
  ) {
    // Convert system messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content
    const conversationMessages = messages.filter(m => m.role !== 'system') as Array<{ role: 'user' | 'assistant'; content: string }>

    const modelId = model === 'claude-opus-4' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022'
    
    const response = await this.anthropic.messages.create({
      model: modelId,
      max_tokens: maxTokens || 4096,
      temperature: temperature || 0.7,
      system: systemMessage,
      messages: conversationMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    })

    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    return {
      content: textContent,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    }
  }
}