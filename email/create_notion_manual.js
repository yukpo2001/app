require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function createManualPage() {
  try {
    // 1. Find a parent page
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
      console.log("No parent page found in the workspace.");
      return;
    }

    const parentPageId = response.results[0].id;
    console.log(`Creating manual under page: ${parentPageId}`);

    // 2. Create the page with blocks
    const newPage = await notion.pages.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      icon: {
        type: "emoji",
        emoji: "📖"
      },
      cover: {
        type: "external",
        external: {
          url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=2000&auto=format&fit=crop"
        }
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: "AI 이메일 비서 (Email Organizer) 사용 설명서",
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: "🚀 개요" } }]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "이 시스템은 Gmail, Notion, AI(Gemini 2.5), 그리고 Discord를 결합하여 귀하의 이메일을 자동으로 분석 및 정리해주는 스마트 개인 비서입니다.",
                }
              }
            ]
          }
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "✨ 주요 기능" } }]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "자동 이메일 수집: 읽지 않은 메일을 주기적으로 탐지합니다." } }]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "스마트 AI 요약: 긴 메일을 3줄로 핵심만 요약해주고 액션 아이템을 추출합니다." } }]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "노션 DB 자동 저장: 메일의 제목, 수신일, 분석 결과를 노션에 깔끔하게 표 형태로 저장합니다." } }]
          }
        },
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "디스코드 긴급 알림: '중요' 하거나 '긴급' 한 이메일일 경우에만 디스코드로 푸시 알림을 즉시 전송합니다." } }]
          }
        },
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: "💬 디스코드 봇 명령어 가이드" } }]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "디스코드 채널 채팅창에 아래 명령어를 입력하여 봇을 제어할 수 있습니다. (현재 개발/업데이트 중)",
                }
              }
            ]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "1. 메일 곧바로 답장하기" } }]
          }
        },
        {
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: "!답장 [Email_ID] [보낼메시지내용]" } }],
            language: "markdown"
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "예시: !답장 1968eb1a123 네 확인했습니다. 다음주 회의때 뵙겠습니다." } }]
          }
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "2. 캘린더에 일정 등록하기" } }]
          }
        },
        {
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: "!일정 [Email_ID]" } }],
            language: "markdown"
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "AI가 메일 속 시간/장소를 파악해 일정을 자동 등록합니다." } }]
          }
        },
        {
          object: "block",
          type: "divider",
          divider: {}
        },
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "⚙️ 봇 실행 방법" } }]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "VS Code나 로컬 터미널을 열고 다음 명령어를 실행해 둔 상태를 유지해야 알림이 수신됩니다:",
                }
              }
            ]
          }
        },
        {
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: "node discord_bot.js" } }],
            language: "bash"
          }
        }
      ]
    });

    console.log("Manual Page created successfully!");
    console.log(`URL: ${newPage.url}`);

  } catch (error) {
    console.error("Error creating manual:", error.body || error);
  }
}

createManualPage();
