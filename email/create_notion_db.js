require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function createDatabase() {
  try {
    const response = await notion.search({
      filter: {
        value: 'page',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 1
    });

    if (response.results.length === 0) {
      console.log("No pages found in the workspace to create a database under.");
      console.log("Please make sure you have shared at least one page with your Notion integration.");
      return;
    }

    const parentPageId = response.results[0].id;
    console.log(`Creating database under page: ${parentPageId}`);

    const newDb = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "📧 AI 이메일 비서 (Email Organizer)",
          },
        },
      ],
      properties: {
        "제목": {
          title: {},
        },
        "보낸 사람": {
          rich_text: {},
        },
        "수신 일시": {
          date: {},
        },
        "중요도": {
          select: {
            options: [
              { name: "🔴 High", color: "red" },
              { name: "🟡 Medium", color: "yellow" },
              { name: "⚪ Low", color: "gray" },
            ],
          },
        },
        "시급성": {
          select: {
            options: [
              { name: "⚡ 긴급", color: "red" },
              { name: "📅 보통", color: "blue" },
              { name: "💤 보류", color: "default" },
            ],
          },
        },
        "AI 요약": {
          rich_text: {},
        },
        "액션 아이템": {
          rich_text: {},
        },
        "처리 상태": {
          status: {
            options: [
              { name: "할 일", color: "red" },
              { name: "처리 완료", color: "green" },
            ]
          },
        },
        "원본 링크": {
          url: {},
        },
        "Email_ID": {
          rich_text: {},
        },
      },
    });
    console.log("Database created successfully!");
    console.log(`Database ID: ${newDb.id}`);
    console.log(`URL: ${newDb.url}`);
  } catch (error) {
    if (error.body) {
         console.error("Error creating database:", error.body);
    } else {
         console.error("Error creating database:", error);
    }
  }
}

createDatabase();
