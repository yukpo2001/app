import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const NOTION_TOKEN = process.env.NOTION_TOKEN?.trim()?.replace(/"/g, '');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim()?.replace(/"/g, '') });

const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID?.trim()?.replace(/"/g, '');
const KNOWLEDGE_DB = process.env.NOTION_KNOWLEDGE_DB_ID?.trim()?.replace(/"/g, '');

// Helpet to get plain text from rich text array
function getText(richTextArr) {
  if (!richTextArr || richTextArr.length === 0) return '';
  return richTextArr.map(t => t.plain_text).join('');
}

async function expressBriefWithAI(projectName, aggregatedKnowledge) {
  const prompt = `
  You are Tiago Forte's Second Brain AI.
  You are generating a Project Brief for the project: "${projectName}".
  
  Here are all the distilled knowledge notes collected for this project:
  
  ${aggregatedKnowledge}
  
  Instructions:
  Synthesize this information to create a comprehensive Project Brief.
  Include the following sections (in KOREAN):
  1. Core Insights (핵심 인사이트 - 3 bullets)
  2. Pain Points / Problems (해결해야 할 문제 - 2 bullets)
  3. Key Messages (주요 메시지 - 2 bullets)
  4. Generated Ideas (아이디어 - 3 bullets)
  5. Identified Risks (예상 리스크 - 1 bullet)
  
  Respond ONLY with valid JSON exactly matching this structure:
  {
    "Core_Insights": ["string"],
    "Pain_Points": ["string"],
    "Messages": ["string"],
    "Ideas": ["string"],
    "Risks": ["string"]
  }
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
    console.error('Gemini Express Error:', error);
    return null;
  }
}

async function runExpress() {
  console.log('Fetching active Projects...');
  const projRes = await fetch(`https://api.notion.com/v1/databases/${PROJECTS_DB}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Active' } }
    })
  });
  const projData = await projRes.json();
  if (!projRes.ok) throw new Error(projData.message);

  for (const project of projData.results) {
    const projectName = getText(project.properties.Name?.title) || 'Untitled Project';
    console.log(`\nProcessing Project: "${projectName}"`);

    // Fetch related Knowledge
    const knowRes = await fetch(`https://api.notion.com/v1/databases/${KNOWLEDGE_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'Project Relation', relation: { contains: project.id } }
      })
    });
    const knowData = await knowRes.json();
    if (!knowRes.ok) throw new Error(knowData.message);

    if (knowData.results.length === 0) {
      console.log('No knowledge notes linked to this project. Skipping.');
      continue;
    }

    let aggregated = '';
    for (const note of knowData.results) {
      const title = getText(note.properties.Title?.title);
      const summary = getText(note.properties.Summary?.rich_text);
      const insights = getText(note.properties['Actionable Insights']?.rich_text);
      
      aggregated += `\n--- Note: ${title} ---\nSummary: ${summary}\nInsights: ${insights}\n`;
    }

    const brief = await expressBriefWithAI(projectName, aggregated);
    if (!brief) continue;

    // Create a new child page under the Project page
    console.log('Creating Notion Brief Page...');
    
    // Convert arrays to Notion bulleted_list_item blocks
    const makeBullets = (arr) => arr.map(text => ({
      object: 'block',
      type: 'bulleted_list_item',
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
        parent: { type: 'page_id', page_id: project.id },
        properties: {
          title: { title: [{ text: { content: `[AI Brief] ${projectName} - ${new Date().toISOString().split('T')[0]}` } }] }
        },
        children: [
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '🎯 핵심 인사이트 (Core Insights)' } }] } },
          ...makeBullets(brief.Core_Insights),
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '⚠️ 해결해야 할 문제 (Pain Points)' } }] } },
          ...makeBullets(brief.Pain_Points),
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '📣 주요 메시지 (Key Messages)' } }] } },
          ...makeBullets(brief.Messages),
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '💡 생성된 아이디어 (Generated Ideas)' } }] } },
          ...makeBullets(brief.Ideas),
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: '🚨 예상 리스크 (Identified Risks)' } }] } },
          ...makeBullets(brief.Risks)
        ]
      })
    });

    if (!createRes.ok) throw new Error((await createRes.json()).message);
    console.log(`✅ Express Brief created for ${projectName}`);
  }
}

runExpress().catch((e) => {
  import('fs').then(fs => fs.writeFileSync('EXPRESS_ERR.txt', e.stack + '\\n' + JSON.stringify(e)));
  console.error(e);
});
