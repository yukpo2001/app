/**
 * Notion API 클라이언트 (서버 전용 - 클라이언트 컴포넌트에서 직접 import 금지)
 * 안티그래비티 표준 패턴: @notionhq/client v5 래퍼
 *
 * ⚠️ v5 breaking change: databases.query → notion.request() 직접 호출로 대체
 *
 * 환경변수:
 *   NOTION_TOKEN=secret_...    (Notion Integration Token)
 *   NOTION_DB_ID=...           (기본 DB ID, 선택사항)
 */

import { Client } from "@notionhq/client";

// ─── 클라이언트 초기화 ────────────────────────────────────────
const getClient = () => {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
        throw new Error("[notion] NOTION_TOKEN 환경변수가 설정되지 않았습니다.");
    }
    return new Client({ auth: token });
};

// ─── 공통 타입 ────────────────────────────────────────────────
export interface NotionFilter {
    [key: string]: unknown;
}

export interface NotionSort {
    property?: string;
    timestamp?: string;
    direction: "ascending" | "descending";
}

export interface QueryOptions {
    filter?: NotionFilter;
    sorts?: NotionSort[];
    pageSize?: number;
    startCursor?: string;
}

export interface QueryResult {
    results: NotionPage[];
    has_more: boolean;
    next_cursor: string | null;
}

export interface NotionPage {
    id: string;
    object: string;
    created_time: string;
    last_edited_time: string;
    url: string;
    properties: Record<string, NotionProperty>;
    [key: string]: unknown;
}

export interface NotionProperty {
    id: string;
    type: string;
    [key: string]: unknown;
}

// ─── DB 스키마 조회 ────────────────────────────────────────────
export async function fetchDatabase(
    databaseId: string
): Promise<Record<string, unknown>> {
    const notion = getClient();
    return notion.request({
        path: `databases/${databaseId}`,
        method: "get",
    });
}

// ─── DB 행 조회 ────────────────────────────────────────────────
export async function queryDatabase(
    databaseId: string,
    options: QueryOptions = {}
): Promise<QueryResult> {
    const notion = getClient();
    const body: Record<string, unknown> = {};
    if (options.filter) body.filter = options.filter;
    if (options.sorts) body.sorts = options.sorts;
    if (options.pageSize) body.page_size = options.pageSize;
    if (options.startCursor) body.start_cursor = options.startCursor;

    return notion.request<QueryResult>({
        path: `databases/${databaseId}/query`,
        method: "post",
        body,
    });
}

/**
 * 페이지네이션을 처리하며 모든 행을 가져옵니다.
 */
export async function queryAllRows(
    databaseId: string,
    options: Omit<QueryOptions, "startCursor" | "pageSize"> = {}
): Promise<NotionPage[]> {
    const notion = getClient();
    const results: NotionPage[] = [];
    let cursor: string | undefined;

    do {
        const body: Record<string, unknown> = { page_size: 100 };
        if (options.filter) body.filter = options.filter;
        if (options.sorts) body.sorts = options.sorts;
        if (cursor) body.start_cursor = cursor;

        const res = await notion.request<QueryResult>({
            path: `databases/${databaseId}/query`,
            method: "post",
            body,
        });

        results.push(...res.results);
        cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
    } while (cursor);

    return results;
}

// ─── 행 삽입 ──────────────────────────────────────────────────
export async function insertRow(
    databaseId: string,
    properties: Record<string, unknown>
): Promise<NotionPage> {
    const notion = getClient();
    return notion.request<NotionPage>({
        path: "pages",
        method: "post",
        body: {
            parent: { database_id: databaseId },
            properties,
        },
    });
}

// ─── 행 수정 ──────────────────────────────────────────────────
export async function updateRow(
    pageId: string,
    properties: Record<string, unknown>
): Promise<NotionPage> {
    const notion = getClient();
    return notion.request<NotionPage>({
        path: `pages/${pageId}`,
        method: "patch",
        body: { properties },
    });
}

// ─── 페이지 조회 ───────────────────────────────────────────────
export async function getPage(pageId: string): Promise<NotionPage> {
    const notion = getClient();
    return notion.request<NotionPage>({
        path: `pages/${pageId}`,
        method: "get",
    });
}

// ─── 헬퍼: 프로퍼티 값 추출 ───────────────────────────────────
export function extractTitle(page: NotionPage): string {
    for (const prop of Object.values(page.properties) as NotionProperty[]) {
        if (prop.type === "title") {
            const titles = (prop as any).title ?? [];
            return titles.map((t: any) => t.plain_text).join("");
        }
    }
    return "";
}

export function extractText(page: NotionPage, propName: string): string {
    const prop = page.properties[propName];
    if (!prop) return "";
    if (prop.type === "rich_text") {
        return ((prop as any).rich_text ?? [])
            .map((t: any) => t.plain_text)
            .join("");
    }
    if (prop.type === "title") {
        return ((prop as any).title ?? [])
            .map((t: any) => t.plain_text)
            .join("");
    }
    return "";
}

export function extractSelect(
    page: NotionPage,
    propName: string
): string | null {
    const prop = page.properties[propName];
    if (!prop || prop.type !== "select") return null;
    return (prop as any).select?.name ?? null;
}

export function extractNumber(
    page: NotionPage,
    propName: string
): number | null {
    const prop = page.properties[propName];
    if (!prop || prop.type !== "number") return null;
    return (prop as any).number ?? null;
}

export function extractCheckbox(page: NotionPage, propName: string): boolean {
    const prop = page.properties[propName];
    if (!prop || prop.type !== "checkbox") return false;
    return (prop as any).checkbox ?? false;
}
