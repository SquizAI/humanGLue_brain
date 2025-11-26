# Human Glue - AI-Powered Organizational Development Platform

An agentic landing page built with atomic design architecture, featuring multi-model AI support through Netlify Functions.

## 🏗️ Architecture

### Atomic Design Structure

```
components/
├── atoms/          # Basic building blocks (Button, Text, Input, Icon, Badge)
├── molecules/      # Combined atoms (InputField, Card, IconButton, TypingDots)
├── organisms/      # Complex components (ChatMessage, ModelSelector, ChatInput)
└── templates/      # Page-level components
```

### Key Technologies

- **AI Integration**: Powered by Claude Sonnet 4.5 (via Anthropic API)
- **State Management**: React Context + LocalStorage
- **Styling**: Tailwind CSS + Custom Animations
- **Deployment**: Netlify with serverless functions
- **AI Models**: Multiple providers via unified API
  - Google Gemini 2.5 (Pro & Flash)
  - OpenAI GPT-4o & O3
  - Anthropic Claude (Opus 4 & Sonnet 4)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for AI providers (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/humanglue-landing.git
cd humanglue-landing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
GOOGLE_AI_API_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

5. Run development server:
```bash
npm run dev
```

## 🌐 Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. Add environment variables in Netlify dashboard

4. Deploy!

### Environment Variables

All environment variables from `.env.example` should be configured in Netlify:

```
# Required for API functionality
GOOGLE_AI_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Optional configuration
RATE_LIMIT_REQUESTS_PER_MINUTE
SESSION_SECRET
CORS_ALLOWED_ORIGINS
```

## 📁 Project Structure

```
humanglue-landing/
├── app/                    # Next.js app directory
├── components/            # Atomic design components
│   ├── atoms/            # Basic UI elements
│   ├── molecules/        # Composite components
│   ├── organisms/        # Complex features
│   └── templates/        # Page templates
├── netlify/              # Netlify Functions
│   └── functions/        # Serverless API endpoints
├── lib/                  # Core libraries
│   └── mcp/             # Model Context Protocol
├── services/            # API service layer
├── utils/               # Utility functions
├── constants/           # App constants
└── hooks/              # Custom React hooks
```

## 🔧 Configuration

### Feature Flags

Control features via environment variables:

```env
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_MODEL_SELECTOR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Model Configuration

Models are configured in `lib/mcp/models.ts` with environment variable overrides:

```env
GOOGLE_AI_MODEL_PRO=gemini-2.0-flash-exp
OPENAI_MODEL_GPT4O=gpt-4o
ANTHROPIC_MODEL_SONNET=claude-3-5-sonnet-20241022
```

## 🛠️ Development

### Component Development

Follow atomic design principles:

1. **Atoms**: Single-purpose, reusable elements
2. **Molecules**: Simple combinations of atoms
3. **Organisms**: Complex, feature-complete components
4. **Templates**: Page layouts and structures

### Adding New Components

```bash
# Create atom
touch components/atoms/NewAtom.tsx

# Export from index
echo "export { NewAtom } from './NewAtom'" >> components/atoms/index.ts
```

### API Development

Netlify Functions are located in `netlify/functions/`:

```typescript
// netlify/functions/my-function.ts
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  // Function logic
}
```

## 📊 Monitoring

### Analytics (Optional)

Configure analytics providers:

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_token
SENTRY_DSN=your_dsn
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow atomic design principles
4. Write tests for new components
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Human Glue Documentation](docs/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [Model Context Protocol](https://modelcontextprotocol.io/)