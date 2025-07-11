# Human Glue Landing Page with MCP Multi-Model AI

An agentic landing page for Human Glue featuring a dynamic chat interface powered by multiple AI models through the Model Context Protocol (MCP).

## Features

- 🤖 **Multi-Model AI Support**: Seamlessly switch between:
  - Google Gemini 2.5 Pro & Flash
  - OpenAI GPT-4o & O3
  - Anthropic Claude Opus 4 & Sonnet 4
  
- 💬 **Agentic Chat Experience**: 
  - Dynamic UI that transforms based on conversation
  - Smooth animations and transitions
  - Typing indicators and real-time responses
  
- 🎨 **Dynamic UI States**:
  - UI adapts as users progress through the conversation
  - Background animations respond to chat state
  - Personalized experience based on user inputs

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Keys**:
   - Copy `.env.example` to `.env.local`
   - Add your API keys:
     ```
     GOOGLE_AI_API_KEY=your_google_ai_key
     OPENAI_API_KEY=your_openai_key
     ANTHROPIC_API_KEY=your_anthropic_key
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

## Architecture

### MCP Integration
The app uses the Model Context Protocol to communicate with multiple AI providers:

- `/lib/mcp/` - MCP server implementation and providers
- `/app/api/chat/` - Next.js API route for handling chat requests
- Model selection UI in the chat interface

### Chat Flow
1. Initial greeting uses local chat flow (no API calls)
2. After user provides basic info, switches to selected AI model
3. UI dynamically transforms based on conversation stage

### Key Components
- `ChatInterface` - Main chat component with model selection
- `ModelSelector` - Dropdown for choosing AI models
- `DynamicBackground` - Animated background that responds to chat state
- `MessageBubble` - Individual message display with animations

## Available Models

| Model | Provider | Best For |
|-------|----------|----------|
| Gemini 2.5 Pro | Google | Advanced reasoning, complex tasks |
| Gemini 2.5 Flash | Google | Quick responses, simple tasks |
| GPT-4o Latest | OpenAI | General purpose, vision capabilities |
| O3 | OpenAI | Advanced reasoning, problem-solving |
| Claude Opus 4 | Anthropic | Detailed responses, creative tasks |
| Claude Sonnet 4 | Anthropic | Balanced performance, coding |

## Development Notes

- Models will only appear in the selector if their API keys are configured
- The chat intelligently routes between local flow and AI models
- All API calls include proper error handling
- Responsive design works on mobile and desktop