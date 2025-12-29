# Messaging Platforms Setup Guide

Complete guide to setting up Slack, Discord, and Signal for HumanGlue communications.

---

## 🟦 Slack Setup

### 1. Create a Slack App
1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name: `HumanGlue`
5. Select your workspace

### 2. Configure OAuth & Permissions
1. In your app settings, go to **"OAuth & Permissions"**
2. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `chat:write.public` - Send to public channels
   - `channels:read` - View channels
   - `groups:read` - View private channels
   - `im:read` - View DMs
   - `users:read` - View user info
   - `files:write` - Upload files

3. Click **"Install to Workspace"**
4. Copy the **Bot User OAuth Token** → `SLACK_BOT_TOKEN`

### 3. Enable Socket Mode (for real-time events)
1. Go to **"Socket Mode"**
2. Enable Socket Mode
3. Generate an **App-Level Token** with `connections:write` scope
4. Copy the token → `SLACK_APP_TOKEN`

### 4. Get Signing Secret
1. Go to **"Basic Information"**
2. Under **App Credentials**, copy **Signing Secret** → `SLACK_SIGNING_SECRET`
3. Copy **Client ID** → `SLACK_CLIENT_ID`
4. Copy **Client Secret** → `SLACK_CLIENT_SECRET`

### 5. Add to .env.local
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CLIENT_ID=123456789.123456789
SLACK_CLIENT_SECRET=your-client-secret
```

### Testing Slack
```typescript
import { getUnifiedCommunicationsService } from '@/lib/services/unified-communications'

const comms = getUnifiedCommunicationsService()
await comms.sendMessage({
  channel: 'slack',
  recipient: '#general', // or channel ID: C1234567890
  content: 'Hello from HumanGlue!',
})
```

---

## 🟪 Discord Setup

### 1. Create a Discord Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: `HumanGlue`
4. Click **"Create"**

### 2. Create a Bot
1. In your application, go to **"Bot"**
2. Click **"Add Bot"**
3. Under **Privileged Gateway Intents**, enable:
   - Message Content Intent
   - Server Members Intent (if needed)
   - Presence Intent (if needed)

### 3. Get Bot Token
1. Still in **"Bot"** section
2. Click **"Reset Token"** → **Copy** → `DISCORD_BOT_TOKEN`
3. ⚠️ **Never share this token!**

### 4. Get Application ID
1. Go to **"General Information"**
2. Copy **Application ID** → `DISCORD_APPLICATION_ID`
3. Copy **Public Key** → `DISCORD_PUBLIC_KEY`

### 5. Invite Bot to Your Server
1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Read Message History
   - Attach Files
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### 6. Add to .env.local
```bash
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_APPLICATION_ID=123456789123456789
DISCORD_PUBLIC_KEY=your-public-key
```

### Testing Discord
```typescript
import { getUnifiedCommunicationsService } from '@/lib/services/unified-communications'

const comms = getUnifiedCommunicationsService()
await comms.sendMessage({
  channel: 'discord',
  recipient: '1234567890123456789', // Channel ID
  content: 'Hello from HumanGlue!',
})
```

---

## 🔵 Signal Setup

### 1. Install signal-cli
```bash
# macOS
brew install signal-cli

# Linux (Debian/Ubuntu)
sudo apt-get install signal-cli

# Verify installation
signal-cli --version
```

### 2. Register a Phone Number
You need a phone number that can receive SMS for verification.

```bash
# Replace with your number in E.164 format
signal-cli -a +18173689117 register

# You'll receive an SMS with a verification code
# Verify with the code:
signal-cli -a +18173689117 verify CODE_FROM_SMS
```

### 3. Link to Existing Signal Account (Alternative)
If you already use Signal on your phone:

```bash
# Generate QR code for linking
signal-cli -a +18173689117 link -n "HumanGlue Server"

# Scan the QR code with Signal app:
# Settings → Linked Devices → Link New Device
```

### 4. Test Signal Connection
```bash
# Send a test message
signal-cli -a +18173689117 send -m "Test message" +1XXXXXXXXXX

# Receive messages
signal-cli -a +18173689117 receive
```

### 5. Add to .env.local
```bash
SIGNAL_PHONE_NUMBER=+18173689117
SIGNAL_CONFIG_PATH=/Users/yourusername/.local/share/signal-cli
```

### Testing Signal
```typescript
import { getSignalService } from '@/lib/services/signal-messaging'

const signal = getSignalService()
if (signal) {
  await signal.sendMessage({
    recipient: '+15551234567',
    message: 'Hello from HumanGlue via Signal!',
  })
}
```

---

## 📋 Quick Reference

### Environment Variables Summary

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...

# Discord
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=...
DISCORD_PUBLIC_KEY=...

# Signal
SIGNAL_PHONE_NUMBER=+1...
SIGNAL_CONFIG_PATH=/path/to/signal-cli
```

### API Endpoints

Once configured, you can use these API routes:

```bash
# Send via Slack
POST /api/communications/send
{
  "channel": "slack",
  "recipient": "#general",
  "message": "Hello!"
}

# Send via Discord
POST /api/communications/send
{
  "channel": "discord",
  "recipient": "channel-id",
  "message": "Hello!"
}

# Send via Signal
POST /api/communications/send
{
  "channel": "signal",
  "recipient": "+15551234567",
  "message": "Hello!"
}
```

---

## 🔐 Security Best Practices

1. **Never commit tokens** - All tokens should be in `.env.local` (already in `.gitignore`)
2. **Rotate tokens regularly** - Especially if exposed
3. **Use environment-specific tokens** - Different tokens for dev/staging/production
4. **Limit permissions** - Only grant scopes you actually need
5. **Monitor usage** - Check platform dashboards for unusual activity

---

## 🚀 Next Steps

1. Set up webhooks for inbound messages
2. Implement rate limiting
3. Add message templates
4. Create notification preferences UI
5. Build analytics dashboard

For more help, see:
- [Slack API Docs](https://api.slack.com/docs)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [signal-cli GitHub](https://github.com/AsamK/signal-cli)
