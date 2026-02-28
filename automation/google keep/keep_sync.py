import gkeepapi
import os
import sys
import json
from dotenv import load_dotenv

# 로컬 .env.local 파일 로드
load_dotenv('.env.local')

def get_keep_client():
    keep = gkeepapi.Keep()
    # 앱 비밀번호를 이용해 로그인
    username = os.getenv('KEEP_USERNAME')
    password = os.getenv('KEEP_APP_PASSWORD')
    
    if not username or not password:
        print("Error: KEEP_USERNAME and KEEP_APP_PASSWORD must be set in .env.local")
        sys.exit(1)
        
    try:
        # 로그인 (최신버전에서는 keep.authenticate을 사용하도록 권장되나 확인이 필요함)
        keep.authenticate(username, password)
        return keep
    except gkeepapi.exception.LoginException:
        print("Error: Login failed. Check your app password or username.")
        sys.exit(1)

def search_notes(query):
    keep = get_keep_client()
    # 쿼리로 검색 (제목이나 본문에 포함된 경우)
    notes = keep.find(query=query)
    
    results = []
    for note in notes:
        results.append({
            "id": note.id,
            "title": note.title,
            "text": note.text,
            "labels": [label.name for label in note.labels.all()]
        })
        
    return json.dumps(results, ensure_ascii=False, indent=2)

def create_note(title, text, color=None):
    keep = get_keep_client()
    note = keep.createNote(title, text)
    
    if color:
        note.color = getattr(gkeepapi.node.ColorValue, color.capitalize(), gkeepapi.node.ColorValue.White)
        
    # 변경사항 구글 서버와 동기화
    keep.sync()
    return json.dumps({"status": "success", "id": note.id})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python keep_sync.py <action> [args...]")
        sys.exit(1)
        
    action = sys.argv[1]
    
    if action == "search":
        if len(sys.argv) < 3:
            print("Usage: python keep_sync.py search <query>")
            sys.exit(1)
        query = sys.argv[2]
        print(search_notes(query))
    elif action == "create":
        if len(sys.argv) < 4:
            print("Usage: python keep_sync.py create <title> <text>")
            sys.exit(1)
        title = sys.argv[2]
        text = sys.argv[3]
        print(create_note(title, text))
