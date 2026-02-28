require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// 환경변수에서 토큰과 챗 ID 불러오기
const token = process.env.TELEGRAM_BOT_TOKEN;
const masterChatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error("❌ 오류: .env 파일에 TELEGRAM_BOT_TOKEN이 설정되지 않았습니다.");
  process.exit(1);
}

// Polling 방식으로 봇 실행
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 텔레그램 IoT 제어 봇(시뮬레이션)이 실행되었습니다.');
console.log('텔레그램 앱에서 봇에게 /status, /on, /off 명령어를 보내보세요!');

// 상태 확인 로직
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '✅ 현재 시스템은 정상 작동 중입니다.\n🌡️ 가상 실내 온도: 24℃\n💡 기기 상태: 대기중');
});

// 기기 켜기 (인가된 사용자만)
bot.onText(/\/on/, (msg) => {
  const chatId = msg.chat.id;
  
  if (masterChatId && chatId.toString() !== masterChatId) {
    return bot.sendMessage(chatId, '🚫 기기를 제어할 권한이 없습니다.');
  }
  
  console.log('[동작 수행] 릴레이 켜기 신호 발생!');
  bot.sendMessage(chatId, '💡 릴레이(전원)를 켰습니다.');
});

// 기기 끄기 (인가된 사용자만)
bot.onText(/\/off/, (msg) => {
  const chatId = msg.chat.id;
  
  if (masterChatId && chatId.toString() !== masterChatId) {
    return bot.sendMessage(chatId, '🚫 기기를 제어할 권한이 없습니다.');
  }
  
  console.log('[동작 수행] 릴레이 끄기 신호 발생!');
  bot.sendMessage(chatId, '🔌 릴레이(전원)를 껐습니다.');
});

// 봇 에러 처리
bot.on('polling_error', (error) => {
  console.error('[텔레그램 통신 에러]:', error.code, error.message);
});
