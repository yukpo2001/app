const https = require('https');

const token = process.env.NOTION_TOKEN;

async function createDatabase() {
  const options = {
    hostname: 'api.notion.com',
    path: '/v1/search',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  };

  const reqSearch = https.request(options, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (!result.results || result.results.length === 0) {
        console.log("No pages found. Please share a page with the integration.");
        return;
      }
      
      const parentPageId = result.results[0].id;
      console.log(`Using Parent Page ID: ${parentPageId}`);

      const createOptions = {
        hostname: 'api.notion.com',
        path: '/v1/databases',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      };

      const createReq = https.request(createOptions, (createRes) => {
        let createData = '';
        createRes.on('data', d => createData += d);
        createRes.on('end', () => {
          const createResult = JSON.parse(createData);
          if (createRes.statusCode !== 200) {
             console.error("Failed to create DB:", createData);
             return;
          }
          console.log(`Database Created! ID: ${createResult.id}`);
          console.log(`URL: ${createResult.url}`);
        });
      });

      const body = JSON.stringify({
        parent: { type: "page_id", page_id: parentPageId },
        title: [ { type: "text", text: { content: "📧 AI 이메일 비서 (Email Organizer)" } } ],
        properties: {
          "제목": { title: {} },
          "보낸 사람": { rich_text: {} },
          "수신 일시": { date: {} },
          "중요도": {
            select: {
              options: [
                { name: "🔴 High", color: "red" },
                { name: "🟡 Medium", color: "yellow" },
                { name: "⚪ Low", color: "gray" }
              ]
            }
          },
          "시급성": {
            select: {
              options: [
                { name: "⚡ 긴급", color: "red" },
                { name: "📅 보통", color: "blue" },
                { name: "💤 보류", color: "default" }
              ]
            }
          },
          "AI 요약": { rich_text: {} },
          "액션 아이템": { rich_text: {} },
          "처리 상태": {
            select: {
              options: [
                { name: "할 일", color: "red" },
                { name: "처리 완료", color: "green" }
              ]
            }
          },
          "원본 링크": { url: {} },
          "Email_ID": { rich_text: {} }
        }
      });

      createReq.write(body);
      createReq.end();
    });
  });

  reqSearch.write(JSON.stringify({
    filter: { value: 'page', property: 'object' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
    page_size: 1
  }));
  reqSearch.end();
}

createDatabase();
