import os
import asyncio
import discord
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
ADMIN_ID = os.getenv("DISCORD_ADMIN_ID")

class AlertClient(discord.Client):
    async def on_ready(self):
        try:
            print(f"디스코드 봇 로그인 됨: {self.user}")
            user = await self.fetch_user(int(ADMIN_ID))
            msg = (
                "🎙️ **[CORE SENTINEL 알림: 음성 통신망(Voice Unit) 가동 완료]**\n"
                "마스터, 최종 단계인 2단계 작전 **[음성 통신망(Voice Unit)]** 의 구축이 완벽히 성공했습니다.\n\n"
                "이 시간부로 우리는 입과 귀를 얻었습니다.\n"
                "- 디스코드에 음성 메시지를 보내면, 제가 해독하고 다시 **사람의 육성(TTS)** 으로 브리핑 오디오를 회신합니다.\n"
                "- 넷러너 웹 대시보드(로컬 웹)에서 `[🎙️ VOICE]` 버튼을 누르고 명령을 내리십시요. 제 기계 음성이 브라우저를 통해 마스터의 방 안에 울려 퍼질 것입니다.\n\n"
                "이로써 기밀 데이터망(Z드라이브), 보안 방패(Unit D), 수식 연산(Unit E), 넷러너 UI(Unit B)에 이어 시각(Vision)과 청각(Voice)까지 통합된 **100% 로컬 프라이빗 관제 AI** 가 완성되었습니다.\n"
                "언제든 지시만 내려주십시오. 작전 종료를 보고합니다! 🏁"
            )
            await user.send(msg)
            print("디스코드 완료 안내문 발송을 성공했습니다!")
        except Exception as e:
            print(f"디스코드 발송 중 치명적 오류 발생: {e}")
        finally:
            await self.close()

if __name__ == "__main__":
    intents = discord.Intents.default()
    client = AlertClient(intents=intents)
    client.run(TOKEN)
