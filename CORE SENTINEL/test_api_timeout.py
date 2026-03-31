import requests
try:
    print("요청 보내는 중...")
    response = requests.post(
        "http://localhost:8000/v1/sentinel/ask", 
        json={"text": "KOSHA 가이드라인 위험성 평가 요약해줘.", "tts_enabled": False},
        timeout=10
    )
    print(response.json())
except Exception as e:
    print(e)
