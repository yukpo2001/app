---
name: email_organizer
description: "AI 기반 이메일 분석 및 분류 스킬. Gmail의 메일을 노션에 정리하고, 디스코드로 브리핑을 보내며, 디스코드 명령어로 이메일 답장 및 캘린더 일정 추가를 수행합니다."
version: 1.0.0
requires:
  packages:
    - googleapis
    - "@notionhq/client"
    - discord.js
    - dotenv
---

# AI 이메일 비서 (Email Organizer) 스킬

**Gmail + Notion + Claude + Discord**를 결합하여 이메일을 자동으로 분석 및 정리하고, 디스코드에서 바로 이메일 답장이나 일정 추가를 지시할 수 있는 파워풀한 시스템입니다.

---

## 🏗️ 아키텍처 및 데이터 흐름

1. **[수집] Gmail API**: 주기적으로(예: 30분) `yukpo2001@gmail.com`의 읽지 않은 메일을 가져옵니다.
2. **[분석] AI (Claude/LLM)**: 메일 본문을 분석해 중요도, 시급성, 3줄 요약, 액션 아이템(Action Item)을 추출합니다.
3. **[저장] Notion DB**: 분석된 데이터를 노션 '이메일 인박스' 데이터베이스에 저장합니다. (`notion-db` 스킬 활용)
4. **[보고] Discord Bot**: 중요도나 시급성이 높은 메일은 디스코드 채널에 즉시 내역(보낸사람, 요약, 이메일 고유 ID)을 보고합니다.
5. **[액션] Discord Command**: 디스코드 채팅창에서 `!답장` 또는 `!일정` 명령어를 입력하면 봇이 해당 이메일에 대한 추가 액션을 수행합니다.

---

## 🛠️ 환경 변수 설정 (`.env`)

```ini
# Gmail API
GMAIL_CLIENT_ID="xxx"
GMAIL_CLIENT_SECRET="xxx"
GMAIL_REFRESH_TOKEN="xxx"

# Notion (notion-db 참조)
NOTION_TOKEN="secret_xxx"
NOTION_EMAIL_DB_ID="xxx"

# Discord (discord_bot 참조)
DISCORD_BOT_TOKEN="xxx"
DISCORD_CHANNEL_ID="xxx" # 보고를 받을 전용 채널 ID
DISCORD_ADMIN_ID="xxx"   # 사용자 본인의 ID (권한 제어용)
```

---

## 🚀 디스코드 인터페이스 (메시지 및 명령어)

디스코드 봇은 메일을 수신하면 예쁜 **Embed UI**를 통해 사용자에게 브리핑합니다.

### 1. 신규 메일 도착 알림 (Embed)
봇이 채널에 보내는 메시지 예시입니다. 하단에 이메일 관리를 위한 고유 `Email_ID`가 부여됩니다.

```text
🚨 [긴급/중요 메일 도착]
제목: 차주 프로젝트 킥오프 미팅 일정 조율 건
보낸사람: 김철수 팀장 (chulsoo@example.com)
요약: 
- 다음 주 수요일 오후 2시 킥오프 미팅 제안.
- 참석 가능 여부 회신 요망.

추출된 액션: 참석 가능 여부 답장 및 캘린더 등록
Email_ID: #msg1234
```

### 2. 디스코드 제어 명령어

사용자는 디스코드 채팅창에 명령어를 입력하여 봇에게 액션을 지시할 수 있습니다. 봇은 사용자의 메시지를 감지하여 Gmail API나 Calendar API를 호출합니다.

#### ✉️ 명령어 1: 이메일 답장 (`!답장`)
디스코드에서 바로 메일에 답장을 보냅니다. AI가 작성한 초안을 보낼 수도 있고, 사용자가 직접 내용을 적어 보낼 수도 있습니다.

*   **사용법**: `!답장 [Email_ID] [답장 내용]`
*   **예시**: `!답장 #msg1234 알겠습니다. 수요일 오후 2시에 뵙겠습니다.`
*   **동작 로직**:
    1. 봇이 `Email_ID`를 기반으로 원본 메일의 `Message-ID`를 찾습니다.
    2. 사용자 입력 내용을 바탕으로 Gmail API를 호출하여 답장(Reply)을 전송합니다.
    3. 전송 완료 후 노션 DB의 해당 항목 상태를 "처리 완료"로 변경합니다.
    4. 디스코드에 "✅ 답장이 성공적으로 전송되었습니다." 라고 피드백합니다.

#### 📅 명령어 2: 캘린더 등록 (`!일정`)
메일 내용에 포함된 날짜와 시간을 바탕으로 노션 캘린더(또는 구글 캘린더)에 일정을 추가합니다.

*   **사용법**: `!일정 [Email_ID]`
*   **예시**: `!일정 #msg1234`
*   **동작 로직**:
    1. 봇이 해당 이메일의 AI 요약 또는 원본 텍스트를 다시 LLM에 보내 "일정 제목, 시작 시간, 종료 시간"을 정확한 ISO Date 포맷으로 추출합니다.
    2. 구글 캘린더 API(또는 노션 API)를 호출하여 캘린더에 일정을 삽입합니다.
    3. 디스코드에 "📅 수요일 오후 2시: [프로젝트 킥오프] 일정이 캘린더에 등록되었습니다." 라고 피드백합니다.

#### 🧠 명령어 3: 추가 요약/질문 (`!질문`)
긴 메일의 구체적인 내용이 궁금할 때 원본 메일을 읽어주는 기능입니다.

*   **사용법**: `!질문 [Email_ID] [궁금한 점]`
*   **예시**: `!질문 #msg1234 킥오프 미팅 장소가 어디야?`
*   **동작 로직**: AI가 원본 메일 텍스트를 컨텍스트로 삼아 사용자의 질문에 답변합니다.

---

## 💻 핵심 코드 패턴 (discord.js 템플릿)

봇의 메시지 감지 및 명령어 처리 부분 예시입니다.

```javascript
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 권한 검사: 본인(ADMIN_ID)만 명령어 사용 가능
  if (message.author.id !== process.env.DISCORD_ADMIN_ID) return;

  const args = message.content.split(' ');
  const command = args[0]; // '!답장', '!일정' 등

  // 1. 답장 기능
  if (command === '!답장') {
    const emailId = args[1]; // #msg1234
    const replyContent = args.slice(2).join(' ');

    if (!emailId || !replyContent) {
      return message.reply('📝 사용법: !답장 [Email_ID] [답장할 내용]');
    }

    // TODO: Gmail API 로직 (replyToEmail 함수 호출)
    // await replyToEmail(emailId, replyContent);
    
    // TODO: Notion 로직 (해당 메일 DB 속성 상태 업데이트)
    
    message.reply(`✅ **${emailId}** 메일에 성공적으로 답장을 보냈습니다.\n> "${replyContent}"`);
  }

  // 2. 일정 등록 기능
  if (command === '!일정') {
    const emailId = args[1];

    if (!emailId) {
      return message.reply('📅 사용법: !일정 [Email_ID]');
    }

    message.reply(`⏳ **${emailId}** 메일 내용을 분석하여 일정을 등록 중입니다...`);

    // TODO: AI 추출 및 Calendar API 로직
    // const eventDetails = await extractEventFromEmail(emailId);
    // await createCalendarEvent(eventDetails);

    message.reply(`📅 일정 등록 완료! (구글 캘린더/노션 동기화됨)`);
  }
});
```

---

## 💡 개발 단계 가이드

이 스킬을 실제로 구현하기 위해서는 다음 순서대로 작업을 진행하는 것을 권장합니다.

1. **Notion DB 셋업**: `notion-db` 스킬을 참고하여 이메일 정리용 DB부터 생성합니다.
2. **Gmail API 연동**: Node.js 환경에서 Google OAuth2 인증을 받아 받은편지함을 긁어오는 스크립트를 테스트합니다.
3. **AI 프롬프트 작성**: 메일 본문을 넣어 JSON 형태(중요도, 시급성, 액션)로 돌려받는 로직을 모듈화합니다.
4. **Discord Bot 연동**: `discord_bot` 스킬을 참고하여 봇을 만들고, 위의 시스템 코드(Embed 생성, `!명령어` 처리)를 붙입니다.
5. **명령어 액션 통합**: 디스코드 채팅창에 `!답장` 입력 시 실제 Gmail 송신 API가 호출되도록 연결합니다.
