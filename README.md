# KendoAI MCP Server

This is a MCP (Model Context Protocol) server that generates React pages using Kendo UI components.

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

To use this MCP server, you need to configure it in your global MCP settings. You can do this through the Cursor interface:

#### Step-by-Step Configuration:

1. **Open Command Palette**

   - Press `Cmd + Shift + P` (on macOS) or `Ctrl + Shift + P` (on Windows/Linux)

2. **Open MCP Settings**

   - Type "View: Open MCP Settings" and select it from the dropdown

3. **Add MCP Server**

   - Click "New MCP Server"

4. **Configure the Server**
   - Add the following configuration:

```json
{
  "mcpServers": {
    "kendoai-mcp": {
      "name": "kendoai-mcp",
      "command": "npx",
      "args": ["tsx", "/absolute-path/cp-progress-kendoai-mcp/src/server.ts"],
      "timeout": 900000,
      "env": {
        "SERVER_URL": "https://your-kendoai-service-url.com",
        "SECRET": "your-kendoai-api-secret-token"
      }
    }
  }
}
```

**Configuration Requirements:**

- **SERVER_URL**: The URL of the external KendoAI service that handles the page generation logic. This service contains the core functionality for generating React pages with Kendo UI components.

- **SECRET**: Your KendoAI API secret token used for authorization with the external service. This ensures secure communication between the MCP server and the KendoAI service.

**Important Notes:**

- Replace `/absolute-path/cp-progress-kendoai-mcp/src/server.ts` with the absolute path to your project's server file
- Replace `https://your-kendoai-service-url.com` with the actual URL of your KendoAI service
- Replace `your-kendoai-api-secret-token` with your actual KendoAI API secret token
