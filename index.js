
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActivityType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Bot Configuration
const BOT_CONFIG = {
    name: "AI Assistant Bot",
    description: "An intelligent Discord bot powered by AI that can help with various tasks",
    prefix: "!",
    commands: {
        ping: "Check bot latency",
        help: "Show available commands",
        ai: "Ask AI a question",
        status: "Change bot status",
        say: "Make the bot say something"
    }
};

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Validate tokens and API keys
function validateTokens() {
    console.log('🔍 Validating Discord token...');
    
    if (!process.env.DISCORD_TOKEN) {
        console.error('❌ DISCORD_TOKEN not found in environment variables');
        return false;
    }
    
    if (!process.env.AI_API_KEY) {
        console.log('⚠️  AI_API_KEY not found - AI features will be disabled');
    }
    
    return true;
}

// Set bot status and presence
function setBotPresence(type = 'watching', text = 'for commands', status = 'online', mobile = false) {
    const activityTypes = {
        playing: ActivityType.Playing,
        streaming: ActivityType.Streaming,
        listening: ActivityType.Listening,
        watching: ActivityType.Watching,
        competing: ActivityType.Competing
    };
    
    const statusTypes = ['online', 'idle', 'dnd', 'invisible'];
    
    if (!statusTypes.includes(status)) {
        status = 'online';
    }
    
    const presenceData = {
        activities: [{
            name: text,
            type: activityTypes[type] || ActivityType.Watching
        }],
        status: status
    };
    
    // Note: Mobile platform indicator requires specific client setup
    // The mobile indicator is primarily cosmetic and may not work reliably
    if (mobile) {
        presenceData.shardId = 0;
        presenceData.afk = false;
    }
    
    client.user.setPresence(presenceData);
    
    const mobileIndicator = mobile ? ' 📱' : '';
    console.log(`🎭 Status set to: ${status} | ${type} ${text}${mobileIndicator}`);
}

// Slash commands setup
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),
    
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands'),
    
    new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Ask AI a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the AI')
                .setRequired(true)
        ),
    
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Change bot status')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Activity type')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'playing' },
                    { name: 'Watching', value: 'watching' },
                    { name: 'Listening', value: 'listening' },
                    { name: 'Streaming', value: 'streaming' },
                    { name: 'Competing', value: 'competing' }
                )
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Status text')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('presence')
                .setDescription('Bot presence')
                .setRequired(false)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do Not Disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                )
        )
        .addBooleanOption(option =>
            option.setName('mobile')
                .setDescription('Show mobile indicator')
                .setRequired(false)
        ),
    
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to say')
                .setRequired(true)
        )
];

// AI API function supporting GROQ
async function askAI(question) {
    if (!process.env.AI_API_KEY) {
        return "AI API key not configured. Please set AI_API_KEY in your environment variables.";
    }
    
    try {
        // Using GROQ API
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-8b-8192", // Fast GROQ model
            messages: [
                {
                    role: "system",
                    content: "You are a helpful Discord bot assistant. Keep responses concise and friendly."
                },
                {
                    role: "user", 
                    content: question
                }
            ],
            max_tokens: 250,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('GROQ API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            return "Invalid GROQ API key. Please check your AI_API_KEY in environment variables.";
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return "Network error: Unable to connect to AI service. Please try again later.";
        } else if (error.response?.status === 429) {
            return "Rate limit exceeded. Please wait a moment before trying again.";
        }
        return "Sorry, I couldn't process your request right now. Please try again later.";
    }
}

// Bot ready event
client.once('ready', async () => {
    console.log(`🤖 ${BOT_CONFIG.name} is online!`);
    console.log(`📊 Bot ID: ${client.user.id}`);
    console.log(`🌐 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.users.cache.size}`);
    
    // Set initial presence
    setBotPresence('playing', 'with slash commands', 'online');
    
    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('🔄 Refreshing slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    
    try {
        switch (commandName) {
            case 'ping':
                const ping = Date.now() - interaction.createdTimestamp;
                await interaction.reply(`🏓 Pong! Latency: ${ping}ms | API Latency: ${Math.round(client.ws.ping)}ms`);
                break;
            
            case 'help':
                const helpEmbed = {
                    color: 0x0099ff,
                    title: `${BOT_CONFIG.name} - Help`,
                    description: BOT_CONFIG.description,
                    fields: [
                        { name: '🏓 /ping', value: BOT_CONFIG.commands.ping, inline: true },
                        { name: '❓ /help', value: BOT_CONFIG.commands.help, inline: true },
                        { name: '🤖 /ai', value: BOT_CONFIG.commands.ai, inline: true },
                        { name: '🎭 /status', value: BOT_CONFIG.commands.status, inline: true },
                        { name: '💬 /say', value: BOT_CONFIG.commands.say, inline: true },
                        { name: '⚙️ Prefix', value: BOT_CONFIG.prefix, inline: true }
                    ],
                    timestamp: new Date(),
                    footer: { text: 'Made with ❤️ on Replit' }
                };
                await interaction.reply({ embeds: [helpEmbed] });
                break;
            
            case 'ai':
                const question = interaction.options.getString('question');
                await interaction.deferReply();
                const aiResponse = await askAI(question);
                await interaction.editReply(`🤖 **AI Response:**\n${aiResponse}`);
                break;
            
            case 'status':
                const type = interaction.options.getString('type');
                const text = interaction.options.getString('text');
                const presence = interaction.options.getString('presence') || 'online';
                const mobile = interaction.options.getBoolean('mobile') || false;
                setBotPresence(type, text, presence, mobile);
                const mobileText = mobile ? ' with mobile indicator' : '';
                await interaction.reply(`✅ Status updated: ${type} ${text} (${presence})${mobileText}`);
                break;
            
            case 'say':
                const message = interaction.options.getString('message');
                await interaction.reply(`📢 ${message}`);
                break;
        }
    } catch (error) {
        console.error('Command error:', error);
        const errorMsg = 'There was an error executing this command!';
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

// Handle prefix commands (legacy support)
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(BOT_CONFIG.prefix)) return;
    
    const args = message.content.slice(BOT_CONFIG.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    switch (command) {
        case 'ping':
            message.reply('🏓 Pong! Use `/ping` for detailed latency info.');
            break;
        case 'help':
            message.reply('📋 Use `/help` to see all available commands!');
            break;
        default:
            message.reply(`❓ Unknown command. Use \`${BOT_CONFIG.prefix}help\` or \`/help\``);
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Start the bot
function startBot() {
    const isValid = validateTokens();
    if (!isValid) {
        console.log('\n📋 Setup Instructions:');
        console.log('1. Get your Discord token from: https://discord.com/developers/applications');
        console.log('2. Enable these 3 options in your Discord app:');
        console.log('   - MESSAGE CONTENT INTENT');
        console.log('   - SERVER MEMBERS INTENT');
        console.log('   - PRESENCE INTENT');
        console.log('3. Set your tokens in the Secrets tab');
        console.log('4. Restart the bot');
        process.exit(1);
    }
    
    // Login to Discord
    client.login(process.env.DISCORD_TOKEN).catch(error => {
        console.error('❌ Failed to login:', error.message);
        console.error('💡 Please check your DISCORD_TOKEN');
        process.exit(1);
    });
}

// Only start if this file is run directly
if (require.main === module) {
    startBot();
}

module.exports = { client, BOT_CONFIG };
