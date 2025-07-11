import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIModel } from '../types'

export class GoogleProvider {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateResponse(
    model: AIModel,
    messages: Array<{ role: string; content: string }>,
    temperature?: number
  ) {
    const modelId = model.includes('pro') ? 'gemini-2.0-flash-exp' : 'gemini-2.0-flash-exp'
    const genModel = this.genAI.getGenerativeModel({ 
      model: modelId,
      generationConfig: {
        temperature: temperature || 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
      }
    })

    // Convert messages to Gemini format
    const chat = genModel.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    })

    const result = await chat.sendMessage(messages[messages.length - 1].content)
    const response = await result.response
    
    return {
      content: response.text(),
      usage: {
        promptTokens: 0, // Google doesn't provide token counts in the same way
        completionTokens: 0,
        totalTokens: 0
      }
    }
  }
}