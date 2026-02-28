require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
const masterId = process.env.DISCORD_ADMIN_ID; // 봇을 제어할 본인의 아이디

if (!token) {
    console.error("❌ 오류: .env 파일에 DISCORD_BOT_TOKEN이 설정되지 않았습니다.");
    process.exit(1);
}

// Client 객체 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // 채팅 내용 읽기 필수
    ],
});

// 시작 시
client.once('ready', () => {
    console.log(`🤖 디스코드 IoT 제어 봇(시뮬레이션)이 준비되었습니다: ${client.user.tag}`);
    console.log('채팅창에서 봇에게 !status, !on, !off 명령어를 사용해보세요!');
});

// 메시지 감지
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    // 상태 확인 명령어 (!status)
    if (message.content === '!status') {
        const statusEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('📊 집안 시스템 상태 보고')
            .addFields(
                { name: '🌡️ 가상 실내 온도', value: '24℃', inline: true },
                { name: '💧 가상 실내 습도', value: '45%', inline: true },
                { name: '💡 기기 상태', value: '정상 (대기중)' }
            )
            .setTimestamp()
            .setFooter({ text: 'Antigravity IoT Bot' });

        message.reply({ embeds: [statusEmbed] });
    }

    // 기기 켜기 명령어 (!on)
    if (message.content === '!on') {
        if (masterId && message.author.id !== masterId) {
            return message.reply('🚫 기기를 제어할 권한이 없습니다.');
        }
        console.log('[동작 수행] 라즈베리 파이 릴레이 켜기 신호 발생!');
        message.reply('💡 릴레이(전원)를 **켰습니다**.');
    }

    // 기기 끄기 명령어 (!off)
    if (message.content === '!off') {
        if (masterId && message.author.id !== masterId) {
            return message.reply('🚫 기기를 제어할 권한이 없습니다.');
        }
        console.log('[동작 수행] 라즈베리 파이 릴레이 끄기 신호 발생!');
        message.reply('🔌 릴레이(전원)를 **껐습니다**.');
    }
});

// 봇 로그인
client.login(token).catch(err => {
    console.error('[디스코드 로그인 에러]:', err);
});
