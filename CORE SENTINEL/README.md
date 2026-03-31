# CORE SENTINEL (코어 센티넬)

CORE SENTINEL은 100% 로컬 오프라인 데이터를 다루되, 극비 정보(PII) 유출을 차단하는 **사이버펑크 테마의 초지능 멀티모달 보안 관제망**입니다.

![Netrunner UI](https://img.shields.io/badge/UI-Cyberpunk_Netrunner-neonblue) ![AI](https://img.shields.io/badge/AI-LangGraph_Orchestrator-000000) ![Security](https://img.shields.io/badge/Security-Zero_Trust_Masking-red)

## 📌 핵심 기능
1. **Unit A (메인 오케스트레이터):** LangGraph 기반 복합 추론 에이전트.
2. **Unit B (클라이언트):** 해커 터미널 컨셉의 Local 웹 UI (`index.html`) 및 디스코드 원격 통신 봇 (`discord_bot.py`).
3. **Unit C (로컬 임베딩):** `ko-sroberta-multitask` 로컬 모델을 통하여 문서 무료 벡터화 및 검색 (비용 0원, 최고 보안).
4. **Unit D (The Shield):** 입력 정보의 PII(주민/카드/전화번호)가 발견될 시 즉시 마스킹. LLM 송출 시 유출 완전 사전 차단.
5. **Phase 9 & 10 (Vision & Voice):** 음성 입/출력, 사진 및 이미지 멀티모달 프롬프트 연동. 

---

## 🚀 빠른 시작 (Quick Start)

### 1. 환경 설정
`.env.example` 파일을 복사하여 `.env` 파일을 만들고 키를 채워 넣으십시오.
```bash
cp .env.example .env
```
*(소스코드에는 어떠한 하드코딩된 API Key도 삽입되지 않았으며, `.env`는 `.gitignore`로 보호됩니다.)*

### 2. 구동 방법
```bash
pip install -r requirements.txt
uvicorn main:app --reload
python discord_bot.py
```
