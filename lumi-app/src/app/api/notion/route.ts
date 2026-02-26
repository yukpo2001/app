/**
 * Notion DB API Route (서버사이드)
 * NOTION_TOKEN을 서버에서만 사용해 클라이언트에 노출 방지
 *
 * GET  /api/notion?db=DATABASE_ID&filter=...    → DB 행 조회
 * POST /api/notion                               → 새 행 삽입
 */

import { NextRequest, NextResponse } from "next/server";
import { queryDatabase, insertRow, fetchDatabase } from "@/lib/notion";

// ─── GET: DB 조회 ────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const dbId = searchParams.get("db") ?? process.env.NOTION_DB_ID;
        const mode = searchParams.get("mode") ?? "rows"; // "rows" | "schema"

        if (!dbId) {
            return NextResponse.json(
                { error: "db 파라미터 또는 NOTION_DB_ID 환경변수가 필요합니다." },
                { status: 400 }
            );
        }

        // 스키마 조회 모드
        if (mode === "schema") {
            const schema = await fetchDatabase(dbId);
            return NextResponse.json({ schema });
        }

        // 행 조회 모드
        const filterParam = searchParams.get("filter");
        const filter = filterParam ? JSON.parse(filterParam) : undefined;

        const data = await queryDatabase(dbId, { filter });

        return NextResponse.json({
            results: data.results,
            has_more: data.has_more,
            next_cursor: data.next_cursor,
        });
    } catch (error) {
        console.error("[/api/notion GET]", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ─── POST: 행 삽입 ───────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { db, properties } = body as {
            db?: string;
            properties: Record<string, unknown>;
        };

        const dbId = db ?? process.env.NOTION_DB_ID;

        if (!dbId) {
            return NextResponse.json(
                { error: "db 필드 또는 NOTION_DB_ID 환경변수가 필요합니다." },
                { status: 400 }
            );
        }

        if (!properties || typeof properties !== "object") {
            return NextResponse.json(
                { error: "properties 객체가 필요합니다." },
                { status: 400 }
            );
        }

        const page = await insertRow(dbId, properties);

        return NextResponse.json({ page }, { status: 201 });
    } catch (error) {
        console.error("[/api/notion POST]", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
