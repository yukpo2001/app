require('dotenv').config();
const axios = require('axios');

/**
 * Discord Webhook으로 알림 전송
 * @param {object} options - 알림 옵션
 * @param {string} options.title - 임베드 제목
 * @param {string} options.description - 임베드 설명
 * @param {string} options.color - 임베드 색상 (hex 10진수)
 * @param {Array} options.fields - 임베드 필드 목록 [{name, value, inline}]
 */
async function sendDiscordNotification({ title, description, color = 0x7289da, fields = [] }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl === 'your_discord_webhook_url_here') {
    console.warn('⚠️  Discord Webhook URL이 설정되지 않았습니다. .env 파일의 DISCORD_WEBHOOK_URL을 업데이트하세요.');
    return;
  }

  try {
    const embed = {
      title,
      description,
      color,
      fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'NotebookLM → Notion 자동화 시스템 | Antigravity'
      }
    };

    await axios.post(webhookUrl, {
      username: '📚 NotebookLM Bot',
      avatar_url: 'https://ssl.gstatic.com/notebooklm/icon/notebooklm-logo.png',
      embeds: [embed]
    });
    
    console.log('✅ Discord 알림 전송 완료');
  } catch (error) {
    console.error('❌ Discord 알림 전송 실패:', error.message);
  }
}

/**
 * 일일 갱신 완료 알림
 * @param {object} stats - 통계 정보
 */
async function sendDailyUpdateNotification(stats) {
  const { updated, added, failed, totalNotebooks } = stats;
  
  await sendDiscordNotification({
    title: '📚 NotebookLM 지식 베이스 갱신 완료',
    description: `매일 오전 9시 자동 갱신이 완료되었습니다.\nNotion DB에서 인사이트를 확인하세요: [NotebookLM 지식 베이스](https://www.notion.so/3226e30cedcb807789add2e6ca7b94ff)`,
    color: 0x57f287, // 초록색
    fields: [
      { name: '📊 전체 노트북', value: `${totalNotebooks}개`, inline: true },
      { name: '🆕 신규 추가', value: `${added}개`, inline: true },
      { name: '🔄 업데이트', value: `${updated}개`, inline: true },
      { name: '❌ 실패', value: `${failed}개`, inline: true },
      { name: '⏰ 갱신 시각', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: false }
    ]
  });
}

/**
 * 에러 알림
 * @param {string} errorMessage - 에러 메시지
 */
async function sendErrorNotification(errorMessage) {
  await sendDiscordNotification({
    title: '❌ NotebookLM 갱신 오류 발생',
    description: `자동 갱신 중 오류가 발생했습니다.\n\`\`\`\n${errorMessage}\n\`\`\``,
    color: 0xed4245 // 빨간색
  });
}

module.exports = { sendDiscordNotification, sendDailyUpdateNotification, sendErrorNotification };
