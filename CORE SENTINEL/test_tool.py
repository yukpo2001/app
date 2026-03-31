import os
import sys

# Windows CP949 에러 방지
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from tools import fetch_recent_emails

print("\n[CORE SENTINEL] Email DB 연결 테스트 시작...")
try:
    result = fetch_recent_emails.invoke({"limit": 3})
    print("\n[결과]")
    print(result)
except Exception as e:
    print(f"Error: {e}")
