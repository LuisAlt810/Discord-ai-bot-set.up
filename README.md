-# Use https://replit.com/@LuisTheDev/FlickeringGorgeousBooleanvalue if it doesn't work by remixing it and going to the secrets tab
# Discord AI Bot Setup Guide

## 🤖 Bot Features

- **Name**: AI Assistant Bot
- **Description**: An intelligent Discord bot powered by AI that can help with various tasks
- **Prefix**: `!` (configurable)
- **Commands**:
  - `/ping` - Check bot latency
  - `/help` - Show available commands
  - `/ai <question>` - Ask AI a question
  - `/status <type> <text> [presence]` - Change bot status
  - `/say <message>` - Make the bot say something

## 🎭 Status & Presence Options

### Activity Types:
- `playing` - Playing a game
- `watching` - Watching something
- `listening` - Listening to music
- `streaming` - Streaming on Twitch
- `competing` - Competing in an event

### Presence Status:
- `online` - Green dot (online)
- `idle` - Yellow dot (away)
- `dnd` - Red dot (do not disturb)
- `invisible` - Gray dot (appears offline)

### Mobile Status:
The bot will automatically show mobile status when appropriate.

## 🔑 Setup Instructions

### 1. Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to the "Bot" section
4. **IMPORTANT**: Enable these 3 options:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT** 
   - ✅ **PRESENCE INTENT**
5. Copy the bot token

### 2. Token Validation

The bot automatically validates your Discord token on startup:
- ✅ Valid token = Bot starts successfully
- ❌ Invalid token = Error message with instructions

### 3. Environment Variables Setup

In Replit Secrets tab, add:
```
DISCORD_TOKEN=your_discord_bot_token_here
AI_API_KEY=your_openai_api_key_here (optional)
```

### 4. Common Issues & Solutions

**Issue**: "Missing Intents"
- **Solution**: Enable the 3 required intents in Discord Developer Portal

**Issue**: "Invalid Token"
- **Solution**: Regenerate token in Discord Developer Portal and update secrets

**Issue**: "Missing Permissions"
- **Solution**: Invite bot with proper permissions using OAuth2 URL generator

**Issue**: "AI not working"
- **Solution**: Add valid AI_API_KEY to secrets (OpenAI API key)

## 🚀 Deployment

1. Click the "Run" button in Replit
2. Bot will validate tokens automatically
3. If successful, bot comes online
4. Invite bot to your server using OAuth2 URL from Discord Developer Portal

## 📁 Files Structure

- `index.js` - Main bot file with all functionality
- `package.json` - Node.js dependencies
- `.env.example` - Environment variables template
- `README.md` - This setup guide

## 🔧 Customization

Edit the `BOT_CONFIG` object in `index.js` to customize:
- Bot name and description
- Command prefix
- Available commands
- Default status

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all 3 Discord intents are enabled
3. Ensure tokens are correctly set in Secrets
4. Check bot permissions in your Discord server
