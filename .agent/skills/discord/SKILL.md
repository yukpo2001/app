---
name: discord_bot
description: 디스코드 봇(Discord.js)을 활용하여 기기를 제어하고, 센서 데이터를 예쁜 UI(Embed)로 모니터링하며, 양방향 통신을 구현하는 패턴. IoT 및 스마트홈 자동화에 매우 적합합니다.
---

# Discord Bot Integration Skill

이 스킬은 `discord.js` 라이브러리를 사용하여 로컬 서버(라즈베리 파이, PC 등)와 디스코드 채널 간의 양방향 통신을 구축하는 표준 방법을 설명합니다. 텔레그램보다 더 풍부한 UI 표출이 가능합니다.

## 1. 디스코드 봇 생성 및 설정 (사전 준비)

1. [Discord Developer Portal](https://discord.com/developers/applications) 에 접속 후 로그인합니다.
2. 우측 상단의 **New Application**을 클릭하고 앱(봇) 이름을 설정합니다.
3. 좌측 메뉴의 **Bot** 탭으로 이동합니다.
   - **Reset Token** 버튼을 눌러 봇 토큰(Token)을 발급받고 절대 유출되지 않게 복사합니다. (`.env`의 `DISCORD_BOT_TOKEN`)
   - 하단의 **Privileged Gateway Intents** 섹션에서 **Message Content Intent**를 반드시 켜주세요(활성화). (채팅 내용을 읽기 위함)
4. 좌측 메뉴의 **OAuth2 -> URL Generator** 로 이동합니다.
   - **Scopes** 영역에서 `bot` 에 체크합니다.
   - 하단에 나타나는 **Bot Permissions** 에서 `Send Messages`, `Read Message History`, `View Channels` 에 체크합니다.
5. 맨 아래에 생성된 URL을 복사한 뒤, 인터넷 창에 붙여넣기 하여 본인이 관리자인 디스코드 서버(채널)에 봇을 초대합니다.

## 2. 기본 연동 패턴 (Node.js 예시 - discord.js v14)

### 2.1. 설치
```bash
npm install discord.js dotenv
```

### 2.2. 기본 봇 구성 및 명령어 수신

```javascript
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // 메시지 내용을 읽기 위한 필수 인텐트
  ],
});

client.once('ready', () => {
  console.log(`✅ 디스코드 봇이 준비되었습니다! 로그인 계정: ${client.user.tag}`);
});

// 채팅 메시지 감지
client.on('messageCreate', (message) => {
  // 봇 자신이 보낸 메시지는 무시 (무한루프 방지)
  if (message.author.bot) return;

  // '!명령어' 형태로 제어
  if (message.content === '!status') {
    // 예쁜 카드(Embed) 형태로 상태 전송
    const statusEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📊 시스템 상태 보고')
      .addFields(
        { name: '온도', value: '24℃', inline: true },
        { name: '습도', value: '45%', inline: true },
        { name: '기기 상태', value: '정상 작동 (대기중)' }
      )
      .setTimestamp();

    message.reply({ embeds: [statusEmbed] });
  }
});

// 토큰으로 봇 서버 로그인
client.login(process.env.DISCORD_BOT_TOKEN);
```

## 3. IoT 기기 제어 패턴 (!on, !off)

디스코드 서버에 있는 특정권한자(자신)나 특정 채널에서만 기기를 켜고 끌 수 있도록 보안 로직을 추가하는 것이 중요합니다.

```javascript
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  // 특정 사용자(Admin ID)만 제어 가능하도록 막기
  const adminId = process.env.DISCORD_ADMIN_ID; // 자신의 디스코드 계정 ID (숫자)
  
  if (message.content === '!on') {
    if (adminId && message.author.id !== adminId) {
      return message.reply('🚫 릴레이를 제어할 권한이 없습니다.');
    }
    // TODO: 라즈베리 파이 GPIO 제어 (릴레이 ON)
    message.reply('💡 릴레이(전원)를 **켰습니다**.');
  }

  if (message.content === '!off') {
    if (adminId && message.author.id !== adminId) {
      return message.reply('🚫 릴레이를 제어할 권한이 없습니다.');
    }
    // TODO: 라즈베리 파이 GPIO 제어 (릴레이 OFF)
    message.reply('🔌 릴레이(전원)를 **껐습니다**.');
  }
});
```

## 4. 능동적 알림(Push) 패턴

온도가 비정상으로 올라가거나 센서가 이벤트를 감지하면, 디스코드의 특정 '알림 채널'로 먼저 메시지를 보냅니다.

```javascript
function sendAlertToDiscord(alertMsg) {
  // 알림을 보낼 특정 방(채널) ID
  const channelId = process.env.DISCORD_ALERT_CHANNEL_ID; 
  const channel = client.channels.cache.get(channelId);
  
  if (channel) {
    channel.send(`⚠️ **[위험 감지]** ${alertMsg}`);
  }
}

// 활용 예시 - 루프 모니터링
// setInterval(() => {
//   if (currentTemp >= 30) {
//     sendAlertToDiscord('온도가 30도를 초과했습니다. 에어컨을 켜는 것이 좋습니다.');
//   }
// }, 10000);
```

## 5. 보안 및 팁
1. **User ID 확인법:** 디스코드 앱 설정 -> 고급 -> '개발자 모드'를 켜고, 채팅창에서 자신의 프로필을 우클릭하여 'ID 복사'를 누르면 숫자 18자리(내 ID)를 얻을 수 있습니다. 채널을 우클릭하여 'ID 복사'를 누르면 채널 ID를 얻습니다.
2. **토큰 보안:** `.env` 파일에 저장하고 절대 Github에 올리지 마세요. 디스코드에서 유출을 감지하면 즉시 토큰을 강제 만료시킵니다.
