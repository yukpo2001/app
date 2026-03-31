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
    # 현재는 인터페이스 스터브(Stub) 상태
    return f"[NotebookLM 응답 대기중] '{question}'에 대한 답변을 MCP 서버에서 가져올 예정입니다."

# 통합 반환용 리스트 (main.py에서 AgentExecutor/ToolNode에 주입)
SENTINEL_TOOLS = [fetch_recent_emails, ask_notebooklm]
