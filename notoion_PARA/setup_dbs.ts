import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const TOKEN = process.env.NOTION_TOKEN!;
const PAGE_ID = process.env.NOTION_PAGE_ID!;

async function createDb(title: string, properties: any) {
  const res = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: PAGE_ID },
      title: [{ type: 'text', text: { content: title } }],
      properties
    })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error creating ${title} DB:`, data);
    throw new Error(data.message);
  }
  console.log(`${title} DB created:`, data.id);
  return data.id;
}

async function main() {
  try {
    const projectsId = await createDb('Projects v2', {
      Name: { title: {} },
      Status: {
        select: {
          options: [
            { name: 'Active', color: 'blue' },
            { name: 'Closing Soon', color: 'yellow' },
            { name: 'Completed', color: 'green' },
            { name: 'Archived', color: 'gray' },
          ],
        },
      },
    });

    const areasId = await createDb('Areas v2', {
      Name: { title: {} },
      'Need Review': { checkbox: {} },
    });

    const inboxId = await createDb('Inbox v2', {
      Title: { title: {} },
      'URL / Content': { rich_text: {} },
      Source: {
        select: {
          options: [
            { name: 'Web', color: 'blue' },
            { name: 'Audio', color: 'orange' },
            { name: 'PDF', color: 'red' },
            { name: 'Idea', color: 'yellow' },
            { name: 'Note', color: 'default' },
          ],
        },
      },
      Processed: { checkbox: {} },
    });

    const knowledgeId = await createDb('Knowledge v2', {
      Title: { title: {} },
      'PARA Type': {
        select: {
          options: [
            { name: 'Project', color: 'blue' },
            { name: 'Area', color: 'green' },
            { name: 'Resource', color: 'orange' },
            { name: 'Archive', color: 'gray' },
          ],
        },
      },
      'Project Relation': { relation: { database_id: projectsId, type: 'single_property', single_property: {} } },
      'Area Relation': { relation: { database_id: areasId, type: 'single_property', single_property: {} } },
      'Classification Reason': { rich_text: {} },
      'Review Needed': {
        select: {
          options: [
            { name: 'Yes', color: 'red' },
            { name: 'No', color: 'default' },
          ],
        },
      },
      Layer: {
        select: {
          options: [
            { name: 'L1', color: 'default' },
            { name: 'L2', color: 'yellow' },
            { name: 'L3', color: 'blue' },
            { name: 'L4', color: 'red' },
          ],
        },
      },
      Summary: { rich_text: {} },
      'Key Sentences': { rich_text: {} },
      'Actionable Insights': { rich_text: {} },
      'Next Use': { rich_text: {} },
    });

    const envContent = `NOTION_TOKEN="${TOKEN}"
NOTION_PAGE_ID="${PAGE_ID}"
NOTION_PROJECTS_DB_ID="${projectsId}"
NOTION_AREAS_DB_ID="${areasId}"
NOTION_INBOX_DB_ID="${inboxId}"
NOTION_KNOWLEDGE_DB_ID="${knowledgeId}"
`;
    fs.writeFileSync('.env', envContent, 'utf-8');
    console.log('Saved v2 IDs to .env');

  } catch (err) {
    console.error(err);
  }
}

main();
