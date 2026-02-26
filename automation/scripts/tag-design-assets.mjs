import { Client } from "@notionhq/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// 1. 환경 변수 및 설정
// ==========================================
const NOTION_TOKEN = process.env.NOTION_TOKEN; // .env에서 로드
const NOTION_DB_ID = "8fc1c181-abb5-426d-8eac-e7a5913aa855"; // 방금 생성한 디자인 라이브러리 DB
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN 환경 변수가 없습니다. .env 파일에 추가해 주세요.");
    process.exit(1);
}


if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY 환경 변수가 없습니다. .env 파일에 추가해 주세요.");
    process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // 빠르고 저렴한 flash 모델 사용

const TARGET_DIR = "Z:\\HDD1\\02.범한&바당올레&네이쳐스타\\01.범한";

// ==========================================
// 2. 헬퍼 함수
// ==========================================

// 이미지를 base64로 변환하여 Gemini에 전송하기 위한 포맷으로 맞춤
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

// 추출된 태그 배열을 Notion의 Multi-select 포맷으로 변환
function formatTagsForNotion(tags) {
    return tags.map(tag => ({ name: tag.trim() }));
}

// ==========================================
// 3. 메인 자동화 로직
// ==========================================
async function processDesignAssets() {
    console.log(`🔍 [1/3] 대상 디렉토리 스캔 중: ${TARGET_DIR}`);

    if (!fs.existsSync(TARGET_DIR)) {
        console.error("❌ Z드라이브 경로를 찾을 수 없습니다. (NAS 연결 상태 확인 필요)");
        process.exit(1);
    }

    function getFiles(dir, files = []) {
        const fileList = fs.readdirSync(dir);
        for (const file of fileList) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                getFiles(fullPath, files);
            } else {
                files.push(fullPath);
            }
        }
        return files;
    }

    const allFiles = getFiles(TARGET_DIR);

    // 지원하는 이미지 확장자 필터링
    const imageFiles = allFiles.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).slice(0, 3); // 테스트를 위해 우선 최대 3개까지만 처리

    console.log(`✅ 총 ${imageFiles.length}개의 처리 대상 이미지를 찾았습니다. (테스트 모드: 최대 3장)`);

    for (const fullPath of imageFiles) {
        const fileName = path.basename(fullPath);
        const mimeType = fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

        console.log(`\n▶️ 파일 처리 중: ${fileName}`);

        try {
            // [A] Gemini API로 이미지 분석
            const imagePart = fileToGenerativePart(fullPath, mimeType);
            const prompt = `
이 리소스는 시각 디자인/브랜딩 회사의 작업물입니다.
이 이미지를 분석해서 다음 JSON 형식으로만 응답해주세요. 마크다운 기호 없이 순수 JSON 텍스트만 출력하세요.
{
  "description": "이 이미지에 대한 1~2문장의 간결한 요약 설명",
  "tags": ["태그1", "태그2", "주요색상", "카테고리"]
}
태그는 최대 5개로, 이미지 내 객체, 주조색, 테마(로고, 배너, 포스터 등)를 나타내는 한글 단어 배열로 만들어주세요.`;

            console.log("   🤖 Gemini Vision 모델로 이미지 분석 중...");
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            const analysis = JSON.parse(responseText);

            console.log(`   💡 분석 완료: ${analysis.description}`);
            console.log(`   🏷️ 추출된 태그: ${analysis.tags.join(", ")}`);

            // [B] Notion DB에 새 데이터 삽입
            console.log("   보관소(Notion)에 레코드 생성 중...");
            await notion.pages.create({
                parent: { database_id: NOTION_DB_ID },
                properties: {
                    "Name": { title: [{ text: { content: fileName } }] },
                    "URL": { url: fullPath },
                    "Tags": { multi_select: formatTagsForNotion(analysis.tags) },
                    "Description": { rich_text: [{ text: { content: analysis.description } }] }
                },
                // 로컬 이미지 자체를 본문(또는 커버)에 바로 넣는 것은 AWS S3 등 퍼블릭 URL이 필요하므로 생략하거나,
                // 추후 구현 시 Vercel Blob 등 퍼블릭 스토리지로 1차 업로드 후 노션에 링크하는 방식을 사용.
            });

            console.log(`   ✅ 성공적으로 Notion DB에 저장되었습니다.`);

            // API Rate Limit 방지를 위한 대기
            await new Promise(r => setTimeout(r, 2000));

        } catch (error) {
            console.error(`   ❌ ${fileName} 처리 중 오류 발생:`, error.message);
        }
    }

    console.log("\n🎉 [3/3] 파이프라인 처리가 완료되었습니다!");
}

processDesignAssets();
