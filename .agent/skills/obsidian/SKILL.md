---
name: obsidian
description: "Antigravity 앱에서 옵시디언(Obsidian)을 연동하는 모든 패턴. Local REST API 연동 / 마크다운 파싱 / 플러그인 개발 / AI 지식베이스 활용 네 가지 방법을 모두 지원."
namespace: skillssmp.library.antigravity.obsidian
version: 1.0.0
requires:
  packages:
    - "obsidian-local-rest-api (플러그인, 선택)"
    - "gray-matter"
    - "remark"
    - "remark-parse"
    - "remark-html"
  mcp_optional: [notebooklm]
---

# Antigravity × Obsidian 통합 스킬

안티그래비티 앱에서 옵시디언 Vault를 활용하는 네 가지 패턴을 제공합니다.
상황에 맞는 방법을 선택하세요.

---

## 방법 1: Vault 실시간 연동 (Local REST API)

### 사용 시나리오
- 앱에서 옵시디언 Vault의 노트를 실시간으로 읽고 쓸 때
- 앱과 옵시디언을 동기화된 데이터 소스로 사용할 때
- 로컬 환경에서 운영되는 앱에서 Vault를 CMS처럼 활용할 때

### 사전 준비
1. 옵시디언 → Settings → Community Plugins → Browse
2. **"Local REST API"** 플러그인 설치 및 활성화
3. 플러그인 설정에서 API Key 확인 (기본 포트: `27123`)

### 환경변수 (`.env.local`)
```
OBSIDIAN_API_URL=http://localhost:27123
OBSIDIAN_API_KEY=your_api_key_here
OBSIDIAN_VAULT_NAME=MyVault
```

### 표준 파일 구조
```
src/
├── lib/
│   └── obsidian.ts          # Obsidian REST API 클라이언트
└── app/
    └── api/
        └── obsidian/
            └── route.ts     # 서버사이드 API Route
```

### obsidian.ts 표준 패턴
```typescript
const OBSIDIAN_URL = process.env.OBSIDIAN_API_URL!;
const OBSIDIAN_KEY = process.env.OBSIDIAN_API_KEY!;

const headers = {
  Authorization: `Bearer ${OBSIDIAN_KEY}`,
  "Content-Type": "application/json",
};

// 노트 목록 조회
export async function listNotes(folder = "/") {
  const res = await fetch(`${OBSIDIAN_URL}/vault/${encodeURIComponent(folder)}`, { headers });
  return res.json();
}

// 노트 내용 읽기
export async function getNote(path: string) {
  const res = await fetch(`${OBSIDIAN_URL}/vault/${encodeURIComponent(path)}`, { headers });
  return res.text(); // 마크다운 원문 반환
}

// 노트 생성/수정
export async function upsertNote(path: string, content: string) {
  await fetch(`${OBSIDIAN_URL}/vault/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers,
    body: content,
  });
}

// 노트 검색
export async function searchNotes(query: string) {
  const res = await fetch(`${OBSIDIAN_URL}/search/simple/?query=${encodeURIComponent(query)}`, { headers });
  return res.json();
}

// Active 노트 (현재 옵시디언에서 열려 있는 노트) 가져오기
export async function getActiveNote() {
  const res = await fetch(`${OBSIDIAN_URL}/active/`, { headers });
  return res.text();
}
```

### API Route 표준 패턴
```typescript
// GET /api/obsidian?path=folder/note.md
import { getNote, listNotes } from "@/lib/obsidian";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") || "/";
  const isFolder = path.endsWith("/") || !path.includes(".");
  const data = isFolder ? await listNotes(path) : await getNote(path);
  return NextResponse.json({ data });
}
```

### Pitfalls
- Local REST API는 **로컬 환경 전용** → Vercel 등 서버 배포 시 사용 불가 (방법 2 사용)
- 옵시디언이 실행 중이어야 API 응답 가능
- CORS 이슈 → 반드시 서버사이드(API Route)에서 호출할 것

---

## 방법 2: 마크다운 파일 직접 파싱

### 사용 시나리오
- Vault 폴더를 앱 소스와 함께 공유/복사해서 정적으로 활용할 때
- 빌드 타임에 노트를 읽어서 정적 사이트로 생성할 때 (Next.js SSG)
- Frontmatter(YAML 메타데이터) 기반으로 콘텐츠를 분류/필터링할 때

### 패키지 설치
```bash
npm install gray-matter remark remark-parse remark-html
```

### 마크다운 파싱 유틸리티
```typescript
// src/lib/md-parser.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const VAULT_DIR = path.join(process.cwd(), "vault"); // 또는 환경변수로 위치 지정

// Frontmatter + 본문 파싱
export function parseNote(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, content };
}

// 마크다운 → HTML 변환
export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

// Vault 내 모든 노트 인덱싱
export function indexVault(folder = VAULT_DIR): Array<{ slug: string; frontmatter: Record<string, unknown>; excerpt: string }> {
  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const { frontmatter, content } = parseNote(path.join(folder, file));
    return {
      slug: file.replace(/\.md$/, ""),
      frontmatter,
      excerpt: content.slice(0, 200),
    };
  });
}
```

### Frontmatter 작성 규칙 (Obsidian 노트)
옵시디언 노트 상단에 YAML 메타데이터를 추가하면 앱에서 필터링 가능:
```yaml
---
title: 여행 코스 추천
tags: [travel, seoul, lumi]
date: 2026-02-23
published: true
category: itinerary
---
```

### Pitfalls
- 서버 컴포넌트 또는 `getStaticProps`에서만 `fs` 모듈 사용 가능
- Vault 경로를 환경변수(`VAULT_PATH`)로 관리해 팀원 간 충돌 방지

---

## 방법 3: 옵시디언 플러그인 개발

### 사용 시나리오
- 옵시디언 내부에서 동작하는 커스텀 기능을 만들 때
- 외부 앱/서비스와 옵시디언을 연결하는 통합 플러그인을 만들 때
- AI 에이전트가 옵시디언을 직접 조작하도록 플러그인을 개발할 때

### 개발 환경 세팅
```bash
# 플러그인 스캐폴딩
npx -y create-obsidian-plugin@latest

# 또는 공식 샘플 클론
git clone https://github.com/obsidianmd/obsidian-sample-plugin
cd obsidian-sample-plugin
npm install
npm run dev
```

### 플러그인 기본 구조
```
my-plugin/
├── main.ts          # 플러그인 진입점
├── manifest.json    # 플러그인 메타데이터
├── styles.css       # 커스텀 스타일 (선택)
└── package.json
```

### main.ts 기본 패턴
```typescript
import { App, Plugin, PluginSettingTab, Setting, Notice, TFile } from "obsidian";

interface MyPluginSettings {
  apiEndpoint: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  apiEndpoint: "http://localhost:3000",
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // 리본 아이콘 추가
    this.addRibbonIcon("send", "Sync to App", async () => {
      const file = this.app.workspace.getActiveFile();
      if (!file) return new Notice("열린 노트가 없습니다.");
      const content = await this.app.vault.read(file);
      await this.syncToApp(file.path, content);
      new Notice("앱과 동기화 완료!");
    });

    // 커맨드 추가
    this.addCommand({
      id: "sync-active-note",
      name: "Active Note를 앱으로 전송",
      callback: () => this.syncActiveNote(),
    });

    // 설정 탭 추가
    this.addSettingTab(new MyPluginSettingTab(this.app, this));
  }

  async syncToApp(path: string, content: string) {
    await fetch(`${this.settings.apiEndpoint}/api/obsidian/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
  }

  async syncActiveNote() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    const content = await this.app.vault.read(file);
    await this.syncToApp(file.path, content);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class MyPluginSettingTab extends PluginSettingTab {
  plugin: MyPlugin;
  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("API Endpoint")
      .setDesc("앱 서버 주소")
      .addText((text) =>
        text.setValue(this.plugin.settings.apiEndpoint).onChange(async (val) => {
          this.plugin.settings.apiEndpoint = val;
          await this.plugin.saveSettings();
        })
      );
  }
}
```

### 플러그인 배포
1. `npm run build` → `main.js`, `manifest.json` 생성
2. Vault `.obsidian/plugins/my-plugin/` 폴더에 복사
3. 옵시디언 → Settings → Community Plugins → 활성화

### Pitfalls
- 플러그인은 옵시디언 내부 Electron 환경에서 실행 → Node.js 모듈 일부 제한
- `manifest.json`의 `minAppVersion` 설정 필수
- `npm run dev` 실행 후 옵시디언에서 플러그인을 활성화해야 변경사항 반영

---

## 방법 4: AI 지식베이스로 연동 (NotebookLM / Claude)

### 사용 시나리오
- Claude가 옵시디언 Vault의 내용을 기반으로 답변할 때
- Vault 노트들을 NotebookLM에 업로드해 AI 리서치 파트너로 활용할 때
- 옵시디언 노트를 AI 프롬프트 컨텍스트로 자동 주입할 때

### 패턴 A: NotebookLM 연동
1. Vault의 마크다운 파일들을 PDF 또는 텍스트로 내보내기
2. NotebookLM (notebooklm.google.com) → 새 노트북 생성
3. 파일 업로드 → AI가 Vault 내용 기반으로 답변
4. 공유 링크 생성 → `notebooklm` MCP의 `add_notebook`으로 등록

### 패턴 B: Claude 컨텍스트 주입
```typescript
// src/lib/vault-context.ts
// 노트를 AI 프롬프트용 컨텍스트로 변환
import { indexVault } from "./md-parser";

export function buildVaultContext(tags?: string[]): string {
  const notes = indexVault();
  const filtered = tags
    ? notes.filter((n) => tags.some((t) => n.frontmatter.tags?.includes(t)))
    : notes;

  return filtered
    .map((n) => `# ${n.frontmatter.title || n.slug}\n${n.excerpt}`)
    .join("\n\n---\n\n");
}

// 사용 예 (API Route에서)
export async function POST(req: Request) {
  const { question } = await req.json();
  const vaultContext = buildVaultContext(["lumi", "travel"]);

  const prompt = `
다음은 옵시디언 Vault의 관련 노트들입니다:
${vaultContext}

위 내용을 바탕으로 답변해 주세요: ${question}
  `;
  // → Claude API 또는 다른 LLM으로 전달
}
```

### 패턴 C: Vault를 실시간 RAG로 (로컬 환경)
```typescript
// Local REST API + 임베딩 + 벡터 검색 구조
// 1. searchNotes(query) → 관련 노트 목록
// 2. 각 노트 내용 getNote(path)로 불러오기
// 3. 컨텍스트로 조합 → LLM 호출

export async function ragQuery(question: string, topK = 3) {
  const results = await searchNotes(question);
  const topNotes = results.slice(0, topK);
  const contexts = await Promise.all(topNotes.map((r: { filename: string }) => getNote(r.filename)));
  return contexts.join("\n\n---\n\n");
}
```

### Pitfalls
- NotebookLM 무료 계정: 노트북 100개, 소스당 500K 단어 제한
- 실시간 RAG 구현 시 옵시디언 실행 필수 (로컬 API 의존)
- 노트 내용을 외부 AI 서비스로 보낼 때 **민감 정보 포함 여부** 반드시 확인

---

## 안티그래비티 옵시디언 운영 원칙

1. **Vault 위치 규칙**: `d:\안티그래비티\vault\` 또는 각 프로젝트 루트의 `vault/` 폴더
2. **태그 규칙**: `[앱명]-[카테고리]` (예: `lumi-itinerary`, `lumi-course`)
3. **Frontmatter 필수 필드**: `title`, `tags`, `date`, `published`
4. **민감 정보 격리**: API 키, 개인정보가 담긴 노트는 `.gitignore`의 `vault/private/`에 격리
5. **NotebookLM 등록**: 주요 Vault는 `add_notebook` MCP 도구로 등록해 Claude가 참조 가능하도록 유지

---

## 참고 스킬
- `notion-db`: 유사한 외부 DB 연동 패턴
- `google_maps`: API 클라이언트 + Route 패턴 참고
- `lumi_curator`: Vault 노트를 루미 컨텐츠로 활용하는 방법
