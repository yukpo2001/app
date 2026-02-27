import { Client } from "@notionhq/client";
import * as xlsx from "xlsx/xlsx.mjs";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// 1. 설정 변수
// ==========================================
const NOTION_TOKEN = process.env.NOTION_TOKEN; // .env에서 로드
const EXCEL_FILE_PATH = "C:/Users/yukpo/Downloads/202602262309_remember(1 of 1).xlsx";

// 사용자가 명시하지 않아서 방금 테스트에 썼던 기존 데이터베이스를 일단 씁니다.
// (나중에 새 DB 만드시면 이 값만 교체하시면 됩니다)
const NOTION_DB_ID = process.env.REMEMBER_NOTION_DB_ID || "8fc1c181-abb5-426d-8eac-e7a5913aa855";

if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN 환경 변수가 없습니다. .env 파일에 추가해 주세요.");
    process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// ==========================================
// 2. 엑셀 파싱 및 노션 업로드 메인 함수
// ==========================================
async function syncRememberToNotion() {
    console.log(`🔍 엑셀 파일 읽는 중: ${EXCEL_FILE_PATH}`);

    if (!fs.existsSync(EXCEL_FILE_PATH)) {
        console.error("❌ 엑셀 파일을 찾을 수 없습니다.");
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(EXCEL_FILE_PATH);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 엑셀 데이터를 JSON 배열 객체로 변환
    const contacts = xlsx.utils.sheet_to_json(sheet);
    console.log(`✅ 총 ${contacts.length}개의 명함 데이터를 발견했습니다.\n`);

    let successCount = 0;
    let failCount = 0;

    for (const [index, contact] of contacts.entries()) {
        const name = contact["이름"] || "이름 없음";
        const company = contact["회사"] || "";
        const title = contact["직함"] || "";
        const department = contact["부서"] || "";
        const phone = contact["휴대폰"] || "";
        const email = contact["전자 메일 주소"] || "";
        const address = contact["근무지 주소 번지"] || "";

        console.log(`▶️ [${index + 1}/${contacts.length}] 등록 중: ${name} (${company})`);

        try {
            await notion.pages.create({
                parent: { database_id: NOTION_DB_ID },
                properties: {
                    // Title 속성 (필수)
                    "Name": {
                        title: [{ text: { content: name } }]
                    },
                    // 참고: 만약 대상 노션 데이터베이스에 아래 열들이 없다면, 에러가 발생합니다.
                    // 현재 테스트를 위해, 기존 DB에 있는 Description 등 텍스트 호환 속성에 몽땅 집어넣거나, 
                    // 새로운 페이지 본문(Children)으로 예쁘게 렌더링해서 넣는 방식을 씁니다.
                },
                children: [
                    {
                        object: 'block',
                        type: 'heading_2',
                        heading_2: {
                            rich_text: [{ type: 'text', text: { content: "📞 명함 상세 정보" } }]
                        }
                    },
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                { type: 'text', text: { content: `🏢 회사: ${company}\n` } },
                                { type: 'text', text: { content: `👔 부서/직함: ${department} / ${title}\n` } },
                                { type: 'text', text: { content: `📱 휴대폰: ${phone}\n` } },
                                { type: 'text', text: { content: `📧 이메일: ${email}\n` } },
                                { type: 'text', text: { content: `📍 주소: ${address}` } }
                            ]
                        }
                    }
                ]
            });
            console.log(`   ✅ 완료`);
            successCount++;

            // API 속도 제어 (Rate Limit 방지) - 노션 API는 초당 3회 제한
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`   ❌ 에러 발생: ${error.body ? JSON.stringify(error.body) : error.message}`);
            failCount++;
        }
    }

    console.log(`\n🎉 업로드 완료! (성공: ${successCount}, 실패: ${failCount})`);
}

syncRememberToNotion();
