import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const NOTION_TOKEN = process.env.NOTION_TOKEN?.trim()?.replace(/"/g, '');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim()?.replace(/"/g, '') });

const KNOWLEDGE_DB = process.env.NOTION_KNOWLEDGE_DB_ID?.trim()?.replace(/"/g, '');

async function fetchPageBlocks(pageId) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    }
  });
  if (!res.ok) return '';
  const data = await res.json();
  let content = '';
  for (const block of data.results) {
    if (block.type === 'paragraph' && block.paragraph.rich_text) {
      content += block.paragraph.rich_text.map(t => t.plain_text).join('') + '\n';
    }
  }
  return content.trim();
}

async function distillWithAI(title, content) {
  const prompt = `
  You are Tiago Forte's Second Brain AI.
  Distill the following knowledge item according to the CODE framework.
  
  Item Title: "${title}"
  Item Content: "${content}"
  
  Instructions:
  1. Determine the knowledge Layer (L2 or L4). Pick L2 if it's general info or light notes. Pick L4 if it's profound, extremely actionable, or a fully formed concept.
  2. Write a 3-5 line short Summary.
  3. Extract 3-5 exact Key Sentences from the text (or create them if text is too short).
  4. Write exactly 2 Actionable Insights (bullet points).
  5. Write 1 sentence on "Next Use" (where or when this will be useful).
  ALL generated text must be in KOREAN.
  
  Respond ONLY with valid JSON exactly matching:
  {
    "Layer": "L2" | "L4",
    "Summary": "string",
    "Key_Sentences": "string",
    "Actionable_Insights": "string",
    "Next_Use": "string"
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
    console.error('Gemini Distill Error:', error);
    return null;
  }
}

async function runDistill() {
  console.log('Querying Knowledge DB for items needing review...');
  const res = await fetch(`https://api.notion.com/v1/databases/${KNOWLEDGE_DB}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: {
        property: 'Review Needed',
        select: { equals: 'Yes' }
      }
    })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  if (data.results.length === 0) {
    console.log('No items need distilling.');
    return;
  }

  console.log(`Found ${data.results.length} items to distill.`);

  for (const page of data.results) {
    const titleObj = page.properties.Title?.title[0];
    const itemTitle = titleObj ? titleObj.plain_text : 'Untitled';

    console.log(`\nDistilling: "${itemTitle}"`);
    const content = await fetchPageBlocks(page.id);
    
    if (!content) {
      console.log('No content found in page blocks, skipping distill.');
      continue;
    }

    const distilled = await distillWithAI(itemTitle, content);
    if (!distilled) {
      console.log('Failed to distill, skipping.');
      continue;
    }

    const properties = {
      Layer: { select: { name: distilled.Layer } },
      Summary: { rich_text: [{ text: { content: distilled.Summary } }] },
      'Key Sentences': { rich_text: [{ text: { content: distilled.Key_Sentences } }] },
      'Actionable Insights': { rich_text: [{ text: { content: distilled.Actionable_Insights } }] },
      'Next Use': { rich_text: [{ text: { content: distilled.Next_Use } }] },
      'Review Needed': { select: { name: 'No' } }
    };

    const updateRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });
    
    if (!updateRes.ok) throw new Error((await updateRes.json()).message);
    
    console.log(`✅ Distilled as [${distilled.Layer}].`);
  }
  
  console.log('\nDistill processing complete.');
}

runDistill().catch((e) => {
  import('fs').then(fs => fs.writeFileSync('DISTILL_ERR.txt', e.stack + '\\n' + JSON.stringify(e)));
  console.error(e);
});
