import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
import argparse
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
import json

async def run_list():
    server_params = StdioServerParameters(command="npx", args=["-y", "notebooklm-mcp"])
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await load_mcp_tools(session)
                list_tool = next((t for t in tools if t.name == "list_notebooks"), None)
                if not list_tool:
                    print(f"오류: list_notebooks MCP 도구를 찾을 수 없습니다.")
                    return
                
                result = await list_tool.ainvoke({})
                if isinstance(result, list) and len(result) > 0 and 'text' in result[0]:
                    print(result[0]['text'])
                else:
                    print(f"[{result}]")
    except Exception as e:
        print(f"🚨 [NotebookLM 오류] MCP 통신 실패: {str(e)}")

async def run_ask(question: str, notebook_id: str = None):
    server_params = StdioServerParameters(command="npx", args=["-y", "notebooklm-mcp"])
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await load_mcp_tools(session)
                ask_tool = next((t for t in tools if t.name == "ask_question"), None)
                if not ask_tool:
                    print(f"오류: NotebookLM MCP 도구를 찾을 수 없습니다.")
                    return
                
                params = {"question": question}
                if notebook_id:
                    # notebook_id param could be ID or URL natively handled by the MCP
                    if notebook_id.startswith("http"):
                        params["notebook_url"] = notebook_id
                    else:
                        params["notebook_id"] = notebook_id

                result = await ask_tool.ainvoke(params)
                if isinstance(result, list) and len(result) > 0 and 'text' in result[0]:
                    inner_data = json.loads(result[0]['text'])
                    if inner_data.get("success") and "data" in inner_data:
                        print(f"📓 [NotebookLM 지식 응답]\n{inner_data['data'].get('answer', '')}")
                    elif not inner_data.get("success"):
                        print(f"🚨 [NotebookLM 에러 발생] {inner_data.get('error', '')}")
                else:
                    print(f"📓 [NotebookLM 지식 응답 RAW]\n{result}")
    except Exception as e:
        print(f"🚨 [NotebookLM 오류] MCP 통신 실패: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NotebookLM MCP Subprocess Client")
    parser.add_argument("--list", action="store_true", help="List all notebooks")
    parser.add_argument("--question", type=str, help="Question to ask")
    parser.add_argument("--id", type=str, help="Specific notebook ID or URL to query", default=None)
    args = parser.parse_args()

    if args.list:
        asyncio.run(run_list())
    elif args.question:
        asyncio.run(run_ask(args.question, args.id))
    else:
        parser.print_help()
