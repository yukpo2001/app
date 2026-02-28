---
name: notebooklm_research
description: "NotebookLM MCP 서버를 사용하여 사용자의 문서를 기반으로 딥 리서치(Deep Research)를 수행하고 고급 요약 및 인사이트를 추출하는 에이전트 스킬"
namespace: skillssmp.library.antigravity.notebooklm
version: 1.0.0
requires:
  mcp_servers:
    - "notebooklm"
---

# NotebookLM 리서치 프로세스 연동 스킬

이 스킬은 Antigravity 에이전트가 `notebooklm` MCP 서버 툴을 통해 구글 NotebookLM과 상호작용하여 정보를 검색하고 요약하는 명확한 워크플로우를 정의합니다. 

사용자가 노션, 웹사이트, 개발 문서, PDF 등 방대한 컨텍스트를 제공해 깊이 있는 문서 조사를 요청할 때 주로 사용됩니다. NotebookLM은 Claude 3나 Gemini 모델과 결합해 거대한 문서를 "세션 기반" 대화형 RAG(Session RAG)로 심층 분석할 수 있습니다.

---

## 1. 사전 체크 및 인증 (Health & Auth)

NotebookLM에 접근하기 전에 MCP 서버의 상태 및 인증 여부를 확인해야 합니다.

1. **상태 확인**: `mcp_notebooklm_get_health` 툴을 호출하여 서버가 정상인지, 그리고 `authenticated: true`인지 확인합니다.
2. **구글 로그인 필요 시**: 인증이 안 되어 있거나 세션이 만료된 경우 `mcp_notebooklm_setup_auth` (최초) 또는 `mcp_notebooklm_re_auth` (재인증)를 실행합니다.
   * 인증 툴 실행 시 백그라운드에서 브라우저 창이 열리며 사용자의 구글 계정 로그인을 대기합니다.
   * 사용자가 로그인을 완료할 시간을 주고, 다시 `get_health`로 상태를 체크합니다.

---

## 2. 노트북(Notebook) 관리 및 선택

질의(Research)를 수행하려면 어떤 "노트북"에 질문할지 먼저 결정해야 합니다.

1. **라이브러리 확인**: `mcp_notebooklm_list_notebooks`를 사용하여 현재 추가되어 있는 노트북 목록을 불러옵니다.
2. **원하는 노트북 검색**: 사용자가 모호하게 "리액트 관련 문서"라고 말했다면, `mcp_notebooklm_search_notebooks`로 `query`를 검색하여 적절한 ID를 찾을 수 있습니다.
3. **새 노트북 추가 (필수 워크플로우)**:
   * 사용자가 새로운 외부 지식(예: n8n 문서, 새로운 아키텍처 가이드)을 노트북으로 활용하고자 하면, 먼저 다음 프로세스를 거칩니다.
     > Agent: "해당 내용이 담긴 NotebookLM의 공유 URL을 알려주세요. 또한 포함된 내용의 요약과 이 노트를 언제 사용해야 할지(Use Cases) 알려주시면 구성해 드리겠습니다."
     > (NotebookLM 웹에서 '+ New' -> 소스 업로드 -> 우측 상단 'Share' -> 'Copy link')
   * 사용자 동의 후 `mcp_notebooklm_add_notebook` 툴을 사용하여 URL과 메타데이터(name, description, topics 등)를 저장합니다.
4. **활성 노트북 설정**: 작업량이 많을 땐 `mcp_notebooklm_select_notebook`을 사용하여 기본 타겟 노트북을 지정(Activate)해 두면 편리합니다.

---

## 3. 질문 질의 및 자료 조사 (Research Execution)

질의에 대한 문맥 파악과 자료의 심층 추출 단계입니다. `mcp_notebooklm_ask_question` 툴을 중심으로 사용합니다.

1. **세션 기반 질문**:
   * 질문을 툴로 호출합니다 (`question` 인자 필수). 예: `question: "Agentic GraphRAG와 일반적인 RAG의 차이점을 설명하고 Middleware의 역할을 요약해."`
   * NotebookLM 서버가 구글의 Gemini 모델 등을 사용하여 제공된 소스 내부를 깊게 검색하고 답변을 도출해 반환합니다.
2. **후속 질문 (Follow-up)**:
   * 첫 질문 결과에서 추가 정보가 필요할 경우, 반환된 `session_id`를 동일하게 유지하며 `mcp_notebooklm_ask_question`으로 꼬리 질문을 호출하면 기존 대화의 문맥(Context)을 이해한 채로 딥다이브가 가능합니다. 
3. **새로운 주제 분기**:
   * 다른 질문으로 넘어갈 때는 인자에서 `session_id`를 생략해 새로운 세션으로 조사하거나, `mcp_notebooklm_reset_session`을 사용해 컨텍스트를 비울 수 있습니다.

---

## 4. 리서치 결과 가공 및 제출

에이전트는 NotebookLM으로부터 추출한 내용을 다음과 같이 활용해야 합니다.

1. **보고서 요약**: Markdown 형식의 Artifact 파일(`report.md`, `walkthrough.md` 등)을 생성하여 사용자에게 시각적으로 잘 정리된 리포트를 제출합니다.
2. **코드 반영**: NotebookLM가 알려준 가이드나 API 규격을 바탕으로 실제 작업 중인 코드(`d:\안티그래비티\..`)에 수정/생성을 진행합니다.
3. **구글 Keep 연동 (선택)**: `google_keep` 스킬 등과 결합하여, 유의미한 조사 결과 요약을 다시 구글 메모에 백업해 둘 수 있습니다.

---

## 문제 해결 (Troubleshooting)

1. **Rate Limit 도달 시**: 
   * 무료 계정의 경우 일일 질문 수(약 50개) 제한이 있습니다. 에러 발생 시 사용자에게 상황을 알리고 다른 계정으로의 전환(`mcp_notebooklm_re_auth`)을 권유하세요.
2. **크롬 프로필 충돌 / 로그인 꼬임 시**:
   * 잦은 로그인 에러가 발생하면 사용자의 권한 동의를 구한 후 모든 구글 크롬 브라우저를 종료하고, `mcp_notebooklm_cleanup_data(confirm=true, preserve_library=true)`를 사용해 강제 캐시 삭제를 진행한 뒤 완전 초기화 상태에서 다시 Auth를 수행합니다. 
