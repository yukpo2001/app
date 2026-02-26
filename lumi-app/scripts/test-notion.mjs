// 노션 DB 연결 테스트 스크립트
// 실행: node scripts/test-notion.mjs

import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DB_ID ?? "92382d3c5f8b4c24afc54889374cdedd";

if (!token) {
    console.error("❌ NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
    console.error("   실행: NOTION_TOKEN=your_token node scripts/test-notion.mjs");
    process.exit(1);
}

const notion = new Client({ auth: token });

async function test() {
    console.log("🔍 노션 DB 연결 테스트 중...\n");

    // 1) DB 스키마 확인
    try {
        const db = await notion.request({
            path: `databases/${dbId}`,
            method: "get",
        });
        console.log("✅ DB 연결 성공!");
        console.log("📋 DB 이름:", db.title?.[0]?.plain_text ?? "(제목 없음)");
        console.log("📊 프로퍼티 목록:");
        for (const [name, prop] of Object.entries(db.properties ?? {})) {
            console.log(`   - ${name}: ${prop.type}`);
        }
    } catch (err) {
        console.error("❌ DB 연결 실패:", err.message);
        console.error("\n💡 해결 방법:");
        console.error("  1. 노션 DB → ··· → Connections → Integration 추가했는지 확인");
        console.error("  2. DB ID가 올바른지 확인:", dbId);
        process.exit(1);
    }

    // 2) 행 조회 테스트
    try {
        const rows = await notion.request({
            path: `databases/${dbId}/query`,
            method: "post",
            body: { page_size: 3 },
        });
        console.log(`\n📝 행 개수: ${rows.results?.length ?? 0}개 (최대 3개 미리보기)`);
        for (const page of rows.results ?? []) {
            const titleProp = Object.values(page.properties ?? {}).find(
                (p) => p.type === "title"
            );
            const title = titleProp?.title?.[0]?.plain_text ?? "(제목 없음)";
            console.log(`   - ${title} (id: ${page.id.slice(0, 8)}...)`);
        }
        console.log("\n🎉 노션 DB 연동 완료!");
    } catch (err) {
        console.error("❌ 행 조회 실패:", err.message);
    }
}

test();
