# Building Model Context Protocol (MCP) Servers

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Building Your First MCP Server](#building-your-first-mcp-server)
- [Transport Layers](#transport-layers)
- [Advanced Features](#advanced-features)
- [Testing & Debugging](#testing--debugging)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. It enables seamless integration between LLM applications (hosts) and external systems (servers) through a client-server architecture.

### Key Benefits
- **Standardized Integration**: Common protocol for all LLM applications
- **Security**: Servers run in isolated processes with limited permissions
- **Flexibility**: Support for local and remote connections
- **Extensibility**: Easy to add new capabilities through resources, tools, and prompts

## Architecture

### Core Components

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Host (LLM)    │         │     Client       │         │     Server      │
│                 │ <-----> │                  │ <-----> │                 │
│ (Claude, etc.)  │         │ (1:1 with Server)│         │ (Your MCP App)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

1. **Host**: The LLM application (e.g., Claude Desktop, IDE)
2. **Client**: Protocol client that manages the connection (1:1 relationship with server)
3. **Server**: Your MCP implementation providing context/tools

### Message Flow

MCP uses JSON-RPC 2.0 for communication with four message types:

1. **Request**: Expects a response (client → server or server → client)
2. **Result**: Successful response to a request
3. **Error**: Failed request response
4. **Notification**: One-way message, no response expected

## Core Concepts

### 1. Resources
Expose data and content from your system:
```python
# Example: File system resource
{
    "uri": "file:///path/to/document.txt",
    "name": "document.txt",
    "mimeType": "text/plain"
}
```

### 2. Tools
Enable LLMs to perform actions:
```python
# Example: Database query tool
{
    "name": "query_database",
    "description": "Execute SQL queries",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"}
        }
    }
}
```

### 3. Prompts
Provide reusable prompt templates:
```python
# Example: Analysis prompt
{
    "name": "analyze_data",
    "description": "Analyze data with specific criteria",
    "arguments": [
        {
            "name": "data_source",
            "description": "The data to analyze"
        }
    ]
}
```

## Building Your First MCP Server

### 1. Setup (Python Example)

```bash
# Install MCP SDK
pip install mcp

# Create project structure
mkdir my-mcp-server
cd my-mcp-server
touch server.py
```

### 2. Basic Server Implementation

```python
# server.py
import asyncio
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

# Create server instance
server = Server("my-mcp-server")

# Define resources
@server.list_resources()
async def handle_list_resources():
    return [
        types.Resource(
            uri="memory://example",
            name="Example Resource",
            mimeType="text/plain"
        )
    ]

@server.read_resource()
async def handle_read_resource(uri: str):
    if uri == "memory://example":
        return "This is example content from MCP server"
    raise ValueError(f"Unknown resource: {uri}")

# Define tools
@server.list_tools()
async def handle_list_tools():
    return [
        types.Tool(
            name="get_weather",
            description="Get weather for a location",
            inputSchema={
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name"
                    }
                },
                "required": ["location"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict):
    if name == "get_weather":
        location = arguments["location"]
        # Simulate weather API call
        return {
            "location": location,
            "temperature": 72,
            "conditions": "Sunny"
        }
    raise ValueError(f"Unknown tool: {name}")

# Define prompts
@server.list_prompts()
async def handle_list_prompts():
    return [
        types.Prompt(
            name="analyze_code",
            description="Analyze code quality",
            arguments=[
                types.PromptArgument(
                    name="language",
                    description="Programming language",
                    required=True
                )
            ]
        )
    ]

@server.get_prompt()
async def handle_get_prompt(name: str, arguments: dict):
    if name == "analyze_code":
        language = arguments.get("language", "python")
        return types.GetPromptResult(
            description="Code analysis prompt",
            messages=[
                types.PromptMessage(
                    role="user",
                    content=types.TextContent(
                        type="text",
                        text=f"Analyze the following {language} code for quality..."
                    )
                )
            ]
        )
    raise ValueError(f"Unknown prompt: {name}")

# Main entry point
async def main():
    # Run the server using stdio transport
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="my-mcp-server",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### 3. Configuration for Claude Desktop

Create `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "PYTHONPATH": "/path/to/your/project"
      }
    }
  }
}
```

## Transport Layers

### 1. Stdio Transport (Local)
For local process communication:

```python
# Server side
async with mcp.server.stdio.stdio_server() as (read, write):
    await server.run(read, write, init_options)

# Client side
async with stdio_client() as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
```

### 2. HTTP Transport (Remote)
For remote connections with SSE:

```python
# Server side (using FastAPI)
from fastapi import FastAPI
from mcp.server.sse import create_sse_handler

app = FastAPI()

# Create SSE handler
sse_handler = create_sse_handler(server)

@app.post("/messages")
async def handle_message(request: Request):
    return await sse_handler(request)

# Client side
from mcp.client.sse import sse_client

async with sse_client("http://localhost:8000/messages") as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
```

## Advanced Features

### 1. Stateful Resources
Implement resources that change over time:

```python
class DatabaseResource:
    def __init__(self):
        self.last_updated = datetime.now()
        self.data = {}
    
    async def get_content(self):
        # Return current state
        return {
            "last_updated": self.last_updated.isoformat(),
            "records": len(self.data)
        }
    
    async def subscribe(self, uri: str):
        # Send notifications when data changes
        while True:
            await asyncio.sleep(5)
            if self.has_changed():
                await server.send_resource_updated(uri)
```

### 2. Complex Tool Interactions
Build tools that interact with external services:

```python
@server.call_tool()
async def handle_call_tool(name: str, arguments: dict):
    if name == "execute_sql":
        query = arguments["query"]
        
        # Validate query
        if not is_safe_query(query):
            raise ValueError("Unsafe query detected")
        
        # Execute with connection pooling
        async with get_db_connection() as conn:
            results = await conn.fetch(query)
            return {
                "columns": list(results[0].keys()),
                "rows": [dict(row) for row in results]
            }
```

### 3. Authentication & Security
Implement security measures:

```python
# Environment-based authentication
class SecureServer(Server):
    def __init__(self, name: str, api_key: str):
        super().__init__(name)
        self.api_key = api_key
    
    async def validate_request(self, request):
        # Validate API key from environment
        if request.headers.get("X-API-Key") != self.api_key:
            raise ValueError("Invalid API key")

# Resource access control
@server.read_resource()
async def handle_read_resource(uri: str, context: dict):
    # Check permissions
    if not has_permission(context["user"], uri):
        raise PermissionError("Access denied")
    
    return get_resource_content(uri)
```

## Testing & Debugging

### 1. Unit Testing
```python
import pytest
from mcp.client.session import ClientSession

@pytest.mark.asyncio
async def test_weather_tool():
    # Create test client
    async with create_test_client(server) as client:
        # Test tool execution
        result = await client.call_tool(
            "get_weather",
            {"location": "New York"}
        )
        
        assert result["temperature"] > 0
        assert "conditions" in result
```

### 2. Debugging Tips
- Enable verbose logging:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```

- Use MCP Inspector for protocol debugging
- Implement health check endpoints
- Add request/response logging middleware

## Best Practices

### 1. Error Handling
```python
@server.call_tool()
async def handle_call_tool(name: str, arguments: dict):
    try:
        # Validate inputs
        validate_arguments(name, arguments)
        
        # Execute with timeout
        result = await asyncio.wait_for(
            execute_tool(name, arguments),
            timeout=30.0
        )
        return result
        
    except asyncio.TimeoutError:
        raise ValueError("Tool execution timed out")
    except ValidationError as e:
        raise ValueError(f"Invalid arguments: {e}")
    except Exception as e:
        logger.error(f"Tool execution failed: {e}")
        raise ValueError("Internal server error")
```

### 2. Performance Optimization
- Use connection pooling for databases
- Implement caching for frequently accessed resources
- Stream large responses instead of loading into memory
- Use async/await throughout for non-blocking operations

### 3. Security Considerations
- Run servers with minimal permissions
- Validate and sanitize all inputs
- Use environment variables for sensitive configuration
- Implement rate limiting for resource-intensive operations
- Audit log all tool executions

## Examples

### Example 1: File System Server
```python
# Expose local files with access control
@server.list_resources()
async def handle_list_resources():
    allowed_dirs = os.environ.get("ALLOWED_DIRS", ".").split(",")
    resources = []
    
    for dir_path in allowed_dirs:
        for file in Path(dir_path).rglob("*.md"):
            resources.append(
                types.Resource(
                    uri=f"file://{file.absolute()}",
                    name=file.name,
                    mimeType="text/markdown"
                )
            )
    
    return resources
```

### Example 2: Database Query Server
```python
# Safe database access with schema inspection
@server.list_tools()
async def handle_list_tools():
    # Dynamically generate tools from database schema
    async with get_db_connection() as conn:
        tables = await conn.fetch(
            "SELECT table_name FROM information_schema.tables"
        )
        
        tools = []
        for table in tables:
            tools.append(
                types.Tool(
                    name=f"query_{table['table_name']}",
                    description=f"Query the {table['table_name']} table",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "filters": {"type": "object"},
                            "limit": {"type": "integer", "default": 10}
                        }
                    }
                )
            )
        
        return tools
```

### Example 3: API Integration Server
```python
# Integrate with external APIs
class APIServer(Server):
    def __init__(self):
        super().__init__("api-server")
        self.clients = {
            "github": GitHubClient(),
            "jira": JiraClient(),
            "slack": SlackClient()
        }
    
    @server.call_tool()
    async def handle_call_tool(self, name: str, arguments: dict):
        service, action = name.split("_", 1)
        
        if service in self.clients:
            client = self.clients[service]
            return await client.execute(action, arguments)
        
        raise ValueError(f"Unknown service: {service}")
```

## Next Steps

1. **Start Simple**: Build a basic server with one resource or tool
2. **Test Locally**: Use stdio transport with Claude Desktop
3. **Add Features**: Gradually add more capabilities
4. **Deploy**: Move to HTTP transport for remote access
5. **Monitor**: Add logging and monitoring for production use

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Example Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 