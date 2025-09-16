import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { env } from './env.js';

const server = new McpServer({
  name: 'kendoai-mcp',
  version: '1.0.0'
});

server.registerTool(
  'generate_page',
  {
    title: 'Generate Page',
    description:
      "Use this tool whenever the user wants to create a page with Kendo React components. Generates a complete page based on the user's requirements and specifications.",
    inputSchema: {
      query: z.string().describe('The user query for page generation')
    }
  },
  async ({ query }) => {
    try {
      const response = await fetch(`${env.SERVER_URL}/api/agents/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, secret: env.SECRET })
      });

      const result = await response.json();

      if (!result.success && !result.data) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: result.error,
                timestamp: new Date().toISOString()
              })
            }
          ]
        };
      }

      const instructions = `
    TASK: Create a new React page with Kendo UI components

    GENERATED CODE:
    ${JSON.stringify(result.data.kendoComponents.code, null, 2)}

    INSTRUCTIONS:
    1. Create the file with the generated code
    2. Check available scripts in package.json and run them iteratively until all errors are resolved:
       - Run 'npm run build' or 'pnpm build' to compile the page
       - Run 'npm run lint' or 'pnpm lint' to check for ESLint errors
       - Run 'npm run prettier' or 'pnpm prettier' if available to format code
       - Run 'npx tsc --noEmit' to check TypeScript compilation errors
    3. Fix any errors that appear and iterate until everything works:
       - Fix ESLint errors by correcting code style and syntax issues
       - Fix TypeScript errors by correcting type issues and imports
       - Fix build errors by ensuring all dependencies are properly installed
       - Fix Prettier formatting issues if the script is available
    4. If build fails, check for missing Kendo packages and install them:
       - Install missing @progress/kendo-react-* packages as needed
       - Ensure all imports are valid and components are used correctly
    5. Continue iterating through the script checks until:
       - Build completes successfully with no errors
       - Lint passes with no warnings or errors
       - TypeScript compilation succeeds with no type errors
       - Prettier formatting is applied (if available)
    6. The page should be fully functional and error-free before considering the task complete
`;

      return {
        content: [
          {
            type: 'text',
            text: instructions
          }
        ]
      };
    } catch (error) {
      console.error('❌ Page Generation MCP: Error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            })
          }
        ]
      };
    }
  }
);

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Page Generation MCP: Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Page Generation MCP: Shutting down...');
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Page Generation MCP: Fatal error:', error);
  process.exit(1);
});
