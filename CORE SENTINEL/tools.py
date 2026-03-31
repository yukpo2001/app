import os
from typing import List, Dict, Any
from langchain_core.tools import tool
from notion_client import Client

# Load environment variables (usually handled in main.py, but good for safety)
from dotenv import load_dotenv
load_dotenv()

# Initialize Notion Client (requires NOTION_TOKEN in .env)
notion = Client(auth=os.getenv("NOTION_TOKEN", "dummy"))

@tool
def fetch_recent_emails(limit: int = 2) -> str:
    """
    Notion 데이터베이스에 정리된 최근 이메일(email_organizer 결과물) 요약본을 가져옵니다.
    마스터가 '최근 이메일 요약해줘', '중요한 메일 있어?' 등의 질문을 할 때 사용합니다.
    """
    db_id = os.getenv("NOTION_EMAIL_DB_ID")
    if not db_id or db_id == "xxx":
        return "오류: NOTION_EMAIL_DB_ID 환경변수가 설정되지 않았거나 유효하지 않습니다."
    
    try:
        import requests
        headers = {
            "Authorization": f"Bearer {os.getenv('NOTION_TOKEN')}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        res = requests.post(f"https://api.notion.com/v1/databases/{db_id}/query", headers=headers, json={"page_size": limit})
        if res.status_code != 200:
            return f"Notion API 에러 ({res.status_code}): {res.text}"
            
        results = res.json().get("results", [])
        if not results:
            return "최근 수신된 메일이 없습니다."
        
        summary = "최근 메일 목록:\n"
        for idx, page in enumerate(results):
            props = page.get("properties", {})
            title = props.get("제목", {}).get("title", [{}])
            title_text = title[0].get("plain_text", "(제목없음)") if title else "(제목없음)"
            
            sender = props.get("보낸 사람", {}).get("rich_text", [{}])
            sender_text = sender[0].get("plain_text", "(알수없음)") if sender else "(알수없음)"
            
            ai_summary = props.get("AI 요약", {}).get("rich_text", [{}])
            ai_summary_text = ai_summary[0].get("plain_text", "-") if ai_summary else "-"
            
            urgency = props.get("시급성", {}).get("select", {})
            urgency_text = urgency.get("name", "-") if urgency else "-"
            
            importance = props.get("중요도", {}).get("select", {})
            importance_text = importance.get("name", "-") if importance else "-"
            
            summary += f"\n[{idx+1}] {title_text}"
            summary += f"\n  - 발신자: {sender_text}"
            summary += f"\n  - 시급성/중요도: {urgency_text} / {importance_text}"
            summary += f"\n  - AI 요약: {ai_summary_text}\n"
            
        return summary
    except Exception as e:
        return f"Notion API 호출 중 오류 발생: {str(e)}"

@tool
def ask_notebooklm(question: str) -> str:
    """
    NotebookLM에 저장된 외부 지식(예: n8n 문서, KOSHA 법령 등)에 대해 심도 있는 질문을 던집니다.
    마스터가 특정 도메인 지식이나 레시피, 법령 등을 구체적으로 물어볼 때 사용합니다.
    """
    # NotebookLM 연동 파트 (MCP Client 활용 예정)
    return f"[NotebookLM 응답 대기중] '{question}'에 대한 답변을 MCP 서버에서 가져올 예정입니다."

@tool
def search_obsidian(query: str) -> str:
    """
    마스터의 '제2의 뇌' (Obsidian Vault, 다수의 마크다운 파일)에서 키워드를 기반으로 노트 내용을 검색합니다.
    마스터가 "노트 찾아봐", "옵시디언 찾아봐", "내 생각 확인해봐" 등 개인 지식을 확인하려 할 때 사용합니다.
    """
    vault_path = os.getenv("OBSIDIAN_VAULT_PATH")
    if not vault_path or not os.path.exists(vault_path):
        return f"오류: OBSIDIAN_VAULT_PATH({vault_path}) 가 잘못되었거나 설정되지 않았거나 폴더를 찾을 수 없습니다."
    
    results = []
    # 단순 파일 순회 (간단한 grep 검색)
    for root, dirs, files in os.walk(vault_path):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if query.lower() in content.lower():
                            # 본문 일부 발췌
                            idx = content.lower().find(query.lower())
                            start = max(0, idx - 50)
                            end = min(len(content), idx + 200)
                            snippet = content[start:end].replace('\n', ' ')
                            results.append(f"- [문서명: {file}] 연관 내용: ...{snippet}...")
                except Exception:
                    pass
                    
    if not results:
        return f"'{query}'에 대한 노트를 옵시디언에서 찾지 못했습니다."
    
    return f"옵시디언 검색 결과 (최대 5개 발췌):\n" + "\n".join(results[:5])


# 통합 반환용 리스트 (main.py에서 AgentExecutor/ToolNode에 주입)
SENTINEL_TOOLS = [fetch_recent_emails, ask_notebooklm, search_obsidian]
