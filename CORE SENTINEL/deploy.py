import os
import sys
import subprocess
from dotenv import load_dotenv
from pyngrok import ngrok

def main():
    # .env 로드
    load_dotenv()

    print("\n[CORE SENTINEL Deploy Sequence Initiated]")
    
    auth_token = os.getenv("NGROK_AUTH_TOKEN")
    if auth_token:
        print("-> NGROK_AUTH_TOKEN 감지됨. 터널 인증을 수행합니다.")
        ngrok.set_auth_token(auth_token)
    else:
        print("-> NGROK_AUTH_TOKEN이 없습니다. 인증 없는 임시 터널을 오픈합니다.")
        print("-> (안내: 세션 한도 초과 오류 방지를 위해 가급적 토큰을 발급받아주세요)")

    # 포트 8000번에 대해 HTTP 터널 오픈
    try:
        http_tunnel = ngrok.connect(8000)
    except Exception as e:
        print(f"Ngrok 실행 중 오류가 발생했습니다: {e}")
        sys.exit(1)

    print(f"\n============================================================")
    print(f"🚀 [Sentinel Public URL]: {http_tunnel.public_url}")
    print(f"============================================================\n")

    print("[SYSTEM] Uvicorn 서버를 내부적으로 시작합니다...\n")
    try:
        # 본 프로세스의 자식으로 uvicorn을 실행
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload"])
    except KeyboardInterrupt:
        print("\n[SYSTEM] 마스터님의 명령으로 통신을 종료합니다.")
    finally:
        ngrok.disconnect(http_tunnel.public_url)
        ngrok.kill()

if __name__ == "__main__":
    main()
