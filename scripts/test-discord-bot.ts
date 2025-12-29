/**
 * Test Discord Bot Connection
 * Run with: npx tsx scripts/test-discord-bot.ts
 */

import { Client, GatewayIntentBits } from 'discord.js'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN not found in environment')
  process.exit(1)
}

console.log('🤖 Starting Discord bot...')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

client.once('ready', () => {
  console.log('✅ Discord bot is online!')
  console.log(`📝 Logged in as: ${client.user?.tag}`)
  console.log(`🏠 Connected to ${client.guilds.cache.size} server(s)`)

  client.guilds.cache.forEach(guild => {
    console.log(`   - ${guild.name} (${guild.memberCount} members)`)
  })

  console.log('\n💬 Bot is now listening for messages...')
  console.log('   Press Ctrl+C to stop\n')
})

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return

  console.log(`📨 Message from ${message.author.tag} in #${message.channel}: ${message.content}`)

  // Respond to !ping command
  if (message.content === '!ping') {
    await message.reply('🏓 Pong! HumanGlue bot is online!')
  }

  // Respond to !help command
  if (message.content === '!help') {
    await message.reply(`
**HumanGlue Bot Commands:**
\`!ping\` - Test if bot is online
\`!help\` - Show this help message
\`!info\` - Show bot information
    `)
  }

  // Respond to !info command
  if (message.content === '!info') {
    await message.reply(`
**HumanGlue Discord Bot**
Connected to ${client.guilds.cache.size} server(s)
Serving ${client.users.cache.size} users
    `)
  }
})

client.on('error', (error) => {
  console.error('❌ Discord client error:', error)
})

// Login to Discord
client.login(DISCORD_BOT_TOKEN).catch((error) => {
  console.error('❌ Failed to login to Discord:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down Discord bot...')
  client.destroy()
  process.exit(0)
})
