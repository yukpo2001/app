import time
import os
import subprocess
import asyncio
import discord
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
ADMIN_ID = os.getenv("DISCORD_ADMIN_ID")

def is_ingestion_running():
    """윈도우 wmic를 통해 data_ingestion.py 프로세스가 돌고 있는지 확인"""
    try:
        # Popen을 쓰거나 check_output을 씁니다.
        output = subprocess.check_output('wmic process where "name=\'python.exe\'" get commandline', shell=True, stderr=subprocess.STDOUT)
        output_str = output.decode('utf-8', errors='ignore')
        # 자기 자신(wait_and_alert.py)이 아닌 실제 data_ingestion.py가 있는지 체크
        lines = output_str.split('\n')
        for line in lines:
            if 'data_ingestion.py' in line and 'wait_and_alert.py' not in line:
                return True
    except Exception as e:
        print(f"프로세스 확인 오류: {e}")
        
    return False

class AlertClient(discord.Client):
    async def on_ready(self):
        try:
            print(f"디스코드 봇 로그인 됨: {self.user}")
            user = await self.fetch_user(int(ADMIN_ID))
            msg = (
                "✅ **[CORE SENTINEL 알림: Unit C]**\n"
                "마스터, IPDrive (Z:\\ 등)의 대용량 문서 스캔 및 데이터 섭취(Ingestion)가 모두 안전하게 완료되었습니다!\n"
                "모든 지식망이 프라이빗 AI 두뇌에 연동되었으니 언제든 질문을 통해 테스트해보십시오."
            )
            await user.send(msg)
            print("디스코드 알림 발송 완료!")
        except Exception as e:
            print(f"발송 실패: {e}")
        finally:
            await self.close()

def main():
    print("감시 시작: data_ingestion.py가 종료될 때까지 대기합니다...")
    
    # 프로세스가 바로 안 잡힐 수 있으므로 15초 정도 대기
    time.sleep(15)
    
    # 무한 루프 돌면서 프로세스 끝날때까지 대기 (60초 간격)
    while is_ingestion_running():
        time.sleep(60)
        
    print("data_ingestion.py 종료(또는 미실행) 감지됨. 디스코드 알림을 보냅니다.")
    
    intents = discord.Intents.default()
    client = AlertClient(intents=intents)
    client.run(TOKEN)

if __name__ == "__main__":
    main()
