import * as dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.NOTION_TOKEN.replace(/"/g, '').trim();
const PAGE_ID = process.env.NOTION_PAGE_ID.replace(/"/g, '').trim();

// Active DB IDs
const activeDbIds = [
  process.env.NOTION_INBOX_DB_ID.replace(/"/g, '').trim(),
  process.env.NOTION_KNOWLEDGE_DB_ID.replace(/"/g, '').trim(),
  process.env.NOTION_PROJECTS_DB_ID.replace(/"/g, '').trim(),
  process.env.NOTION_AREAS_DB_ID.replace(/"/g, '').trim()
];

async function cleanupNotion() {
  console.log('Fetching children of Root Page...');
  
  // 1. Fetch all blocks from Root Page
  const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28'
    }
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  
  // Filter only child databases
  const databases = data.results.filter(b => b.type === 'child_database');
  console.log(`Found ${databases.length} child databases.`);

  for (const db of databases) {
    const dbId = db.id;
    const dbTitle = db.child_database.title;
    
    // Check if this is an active v2 DB
    if (activeDbIds.includes(dbId)) {
      // Remove " v2" from the title
      const newTitle = dbTitle.replace(' v2', '');
      if (newTitle !== dbTitle) {
        console.log(`Renaming [${dbTitle}] -> [${newTitle}]...`);
        const updateRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: [{ type: 'text', text: { content: newTitle } }]
          })
        });
        if (!updateRes.ok) console.error(`Failed to rename ${dbTitle}`);
        else console.log(`✅ Renamed ${dbTitle} to ${newTitle}`);
      }
    } else {
      // This is an old/legacy DB. Let's check if it matches our old names.
      const isLegacy = ['Inbox', 'Knowledge', 'Projects', 'Areas'].some(name => dbTitle.includes(name));
      if (isLegacy) {
        console.log(`Archiving (Deleting) legacy DB: [${dbTitle}]...`);
        const archiveRes = await fetch(`https://api.notion.com/v1/blocks/${dbId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Notion-Version': '2022-06-28'
          }
        });
        if (!archiveRes.ok) console.error(`Failed to archive ${dbTitle}`);
        else console.log(`🗑️ Archived ${dbTitle}`);
      }
    }
  }
  
  console.log('Cleanup complete!');
}

cleanupNotion().catch(console.error);
