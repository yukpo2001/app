import requests

def test_api():
    url = "http://localhost:8000/v1/sentinel/ask"
    payload = {
        "text": "n8n 사용법 요약해줘.",
        "tts_enabled": False
    }
    
    print("요청 보내는 중...")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("\n[관제 엔진 응답]")
        print(response.json()["response"])
    except Exception as e:
        print(f"오류: {e}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"상세 내용: {response.text}")

if __name__ == "__main__":
    test_api()
