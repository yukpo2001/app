require('dotenv').config();
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Client } = require("@notionhq/client");

// 1. Initialize API Clients
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function processEmails(discordClient) {
  console.log("Checking for new unread emails...");
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 5
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      console.log('No new unread emails to process.');
      return;
    }

    console.log(`Found ${messages.length} email(s). Processing...`);

    for (const msg of messages) {
      // Get full email payload
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const payload = msgRes.data.payload;
      const headers = payload.headers;
      
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
      
      // Parse dates properly for Notion (ISO 8601 format requirement)
      let dateIso = new Date().toISOString();
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;
      if (dateHeader) {
          const parsed = new Date(dateHeader);
          if (!isNaN(parsed.getTime())) dateIso = parsed.toISOString();
      }
      
      const emailLink = `https://mail.google.com/mail/u/0/#inbox/${msg.id}`;
      
      let bodyText = msgRes.data.snippet || '';
      // Heuristic extraction for main text content
      if (payload.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
           bodyText = Buffer.from(textPart.body.data, 'base64').toString('utf8');
        }
      } else if (payload.body && payload.body.data) {
         bodyText = Buffer.from(payload.body.data, 'base64').toString('utf8');
      }

      console.log(`\nAnalyzing email: ${subject}`);
      
      // 2. Claude AI Analysis
      const prompt = `You are an AI Email Organizer assistant. Output ONLY valid JSON representing the object. Do NOT wrap in markdown or backticks.
Analyze the following email and return a JSON object with the exact following schema and values. 
{
  "importance": "🔴 High" | "🟡 Medium" | "⚪ Low",
  "urgency": "⚡ 긴급" | "📅 보통" | "💤 보류",
  "summary": "3-line summary of the email in Korean.",
  "action_item": "Extract user action items in Korean if any, otherwise 'None'."
}

Email Subject: ${subject}
From: ${from}
Email Body:
${bodyText.substring(0, 2000)}
`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });

      let aiResult = {};
      try {
          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiResult = JSON.parse(jsonStr);
      } catch (e) {
          console.error("Failed to parse AI response as JSON", e);
          aiResult = {
              importance: "⚪ Low",
              urgency: "💤 보류",
              summary: "Failed to summarize email properly.",
              action_item: "None"
          };
      }

      console.log(`Result -> Importance: ${aiResult.importance}, Urgency: ${aiResult.urgency}`);

      // 3. Save to Notion DB
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_EMAIL_DB_ID },
        properties: {
          "제목": { title: [{ text: { content: subject } }] },
          "보낸 사람": { rich_text: [{ text: { content: from } }] },
          "수신 일시": { date: { start: dateIso } },
          "중요도": { select: { name: aiResult.importance } },
          "시급성": { select: { name: aiResult.urgency } },
          "AI 요약": { rich_text: [{ text: { content: aiResult.summary } }] },
          "액션 아이템": { rich_text: [{ text: { content: aiResult.action_item } }] },
          "처리 상태": { select: { name: "할 일" } },
          "원본 링크": { url: emailLink },
          "Email_ID": { rich_text: [{ text: { content: msg.id } }] },
        }
      });
      
      console.log("-> Saved to Notion.");
      
      // Discord Notification (Report only if Important or Urgent)
      const isImportant = aiResult.importance.includes('High');
      const isUrgent = aiResult.urgency.includes('긴급');
      
      if (discordClient && process.env.DISCORD_CHANNEL_ID && (isImportant || isUrgent)) {
        try {
          const channel = await discordClient.channels.fetch(process.env.DISCORD_CHANNEL_ID);
          if (channel) {
            const embedColor = aiResult.importance.includes('High') ? 0xff0000 : (aiResult.importance.includes('Medium') ? 0xffff00 : 0x00ff00);
            const embed = {
              color: embedColor,
              title: `📧 신규 메일 도착: ${subject}`,
              url: emailLink,
              description: `**보낸사람**: ${from}\n\n**💡 요약**\n${aiResult.summary}\n\n**🎯 액션 아이템**\n${aiResult.action_item}`,
              fields: [
                { name: '중요도', value: aiResult.importance, inline: true },
                { name: '시급성', value: aiResult.urgency, inline: true },
                { name: 'Email_ID', value: `\`${msg.id}\``, inline: false }
              ],
              footer: { text: 'Email Organizer Bot' }
            };
            await channel.send({ embeds: [embed] });
            console.log("-> Sent Discord notification.");
          }
        } catch (discordErr) {
          console.error("Failed to send Discord alert:", discordErr);
        }
      }
      // 4. Mark email as read
      await gmail.users.messages.modify({
          userId: 'me',
          id: msg.id,
          requestBody: {
              removeLabelIds: ['UNREAD']
          }
      });
      console.log("-> Marked email as read in Gmail.");
    }
    console.log("\n✅ Finished processing all new emails!");
  } catch(e) {
      console.error("Error processing emails:", e.message || e);
  }
}

// Export or run based on context
if (require.main === module) {
  processEmails();
} else {
  module.exports = { processEmails };
}
