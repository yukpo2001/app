// 96개 NotebookLM 노트북 분류 데이터
// 카테고리: 🤖 AI/ML | 💻 개발/기술 | 📈 비즈니스/창업 | 🏛️ 정부지원/사업 | 🧠 자기계발/심리 | 🍺 바이오/식품/브루잉 | 💰 재테크/금융 | 🔬 과학/철학 | 📝 기타

const NOTEBOOKS = [
  // === 🤖 AI/ML ===
  { title: "Building an AI GitHub Agent with n8n and Discord", category: "🤖 AI/ML", tags: ["Agent","n8n","Discord"], importance: "🔴 높음", insights: "• n8n+Discord 웹훅으로 GitHub 이벤트 자동화\n• AI 에이전트 PR/이슈 자동 처리 파이프라인\n• Discord를 AI 제어 허브로 활용", action: "n8n 자동화 파이프라인 구현 시 참조" },
  { title: "Skills.sh: Leveling Up AI Coding with Custom Agent Knowledge", category: "🤖 AI/ML", tags: ["Claude","Agent","MCP"], importance: "🔴 높음", insights: "• AI 에이전트 커스텀 Skills 지식베이스 구축\n• 반복 학습을 위한 지식 계층화 전략\n• Antigravity 스킬 시스템 연계 가능", action: "나만의 Skills 라이브러리 설계에 활용" },
  { title: "Mastering GraphRAG and Knowledge Graphs for AI Agents", category: "🤖 AI/ML", tags: ["RAG","Agent","GraphRAG"], importance: "🔴 높음", insights: "• GraphRAG와 Knowledge Graph 기반 검색 아키텍처\n• 관계형 데이터로 AI 추론 정확도 향상\n• 복잡한 멀티홉 질의 처리 전략", action: "GraphRAG 시스템 설계 시 핵심 참조" },
  { title: "Building Agentic GraphRAG with Middleware and Workflow Patterns", category: "🤖 AI/ML", tags: ["RAG","Agent","Middleware"], importance: "🔴 높음", insights: "• Agentic GraphRAG 미들웨어 패턴\n• 워크플로우 기반 에이전트 오케스트레이션\n• 프로덕션 레벨 GraphRAG 구현 가이드", action: "GraphRAG 에이전트 구축 시 1순위 참조" },
  { title: "2026 Developer Guide to 9 Essential MCP Tools", category: "🤖 AI/ML", tags: ["MCP","Agent","Claude"], importance: "🔴 높음", insights: "• 2026년 필수 MCP 도구 9가지 심층 가이드\n• 각 MCP 도구 실전 활용 패턴\n• Antigravity 환경과 연계 방법", action: "새 MCP 도구 도입 전 반드시 참조" },
  { title: "Mastering Claude Code: Boris's Five Multi-Agent Strategies", category: "🤖 AI/ML", tags: ["Claude","Agent"], importance: "🔴 높음", insights: "• Claude Code 멀티에이전트 5가지 전략\n• 복잡한 작업을 에이전트 팀으로 분할 처리\n• 에이전트 간 커뮤니케이션 패턴", action: "Claude 멀티에이전트 아키텍처 설계에 활용" },
  { title: "Mastering Claude Code: Training AI as Your Expert Staff", category: "🤖 AI/ML", tags: ["Claude","Agent"], importance: "🔴 높음", insights: "• AI를 전문 직원처럼 훈련하는 방법론\n• 페르소나 기반 AI 역할 분담 전략\n• 반복 작업 자동화 프레임워크", action: "Claude 코딩 생산성 극대화에 활용" },
  { title: "Mastering NotebookLM and AI Agents from A to Z", category: "🤖 AI/ML", tags: ["Agent","RAG","MCP"], importance: "🔴 높음", insights: "• NotebookLM + AI 에이전트 완전 가이드\n• 문서 기반 RAG 시스템 구축 방법\n• 지식 베이스 자동화 워크플로우", action: "이 프로젝트(notebooklm2notion) 설계의 핵심 참조" },
  { title: "The Architecture of AI Hallucinations and How to Tame Them", category: "🤖 AI/ML", tags: ["RAG","Agent"], importance: "🔴 높음", insights: "• AI 환각 현상 발생 원인과 메커니즘\n• RAG로 환각 억제하는 검증된 전략\n• 프로덕션 AI 신뢰성 확보 방법", action: "AI 서비스 출시 전 신뢰성 검증 체크리스트" },
  { title: "Harness Engineering: Steering AI through Systems and Constraints", category: "🤖 AI/ML", tags: ["Claude","Agent","MCP"], importance: "🔴 높음", insights: "• AI 하네스(Harness) 시스템 설계 원칙\n• 제약 조건을 통한 AI 행동 제어\n• Antigravity 에이전트 시스템의 근간", action: "Antigravity 에이전트 제약 설계에 핵심 참조" },
  { title: "Essential Claude Code Updates: Memory, Simplified Batching, and Remote Control", category: "🤖 AI/ML", tags: ["Claude","MCP"], importance: "🟡 중간", insights: "• Claude Code 최신 메모리/배칭/원격제어 업데이트\n• 모델 컨텍스트 효율화 방법\n• 원격 Claude 제어 패턴", action: "Claude Code 업그레이드 시 반영" },
  { title: "Google Web MCP: Solving AI Agent Browser Limitations", category: "🤖 AI/ML", tags: ["MCP","Agent"], importance: "🟡 중간", insights: "• Google Web MCP로 브라우저 제한 극복\n• 웹 검색 기반 실시간 정보 수집\n• 에이전트 웹 자동화 확장", action: "웹 크롤링 에이전트 구현 시 참조" },
  { title: "Mastering Antigravity: Advanced MCP Settings for Gemini AI Coding", category: "🤖 AI/ML", tags: ["MCP","Claude","Agent"], importance: "🔴 높음", insights: "• Antigravity + Gemini AI 고급 MCP 설정\n• AI 코딩 생산성 극대화 설정\n• 커스텀 MCP 구성 패턴", action: "Antigravity 환경 최적화 설정에 참조" },
  { title: "Skill: Professional Consistency for AI Automation", category: "🤖 AI/ML", tags: ["Agent","Claude"], importance: "🟡 중간", insights: "• AI 자동화의 일관성 유지 원칙\n• 전문적 결과물을 위한 프롬프트 패턴\n• 반복 작업 품질 보장 전략", action: "AI 자동화 워크플로우 표준화에 활용" },
  { title: "The 95 Percent System: Mastering AI Workflow Engineering", category: "🤖 AI/ML", tags: ["Agent","n8n"], importance: "🟡 중간", insights: "• 95% 자동화 달성을 위한 워크플로우 시스템\n• 나머지 5% 수동 개입 포인트 설계\n• 실무 적용 가능한 AI 워크플로우 템플릿", action: "비즈니스 프로세스 자동화 설계 시 활용" },
  { title: "Google Gemini Gems: Zero-Code AI Workflow Automation Guide", category: "🤖 AI/ML", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• Gemini Gems 노코드 자동화 가이드\n• 제로코드로 AI 워크플로우 구성\n• 비개발자를 위한 AI 활용 전략", action: "클라이언트 AI 교육 자료로 활용" },
  { title: "Context Engineering", category: "🤖 AI/ML", tags: ["Claude","RAG"], importance: "🔴 높음", insights: "• 컨텍스트 엔지니어링 기본 원리\n• 프롬프트 vs 컨텍스트의 차이\n• 대형 컨텍스트 윈도우 활용 전략", action: "모든 AI 프로젝트의 컨텍스트 설계에 적용" },
  { title: "Beyond Prompt Engineering: The Power of Context Design", category: "🤖 AI/ML", tags: ["Claude","RAG"], importance: "🔴 높음", insights: "• 프롬프트 엔지니어링을 넘어선 컨텍스트 설계\n• 시스템 수준 AI 성능 최적화\n• Antigravity 전체 시스템 설계 철학과 연관", action: "AI 시스템 아키텍처 설계 시 핵심 참조" },
  { title: "AI Business Plan Writing Strategies with Gemini", category: "🤖 AI/ML", tags: ["Agent"], importance: "🟡 중간", insights: "• Gemini를 활용한 사업계획서 작성 전략\n• AI 보조 비즈니스 문서화 방법\n• 지원사업 사업계획서 자동화 가이드", action: "정부 지원사업 신청 시 활용" },
  { title: "The Six Month Blueprint for Mastering AI Systems", category: "🤖 AI/ML", tags: ["Claude","Agent"], importance: "🟡 중간", insights: "• 6개월 AI 시스템 마스터 로드맵\n• 단계별 AI 역량 개발 전략\n• 실전 프로젝트 중심 학습 계획", action: "개인 AI 개발 커리큘럼 수립에 활용" },
  { title: "Full-Stack Development with Google AI Studio and Antigravity", category: "🤖 AI/ML", tags: ["Claude","MCP"], importance: "🔴 높음", insights: "• Google AI Studio + Antigravity 풀스택 개발\n• AI 보조 풀스택 개발 워크플로우\n• 빠른 프로토타입 제작 전략", action: "신규 앱 개발 시 개발 환경 설정 참조" },
  { title: "The AI Safety Expert: Roman Yampolskiy on Super Intelligence Risks", category: "🤖 AI/ML", tags: ["Agent"], importance: "🟢 낮음", insights: "• AI 초지능 위험성 전문가 분석\n• AI 안전성 연구 현황\n• 미래 AI 거버넌스 방향", action: "AI 윤리/안전 관련 토론 시 참고" },
  { title: "Building Global Micro-SaaS with AntiGravity and Claude Code", category: "🤖 AI/ML", tags: ["Claude","Agent","MCP"], importance: "🔴 높음", insights: "• Antigravity + Claude Code로 글로벌 마이크로 SaaS 구축\n• 1인 개발자 SaaS 출시 전략\n• AI 코딩으로 개발 비용 최소화", action: "마이크로 SaaS 아이디어 구현 시 필수 참조" },

  // === 💻 개발/기술 ===
  { title: "Installing OpenClaw on Windows and Creating AI Agents", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• Windows에 OpenClaw 설치 및 AI 에이전트 생성\n• 로컬 AI 에이전트 환경 구성\n• OpenClaw 기반 개발 워크플로우", action: "로컬 AI 개발 환경 세팅 시 참조" },
  { title: "Automating Development Workflows with OpenClaw and Mac Mini", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• OpenClaw + Mac Mini로 개발 워크플로우 자동화\n• 홈서버 기반 AI 개발 환경\n• 24시간 자동화 파이프라인 구성", action: "홈서버 개발 환경 구축 시 참조" },
  { title: "Vercel Skills and the Evolution of AI Agent Infrastructure", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• Vercel 플랫폼 AI 에이전트 인프라 진화\n• 서버리스 AI 배포 전략\n• 에지 컴퓨팅 기반 AI 서비스", action: "AI 서비스 배포 인프라 선택 시 참조" },
  { title: "The AI Coding Advantage: Mastering DDD Structure", category: "💻 개발/기술", tags: ["Claude","Agent"], importance: "🔴 높음", insights: "• AI 코딩과 도메인 주도 설계(DDD) 결합\n• AI가 이해하기 쉬운 코드 구조 설계\n• 유지보수성 높은 AI 보조 개발 방법론", action: "새 프로젝트 아키텍처 설계 시 DDD 적용" },
  { title: "Building n8n Workflows with MCP and Natural Language prompts", category: "💻 개발/기술", tags: ["n8n","MCP","Agent"], importance: "🔴 높음", insights: "• n8n + MCP 자연어 워크플로우 구성\n• 프롬프트로 자동화 파이프라인 생성\n• 비개발자도 n8n 워크플로우 제작 가능", action: "n8n 워크플로우 자동 생성 시스템 구축에 활용" },
  { title: "Zero Cost Forever: Hosting Your n8n Server on GCP", category: "💻 개발/기술", tags: ["n8n"], importance: "🟡 중간", insights: "• GCP 무료 티어로 n8n 서버 영구 운영\n• 제로 비용 자동화 인프라 구성\n• GCP + n8n 세팅 단계별 가이드", action: "n8n 서버 무료 인프라 구축 시 참조" },
  { title: "Transforming Old Laptops into Private OpenClaw AI Servers", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟢 낮음", insights: "• 구형 노트북을 프라이빗 AI 서버로 변환\n• 로컬 LLM 서버 구축 방법\n• 저비용 AI 인프라 구성", action: "홈랩 AI 서버 구축 시 참조" },
  { title: "Building Private Local Vision AI Websites with Qwen2-VL", category: "💻 개발/기술", tags: ["Agent"], importance: "🟢 낮음", insights: "• Qwen2-VL 로컬 비전 AI 웹사이트 구축\n• 오프라인 이미지 인식 시스템\n• 프라이버시 보호 로컬 AI 서비스", action: "이미지 인식 기능 추가 시 참조" },
  { title: "Agents.md 규칙", category: "💻 개발/기술", tags: ["Agent","Claude","MCP"], importance: "🔴 높음", insights: "• AI 에이전트 행동 규칙 정의 방법론\n• Agents.md 표준 형식과 작성법\n• Antigravity 에이전트 규칙 시스템의 근간", action: "에이전트 규칙 문서 작성 시 필수 참조" },
  { title: "Local LLM", category: "💻 개발/기술", tags: ["Agent"], importance: "🟡 중간", insights: "• 로컬 LLM 설치·운영 기본 가이드\n• 오프라인 AI 추론 환경 구성\n• 프라이버시 보호 AI 활용 방법", action: "로컬 AI 환경 구축 시 참조" },
  { title: "홈서버", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• 홈서버 구축 및 운영 기본 가이드\n• 로컬 AI/개발 환경 최적화\n• 24시간 서비스 운영 전략", action: "홈서버 세팅 시 참조" },
  { title: "안티그래비티,아두이노,라즈베리파이", category: "💻 개발/기술", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• Antigravity + IoT 기기 연동 방법\n• 아두이노/라즈베리파이 제어 패턴\n• 스마트홈 자동화 구현 가이드", action: "IoT 프로젝트 개발 시 참조" },
  { title: "skills", category: "💻 개발/기술", tags: ["Claude","Agent","MCP"], importance: "🔴 높음", insights: "• Antigravity 스킬 시스템 정의\n• 에이전트 능력 확장 패턴\n• 커스텀 스킬 개발 방법론", action: "새 스킬 개발 시 필수 참조" },

  // === 📈 비즈니스/창업 ===
  { title: "The Blueprint for Building a Million Dollar Business Zero to One", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🔴 높음", insights: "• 0에서 100만 달러 비즈니스 구축 청사진\n• 초기 제품-시장 적합성 검증 전략\n• 스케일업 타이밍과 방법론", action: "신규 비즈니스 모델 수립 시 참조" },
  { title: "The 14-Day App Blueprint: From Zero to Millions with AI", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🔴 높음", insights: "• 14일 만에 AI 앱으로 수백만 달성 전략\n• 초고속 MVP 개발과 출시 방법\n• AI 시대 앱 비즈니스 핵심 원칙", action: "마이크로 SaaS 14일 출시 챌린지에 활용" },
  { title: "Global Vibe Coding: From Development to Market Success", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🔴 높음", insights: "• 바이브코딩으로 글로벌 시장 진출\n• 현지화 없이 글로벌 제품 설계 원칙\n• AI 코딩으로 시작비용 0에 가깝게 창업", action: "글로벌 SaaS 제품 기획 시 참조" },
  { title: "Daniel Priestley's 5-Step Billion Won Startup Strategy", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🔴 높음", insights: "• Daniel Priestley의 10억 스타트업 5단계 전략\n• 개인 브랜드 기반 비즈니스 구축\n• 수요 창출 vs 공급 최적화 전략", action: "스타트업 성장 전략 수립 시 핵심 참조" },
  { title: "마이크로 사스 홍보전략", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🔴 높음", insights: "• 마이크로 SaaS 제품 홍보 전략\n• 커뮤니티 기반 바이럴 마케팅\n• 저비용 고효율 유저 확보 방법", action: "SaaS 제품 출시 마케팅 계획 수립에 활용" },
  { title: "The Two-Week Rule for Rapid Business Success", category: "📈 비즈니스/창업", tags: ["창업"], importance: "🟡 중간", insights: "• 2주 규칙으로 빠른 비즈니스 성공\n• 빠른 실험과 피벗 방법론\n• 린 스타트업 심화 전략", action: "신규 서비스 론칭 타임라인 설정에 참조" },
  { title: "A Business That Makes Money: Three Pillars of Success", category: "📈 비즈니스/창업", tags: ["창업","마케팅"], importance: "🟡 중간", insights: "• 수익 창출 사업의 3가지 핵심 기둥\n• 지속 가능한 비즈니스 모델 설계\n• 현금흐름 최적화 전략", action: "사업계획서 핵심 지표 설정 시 참조" },
  { title: "RFP를 제안서로 만들기", category: "📈 비즈니스/창업", tags: ["창업","지원사업"], importance: "🟡 중간", insights: "• RFP를 경쟁력 있는 제안서로 전환하는 방법\n• 제안서 구조와 설득 전략\n• AI를 활용한 제안서 작성 자동화", action: "제안서 작성 시 구조와 논리 설계에 참조" },
  { title: "Beyond Traffic: Master the Psychology of High-Value Conversion", category: "📈 비즈니스/창업", tags: ["마케팅"], importance: "🟡 중간", insights: "• 트래픽 넘어 고가치 전환 심리학\n• 구매 결정 심리 트리거\n• 랜딩페이지 최적화 전략", action: "서비스 판매 전환율 개선 시 참조" },
  { title: "Cornering Success: How Mo Seori Conquered the Global Market", category: "📈 비즈니스/창업", tags: ["마케팅","창업"], importance: "🟡 중간", insights: "• Mo Seori가 글로벌 시장을 공략한 틈새 전략\n• 니치 마켓 선점 방법론\n• K-콘텐츠 글로벌화 사례 연구", action: "글로벌 틈새시장 공략 전략 수립에 참조" },
  { title: "사기꾼에게 얻은 전략", category: "📈 비즈니스/창업", tags: ["마케팅","심리학"], importance: "🟡 중간", insights: "• 설득과 영향력의 심리적 원리\n• 비즈니스에서 활용 가능한 설득 전략\n• 역으로 사기 피하는 방법", action: "영업/마케팅 전략 수립 시 심리 기법 참조" },
  { title: "The Seven Dark Psychology Triggers of Master Salesmen", category: "📈 비즈니스/창업", tags: ["마케팅","심리학"], importance: "🟡 중간", insights: "• 마스터 세일즈맨의 7가지 심리 트리거\n• 고객 구매 결정을 이끄는 감정 전략\n• 윤리적 활용 방안", action: "세일즈 스크립트 및 마케팅 카피 작성에 활용" },
  { title: "온라인 비즈니스 퍼널", category: "📈 비즈니스/창업", tags: ["마케팅","창업"], importance: "🟡 중간", insights: "• 온라인 비즈니스 판매 퍼널 설계\n• 리드→구매→재구매 퍼널 최적화\n• 자동화 마케팅 시스템 구축", action: "제품 판매 자동화 퍼널 구축에 활용" },
  { title: "Korean Craft Brewery Market Landscape and Competitor Analysis Report", category: "📈 비즈니스/창업", tags: ["창업","브루잉"], importance: "🔴 높음", insights: "• 한국 크래프트 맥주 시장 현황\n• 경쟁사 심층 분석\n• 시장 진입 전략 및 차별화 포인트", action: "에일리언 브루잉 경쟁 전략 수립 시 핵심 참조" },
  { title: "간판", category: "📈 비즈니스/창업", tags: ["창업"], importance: "🟢 낮음", insights: "• 간판 디자인 및 마케팅 효과\n• 오프라인 점포 브랜딩 전략\n• 비용 대비 효과 분석", action: "오프라인 매장 브랜딩 시 참조" },
  { title: "Psychological Archetypes in Brand Identity", category: "📈 비즈니스/창업", tags: ["마케팅"], importance: "🟡 중간", insights: "• 브랜드 아이덴티티의 심리학적 원형\n• 12가지 브랜드 아키타입과 적용법\n• 브랜드 일관성 유지 전략", action: "Antigravity/에일리언 브랜드 아이덴티티 재정립 시 활용" },

  // === 🏛️ 정부지원/사업 ===
  { title: "2026 AI Voucher Announcement and Startup Support Projects", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🔴 높음", insights: "• 2026 AI 바우처 공고 내용과 지원 자격\n• 스타트업 지원 사업 주요 항목\n• 신청 전략 및 평가 기준 분석", action: "AI 바우처 신청 서류 준비 시 참조" },
  { title: "2026 AI Voucher Support Project and Startup Consulting Strategy", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🔴 높음", insights: "• 2026 AI 바우처 컨설팅 전략\n• 심사위원 관점에서 본 평가 포인트\n• 합격률 높이는 사업계획서 작성법", action: "AI 바우처 컨설팅 서비스 제공 시 활용" },
  { title: "Data 바우처", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🔴 높음", insights: "• 데이터 바우처 지원 사업 가이드\n• 데이터 구매·활용 바우처 종류\n• 신청 자격과 절차", action: "데이터 바우처 신청 서류 준비에 활용" },
  { title: "2026 지원사업", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🔴 높음", insights: "• 2026년 주요 정부 지원사업 목록\n• 분야별 지원 규모와 조건\n• 우선 신청 추천 사업", action: "연간 지원사업 신청 계획 수립에 활용" },
  { title: "2025년 지원사업", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🟡 중간", insights: "• 2025년 지원사업 결과 및 교훈\n• 성공/실패 사례 분석\n• 2026년 전략 수립에 활용할 인사이트", action: "향후 신청 전략 개선에 활용" },
  { title: "2024 Agri-Food Venture Incubation Support Program Application Guide", category: "🏛️ 정부지원/사업", tags: ["지원사업","브루잉"], importance: "🟡 중간", insights: "• 농식품 벤처 인큐베이션 신청 가이드\n• 농식품 분야 창업 지원 조건\n• 심사 평가 기준 분석", action: "식품/음료 관련 창업 지원 신청 시 참조" },
  { title: "예창패 사업기획서", category: "🏛️ 정부지원/사업", tags: ["지원사업","창업"], importance: "🔴 높음", insights: "• 예비창업패키지 사업기획서 작성 가이드\n• 합격 사업계획서 구조 분석\n• 심사위원이 보는 핵심 포인트", action: "예창패 재신청 시 사업계획서 개선에 활용" },
  { title: "사업계획서 분석", category: "🏛️ 정부지원/사업", tags: ["지원사업","창업"], importance: "🟡 중간", insights: "• 성공적인 사업계획서 구조 및 요소 분석\n• 심사 통과를 위한 필수 포인트\n• AI 기반 사업계획서 초안 자동화", action: "모든 지원사업 신청 시 사업계획서 템플릿으로 활용" },
  { title: "사업계회서 작성", category: "🏛️ 정부지원/사업", tags: ["지원사업","창업"], importance: "🟡 중간", insights: "• 사업계획서 작성 실전 가이드\n• 실무자 관점의 작성 팁\n• 자주 실수하는 포인트", action: "지원사업 신청 서류 작성 시 참조" },
  { title: "정부과제 노트", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🟡 중간", insights: "• 정부 R&D 과제 신청 및 관리\n• 과제 수행 중 중요 체크포인트\n• 정산 및 보고서 작성 가이드", action: "정부과제 수행 중 절차 확인에 활용" },
  { title: "Public Institution Fair Recruitment Guidelines and Audit Standards", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🟢 낮음", insights: "• 공공기관 공정 채용 기준\n• 채용 감사 기준 및 준수 사항\n• 채용 절차 적법성 확인", action: "직원 채용 시 법적 기준 확인에 참조" },
  { title: "Future of Public Employment: AI, MZ Generation, and Regional Talent", category: "🏛️ 정부지원/사업", tags: ["지원사업"], importance: "🟢 낮음", insights: "• AI 시대 공공 고용의 미래\n• MZ 세대와 지역인재 채용 트렌드\n• 공공기관 AI 도입 현황", action: "채용 전략 및 인력 계획 수립 시 참조" },
  { title: "2026 AI Basic Act: A Comprehensive Guide to New Rules", category: "🏛️ 정부지원/사업", tags: ["지원사업","Claude"], importance: "🟡 중간", insights: "• 2026 AI 기본법 주요 내용\n• AI 서비스 운영 시 준수해야 할 규정\n• 리스크 관리 방안", action: "AI 서비스 출시 전 법적 준수 사항 확인" },

  // === 🧠 자기계발/심리 ===
  { title: "인간본성의 법칙", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🔴 높음", insights: "• 로버트 그린의 인간 본성 18가지 법칙\n• 심리적 패턴 이해와 활용\n• 리더십과 대인관계에 적용", action: "팀 리더십 및 협상 전략 수립에 활용" },
  { title: "바딤 젤란드가 정립한 '리얼리티 트랜서핑'", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟡 중간", insights: "• 리얼리티 트랜서핑 핵심 원리\n• 의도와 에너지 관리 방법론\n• 목표 실현 전략", action: "개인 목표 설정 및 달성 전략에 활용" },
  { title: "아더리시 기버", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟡 중간", insights: "• Give and Take 원리의 현대적 적용\n• 기버(Giver) 전략으로 성공하는 방법\n• 네트워크 구축에서 기버 마인드셋", action: "비즈니스 네트워킹 전략에 활용" },
  { title: "레즈오션으로부터", category: "🧠 자기계발/심리", tags: ["심리학","창업"], importance: "🟡 중간", insights: "• 레드오션에서 블루오션 발견하는 전략\n• 가치 혁신을 통한 시장 재정의\n• 경쟁 없는 시장 공간 창출", action: "신규 서비스 시장 차별화 전략에 활용" },
  { title: "윤현의 재정 독립을 위한 전략적 자산 설계와 실행 지침서", category: "🧠 자기계발/심리", tags: ["재테크"], importance: "🔴 높음", insights: "• 개인 재정 독립을 위한 자산 설계\n• 수입-지출-투자 최적화 전략\n• 단계별 재정 목표 달성 로드맵", action: "개인 재정 계획 수립 및 실행에 직접 활용" },
  { title: "운과 커리어", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟡 중간", insights: "• 커리어에서 운의 역할\n• 행운을 만드는 구조 설계\n• 기회 포착 능력 개발", action: "커리어 전략 및 기회 발굴 방법에 활용" },
  { title: "폰없는 미래", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟢 낮음", insights: "• 스마트폰 의존도 감소의 미래\n• 디지털 디톡스와 집중력 회복\n• 기술과 인간의 새로운 관계", action: "디지털 웰빙 전략 수립에 참조" },
  { title: "말기 4MAT", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟡 중간", insights: "• 4MAT 학습 스타일 모델\n• 교육·발표 설계에 적용하는 4MAT 방법론\n• 다양한 학습자 유형에 맞는 설명 전략", action: "교육 콘텐츠 및 발표 구조 설계에 활용" },
  { title: "가지치기법", category: "🧠 자기계발/심리", tags: ["심리학"], importance: "🟡 중간", insights: "• 생각 정리와 우선순위 결정 방법\n• 불필요한 것을 제거하는 집중 전략\n• 가지치기의 원리를 업무에 적용", action: "프로젝트 우선순위 결정 시 활용" },
  { title: "Untitled notebook", category: "🧠 자기계발/심리", tags: [], importance: "🟢 낮음", insights: "• 내용 미분류 (소스 없음)\n• 추가 확인 필요", action: "내용 확인 후 적절한 카테고리로 이동" },

  // === 🍺 바이오/식품/브루잉 ===
  { title: "Korean Craft Brewery Market Landscape and Competitor Analysis Report", category: "🍺 바이오/식품/브루잉", tags: ["브루잉","창업"], importance: "🔴 높음", insights: "• 한국 크래프트 맥주 시장 분석\n• 경쟁사 현황 및 차별화 포인트\n• 시장 진입 전략", action: "에일리언 브루잉 전략 수립 시 참조" },
  { title: "에일리언브루잉 용역: Regional Beer Development Report", category: "🍺 바이오/식품/브루잉", tags: ["브루잉"], importance: "🔴 높음", insights: "• 지역 맥주 개발 보고서\n• 에일리언 브루잉 제품 개발 방향\n• 지역 특색을 살린 레시피 전략", action: "에일리언 브루잉 신제품 개발 시 참조" },
  { title: "2021 Beer Style Judging and Classification Guidelines", category: "🍺 바이오/식품/브루잉", tags: ["브루잉"], importance: "🟡 중간", insights: "• BJCP 맥주 스타일 심판 기준\n• 맥주 분류 체계와 특성\n• 품질 평가 기준", action: "맥주 품질 관리 및 대회 출품 시 참조" },
  { title: "코르크 바닥재", category: "🍺 바이오/식품/브루잉", tags: ["창업"], importance: "🟢 낮음", insights: "• 코르크 바닥재 특성과 장단점\n• 인테리어 소재로서의 코르크\n• 가격 및 시공 고려사항", action: "매장 인테리어 설계 시 소재 선택 참조" },
  { title: "음식페어링 가이드", category: "🍺 바이오/식품/브루잉", tags: ["브루잉"], importance: "🟡 중간", insights: "• 맥주-음식 페어링 원칙\n• 맛의 보완과 대비 전략\n• 메뉴 구성에 활용하는 페어링 법칙", action: "에일리언 브루잉 메뉴/이벤트 기획 시 활용" },
  { title: "케비어 된장찌개", category: "🍺 바이오/식품/브루잉", tags: ["브루잉"], importance: "🟢 낮음", insights: "• 발효식품의 풍미 요소\n• 된장과 캐비어의 만남 (퓨전 요리)\n• 고급 식재료 활용 아이디어", action: "브루 펍 푸드 메뉴 개발 시 아이디어 참조" },
  { title: "2025-2026 Global AI Pet Healthcare Market and Technology Report", category: "🍺 바이오/식품/브루잉", tags: ["창업"], importance: "🟡 중간", insights: "• 글로벌 AI 반려동물 헬스케어 시장 분석\n• AI 기술 적용 사례 및 트렌드\n• 시장 진입 기회", action: "AI 반려동물 서비스 개발 시 시장 분석 참조" },
  { title: "AI Agentic Smart Collar Development Strategy", category: "🍺 바이오/식품/브루잉", tags: ["Agent","창업"], importance: "🟡 중간", insights: "• AI 스마트 목걸이 개발 전략\n• 반려동물 IoT 헬스케어 아키텍처\n• 시장 진입 전략 및 경쟁 분석", action: "AI 스마트 목걸이 제품 개발 로드맵에 활용" },
  { title: "Domestic Pet Care and Monitoring Robotics Market Analysis", category: "🍺 바이오/식품/브루잉", tags: ["창업"], importance: "🟡 중간", insights: "• 국내 반려동물 케어 로봇 시장\n• 주요 플레이어 및 기술 현황\n• 시장 규모와 성장 가능성", action: "반려동물 로봇 제품 개발 시 시장 분석 참조" },

  // === 💰 재테크/금융 ===
  { title: "The Rockefeller Waterfall: Building a Perpetual Family Bank", category: "💰 재테크/금융", tags: ["재테크"], importance: "🟡 중간", insights: "• 록펠러 워터폴 - 영구적 패밀리 뱅크 구축\n• 세대 간 자산 이전 전략\n• 무한 복리 시스템 설계", action: "장기 자산 증식 전략 수립 시 참조" },
  { title: "2026 Monthly Fortune and Financial Success Guide", category: "💰 재테크/금융", tags: ["재테크"], importance: "🟢 낮음", insights: "• 2026년 월별 운세와 재정 성공 가이드\n• 재정 결정에 활용하는 타이밍 전략\n• 행운의 관점에서 본 투자 시기", action: "연간 재정 계획 참고 자료로 활용" },
  { title: "2026 농지연금 가입 자격 및 수령액 완전 가이드", category: "💰 재테크/금융", tags: ["재테크"], importance: "🟡 중간", insights: "• 농지연금 가입 자격과 수령액 계산\n• 농지를 활용한 노후 소득 전략\n• 신청 절차 및 주의사항", action: "농지 자산 활용 및 노후 소득 계획 시 참조" },
  { title: "장수경제", category: "💰 재테크/금융", tags: ["재테크"], importance: "🟡 중간", insights: "• 고령화 시대 장수경제 트렌드\n• 시니어 시장 비즈니스 기회\n• 장기 투자 전략의 새로운 관점", action: "시니어 타겟 비즈니스 기획 시 참조" },

  // === 🔬 과학/철학 ===
  { title: "Decoherence is Time: Quantum Superposition and the Birth of Chronos", category: "🔬 과학/철학", tags: [], importance: "🟢 낮음", insights: "• 양자 중첩과 시간 탄생의 관계\n• 양자역학적 시간 개념\n• 우주론적 관점에서의 시간", action: "과학적 세계관 확장 및 창의적 사고에 활용" },
  { title: "미세구조 상수", category: "🔬 과학/철학", tags: [], importance: "🟢 낮음", insights: "• 미세구조 상수의 물리학적 의미\n• 우주의 근본 상수 이해\n• 과학 철학적 관점", action: "과학적 교양 강화 및 관련 연구 참조" },
  { title: "존 어리 <모빌리티(Mobilities)>", category: "🔬 과학/철학", tags: [], importance: "🟢 낮음", insights: "• 모빌리티 패러다임\n• 이동성의 사회학적 분석\n• 스마트시티와 이동 혁명", action: "스마트모빌리티 서비스 기획 시 이론적 배경 참조" },
  { title: "PSST 배분전략", category: "🔬 과학/철학", tags: ["재테크"], importance: "🟡 중간", insights: "• PSST 자산 배분 전략\n• 주식-채권-현금 최적 배분\n• 시장 상황별 리밸런싱 전략", action: "투자 포트폴리오 구성 시 참조" },

  // === 📝 기타 ===
  { title: "안티그래비티", category: "📝 기타", tags: ["Agent","MCP","Claude"], importance: "🔴 높음", insights: "• Antigravity 시스템 전체 개요\n• 에이전트, 스킬, MCP 통합 아키텍처\n• 향후 개발 방향과 비전", action: "Antigravity 시스템 설계 참조 문서" },
  { title: "논백 논문", category: "📝 기타", tags: [], importance: "🟡 중간", insights: "• 논백(Non-back) 관련 연구 논문\n• 학술 연구 방법론\n• 실무 적용 가능성", action: "학술 연구 및 논문 작성 시 참조" },
  { title: "숭실대", category: "📝 기타", tags: [], importance: "🟢 낮음", insights: "• 숭실대 관련 정보\n• 교육 과정 및 협력 가능성", action: "학교 협력 프로그램 검토 시 참조" },
  { title: "범한시청각교재개발원", category: "📝 기타", tags: [], importance: "🟢 낮음", insights: "• 시청각 교재 개발 기관 정보\n• 교육 콘텐츠 제작 참조", action: "교육 콘텐츠 외주 제작 시 참조" },
  { title: "Professional Profile and Brewing Career of Yun Hyeon", category: "📝 기타", tags: ["브루잉"], importance: "🟡 중간", insights: "• 윤현의 전문 프로필과 브루잉 커리어\n• 경력 기술서 핵심 내용\n• 브루마스터로서의 포지셔닝", action: "포트폴리오, 이력서 업데이트 시 참조" },
  { title: "The Rise of Clawdbot: A Local AI Paradigm Shift", category: "📝 기타", tags: ["Agent","MCP"], importance: "🟡 중간", insights: "• Clawdbot의 로컬 AI 패러다임 전환\n• 온디바이스 AI 전략\n• 로컬 AI의 미래 방향", action: "로컬 AI 서비스 개발 전략 수립에 참조" },
  { title: "Daniel Priestley's 5-Step Billion Won Startup Strategy", category: "📝 기타", tags: ["창업","마케팅"], importance: "🟡 중간", insights: "• 10억 스타트업 5단계 전략 복습", action: "창업 전략 참조" },
];

module.exports = NOTEBOOKS;
