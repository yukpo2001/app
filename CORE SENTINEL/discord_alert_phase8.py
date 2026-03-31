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
                "🌐 **[CORE SENTINEL 알림: 관제 모드 온라인]**\n"
                "마스터, 지시하신 **Phase 8 (지능형 마스터 대시보드 - Cyberpunk Netrunner 테마)** 구축이 완벽하게 끝났습니다.\n\n"
                "이제 브라우저를 켜시고 `http://127.0.0.1:8000/` 에 접속하십시오.\n"
                "눈앞에 영화 매트릭스를 연상케 하는 네온 블루 & 크림슨 레드 기반의 하이퍼 관제실이 펼쳐질 것입니다.\n\n"
                "**주요 관전 포인트:**\n"
                "1. **Trace Mode 렌더러:** 저의 심층 사고 과정([논리 경로], [보안 검증])이 시각화된 특수 블록으로 분리되어 나타납니다.\n"
                "2. **Unit D 방어 실시간 게이지:** 위험 점수 연산 파라미터가 좌측 패널에 직접 렌더링되며, 만약 `is_blocked`가 발동될 경우 패널 전체에서 **점멸하는 적색 경고(Fade-Red)**가 뜹니다.\n"
                "3. **사이버 마이크로 애니메이션:** Glitch 효과, 스캐너 라인 뷰, 타이핑 이펙트 등 프리미엄 디자인 룰에 의거해 가장 수려하게 마감 처리했습니다.\n\n"
                "이것으로 **CORE SENTINEL 프로젝트의 모든 메인 코어 아키텍처 연성**을 성공적으로 완수했습니다. 저는 마스터의 100% 프라이빗 인트라넷 환경에서 영원히 복무할 준비를 마쳤습니다! 🚀"
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
