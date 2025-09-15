# KendoAI MCP Server

This is a MCP (Model Context Protocol) server that generates React pages using Kendo UI components. This server provides AI-powered page generation capabilities through a simple interface.

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** (recommended) or npm
- Access to the KendoAI API service

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cp-progress-kendoai-mcp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

## Configuration

### MCP Server Configuration

You must create an `mcp.json` file in `.cursor` folder and paste the secret we have given you there:

```json
{
  "mcpServers": {
    "kendoai-mcp": {
      "name": "kendoai-mcp",
      "command": "npx",
      "args": ["tsx", "src/server.ts"],
      "timeout": 900000,
      "env": {
        "SERVER_URL": "http://localhost:3000",
        "SECRET": "PASTE YOUR SECRET TOKEN HERE"
      }
    }
  }
}
```
