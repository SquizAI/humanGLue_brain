# Bird SMS MCP Server

An MCP (Model Context Protocol) server for interacting with Bird's messaging API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

3. Set environment variables:
```bash
export BIRD_API_KEY=your-api-key
export BIRD_WORKSPACE_ID=your-workspace-id
export BIRD_CHANNEL_ID=your-channel-id
```

## Available Tools

### `bird_send_sms`
Send an SMS message using Bird API.

**Parameters:**
- `to` (required): Phone number in E.164 format (e.g., +17077066620)
- `message` (required): The text message content
- `channelId` (optional): Override the default channel ID

### `bird_send_via_navigator`
Send an SMS using Bird Navigator for conversation flows.

**Parameters:**
- `navigatorId` (required): The Bird Navigator ID
- `to` (required): Phone number in E.164 format
- `message` (required): The text message content

### `bird_get_message`
Get details of a sent message.

**Parameters:**
- `messageId` (required): The Bird message ID
- `channelId` (optional): Override the default channel ID

### `bird_list_channels`
List available messaging channels in the workspace.

### `bird_list_navigators`
List available navigators in the workspace.

### `bird_get_workspace_info`
Get information about the current Bird workspace.

### `bird_send_template`
Send a pre-approved message template.

**Parameters:**
- `to` (required): Phone number in E.164 format
- `templateId` (required): The template ID
- `parameters` (optional): Template parameters as key-value pairs
- `channelId` (optional): Override the default channel ID

## Claude Code Configuration

Add to your Claude settings (`.claude/settings.local.json` or similar):

```json
{
  "mcpServers": {
    "bird-sms": {
      "command": "node",
      "args": ["mcp-servers/bird-sms/dist/index.js"],
      "env": {
        "BIRD_API_KEY": "your-api-key",
        "BIRD_WORKSPACE_ID": "your-workspace-id",
        "BIRD_CHANNEL_ID": "your-channel-id"
      }
    }
  }
}
```

## Bird API Documentation

For more information, see: https://docs.bird.com/api/
