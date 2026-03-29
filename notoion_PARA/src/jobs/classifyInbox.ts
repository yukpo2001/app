// @ts-nocheck
import { Client } from '@notionhq/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INBOX_DB = process.env.NOTION_INBOX_DB_ID!;
const KNOWLEDGE_DB = process.env.NOTION_KNOWLEDGE_DB_ID!;
const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID!;
const AREAS_DB = process.env.NOTION_AREAS_DB_ID!;

async function fetchOptions(dbId: string) {
  const result = await notion.databases.query({ database_id: dbId });
  return result.results.map((page: any) => {
    // Basic title parsing
    let title = 'Unknown';
    if (page.properties.Name && page.properties.Name.title.length > 0) {
      title = page.properties.Name.title[0].plain_text;
    }
    return { id: page.id, name: title };
  });
}

async function classifyWithAI(title: string, content: string, projects: any[], areas: any[]) {
  const prompt = `
  You are Tiago Forte's Second Brain AI.
  Categorize the following inbox item.
  
  Item Title: "${title}"
  Item Content: "${content}"
  
  Available Projects:
  ${JSON.stringify(projects)}
  
  Available Areas:
  ${JSON.stringify(areas)}
  
  Instructions:
  1. Determine the "PARA Type" which must be exactly one of: "Project", "Area", "Resource", "Archive".
  2. If type is Project or Area, provide the matching ID from the lists above in "project_id" or "area_id" (or null if none match perfectly). If Resource or Archive, leave them null.
  3. Provide a 1-sentence "reason" why you categorized it this way (in KOREAN).
  4. Decide if "review_needed" is true/false based on how actionable this looks.
  
  Respond ONLY with valid JSON in this exact structure:
  {
    "type": "Project|Area|Resource|Archive",
    "project_id": "string|null",
    "area_id": "string|null",
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
  const inbox = await notion.databases.query({
    database_id: INBOX_DB,
    filter: {
      property: 'Processed',
      checkbox: { equals: false }
    }
  });

  if (inbox.results.length === 0) {
    console.log('No unprocessed items in Inbox.');
    return;
  }

  console.log(`Found ${inbox.results.length} items to process.`);

  for (const item of inbox.results) {
    const page = item as any;
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

    // Build the properties for Knowledge DB
    const properties: any = {
      Title: { title: [{ text: { content: itemTitle } }] },
      'PARA Type': { select: { name: classification.type } },
      'Classification Reason': { rich_text: [{ text: { content: classification.reason } }] },
      'Review Needed': { select: { name: classification.review_needed ? 'Yes' : 'No' } }
    };

    if (classification.project_id && classification.type === 'Project') {
      properties['Project Relation'] = { relation: [{ id: classification.project_id }] };
    }
    if (classification.area_id && classification.type === 'Area') {
      properties['Area Relation'] = { relation: [{ id: classification.area_id }] };
    }

    try {
      // 1. Create page in Knowledge DB
      await notion.pages.create({
        parent: { type: 'database_id', database_id: KNOWLEDGE_DB },
        properties
      });

      // 2. Mark Inbox item as Processed
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Processed: { checkbox: true }
        }
      });
      console.log(`✅ Classified as [${classification.type}]. Reason: ${classification.reason}`);
    } catch (e: any) {
      console.error('Error updating Notion:', e.message);
    }
  }
  
  console.log('\nInbox processing complete.');
}

runClassify().catch(console.error);
