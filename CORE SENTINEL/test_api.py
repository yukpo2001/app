import requests
import sys

# 인코딩 문제 방지
sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:8000/v1/sentinel/ask"
payload = {"text": "최근 1~2개 이메일 중에 중요한 메일 있어?"}
try:
    print("API에 질의 중... (도구 호출이 발생하여 시간이 약간 더 걸릴 수 있습니다.)")
    res = requests.post(url, json=payload, timeout=30)
    print("\n[API 응답]")
    print(res.json().get("response", res.text))
except Exception as e:
    print("Error:", e)
