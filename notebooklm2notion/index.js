require('dotenv').config();
const axios = require('axios');
const { sendDailyUpdateNotification, sendErrorNotification } = require('./notifier');
const NOTEBOOKS = require('./notebooks_data');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DB_ID;
const TODAY = new Date().toISOString().split('T')[0];

const notionAPI = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  }
});

/** DB에서 제목으로 기존 페이지 검색 */
async function findExisting(title) {
  const res = await notionAPI.post(`/databases/${DATABASE_ID}/query`, {
    filter: { property: 'Title', title: { equals: title } }
  });
  return res.data.results[0] || null;
}

/** 페이지 속성 빌드 */
function buildProperties(nb) {
  const { title, category, tags, importance, insights, action } = nb;
  return {
    'Title':           { title: [{ text: { content: title.substring(0, 2000) } }] },
    'Category':        { select: { name: category } },
    'Tags':            { multi_select: tags.map(t => ({ name: t })) },
    'Importance':      { select: { name: importance } },
    'Insights':        { rich_text: [{ text: { content: insights.substring(0, 2000) } }] },
    'Action Plan':     { rich_text: [{ text: { content: action.substring(0, 2000) } }] },
    'Analysis Date':   { date: { start: TODAY } },
    'Status':          { status: { name: '완료' } }
  };
}

/** 노트북 1개를 삽입 또는 업데이트 */
async function upsertNotebook(notebook) {
  const existing = await findExisting(notebook.title);
  const properties = buildProperties(notebook);

  if (existing) {
    await notionAPI.patch(`/pages/${existing.id}`, { properties });
    return 'updated';
  } else {
    await notionAPI.post('/pages', {
      parent: { database_id: DATABASE_ID },
      properties
    });
    return 'added';
  }
}

/** 전체 실행 */
async function main() {
  console.log(`\n🚀 NotebookLM → Notion 동기화 시작 (${TODAY})\n`);

  if (!NOTION_TOKEN || NOTION_TOKEN === 'your_notion_integration_token_here') {
    const msg = 'NOTION_TOKEN이 설정되지 않았습니다.';
    console.error('❌', msg);
    await sendErrorNotification(msg);
    process.exit(1);
  }

  const stats = { updated: 0, added: 0, failed: 0, totalNotebooks: NOTEBOOKS.length };

  for (let i = 0; i < NOTEBOOKS.length; i++) {
    const nb = NOTEBOOKS[i];
    try {
      const result = await upsertNotebook(nb);
      stats[result]++;
      process.stdout.write(`✅ [${i+1}/${NOTEBOOKS.length}] ${nb.title.substring(0,50)}\r`);
      await new Promise(r => setTimeout(r, 400)); // API rate limit 방지
    } catch (err) {
      stats.failed++;
      const errMsg = err.response?.data?.message || err.message;
      console.error(`\n❌ 실패: ${nb.title} — ${errMsg}`);
    }
  }

  console.log('\n\n=== 동기화 완료 ===');
  console.log(`✅ 신규: ${stats.added}개 | 🔄 업데이트: ${stats.updated}개 | ❌ 실패: ${stats.failed}개`);

  await sendDailyUpdateNotification(stats);
}

main().catch(async (err) => {
  console.error('치명적 오류:', err.message);
  await sendErrorNotification(err.message);
  process.exit(1);
});

