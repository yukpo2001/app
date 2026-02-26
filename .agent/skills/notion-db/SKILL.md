---
name: notion-db
description: "Antigravity 전체 앱에서 노션을 공용 DB로 사용하는 패턴. 코드 연동(Notion API) + AI 자동화(Rube MCP) 두 가지 방법을 모두 지원."
namespace: skillssmp.library.antigravity.notion
version: 1.0.0
requires:
  packages:
    - "@notionhq/client"
  mcp_optional: [rube]
---

# Antigravity × Notion DB 통합 스킬

안티그래비티의 모든 앱은 노션을 공용 데이터베이스로 사용합니다.
두 가지 방법을 상황에 맞게 선택하세요.

---

## 방법 1: 앱 코드에서 직접 연동 (Notion API)

### 사용 시나리오
- 앱에서 노션 DB 데이터를 실시간으로 읽고 쓸 때
- 사용자 입력을 노션 DB에 저장할 때
- 노션을 CMS(콘텐츠 관리 시스템)로 사용할 때

### 환경변수 (`.env.local`)
```
NOTION_TOKEN=secret_xxxx          # Notion Integration Token
NOTION_DB_ID=xxxx                 # 기본 DB ID (앱별로 다를 수 있음)
```

### Notion Integration 발급
1. https://www.notion.so/my-integrations 접속
2. "New integration" 클릭 → 이름 입력 → Submit
3. "Internal Integration Secret" 복사 → `NOTION_TOKEN`에 저장
4. 노션에서 DB 열기 → 우상단 ··· → "Connections" → Integration 추가

### 표준 파일 구조
모든 Antigravity 앱에서 동일한 구조를 사용합니다:
```
src/
├── lib/
│   └── notion.ts          # Notion API 클라이언트 (서버 전용)
└── app/
    └── api/
        └── notion/
            └── route.ts   # 서버사이드 API Route
```

### notion.ts 표준 패턴
```typescript
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// DB 조회
export async function queryDatabase(databaseId: string, filter?: object) {
  return notion.databases.query({
    database_id: databaseId,
    filter: filter as any,
  });
}

// 행 삽입
export async function insertRow(databaseId: string, properties: object) {
  return notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties as any,
  });
}

// 행 수정
export async function updateRow(pageId: string, properties: object) {
  return notion.pages.update({
    page_id: pageId,
    properties: properties as any,
  });
}
```

### API Route 표준 패턴
```typescript
// GET /api/notion?db=DB_ID
import { queryDatabase } from "@/lib/notion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const dbId = req.nextUrl.searchParams.get("db") 
    || process.env.NOTION_DB_ID!;
  const data = await queryDatabase(dbId);
  return NextResponse.json(data);
}
```

### Pitfalls
- `NOTION_TOKEN`은 절대 클라이언트 컴포넌트에서 직접 사용 금지 → 항상 API Route 경유
- DB가 Integration과 공유되지 않으면 404 발생 → Connections에서 Integration 추가 확인
- 프로퍼티 이름은 대소문자 구분 → 노션 DB 스키마와 정확히 일치해야 함

---

## 방법 2: AI(Claude)가 직접 노션 조작 (Rube MCP)

### 사용 시나리오
- Claude가 직접 노션 DB를 읽거나 업데이트할 때
- 노션 페이지/DB를 자동화 작업으로 관리할 때
- 방법 1의 코드 없이 빠르게 노션 조작이 필요할 때

### MCP 설정
Claude Desktop → Settings → Developer → Edit Config:
```json
{
  "mcpServers": {
    "rube": {
      "url": "https://rube.app/mcp"
    }
  }
}
```

### 연결 순서
1. `RUBE_MANAGE_CONNECTIONS` 호출 (toolkit: "notion")
2. 반환된 OAuth 링크로 노션 계정 연결
3. 상태가 ACTIVE이면 사용 가능

### 주요 도구 (notion-automation 스킬 참조)
| 목적 | 도구 |
|------|------|
| DB 검색 | `NOTION_SEARCH_NOTION_PAGE` |
| DB 조회 | `NOTION_QUERY_DATABASE` |
| 행 삽입 | `NOTION_INSERT_ROW_DATABASE` |
| 행 수정 | `NOTION_UPDATE_ROW_DATABASE` |
| 스키마 확인 | `NOTION_FETCH_DATABASE` |

> 자세한 도구 목록은 `notion-automation` 스킬 참조

---

## Antigravity 앱별 DB 관리 원칙

1. **앱마다 전용 DB** 생성 (공유 DB 사용 시 혼선 방지)
2. **DB 이름 규칙**: `[앱명]_[데이터종류]` (예: `lumi_courses`, `biz_users`)
3. **Integration 하나로 모든 DB 관리** (antigravity-integration 하나 생성 후 공유)
4. **Vercel 환경변수 등록** — 배포 시 Vercel Dashboard → Settings → Environment Variables에도 동일하게 추가

---

## 참고 스킬
- `notion-automation`: Rube MCP 상세 워크플로우
- `google_maps`: 유사한 외부 API 연동 패턴 참고
