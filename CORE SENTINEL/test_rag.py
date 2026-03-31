import sys
import asyncio
from tools import search_vector_db

async def main():
    print("================ RAG 테스트 ==================")
    query1 = "오미자 고세 레시피 핵심이 뭐야?"
    print(f"질의 1: {query1}")
    res1 = search_vector_db.invoke({"query": query1})
    print(f"결과 1:\n{res1}\n")

    query2 = "2026년 중간고사(Death week)는 언제야?"
    print(f"질의 2: {query2}")
    res2 = search_vector_db.invoke({"query": query2})
    print(f"결과 2:\n{res2}\n")
    print("==============================================")

if __name__ == "__main__":
    asyncio.run(main())
