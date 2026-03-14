require('dotenv').config();
const axios = require('axios');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DB_ID;

const notionAPI = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  }
});

// 수집된 NotebookLM URL 맵 (제목 → URL)
const NOTEBOOK_URLS = {
  "The App Flipping Playbook: Build, Grow, and Exit Fast": "https://notebooklm.google.com/notebook/40b1765d-7bd5-468b-a64e-27561b71c628",
  "opal 프롬프트 빌더": "https://notebooklm.google.com/notebook/255176fd-3f92-4711-85fc-11fce667089e",
  "Mastering AI Animation with Google Gemini and Flow": "https://notebooklm.google.com/notebook/a7feafb4-be18-4049-997f-deaf91c9f419",
  "자영업 생존 공식: 한 방이 아닌 단계적 접근": "https://notebooklm.google.com/notebook/eeaf0c7f-17ca-4da4-9a83-04397692e91e",
  "Building an AI GitHub Agent with n8n and Discord": "https://notebooklm.google.com/notebook/60f05140-1a9a-4c08-b916-0594897df361",
  "Skills.sh: Leveling Up AI Coding with Custom Agent Knowledge": "https://notebooklm.google.com/notebook/13f00220-859d-4fcf-a44f-03c53c813972",
  "The Blueprint for Building a Million Dollar Business Zero to One": "https://notebooklm.google.com/notebook/d5f94439-fdfe-4517-a3e8-27e1ae1d2e21",
  "Global Vibe Coding: From Development to Market Success": "https://notebooklm.google.com/notebook/4bb6c891-a832-4936-ab39-7094d4ee3faa",
  "The 14-Day App Blueprint: From Zero to Millions with AI": "https://notebooklm.google.com/notebook/f52f3c2a-0926-405f-9361-be0ff2772936",
  "사기꾼에게 얻은 전략": "https://notebooklm.google.com/notebook/7cf818f7-a8c5-4d5b-ae3e-1ffdde47c747",
  "The Seven Dark Psychology Triggers of Master Salesmen": "https://notebooklm.google.com/notebook/baba6b78-b1fd-48ce-a179-6e6c8745baf6",
  "마이크로 사스 홍보전략": "https://notebooklm.google.com/notebook/2a3698c7-3bcd-412c-9d5f-d194d9074340",
  "The Two-Week Rule for Rapid Business Success": "https://notebooklm.google.com/notebook/93d2f78f-91fa-49e0-a02f-f56cc7573dab",
  "2026 AI Voucher Announcement and Startup Support Projects": "https://notebooklm.google.com/notebook/57bd7c03-332e-4bb7-aeff-a0921ef386ae",
  "안티그래비티,아두이노,라즈베리파이": "https://notebooklm.google.com/notebook/2593d8fb-0810-48e0-a05e-bb1631776952",
  "A Business That Makes Money: Three Pillars of Success": "https://notebooklm.google.com/notebook/377a28fd-1510-4f51-87fe-11afce667089e",
  "Mastering Claude Code: Training AI as Your Expert Staff": "https://notebooklm.google.com/notebook/7f232746-9989-4391-8d85-fe5b6c034f7f",
  "Data 바우처": "https://notebooklm.google.com/notebook/2e05fff9-b047-48d0-8167-4703a2db667a",
  "Korean Craft Brewery Market Landscape and Competitor Analysis Report": "https://notebooklm.google.com/notebook/55ea8cd8-151c-4016-a828-caeb86ff8f2a",
  "2026 AI Voucher Support Project and Startup Consulting Strategy": "https://notebooklm.google.com/notebook/e0c31128-f7ea-4c9b-b6d1-842984760c0e",
  "Skill: Professional Consistency for AI Automation": "https://notebooklm.google.com/notebook/fe19ec15-5142-4f0d-8e13-a477286c80b3",
  "Daniel Priestley's 5-Step Billion Won Startup Strategy": "https://notebooklm.google.com/notebook/9c40ed17-fe2f-4ca2-89e4-fd92bfc72e73",
  "Mastering GraphRAG and Knowledge Graphs for AI Agents": "https://notebooklm.google.com/notebook/31941926-13b9-4f1b-a428-5ac6ce123179",
  "2026 Developer Guide to 9 Essential MCP Tools": "https://notebooklm.google.com/notebook/46442ac4-533b-49b3-a849-8ab12cda4c7e",
  "Building Global Micro-SaaS with AntiGravity and Claude Code": "https://notebooklm.google.com/notebook/a03e7ec2-7105-4be5-854e-7104d2ba548d",
  "The Six Month Blueprint for Mastering AI Systems": "https://notebooklm.google.com/notebook/468c22d1-9770-4552-85ab-223bb7de4adc",
  "케비어 된장찌개": "https://notebooklm.google.com/notebook/58abaafe-0aa9-4f9d-91a4-0892bcb3c20d",
  "Harness Engineering: Steering AI through Systems and Constraints": "https://notebooklm.google.com/notebook/5959fca9-cbeb-4339-b789-747bb978c17b",
  "Decoherence is Time: Quantum Superposition and the Birth of Chronos": "https://notebooklm.google.com/notebook/f5c5be9c-9e4f-4a44-939f-bb823ba713fe",
  "바딤 젤란드가 정립한 '리얼리티 트랜서핑'": "https://notebooklm.google.com/notebook/89f1e11f-a12a-4c4f-8b99-93832f66df61",
  "PSST 배분전략": "https://notebooklm.google.com/notebook/ed1b5a1b-d785-4bfb-8949-c259dcb4c999",
  "Mastering NotebookLM and AI Agents from A to Z": "https://notebooklm.google.com/notebook/669486d8-a68d-42fb-a0d9-a9b7b0ec2922",
  "Essential Claude Code Updates: Memory, Simplified Batching, and Remote Control": "https://notebooklm.google.com/notebook/c5393080-f42d-4bc2-9dc9-f7cbeeb26531",
  "걸러야 하는 사람 유형": "https://notebooklm.google.com/notebook/7ab50be3-721b-428a-8ed3-4da52338d9e0",
  "구글 AI 생태계: 제미나이와 노트북LM 및 오팔 통합 활용법": "https://notebooklm.google.com/notebook/eff17922-2d7a-4025-9a62-633e75687b20",
  "Short-Form Storytelling: Five Success Formulas for Viral Content": "https://notebooklm.google.com/notebook/298f9387-7f73-4bc6-927a-5d343256d956",
  "Six Trends Shaping the Next Era of Social Media": "https://notebooklm.google.com/notebook/e73fe86b-fe7e-4aba-b312-0ceb0b942024",
  "자기소개 원칙": "https://notebooklm.google.com/notebook/3eee2bef-e084-4cc4-9674-ff5f5781b2bc",
  "상처 주지 않고 피드백 하는 법": "https://notebooklm.google.com/notebook/063c3a5f-cb3a-4ee7-96ec-951d6b64e07a",
  "ALEIAN City Nights / ALEIAN Route / ALEIAN Tap Trip": "https://notebooklm.google.com/notebook/1b47c550-db7d-436a-b7bb-13a27153f731",
  "행사 규모와 네트워킹 전략": "https://notebooklm.google.com/notebook/87850c46-7c4e-4305-8efa-9366ac931737",
  "Brewing the Future: Bio-Strategy and Fermentation Science": "https://notebooklm.google.com/notebook/99a4d843-99b1-42c0-9537-2af63a5b20d7",
  "Innovation Through Service Design: Market Revitalization Strategies": "https://notebooklm.google.com/notebook/3bed4c0f-7c5e-46e0-a44c-8314f4050042",
  "Simple AI Apps: Rapid Profit Strategy and Launch Guide": "https://notebooklm.google.com/notebook/9d8f3bd0-4db3-40c6-b480-4bc9b441180e",
  "한국 에듀테크 산업 및 디지털 교육혁신 시장 분석": "https://notebooklm.google.com/notebook/98c7e943-96ce-4fd5-8012-36eda1779ef5",
  "매출 10배 마케팅 핵심 원리: 객수 곱하기 객단가": "https://notebooklm.google.com/notebook/a13478da-82cd-4511-a395-11fcebff9941",
  "만다라트": "https://notebooklm.google.com/notebook/72ab7840-f8b7-446b-8779-ab43375f49cb",

  // === 2차 수집 URL ===
  "Context Engineering": "https://notebooklm.google.com/notebook/210a2769-1a80-4cd7-ade2-1c14741d7733",
  "음식페어링 가이드": "https://notebooklm.google.com/notebook/402280a5-6722-4488-99f4-0b1e30ea7df7",
  "코르크 바닥재": "https://notebooklm.google.com/notebook/74c75c46-69ed-45eb-9378-1dc06554bd41",
  "Building n8n Workflows with MCP and Natural Language prompts": "https://notebooklm.google.com/notebook/a26206c2-aff9-4adc-b5a7-988604845fcf",
  "Building Agentic GraphRAG with Middleware and Workflow Patterns": "https://notebooklm.google.com/notebook/d25ee1ef-6f91-4534-8880-226b96db9e93",
  "간판": "https://notebooklm.google.com/notebook/7a59909c-db01-47b8-8b1c-3d54202f4616",
  "걸러야 하는 사람 유형": "https://notebooklm.google.com/notebook/931379d8-41d1-499b-8336-999f53e8f1f8",
  "자영업 생존 공식: 한 방이 아닌 단계적 접근": "https://notebooklm.google.com/notebook/eeaf0c7f-17ca-4da4-9a83-04397692e91e",
  "GraphRAG 논문": "https://notebooklm.google.com/notebook/d25ee1ef-6f91-4534-8880-226b96db9e93",

  // === 3차 수집 URL ===
  "Vercel Skills and the Evolution of AI Agent Infrastructure": "https://notebooklm.google.com/notebook/2340ca03-8710-4019-bf0c-2aaf9dd613e4",
  "Zero Cost Forever: Hosting Your n8n Server on GCP": "https://notebooklm.google.com/notebook/75aa7d5a-3978-4a63-890c-cf98fa1e29e1",
  "홈서버": "https://notebooklm.google.com/notebook/937eb2ec-3ef4-4bba-b70b-993737ff0cd7",
  "매출 10배 마케팅 핵심 원리: 객수 곱하기 객단가": "https://notebooklm.google.com/notebook/6881b7f1-879a-4488-8c34-0ccee1995a19",
  "Mastering GraphRAG and Knowledge Graphs for AI Agents": "https://notebooklm.google.com/notebook/cfd4e166-405f-41f6-8ab5-15c69ac2756b",
  "Data 바우쳐": "https://notebooklm.google.com/notebook/17acc657-9deb-4df1-b054-aebc6b811dd5",
  "Short-Form Storytelling: Five Success Formulas for Viral Content": "https://notebooklm.google.com/notebook/f45f1dea-a52c-40f3-bd28-d3b9acc127da",
  "Essential Claude Code Updates: Memory, Simplified Batching, and Remote Control": "https://notebooklm.google.com/notebook/886bb590-d5a0-4d0f-9512-57d4f52710c9",
  "2026 AI Voucher Support Project and Startup Consulting Strategy": "https://notebooklm.google.com/notebook/4ed405d6-d4a7-44a2-afb0-58da27330a64",
  "안티그래비티,아두이노,라즈베리파이": "https://notebooklm.google.com/notebook/1fc3c736-b1cf-4508-86a9-68f62ad151ec",

  // === 4차 수집 URL ===
  "인간본성의 법칙": "https://notebooklm.google.com/notebook/632af6bb-4250-4038-bf86-729cb2079cc8",
  "2025년 지원사업": "https://notebooklm.google.com/notebook/211b0bb3-2cd2-48b9-8087-d7576cdf05dd",
  "논백 논문": "https://notebooklm.google.com/notebook/7cee728c-8e02-42f7-8734-fc4dc093e796",
  "Mastering Claude Code: Boris's Five Multi-Agent Strategies": "https://notebooklm.google.com/notebook/6bac8473-97c4-4ace-b6f1-f967f7d5d8dd",
  "온라인 비즈니스 퍼널": "https://notebooklm.google.com/notebook/7bc529f9-6627-42ca-959c-7c60ec11b38d",
  "RFP를 제안서로 만들기": "https://notebooklm.google.com/notebook/a1a55a0c-f4e7-4f93-8d36-0db9261d0e89",
  "Automating Development Workflows with OpenClaw and Mac Mini": "https://notebooklm.google.com/notebook/f85442ff-1e6b-4a69-9535-34dedaf63912",
  "2025-2026 Global AI Pet Healthcare Market and Technology Report": "https://notebooklm.google.com/notebook/a4b6b4d3-7593-4e95-8f25-2f62735f082a",
  "Building Private Local Vision AI Websites with Qwen2-VL": "https://notebooklm.google.com/notebook/5102cc55-14fc-4f1e-9154-442e44a2f324",
  "장수경제": "https://notebooklm.google.com/notebook/ebab6b51-f341-454b-a624-d84ddf4de1bf",
  "사업계회서 작성": "https://notebooklm.google.com/notebook/918344ea-46c7-4bab-bd8a-f2d95b1cb138",
  "Mastering Antigravity: Advanced MCP Settings for Gemini AI Coding": "https://notebooklm.google.com/notebook/e93947dc-04af-4f11-8b6e-a3b8a7e791d3",
  "2021 Beer Style Judging and Classification Guidelines": "https://notebooklm.google.com/notebook/e37ee4af-9e61-4948-a0c7-41ca94669ed2",
  "Google Web MCP: Solving AI Agent Browser Limitations": "https://notebooklm.google.com/notebook/400f50c1-9caa-4628-bd09-b90bd615fbdf",
  "The Rockefeller Waterfall: Building a Perpetual Family Bank": "https://notebooklm.google.com/notebook/b5305f4e-2d4f-48f3-9ac4-0a6f18034a06",
  "운과 커리어": "https://notebooklm.google.com/notebook/f651ac88-1896-4991-af4b-7bc4a566d2dc",
  "폰없는 미래": "https://notebooklm.google.com/notebook/8e9a8a15-62ff-40a1-a141-3bb20ee9e6bb",

  // === 5차 수집 URL ===
  "skills (단독)": "https://notebooklm.google.com/notebook/13f00220-859d-4fcf-a44f-03c53c813972",
  "Full-Stack Development with Google AI Studio and Antigravity": "https://notebooklm.google.com/notebook/b2674929-f81e-4330-9969-49598b799f31",
  "The 95 Percent System: Mastering AI Workflow Engineering": "https://notebooklm.google.com/notebook/3e4811da-5c68-4de2-8420-bb6a09354b7c",
  "Installing OpenClaw on Windows and Creating AI Agents": "https://notebooklm.google.com/notebook/2271df4a-c1b1-40a8-8c63-5fd905c95ffd",
  "Transforming Old Laptops into Private OpenClaw AI Servers": "https://notebooklm.google.com/notebook/9764ceac-65f2-44ed-b647-d224c52f7e62",
  "The AI Safety Expert: Roman Yampolskiy on Super Intelligence Risks": "https://notebooklm.google.com/notebook/fc35a791-7ccf-4aa0-8c44-ca2ec253f7c4",
  "Google Gemini Gems: Zero-Code AI Workflow Automation Guide": "https://notebooklm.google.com/notebook/1923ee7e-16cc-4d9d-9f00-5a044c3a1c8b",
  "Professional Profile and Brewing Career of Yun Hyeon": "https://notebooklm.google.com/notebook/4ad735d2-707d-4e88-984b-687039f9c9eb",
  "The Rise of Clawdbot: A Local AI Paradigm Shift": "https://notebooklm.google.com/notebook/49ca0609-a791-4095-b468-bcc98ff4489e",
  "The Architecture of AI Hallucinations and How to Tame Them": "https://notebooklm.google.com/notebook/dcfcb954-e61e-4e59-aef4-2dbd8ceb5f85",
  "AI Business Plan Writing Strategies with Gemini": "https://notebooklm.google.com/notebook/a556182f-bc0a-4efe-b2cb-b091f17b7edb",
  "AI Agentic Smart Collar Development Strategy": "https://notebooklm.google.com/notebook/7c642cc3-2187-422c-8b3a-3c72d567ce48",
  "Domestic Pet Care and Monitoring Robotics Market Analysis": "https://notebooklm.google.com/notebook/a6aecbe2-ab69-4f53-8951-bd59a9c7b17d",
  "Psychological Archetypes in Brand Identity": "https://notebooklm.google.com/notebook/eddc75c7-d840-43ff-9e66-05c5dffd8242",
  "Cornering Success: How Mo Seori Conquered the Global Market": "https://notebooklm.google.com/notebook/04b161df-99d1-402f-81b1-b711bf3c150e",
  "Beyond Traffic: Master the Psychology of High-Value Conversion": "https://notebooklm.google.com/notebook/c9ad0669-f0cc-4b56-88e4-6c14873f460f",
  "2026 Monthly Fortune and Financial Success Guide": "https://notebooklm.google.com/notebook/294784a0-5b72-4209-bac1-81a1b5eec63e",
  "2026 지원사업": "https://notebooklm.google.com/notebook/51a655fc-4113-46dd-9efa-520d251d82b3",
  "2026 농지연금 가입 자격 및 수령액 완전 가이드": "https://notebooklm.google.com/notebook/f47f7242-d236-4486-a33b-f26ba484cc26",
  "2026 AI Basic Act: A Comprehensive Guide to New Rules": "https://notebooklm.google.com/notebook/eab8bd35-c841-4334-994b-84d860cf163f",
  "에일리언브루잉 용역: Regional Beer Development Report": "https://notebooklm.google.com/notebook/63289999-4405-48c4-b0bf-8b0456b2a589",
  "존 어리 <모빌리티(Mobilities)>": "https://notebooklm.google.com/notebook/6f780e87-b551-48eb-8c7a-dfd91ad5f135",
  "Local LLM": "https://notebooklm.google.com/notebook/54489ee2-a6cf-47f1-a5e6-4be134540cf3"
};

/** DB에서 모든 페이지 가져오기 */
async function getAllPages() {
  let allPages = [];
  let cursor = undefined;
  
  do {
    const body = cursor ? { start_cursor: cursor } : {};
    const res = await notionAPI.post(`/databases/${DATABASE_ID}/query`, body);
    allPages = allPages.concat(res.data.results);
    cursor = res.data.has_more ? res.data.next_cursor : null;
  } while (cursor);
  
  return allPages;
}

/** 페이지의 NotebookLM Link 필드 업데이트 */
async function updateLink(pageId, url) {
  await notionAPI.patch(`/pages/${pageId}`, {
    properties: {
      'NotebookLM Link': { url }
    }
  });
}

async function main() {
  console.log('\n🔗 NotebookLM 링크 업데이트 시작\n');
  
  // DB의 모든 페이지 가져오기
  console.log('📋 Notion DB에서 전체 페이지 목록 조회 중...');
  const pages = await getAllPages();
  console.log(`✅ 총 ${pages.length}개 페이지 발견\n`);
  
  let updated = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const page of pages) {
    const titleArr = page.properties?.Title?.title;
    if (!titleArr || titleArr.length === 0) continue;
    
    const title = titleArr[0].plain_text;
    const url = NOTEBOOK_URLS[title];
    
    if (url) {
      try {
        await updateLink(page.id, url);
        updated++;
        process.stdout.write(`✅ [${updated}] ${title.substring(0, 50)}\r`);
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error(`\n❌ 실패: ${title} — ${err.response?.data?.message || err.message}`);
      }
    } else {
      notFound++;
      notFoundList.push(title);
    }
  }

  console.log('\n\n=== 업데이트 완료 ===');
  console.log(`🔗 링크 업데이트: ${updated}개`);
  console.log(`⚠️  URL 없음 (수동 추가 필요): ${notFoundList.length}개`);
  if (notFoundList.length > 0) {
    console.log('\nURL 없는 노트북 목록:');
    notFoundList.forEach((t, i) => console.log(`  ${i+1}. ${t}`));
  }
}

main().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
