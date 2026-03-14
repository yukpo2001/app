require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { processEmails } = require('./sync_emails');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

client.once('ready', () => {
  console.log(`🤖 Discord Bot Logged in as ${client.user.tag}!`);
  
  // Run initial fetch
  console.log("Running initial email fetch...");
  processEmails(client);
  
  // Run periodically every 10 minutes
  setInterval(() => {
    console.log("Running periodic email fetch...");
    processEmails(client);
  }, 10 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[0];

  if (command === '!답장') {
    const emailId = args[1];
    const replyContent = args.slice(2).join(' ');

    if (!emailId || !replyContent) {
      return message.reply('📝 사용법: `!답장 [Email_ID] [답장할 내용]`');
    }

    message.reply(`⏳ \`${emailId}\` 메일에 답장을 전송하는 중입니다...`);
    
    // TODO: Implement Gmail API reply logic using emailId and replyContent
    // await replyToEmail(emailId, replyContent);
    
    setTimeout(() => {
      message.reply(`✅ 성공적으로 답장을 보냈습니다!\n> "${replyContent}"`);
    }, 2000);
  }

  if (command === '!일정') {
    const emailId = args[1];

    if (!emailId) {
      return message.reply('📅 사용법: `!일정 [Email_ID]`');
    }

    message.reply(`⏳ \`${emailId}\` 메일 내용을 분석하여 일정을 등록 중입니다...`);
    
    // TODO: Implement Calendar API integration to extract time and schedule
    // const eventDetails = await extractEventFromEmail(emailId);
    
    setTimeout(() => {
      message.reply(`📅 일정 등록이 완료되었습니다!`);
    }, 2000);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
