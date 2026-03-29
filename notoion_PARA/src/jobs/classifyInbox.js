import { Client } from '@notionhq/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const NOTION_TOKEN = process.env.NOTION_TOKEN?.trim()?.replace(/"/g, '');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim()?.replace(/"/g, '') });

const INBOX_DB = process.env.NOTION_INBOX_DB_ID?.trim()?.replace(/"/g, '');
const KNOWLEDGE_DB = process.env.NOTION_KNOWLEDGE_DB_ID?.trim()?.replace(/"/g, '');
const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID?.trim()?.replace(/"/g, '');
const AREAS_DB = process.env.NOTION_AREAS_DB_ID?.trim()?.replace(/"/g, '');

async function fetchOptions(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  
  let counter = 1;
  return data.results.map((page) => {
    let title = 'Unknown';
    if (page.properties.Name && page.properties.Name.title.length > 0) {
      title = page.properties.Name.title[0].plain_text;
    }
    return { idx: counter++, id: page.id, name: title };
  });
}

async function classifyWithAI(title, content, projects, areas) {
  const prompt = `
  You are Tiago Forte's Second Brain AI.
  Categorize the following inbox item.
  
  Item Title: "${title}"
  Item Content: "${content}"
  
  Available Projects:
  ${JSON.stringify(projects.map(p => ({ idx: p.idx, name: p.name })))}
  
  Available Areas:
  ${JSON.stringify(areas.map(a => ({ idx: a.idx, name: a.name })))}
  
  Instructions:
  1. Determine the "PARA Type" which must be exactly one of: "Project", "Area", "Resource", "Archive".
  2. If type is Project or Area, provide the matching "idx" from the lists above in "project_idx" or "area_idx" (or null if none match perfectly). If Resource or Archive, leave them null.
  3. Provide a 1-sentence "reason" why you categorized it this way (in KOREAN).
  4. Decide if "review_needed" is true/false based on how actionable this looks.
  
  Respond ONLY with valid JSON in this exact structure:
  {
    "type": "Project|Area|Resource|Archive",
    "project_idx": number|null,
    "area_idx": number|null,
    "reason": "한국어 1문장 작성",
    "review_needed": boolean
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
    console.error('Gemini Classification Error:', error);
    return null;
  }
}

async function runClassify() {
  console.log('Fetching active Projects and Areas...');
  const [projects, areas] = await Promise.all([
    fetchOptions(PROJECTS_DB),
    fetchOptions(AREAS_DB)
  ]);

  console.log('Querying unprocessed Inbox items...');
  const inboxRes = await fetch(`https://api.notion.com/v1/databases/${INBOX_DB}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: { property: 'Processed', checkbox: { equals: false } }
    })
  });
  const inbox = await inboxRes.json();
  if (!inboxRes.ok) throw new Error(inbox.message);

  if (inbox.results.length === 0) {
    console.log('No unprocessed items in Inbox.');
    return;
  }

  console.log(`Found ${inbox.results.length} items to process.`);

  for (const item of inbox.results) {
    const page = item;
    const titleObj = page.properties.Title?.title[0];
    const textObj = page.properties['URL / Content']?.rich_text[0];
    
    const itemTitle = titleObj ? titleObj.plain_text : 'Untitled';
    const itemContent = textObj ? textObj.plain_text : '';

    console.log(`\nProcessing: "${itemTitle}"`);
    const classification = await classifyWithAI(itemTitle, itemContent, projects, areas);

    if (!classification) {
      console.log('Failed to classify, skipping.');
      continue;
    }

    const properties = {
      Title: { title: [{ text: { content: itemTitle } }] },
      'PARA Type': { select: { name: classification.type } },
      'Classification Reason': { rich_text: [{ text: { content: classification.reason } }] },
      'Review Needed': { select: { name: classification.review_needed ? 'Yes' : 'No' } }
    };

    if (classification.project_idx && classification.type === 'Project') {
      const p = projects.find(p => p.idx === classification.project_idx);
      if (p) properties['Project Relation'] = { relation: [{ id: p.id }] };
    }
    if (classification.area_idx && classification.type === 'Area') {
      const a = areas.find(a => a.idx === classification.area_idx);
      if (a) properties['Area Relation'] = { relation: [{ id: a.id }] };
    }

    try {
      const createRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent: { type: 'database_id', database_id: KNOWLEDGE_DB },
          properties,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: itemContent || 'No original content.' } }]
              }
            }
          ]
        })
      });
      if (!createRes.ok) throw new Error((await createRes.json()).message);

      const updateRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { Processed: { checkbox: true } }
        })
      });
      if (!updateRes.ok) throw new Error((await updateRes.json()).message);
      console.log(`✅ Classified as [${classification.type}]. Reason: ${classification.reason}`);
    } catch (e) {
      console.error('Error updating Notion:', e.message);
    }
  }
  
  console.log('\nInbox processing complete.');
}

runClassify().catch((e) => {
  import('fs').then(fs => fs.writeFileSync('JS_ERR.txt', e.stack + '\\n' + JSON.stringify(e)));
  console.error(e);
});
