---
name: telegram_bot
description: 텔레그램 봇(Telegram Bot) API를 활용하여 사용자에게 알림을 전송하고, 채팅 명령어를 통해 기기나 앱을 제어하는 패턴을 제공합니다. IoT 및 자동화 프로젝트에 적합합니다.
---

# Telegram Bot Integration Skill

이 스킬은 텔레그램 봇을 생성하고 앱(Node.js, Python 등)과 연동하여 메시지를 주고받는 표준화된 방법을 설명합니다. 특히 라즈베리파이나 아두이노와 같은 IoT 기기 제어 및 상태 모니터링에 유용하게 쓰일 수 있습니다.

## 1. 텔레그램 봇 생성 및 설정 (사전 준비)

1. 텔레그램 앱에서 **BotFather**(`@BotFather`)를 검색하여 대화를 시작합니다.
2. `/newbot` 명령어를 입력하여 새로운 봇을 생성합니다.
3. 봇의 이름과 username(반드시 `bot`으로 끝나야 함)을 설정합니다.
4. BotFather가 발급해주는 **HTTP API Token**을 안전한 곳에 복사합니다. (`.env` 파일에 `TELEGRAM_BOT_TOKEN`으로 저장)
5. 생성한 봇을 텔레그램에서 검색하여 대화를 시작(Start 단추 클릭)합니다.
6. 브라우저에서 아래 주소로 접속하여 자신의 **Chat ID**를 확인합니다.
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   응답된 JSON 내용 중 `message.chat.id` 값을 확인하여 `.env` 파일에 `TELEGRAM_CHAT_ID`로 저장합니다.

## 2. 기본 연동 패턴 (Node.js 예시 - node-telegram-bot-api)

가장 널리 쓰이는 `node-telegram-bot-api` 라이브러리를 기반으로 한 연동 패턴입니다.

### 2.1. 설치
```bash
npm install node-telegram-bot-api dotenv
```

### 2.2. 기본 봇 구성 및 메시지 수신 (Polling 방식)
IoT 기기 제어용 로컬 서버(라즈베리파이)에서는 고정 IP나 포트포워딩이 필요 없는 Polling 방식이 매우 유리합니다.

```javascript
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// 토큰 셋업 및 Polling 방식으로 봇 실행
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('텔레그램 제어 봇이 실행되었습니다.');

// 상태 확인 명령어 처리 (예: /status)
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  // TODO: 온도 센서나 기기 상태를 읽어오는 로직 추가
  bot.sendMessage(chatId, '✅ 현재 시스템은 정상 작동 중이며, 실내 온도는 24℃입니다.');
});
```

## 3. IoT 기기 제어 패턴

사용자가 텔레그램 챗봇에 명령어를 입력하여 집 안에 있는 기기(예: LED, 릴레이 스위치)를 켜고 끄는 패턴입니다.

### 3.1. 기기 제어 명령어 예시 (`/on`, `/off`)
```javascript
// 기기 켜기 명령어
bot.onText(/\/on/, (msg) => {
  const chatId = msg.chat.id;
  
  // 보안: 인가된 사용자(본인)만 제어할 수 있도록 Chat ID 검사
  if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
    return bot.sendMessage(chatId, '🚫 기기를 제어할 권한이 없습니다.');
  }
  
  // TODO: 라즈베리파이/아두이노 GPIO 제어 코드 실행 (예: 릴레이 ON)
  // turnOnRelay(); 
  
  bot.sendMessage(chatId, '💡 릴레이(전원)를 켰습니다.');
});

// 기기 끄기 명령어
bot.onText(/\/off/, (msg) => {
  const chatId = msg.chat.id;
  
  if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
    return bot.sendMessage(chatId, '🚫 기기를 제어할 권한이 없습니다.');
  }
  
  // TODO: 라즈베리파이/아두이노 GPIO 제어 코드 실행 (예: 릴레이 OFF)
  // turnOffRelay();
  
  bot.sendMessage(chatId, '🔌 릴레이(전원)를 껐습니다.');
});
```

## 4. 능동적 알림(Push Notification) 패턴

서버(라즈베리파이)에서 특정 이벤트(온도 이상, 움직임 감지 센서 작동 등)가 발생했을 때 사용자에게 먼저 스마트폰으로 알림(푸시 메시지)을 보내는 패턴입니다.

```javascript
// 특정 이벤트 감지 시 텔레그램으로 경고 전송
function sendAlertMessage(alertText) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  // 메시지만 전송할 때는 polling 옵션 없이 봇 인스턴스 생성 가능
  const notiBot = new TelegramBot(token, { polling: false });
  
  notiBot.sendMessage(chatId, `⚠️ [경고 알림]\n${alertText}`)
    .then(() => console.log('알림 전송 성공'))
    .catch((error) => console.error('알림 전송 실패:', error.message));
}

// 활용 예: 센서 모니터링 루프 내에서 호출
// setTimeout(() => {
//   if (currentTemp > 30) {
//     sendAlertMessage('현재 온도가 30도를 초과했습니다. 에어컨을 가동할까요? (/on)');
//   }
// }, 5000);
```

## 5. 보안 및 모범 사례 (Best Practices)
1. **Chat ID 화이트리스트 검증:** 봇 이름만 알면 누구나 봇에게 메시지를 보낼 수 있습니다. 집 안의 기기를 제어하는 치명적인 명령어는 반드시 메시지를 보낸 사람의 `chat.id`가 사용자의 고유 Chat ID와 일치하는지 확인해야 합니다.
2. **에러 핸들링 및 안정성 재시도:** 인터넷 연결 끊김 등 네트워크 문제로 텔레그램 API 서버 접속에 실패하면 Node 앱이 튕길 수 있습니다. 이를 방지하기 위해 `polling_error`를 핸들링해 줍니다.
   ```javascript
   bot.on('polling_error', (error) => {
     console.error('[Telegram Bot Polling Error]:', error.code, error.message);
   });
   ```
3. **토큰 하드코딩 금지:** 텔레그램 봇 토큰은 비밀번호와 같습니다. 소스코드에 하드코딩하지 말고 반드시 `.env` 등을 사용하여 환경변수에서 불러오세요. Github에 코드가 유출되면 악용될 수 있습니다.
