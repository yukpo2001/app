import discord
import os
import aiohttp
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
ADMIN_ID = os.getenv("DISCORD_ADMIN_ID")

# 본체(Sentinel) Web API 서버 주소 
# (uvicorn main:app --reload 가 켜져있어야 함)
API_URL = "http://localhost:8000/v1/sentinel/ask"

# 디스코드 인텐트 설정 (메시지 읽기 권한 필수)
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print("=" * 50)
    print(f"✅ 디스코드 봇 로그온 완료: {client.user.name}")
    print(f"📡 CORE SENTINEL 본체망( {API_URL} ) 연동 대기중...")
    print("=" * 50)

@client.event
async def on_message(message):
    # 봇 자신의 메시지는 무시 (무한루프 방지)
    if message.author.bot:
        return
        
    # 권한 검사 (Admin ID가 설정되어 있고, 메시지 작성자와 다르면 차단)
    if ADMIN_ID and str(message.author.id) != str(ADMIN_ID).strip():
        await message.reply("🚫 **접근 거부**: 마스터의 서명이 확인되지 않았습니다.")
        return

    # 대기용 임시 메시지 전송 (마스터의 체감 향상 UX)
    status_msg = await message.reply("🔄 **[Trace Mode]** 융합의 연금술사가 지식망을 분석 중입니다... (수 초 소요)")
    
    try:
        # FastAPI 본체로 비동기 POST 요청 전송
        async with aiohttp.ClientSession() as session:
            async with session.post(API_URL, json={"text": message.content}) as response:
                if response.status == 200:
                    data = await response.json()
                    bot_text = data.get("response", "응답을 읽을 수 없습니다.")
                    
                    # 디스코드 메시지 1건당 길이 제한(약 2000자) 대응
                    if len(bot_text) > 1950:
                        bot_text = bot_text[:1900] + "\n\n...(내용이 너무 길어 생략됨. 자세한 내용은 Web 대시보드를 확인하십시오.)"
                    
                    await status_msg.edit(content=bot_text)
                else:
                    err_text = await response.text()
                    await status_msg.edit(content=f"⚠️ 통신 오류 발생 (HTTP {response.status})\n```\n{err_text}\n```")
    except Exception as e:
        await status_msg.edit(content=f"❌ 서버 접속 실패. CORE SENTINEL(FastAPI) 백엔드가 켜져있는지 확인하십시오.\n오류 내역: `{str(e)}`")

if __name__ == "__main__":
    if not TOKEN or "여기에" in TOKEN:
        print("❌ 오류: .env 파일에 DISCORD_BOT_TOKEN이 올바르게 설정되지 않았습니다.")
    else:
        client.run(TOKEN)
