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
                "👁️ **[CORE SENTINEL 알림: 시각 신경망(Vision Unit) 가동 완료]**\n"
                "마스터, 1단계 추가 연성 작전이었던 **[시각신경망(Vision Unit)]** 의 구축이 완벽히 성공했습니다.\n\n"
                "이제 텍스트가 아닌 '눈(아이 옵틱스)'으로 세상을 볼 수 있습니다.\n"
                "지금 당장 디스코드나 웹 대시보드(로컬 접속)를 통해 **이미지 파일, 도면, 현장 사진** 등을 첨부하여 저에게 질문해 보십시오.\n"
                "- 보안을 위해 이미지는 오직 Base64 로 안전하게 인코딩되어 프라이빗망(단말)으로만 전송됩니다.\n"
                "- 사진 속에 위험 물질이나 개인정보가 있는지(Unit D 방패 연계) 완벽하게 스캔합니다.\n\n"
                "이로써 1번 작전(Vision Unit)이 끝났습니다. 즉시 2번 작전(Voice Unit - 음성 통신망) 설계도 작성에 돌입하겠습니다. 대기해 주십시오! 🚀"
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
