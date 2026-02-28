---
name: google_keep
description: "구글 Keep(Google Keep)을 검색해서 자료로 활용하고, 결과를 다시 Keep에 저장하는 스킬 및 가이드"
namespace: skillssmp.library.antigravity.keep
version: 1.0.0
requires:
  packages:
    - "gkeepapi" (Python unofficial API for Google Keep)
---

# Google Keep 연동 및 활용 스킬

이 스킬은 Antigravity 앱 또는 AI 에이전트가 구글 Keep의 메모를 검색하여 컨텍스트 자료로 활용하고, 작업된 결과를 다시 구글 Keep에 새 메모로 저장하는 워크플로우를 정의합니다.

(주의: Google Keep의 공식 API는 Google Workspace Enterprise 사용자에게만 제공되므로, 일반 계정의 경우 파이썬의 비공식 라이브러리인 `gkeepapi`를 활용하는 방식을 표준으로 합니다.)

---

## 1. 환경 설정 및 프록시 스크립트 준비

Python 스크립트를 통해 Google Keep과 통신합니다. Node.js 생태계에서 접근할 경우 `child_process` 등으로 파이썬 스크립트를 호출하여 연동합니다.

### 패키지 설치
```bash
pip install gkeepapi
```

### 인증 정보 설정 (`.env.local`)
구글 계정의 앱 비밀번호(App Password)가 필요합니다. 본 계정 비밀번호 대신 2단계 인증을 켠 후 앱별 비밀번호를 발급받아 사용하세요.

```env
KEEP_USERNAME=your_email@gmail.com
KEEP_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx
```

---

## 2. 파이썬 연동 스크립트 템플릿 (`keep_sync.py`)

AI 에이전트나 백엔드에서 호출할 수 있는 공용 파이썬 스크립트 작성 패턴입니다.

```python
import gkeepapi
import os
import sys
import json

def get_keep_client():
    keep = gkeepapi.Keep()
    # 앱 비밀번호를 이용해 로그인
    username = os.getenv('KEEP_USERNAME')
    password = os.getenv('KEEP_APP_PASSWORD')
    
    # 토큰 캐싱을 위해 state 파일 저장/불러오기 가능
    try:
        keep.login(username, password)
        return keep
    except gkeepapi.exception.LoginException:
        print("Login failed. Check app password.")
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
        
    return json.dumps(results, ensure_ascii=False)

def create_note(title, text, color=None):
    keep = get_keep_client()
    note = keep.createNote(title, text)
    
    if color:
        # e.g., gkeepapi.node.ColorValue.Red
        note.color = getattr(gkeepapi.node.ColorValue, color.capitalize(), gkeepapi.node.ColorValue.White)
        
    # 변경사항 구글 서버와 동기화
    keep.sync()
    return json.dumps({"status": "success", "id": note.id})

if __name__ == "__main__":
    action = sys.argv[1]
    
    if action == "search":
        query = sys.argv[2]
        print(search_notes(query))
    elif action == "create":
        title = sys.argv[2]
        text = sys.argv[3]
        print(create_note(title, text))
```

---

## 3. AI 에이전트 작업 파이프라인 (워크플로우)

프롬프트나 AI 에이전트가 이 스킬을 활용할 때 다음 순서를 따릅니다.

### 3.1. 자료 검색 (Research)
사용자가 특정 문맥을 요구하면, 파이썬 스크립트를 호출해 구글 Keep에서 관련된 노트를 가져옵니다.
```bash
python keep_sync.py search "프로젝트 아이디어"
```
가져온 JSON 데이터를 AI의 컨텍스트(자료)로 활용하여 사용자의 요청 사항을 분석하거나 코드를 작성합니다.

### 3.2. 정보 가공 및 처리
AI가 취합한 정보, 웹에서 검색한 자료, 혹은 분석된 결과를 바탕으로 최종 리포트나 요약본을 생성합니다.

### 3.3. 결과물 저장 (Save)
완성된 결과를 다시 구글 Keep에 새 노트로 저장합니다.
```bash
python keep_sync.py create "AI 요약: 프로젝트 아이디어 분석" "1. 분석 결과... 2. 향후 계획..."
```

---

## 4. 유의사항

1. **로그인 빈도**: 너무 잦은 로그인은 구글 정책에 의해 차단될 수 있습니다. `keep.dump()`와 `keep.restore()` 함수를 활용하여 인증 토큰을 로컬에 캐싱하는 것을 권장합니다.
2. **동기화 지연**: `keep.sync()`를 호출해야만 모바일이나 웹 구글 Keep에 반영됩니다.
3. **태그 및 색상**: 검색 시 특정 태그(Label)나 색상을 지정하여 필터링하면 AI가 자료를 분류하기가 더 수월해집니다.
4. **엔터프라이즈 환경**: 회사 계정(Workspace)인 경우 이 스크립트 대신 정식 [Google Keep API](https://developers.google.com/keep/api) (Oauth2.0 기반)를 사용해야 합니다.
