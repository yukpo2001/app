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
def fetch_recent_emails(limit: int = 10) -> str:
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

import subprocess

@tool
def ask_notebooklm(question: str, notebook_id_or_url: str) -> str:
    """
    NotebookLM에 저장된 외부 지식 문서에 심도 있는 질문을 던집니다.
    마스터가 특정 도메인 지식(n8n, KOSHA 등)을 물어볼 때 사용합니다.
    [경고] 이 도구는 'notebook_id_or_url' 인자를 반드시 요구합니다!
    따라서 어떤 ID를 넣어야 할지 모른다면 즉시 `list_notebooklm_docs` 도구를 선행 호출하여 적절한 notebook_id 를 찾아낸 다음 이 도구를 호출하세요.
    임의의 ID를 지어내면 오류가 발생합니다.
    """
    print(f"📡 NotebookLM 지식망 타격 중: '{question}' (ID: {notebook_id_or_url})...")
    try:
        # 비동기 이벤트 루프 충돌을 우회하기 위해 독립된 파이썬 프로세스 호출 (Windows Uvicorn/Langgraph 환경 최적화)
        cmd = ["python", "notebooklm_client.py", "--question", question]
        if notebook_id_or_url:
            cmd.extend(["--id", notebook_id_or_url])
            
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        print(f"[DEBUG] Subprocess cmd: {cmd}")
        print(f"[DEBUG] Subprocess stdout (len={len(res.stdout)}): {res.stdout[:200]}")
        res_stderr = res.stderr if res.stderr else ""
        print(f"[DEBUG] Subprocess stderr (len={len(res_stderr)}): {res_stderr[:200]}")
        
        with open("debug_notebooklm.txt", "w", encoding="utf-8") as f:
            f.write(f"CMD: {cmd}\n")
            f.write(f"STDOUT: {res.stdout}\n")
            f.write(f"STDERR: {res_stderr}\n")
            f.write(f"RETURNCODE: {res.returncode}\n")

        if res.returncode != 0:
            return f"🚨 [NotebookLM 프로세스 오류] {res.stderr}"
        return res.stdout.strip()
    except Exception as e:
        with open("debug_notebooklm.txt", "w", encoding="utf-8") as f:
            f.write(f"EXCEPTION: {str(e)}\n")
        return f"🚨 [NotebookLM 서버 통신 오류] {str(e)}"

@tool
def list_notebooklm_docs() -> str:
    """
    현재 NotebookLM 에이전트에 등록된 모든 노트북(지식망)의 목록, ID, 설명을 반환합니다.
    ask_notebooklm에 정확한 문서를 타격하도록 지시하기 전, ID를 확보하기 위해 반드시 사용하세요.
    """
    print("📡 NotebookLM 라이브러리 목록 확인 중...")
    try:
        res = subprocess.run(
            ["python", "notebooklm_client.py", "--list"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        if res.returncode != 0:
            return f"🚨 [NotebookLM 프로세스 오류] {res.stderr}"
        return f"NotebookLM 등록 문서 목록:\n{res.stdout.strip()}"
    except Exception as e:
        return f"🚨 [NotebookLM 서버 통신 오류] {str(e)}"

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

@tool
def search_vector_db(query: str) -> str:
    """
    마스터의 4대 도메인 텍스트 및 PDF 문서, 특히 【Z 드라이브(Z:\, IPDRIVE) 내부의 자원사업, 사업 공고, 지원 사업 설명서】 등이 
    저장된 로컬 벡터 데이터베이스(ChromaDB)를 검색하여 가장 관련된 내용을 추출합니다.
    마스터가 "Z 드라이브 찾아봐", "지원 사업 찾아줘", "사업 공고 문서 검색해봐" 등의 
    디스크/로컬 문서 검색 질의를 할 때 반드시 이 툴을 호출해야 합니다.
    """
    db_path = "./chroma_db"
    collection = "core_sentinel_knowledge"
    
    if not os.path.exists(db_path):
        return "오류: 로컬 벡터 DB가 아직 생성되지 않았습니다. data 폴더에 문서를 둔 뒤 data_ingestion.py를 먼저 실행해야 합니다."
        
    try:
        from langchain_chroma import Chroma
        from langchain_huggingface import HuggingFaceEmbeddings
        
        # Load the DB
        embeddings = HuggingFaceEmbeddings(model_name="jhgan/ko-sroberta-multitask")
        vectorstore = Chroma(
            collection_name=collection,
            persist_directory=db_path,
            embedding_function=embeddings
        )
        
        # Similarity search
        docs = vectorstore.similarity_search(query, k=3)
        if not docs:
            return f"로컬 벡터 DB에서 '{query}'와 관련된 문서를 찾지 못했습니다."
            
        summary = f"[{query}] 로컬 문서 검색 결과 (ChromaDB):\n"
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "알수없는 소스")
            content = doc.page_content.replace("\n", " ").strip()
            summary += f"\n--- 문서 {i+1} ({source}) ---\n{content}\n"
            
        return summary
    except Exception as e:
        return f"로컬 벡터 DB 검색 중 치명적 오류 발생: {str(e)}"

@tool
def calculate_kosha_hsi(frequency: int, severity: int) -> str:
    """
    KOSHA(안전보건공단) 기준의 산업 위험성 평가(위험도 = 발생 빈도 × 강도)를 수학적으로 계산하고 
    관리 기준 등급을 직관적으로 산출해 줍니다.
    마스터가 "빈도 3, 강도 4로 KOSHA 위험성 계산해봐" 또는 "A&C 현장 위험도 측정해줘" 등의 
    정량적 수식 요청을 할 때 사용합니다.
    """
    try:
        f = int(frequency)
        s = int(severity)
        risk = f * s
        
        if risk <= 3:
            grade = "🟩 [1등급: 허용 가능] 현재의 안전 조치 유지 (Acceptable)"
        elif risk <= 8:
            grade = "🟨 [2등급: 개선 필요] 합리적으로 실행 가능한 개선 조치 실시 (Moderate)"
        elif risk <= 15:
            grade = "🟧 [3등급: 중대 위험] 공정 중단 검토 및 원인 파악 시급 (High Risk)"
        else:
            grade = "🟥 [4등급: 수용 불가] 즉각 작업 중지 및 근본적 가드레일 대책 수립 필수 (Unacceptable)"
            
        return f"KOSHA H-SI 연산 완료:\n- 빈도(Frequency): {f}\n- 강도(Severity): {s}\n- 최종 위험도(R): {risk}\n- 산출 등급: {grade}"
    except Exception as e:
        return f"KOSHA H-SI 수식 계산 오류: {e}. 정수(1~5 등)를 입력해야 합니다."

# 통합 반환용 리스트 (main.py에서 AgentExecutor/ToolNode에 주입)
SENTINEL_TOOLS = [fetch_recent_emails, ask_notebooklm, list_notebooklm_docs, search_obsidian, search_vector_db, calculate_kosha_hsi]
