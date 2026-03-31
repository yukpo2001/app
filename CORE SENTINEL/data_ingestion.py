import os
import glob
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv

load_dotenv()

# 상수 정의
DATA_DIR = "./data"
IPDRIVE_DIR = os.getenv("IPDRIVE_PATH", "Z:\\")
DB_DIR = "./chroma_db"
COLLECTION_NAME = "core_sentinel_knowledge"
EMBEDDING_MODEL = "jhgan/ko-sroberta-multitask" # 로컬 한국어 모델 (무료/API 불필요)

# OOM (메모리 부족)을 방지하기 위한 배치 사이즈
BATCH_SIZE = 50 

def iter_documents():
    """제너레이터(Generator) 방식으로 메모리 부하 없이 파일을 하나씩 읽어 반환합니다."""
    # 1. 로컬 Data 폴더 스캔
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    search_dirs = [DATA_DIR]
    if os.path.exists(IPDRIVE_DIR):
        search_dirs.append(IPDRIVE_DIR)
        print(f"✅ IPDRIVE 감지됨: {IPDRIVE_DIR}")
    else:
        print(f"⚠️ IPDRIVE를 찾을 수 없습니다: {IPDRIVE_DIR} (Data 폴더만 스캔합니다)")

    # txt / pdf 탐색
    for s_dir in search_dirs:
        for root, _, files in os.walk(s_dir):
            for file in files:
                file_path = os.path.join(root, file)
                if file.lower().endswith('.txt'):
                    try:
                        loader = TextLoader(file_path, encoding='utf-8')
                        yield from loader.load()
                    except Exception as e:
                        print(f"텍스트 로딩 실패 ({file_path}): {e}")
                elif file.lower().endswith('.pdf'):
                    try:
                        loader = PyPDFLoader(file_path)
                        yield from loader.load()
                    except Exception as e:
                        print(f"PDF 로딩 실패 ({file_path}): {e}")

def ingest_data():
    """배치(Batch) 모드로 문서를 잘라 DB에 계속 밀어넣고 메모리를 비웁니다."""
    print(f"🚀 임베딩 엔진(로컬) 초기화 중: {EMBEDDING_MODEL}")
    # 허깅페이스 기반 100% 로컬 모델 로딩 (외부 전송 없음)
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=300,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    batch_docs = []
    total_chunks_saved = 0

    print("📄 파일 스캔 및 데이터 주입(Ingestion) 시작...")

    for doc in iter_documents():
        # 파일 하나에서 나온 문서를 바로 청킹
        chunks = text_splitter.split_documents([doc])
        batch_docs.extend(chunks)

        # 뱃치 사이즈 도달 시 DB에 임베딩하고 메모리 해제
        if len(batch_docs) >= BATCH_SIZE:
            Chroma.from_documents(
                documents=batch_docs,
                embedding=embeddings,
                collection_name=COLLECTION_NAME,
                persist_directory=DB_DIR
            )
            total_chunks_saved += len(batch_docs)
            print(f"   => 현재까지 {total_chunks_saved}개 청크 임베딩 완료...")
            # 메모리 해제
            batch_docs.clear()

    # 잔여(나머지) 뱃치 처리
    if batch_docs:
        Chroma.from_documents(
            documents=batch_docs,
            embedding=embeddings,
            collection_name=COLLECTION_NAME,
            persist_directory=DB_DIR
        )
        total_chunks_saved += len(batch_docs)

    print("==================================================")
    if total_chunks_saved == 0:
        print("경고: 임베딩된 데이터가 0건입니다.")
    else:
        print(f"✅ 대용량 데이터 로컬 임베딩 통과! 누적 {total_chunks_saved} 청크 저장 완료.")
    print("==================================================")

if __name__ == "__main__":
    print("==========================================")
    print(" CORE SENTINEL 대량 데이터 섭취 모듈 (로컬)")
    print("==========================================")
    ingest_data()
