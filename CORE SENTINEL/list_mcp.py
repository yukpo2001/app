import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

async def list_tools():
    server_params = StdioServerParameters(command="npx", args=["-y", "notebooklm-mcp"])
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await load_mcp_tools(session)
            names = [t.name for t in tools]
            print(f"Available tools: {names}")

if __name__ == "__main__":
    asyncio.run(list_tools())
