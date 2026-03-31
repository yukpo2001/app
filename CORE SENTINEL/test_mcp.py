import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_mcp():
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "notebooklm-mcp"],
    )
    print("Connecting to MCP server...")
    async with stdio_client(server_params) as (read, write):
        print("Connected! Initializing session...")
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("Session initialized!")
            
            # test tools
            result = await session.call_tool("mcp_notebooklm_get_health", {})
            print(result)

if __name__ == "__main__":
    asyncio.run(test_mcp())
