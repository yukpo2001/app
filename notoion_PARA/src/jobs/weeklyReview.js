import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const NOTION_TOKEN = process.env.NOTION_TOKEN?.trim()?.replace(/"/g, '');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim()?.replace(/"/g, '') });

const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID?.trim()?.replace(/"/g, '');
const KNOWLEDGE_DB = process.env.NOTION_KNOWLEDGE_DB_ID?.trim()?.replace(/"/g, '');
const INBOX_DB = process.env.NOTION_INBOX_DB_ID?.trim()?.replace(/"/g, '');
const ROOT_PAGE = process.env.NOTION_PAGE_ID?.trim()?.replace(/"/g, '');

function getText(richTextArr) {
  if (!richTextArr || richTextArr.length === 0) return '';
  return richTextArr.map(t => t.plain_text).join('');
}

async function reviewWithAI(projectsText, inboxesText, knowledgeText) {
  const prompt = `
  You are Tiago Forte's Second Brain AI.
  Generate a Weekly Review Report based on the following current state of the user's PARA system.
  
  Active Projects:
  ${projectsText}
  
  Unprocessed Inbox Items (Need Attention):
  ${inboxesText}
  
  Recently Distilled Knowledge (L2/L4 Insights):
  ${knowledgeText}
  
  Instructions:
  Write a Weekly Review containing:
  1. "Weekly Summary" (주간 요약) - A 2-3 sentence overview of the week's focus based on the data.
  2. "Top 3 Priorities" (다음 주 Top 3 우선순위) - Based on active projects and actionable insights, suggest what the user should focus on next week.
  3. "Inbox Warning" (인박스 정리 권고) - A short remark about unprocessed items, if any.
  
  Respond ONLY with valid JSON exactly matching:
  {
    "Summary": "string",
    "Priorities": ["string", "string", "string"],
    "Warning": "string"
  }
  ALL generated text must be in KOREAN.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini Review Error:', error);
    return null;
  }
}

async function runWeeklyReview() {
  console.log('Gathering PARA System Data for Weekly Review...');
  
  // 1. Fetch Active Projects
  const projRes = await fetch(`https://api.notion.com/v1/databases/${PROJECTS_DB}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter: { property: 'Status', select: { equals: 'Active' } } })
  });
  const projData = await projRes.json();
  let projectsText = '';
  if (projRes.ok) {
    projData.results.forEach(p => projectsText += `- ${getText(p.properties.Name?.title)}\n`);
  }

  // 2. Fetch Unprocessed Inbox
  const inboxRes = await fetch(`https://api.notion.com/v1/databases/${INBOX_DB}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter: { property: 'Processed', checkbox: { equals: false } } })
  });
  const inboxData = await inboxRes.json();
  let inboxesText = '';
  if (inboxRes.ok) {
    inboxData.results.forEach(i => inboxesText += `- ${getText(i.properties.Title?.title)}\n`);
  }

  // 3. Fetch L4/L2 Knowledge
  const knowRes = await fetch(`https://api.notion.com/v1/databases/${KNOWLEDGE_DB}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: { or: [ { property: 'Layer', select: { equals: 'L4' } }, { property: 'Layer', select: { equals: 'L2' } } ] }
    })
  });
  const knowData = await knowRes.json();
  let knowledgeText = '';
  if (knowRes.ok) {
    knowData.results.forEach(k => {
      knowledgeText += `- [${k.properties.Layer?.select?.name}] ${getText(k.properties.Title?.title)}: ${getText(k.properties['Actionable Insights']?.rich_text)}\n`;
    });
  }

  const review = await reviewWithAI(projectsText || '(None)', inboxesText || '(All processed)', knowledgeText || '(None)');
  if (!review) return;

  console.log('Creating Notion Weekly Review Page...');
  const makeBullets = (arr) => arr.map(text => ({
    object: 'block', type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] }
  }));

  const createRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: ROOT_PAGE },
      properties: {
        title: { title: [{ text: { content: `📆 주간 리뷰 (Weekly Review) - ${new Date().toISOString().split('T')[0]}` } }] }
      },
      children: [
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '📝 주간 요약 (Summary)' } }] } },
        { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: review.Summary } }] } },
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '🎯 다음 주 Top 3 우선순위' } }] } },
        ...makeBullets(review.Priorities),
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '📥 인박스 상태' } }] } },
        { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: review.Warning } }] } },
      ]
    })
  });

  if (!createRes.ok) throw new Error((await createRes.json()).message);
  console.log('✅ Weekly Review created successfully at Root Page.');
}

runWeeklyReview().catch((e) => {
  import('fs').then(fs => fs.writeFileSync('REVIEW_ERR.txt', e.stack + '\\n' + JSON.stringify(e)));
  console.error(e);
});
