import discord
import os
import aiohttp
import tempfile
import base64
from dotenv import load_dotenv
from openai import AsyncOpenAI

# 환경 변수 로드
load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
ADMIN_ID = os.getenv("DISCORD_ADMIN_ID")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI 비동기 클라이언트 (Whisper 용)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

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
    if openai_client:
        print("🎙️ Whisper STT 음성 인식 모듈 장전 완료.")
    print("👁️ Vision Unit (이미지 시각 처리) 지원 준비 완료.")
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

    # 최종 전송할 텍스트 추출 (기본값은 메시지 내용)
    query_text = message.content.strip()

    # 음성 메시지(Voice Note) 감지
    voice_detected = False
    image_base64 = None
    
    for attachment in message.attachments:
        if attachment.is_voice_message() or (attachment.content_type and "audio" in attachment.content_type):
            voice_detected = True
            if not openai_client:
                await message.reply("⚠️ OPENAI_API_KEY가 존재하지 않아 음성을 변환할 수 없습니다.")
                return
                
            status_msg = await message.reply("🎙️ **[Audio Mode]** 마스터의 음성을 해독 중입니다...")
            
            try:
                # 임시 파일로 다운로드
                with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
                    tmp_path = tmp.name
                await attachment.save(tmp_path)
                
                # Whisper 로 STT 변환
                with open(tmp_path, "rb") as audio_file:
                    transcript = await openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                query_text = transcript.text
                os.remove(tmp_path)  # 임시파일 정리
                
                await status_msg.edit(content=f"🎤 **음성 해독됨:** `{query_text}`\n🔄 **[Trace Mode]** 융합의 연금술사가 지식망을 분석 중입니다...")
            except Exception as e:
                await status_msg.edit(content=f"❌ 음성 변환 실패: `{str(e)}`")
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
                return
            break # 첫번째 음성 파일만 처리
            
        elif attachment.content_type and attachment.content_type.startswith('image/'):
            # 이미지(시각 정보) 감지 (Phase 9 Vision Unit)
            try:
                img_bytes = await attachment.read()
                image_base64 = base64.b64encode(img_bytes).decode('utf-8')
            except Exception as e:
                await message.reply(f"❌ 이미지 로드 실패: `{str(e)}`")
                return
            break

    if not query_text and not image_base64:
        return # 음성도 이미지도 텍스트도 없으면 무시

    if not voice_detected:
        if image_base64:
             status_msg = await message.reply("👁️ **[Vision Mode]** 시각 신경망 가동 중입니다...")
        else:
             status_msg = await message.reply("🔄 **[Trace Mode]** 융합의 연금술사가 지식망을 분석 중입니다... (수 초 소요)")
    
    try:
        # FastAPI 본체로 비동기 POST 요청 전송
        payload = {
            "text": query_text, 
            "query": query_text,
            "tts_enabled": voice_detected
        }
        if image_base64:
            payload["image_base64"] = image_base64
            
        async with aiohttp.ClientSession() as session:
            async with session.post(API_URL, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    bot_text = data.get("response", "응답을 읽을 수 없습니다.")
                    
                    # 오디오(TTS) 음답이 있다면 파일로 변환하여 전송
                    audio_b64 = data.get("audio_base64")
                    if audio_b64:
                        try:
                            audio_bytes = base64.b64decode(audio_b64)
                            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_mp3:
                                tmp_mp3.write(audio_bytes)
                                tmp_mp3_path = tmp_mp3.name
                            
                            # 길이 제한 검사 후 텍스트와 함께 음성 전송
                            if len(bot_text) > 1950:
                                bot_text = bot_text[:1900] + "\n...(생략됨)"
                                
                            await status_msg.edit(content=bot_text)
                            await message.reply(file=discord.File(tmp_mp3_path))
                            os.remove(tmp_mp3_path)
                        except Exception as e:
                            await status_msg.edit(content=f"{bot_text}\n\n⚠️ TTS 송출 에러: `{str(e)}`")
                    else:
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
