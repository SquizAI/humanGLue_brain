# API Documentation

This directory contains comprehensive documentation for working with various AI APIs and protocols.

## Available Documentation

### AI Provider APIs
- [**Gemini Structured Outputs**](./gemini/structured_outputs.md) - Google's Gemini API for JSON generation
- [**OpenAI Structured Outputs**](./openai/structured_outputs.md) - OpenAI's structured output capabilities
- [**Anthropic Structured Outputs**](./anthropic/structured_outputs.md) - Anthropic's tool-use approach to structured data

### Protocols & Development
- [**Building MCP Servers**](./mcp_development.md) - Complete guide to Model Context Protocol development

### UI/UX & Design Patterns
- [**AI Chat UI Examples**](./ai_chat_ui_examples.md) - Amazing AI-first UI patterns for intent-based interactions

## Quick Comparison: Structured Outputs

| Feature | Gemini | OpenAI | Anthropic |
|---------|---------|---------|-----------|
| **Method** | JSON mode + schemas | JSON Schema validation | Tool use without execution |
| **Schema Support** | TypedDict, Pydantic | Native JSON Schema | JSON Schema in tools |
| **Validation** | Built-in | Strict mode available | Via tool definitions |
| **Streaming** | Supported | Supported | Supported |
| **Error Handling** | Try-except blocks | Refusal handling | Tool error responses |

## Getting Started

1. Choose your AI provider based on your needs
2. Review the structured output documentation for your chosen provider
3. Explore MCP development if you need custom integrations
4. Check out AI Chat UI examples for inspiration on building conversational interfaces

## Additional Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com)
- [Google AI Studio](https://makersuite.google.com) 