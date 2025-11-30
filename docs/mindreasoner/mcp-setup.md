# Mind Reasoner MCP Server Setup

The MindSim MCP Server connects any MCP-compatible client (like Claude) to Mind Reasoner's digital twin technology.

## Server Endpoint

```
https://mcp.mindreasoner.com/mcp
```

## Prerequisites

1. Get your API key from [https://app.mindsim.com](https://app.mindsim.com/)
2. Have Claude CLI installed and logged in

## Basic Setup (Mind Reasoner Only)

### For Claude Code:

```bash
claude mcp add \
  --transport http \
  mindsim \
  https://mcp.mindreasoner.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### For Custom MCP Client:

```json
{
  "url": "https://mcp.mindreasoner.com/mcp",
  "transport": "http",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  }
}
```

## Setup with Integrations

### Gong Integration

Prerequisites:
1. Must have **Technical Administrator** role in Gong
2. Sign in to [app.gong.io/company/api](https://app.gong.io/company/api)
3. Click "Create" to generate an **Access Key** and **Access Key Secret**

```bash
claude mcp add \
  --transport http \
  mindsim \
  https://mcp.mindreasoner.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "X-Gong-Access-Key: YOUR_ACCESS_KEY" \
  --header "X-Gong-Access-Secret: YOUR_ACCESS_KEY_SECRET"
```

### Fathom Integration

Prerequisites:
1. Sign in to your Fathom account
2. Navigate to **Settings → API Access**
3. Click "Generate API Key"

```bash
claude mcp add \
  --transport http \
  mindsim \
  https://mcp.mindreasoner.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "X-Fathom-Api-Key: YOUR_FATHOM_API_KEY"
```

### Fireflies Integration

Prerequisites:
1. Sign in to your Fireflies AI account at [app.fireflies.ai](https://app.fireflies.ai/)
2. Navigate to **Settings → Integrations → API**
3. Click "Generate API Key"

```bash
claude mcp add \
  --transport http \
  mindsim \
  https://mcp.mindreasoner.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "X-Fireflies-Api-Key: YOUR_FIREFLIES_API_KEY"
```

### Zoom Integration

1. Sign in to your MindSim account at [https://app.mindsim.com](https://app.mindsim.com/)
2. Navigate to **Settings → Integrations**
3. Click **Connect Zoom** and authorize access

Zoom works automatically once enabled—use the basic setup command.

## Verifying Connection

After setup, restart Claude Desktop. Then ask:

```
"What Mind Reasoner tools do you have access to?"
```

Claude should list all available tools (14 core tools + integration tools if configured).
