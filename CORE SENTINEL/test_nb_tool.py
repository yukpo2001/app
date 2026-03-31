import asyncio
from tools import ask_notebooklm

async def test():
    print("Testing NotebookLM MCP tool...")
    res = await ask_notebooklm.ainvoke({"question": "KOSHA 가이드라인에 대한 짧은 요약 알려줘"})
    print("Result:")
    print(res)

if __name__ == "__main__":
    asyncio.run(test())
