import OpenAI from 'openai'
import { AIModel } from '../types'

export class OpenAIProvider {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  async generateResponse(
    model: AIModel,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    temperature?: number,
    maxTokens?: number
  ) {
    const modelId = model === 'o3' ? 'o3-mini' : 'gpt-4o'
    
    const completion = await this.openai.chat.completions.create({
      model: modelId,
      messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 4096,
    })

    return {
      content: completion.choices[0].message.content || '',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      }
    }
  }
}