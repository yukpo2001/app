import asyncio
from tools import ask_notebooklm

async def test():
    try:
        res = await ask_notebooklm.ainvoke({"question": "KOSHA 가이드라인 요약해줘"})
        with open("test_out.txt", "w", encoding="utf-8") as f:
            f.write(str(res))
    except Exception as e:
        with open("test_out.txt", "w", encoding="utf-8") as f:
            f.write(f"ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test())
