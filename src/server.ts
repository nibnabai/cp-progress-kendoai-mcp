import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { env } from './env.js';
import dedent from 'dedent';
import { ACTComponentSchema } from './types.js';

const server = new McpServer({
  name: 'kendoai-mcp',
  version: '1.0.0'
});

server.registerTool(
  'planner_tool',
  {
    title: 'Kendo React Page Planner',
    description: dedent`
      **PRIMARY TOOL** - Must be called first when creating Kendo React pages.
      
      This tool analyzes user requirements and generates a comprehensive execution plan for building 
      a page with Kendo React components. It breaks down complex UI requirements into structured, 
      actionable steps that guide the subsequent tools in the pipeline.
      
      **When to use:** Always call this tool first when the user requests:
      - Creating a new page with Kendo React components
      - Building forms, dashboards, grids, or any UI with Kendo components
      - Converting mockups or designs to Kendo React implementations
      
      **Expected output:** A detailed markdown plan containing:
      - Component breakdown and hierarchy
      - Layout structure recommendations
      - State management requirements
      - Kendo-specific component suggestions
      - Implementation priority and dependencies
    `,
    inputSchema: {
      query: z.string().describe(
        'The complete user request for page creation. Include all requirements, features, ' +
        'UI elements, functionality, styling preferences, and any specific Kendo components mentioned. ' +
        'The more detailed the query, the better the generated plan will be.'
      )
    }
  },
  async ({ query }) => {
    try {
      const response = await fetch(`${env.SERVER_URL}/api/agents/planner/generate`, {
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
              text: dedent`
                ## ❌ Planner Tool API Error

                **Error Details:**
                ${result.error || 'Unknown error occurred while generating the execution plan'}

                **Troubleshooting Steps:**
                1. **Check your query** - Ensure it clearly describes what you want to build
                2. **Verify server connection** - The planning service may be temporarily unavailable
                3. **Try again** - Temporary issues sometimes resolve with retry
                4. **Simplify your request** - Break complex requirements into smaller parts

                **Example of a good query:**
                "Create a user management dashboard with a data grid showing user information, 
                filters for search, and buttons to add/edit/delete users using Kendo React components"

                **Timestamp:** ${new Date().toISOString()}
              `
            }
          ]
        };
      }

      const instructions = dedent`
        ## 📋 Kendo React Page Generation Plan

        **NEXT STEP:** Use the 'structure_tool' with this plan and the original query to generate the Abstract Component Tree.

        ### Execution Plan:
        ${result.data.plan}

        ### Instructions for Next Steps:
        1. **Copy this entire plan** - You'll need to pass it to the structure_tool
        2. **Call structure_tool** with both the original query and this execution plan
        3. **Follow the plan systematically** - Each step builds upon the previous one
        4. **Validate requirements** - Ensure all user requirements are captured in subsequent steps

        **Important:** Do not proceed to implementation without first generating the component structure using the structure_tool.
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
      console.error('❌ Planner Agent Error:', error);
      return {
        content: [
          {
            type: 'text',
            text: dedent`
              ## ⚠️ Planner Tool Network Error

              **Connection Error:**
              ${error instanceof Error ? error.message : 'Unknown network error'}

              **Possible Causes:**
              1. **Server unavailable** - The planning service endpoint may be down
              2. **Network issues** - Check your internet connection
              3. **Configuration error** - Verify SERVER_URL and SECRET in environment
              4. **Timeout** - The request may have taken too long

              **Next Steps:**
              1. Check server status and retry in a few moments
              2. Verify environment configuration
              3. Contact administrator if issue persists

              **Timestamp:** ${new Date().toISOString()}
            `
          }
        ]
      };
    }
  }
);

server.registerTool(
  'structure_tool',
  {
    title: 'Kendo React Component Structure Generator',
    description: dedent`
      **SECOND TOOL** - Call after planner_tool to generate the Abstract Component Tree (ACT).
      
      This tool transforms the execution plan into a hierarchical component structure that defines
      the architecture of your Kendo React page. It creates a tree representation showing how
      components should be nested, their relationships, and specific Kendo component types to use.
      
      **Purpose:**
      - Converts abstract plans into concrete component hierarchies
      - Identifies optimal Kendo React components for each UI element
      - Defines component relationships and data flow
      - Provides MCP queries for component-specific documentation
      
      **Input Requirements:**
      - Original user query (for context preservation)
      - Complete execution plan from planner_tool
      
      **Output:** Abstract Component Tree with:
      - Component hierarchy and nesting structure
      - Kendo-specific component recommendations
      - Component descriptions and purposes
      - MCP queries for detailed component documentation
    `,
    inputSchema: {
      query: z.string().describe(
        'The original user request for page creation. Must be identical to the query used in planner_tool ' +
        'to maintain consistency and context throughout the generation pipeline.'
      ),
      plan: z.string().describe(
        'Complete execution plan in markdown format from planner_tool. Should include component breakdown, ' +
        'layout structure, state management requirements, and implementation steps.'
      ),
    }
  },
  async ({ plan, query }) => {
    try {
      const response = await fetch(`${env.SERVER_URL}/api/agents/structure/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ executionPlan: {
          id: `plan-${Date.now()}`,
          userQuery: query,
          plan,
        }, query, secret: env.SECRET })
      });

      const result = await response.json();

      if (!result.success && !result.data) {
        return {
          content: [
            {
              type: 'text',
              text: dedent`
                ## ❌ Structure Tool API Error

                **Error Details:**
                ${result.error || 'Unknown error occurred while generating the component structure'}

                **Troubleshooting Steps:**
                1. **Verify execution plan** - Ensure you're passing the complete plan from planner_tool
                2. **Check plan format** - The execution plan should be in the correct object format
                3. **Validate query** - Ensure the original query is included and matches the plan
                4. **Retry the request** - Temporary service issues may resolve automatically

                **Required Input Format:**
                - query: Original user request string
                - executionPlan: Complete plan object with id, userQuery, plan, and createdAt

                **Timestamp:** ${new Date().toISOString()}
              `
            }
          ]
        };
      }

      const instructions = dedent`
        ## 🏗️ Abstract Component Tree (ACT) Generated

        **NEXT STEP:** Use the 'merger_tool' with this ACT structure to generate the final Kendo React code.

        ### Component Structure:
        ${JSON.stringify(result.data.structure, null, 2)}

        ### Instructions for Next Steps:
        1. **Validate the structure** - Review the component hierarchy and ensure it matches your requirements
        2. **Copy the ACT structure** - You'll need to pass this exact structure to the merger_tool
        3. **Call merger_tool** with the ACT structure to generate the final React code
        4. **Review component choices** - Ensure the selected Kendo components align with your needs

        ### What This Structure Provides:
        - **Hierarchical layout** - Shows how components nest within each other
        - **Component types** - Specific Kendo React components recommended for each element
        - **Descriptions** - Purpose and functionality of each component
        - **MCP queries** - Specific queries to get detailed component documentation if needed

        **Important:** This structure serves as the blueprint for code generation. Verify it captures all your requirements before proceeding to the merger_tool.
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
      console.error('❌ Structure Agent Error:', error);
      return {
        content: [
          {
            type: 'text',
            text: dedent`
              ## ⚠️ Structure Tool Network Error

              **Connection Error:**
              ${error instanceof Error ? error.message : 'Unknown network error'}

              **Possible Causes:**
              1. **Server unavailable** - The structure service endpoint may be down
              2. **Invalid execution plan** - The plan format may not be recognized
              3. **Network issues** - Check your internet connection
              4. **Configuration error** - Verify SERVER_URL and SECRET in environment

              **Next Steps:**
              1. Verify the execution plan is properly formatted
              2. Check server status and retry
              3. Ensure you're using the plan from planner_tool
              4. Contact administrator if issue persists

              **Timestamp:** ${new Date().toISOString()}
            `
          }
        ]
      };
    }
  }
);

server.registerTool(
  'merger_tool',
  {
    title: 'Kendo React Code Generator',
    description: dedent`
      **FINAL TOOL** - Call after structure_tool to generate production-ready Kendo React code.
      
      This tool transforms the Abstract Component Tree (ACT) into complete, functional React code
      using Kendo React components. It generates TypeScript/JSX code with proper imports,
      component structure, styling, and event handling.
      
      **Purpose:**
      - Converts ACT structure into executable React code
      - Applies Kendo React best practices and patterns
      - Generates proper imports and component configurations
      - Creates responsive layouts with Kendo styling
      - Implements state management and event handling
      
      **Code Generation Features:**
      - TypeScript support with proper typing
      - Responsive design with Kendo themes
      - Proper component composition and props
      - Event handlers and state management
      - Accessibility features and ARIA attributes
      - Error boundaries and loading states
      
      **Input:** Abstract Component Tree from structure_tool
      **Output:** Complete React page with detailed implementation instructions
    `,
    inputSchema: {
      actStructure: ACTComponentSchema.describe(
        'The complete Abstract Component Tree structure generated by structure_tool. This hierarchical ' +
        'structure defines the component layout, types, descriptions, and relationships. Must contain ' +
        'all necessary information for code generation including component types, nesting hierarchy, ' +
        'and any specific Kendo component configurations.'
      )
    }
  },
  async ({ actStructure }) => {
    try {
      const response = await fetch(`${env.SERVER_URL}/api/agents/merger/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actStructure, secret: env.SECRET })
      });

      const result = await response.json();

      if (!result.success && !result.data) {
        return {
          content: [
            {
              type: 'text',
              text: dedent`
                ## ❌ Code Generator API Error

                **Error Details:**
                ${result.error || 'Unknown error occurred while generating the Kendo React code'}

                **Troubleshooting Steps:**
                1. **Verify ACT structure** - Ensure you're passing the complete Abstract Component Tree from structure_tool
                2. **Check component types** - Verify all component names are valid Kendo React components
                3. **Validate schema** - The ACT structure must follow the ACTComponentSchema format
                4. **Review component hierarchy** - Ensure the nesting structure is logical

                **Required Input Format:**
                - actStructure: Complete ACT object with component, description, mcpQuery, and children fields
                - All components should be valid Kendo React component names or HTML elements

                **Common Issues:**
                - Invalid component names (use "Grid", "Button", "Input", etc.)
                - Missing or malformed component descriptions
                - Incorrect nesting structure in children arrays

                **Timestamp:** ${new Date().toISOString()}
              `
            }
          ]
        };
      }

      const instructions = dedent`
        ## 🚀 Kendo React Code Generated Successfully!

        ### Generated Code:
        \`\`\`tsx
        ${JSON.stringify(result.data.code.mainComponent, null, 2)}
        \`\`\`

        ## 📋 Implementation Checklist

        ### Step 1: Create the React Component File
        1. **Create the file** - Save the generated code to an appropriate location (e.g., \`src/components/GeneratedPage.tsx\`)
        2. **Review the code** - Ensure all imports and component usage look correct
        3. **Check file structure** - Verify the component follows React best practices

        ### Step 2: Install Required Dependencies
        Before running any scripts, ensure all Kendo React packages are installed:
        \`\`\`bash
        # Check if these packages are in package.json, install if missing:
        npm install @progress/kendo-react-grid
        npm install @progress/kendo-react-inputs
        npm install @progress/kendo-react-layout
        npm install @progress/kendo-react-buttons
        npm install @progress/kendo-react-dateinputs
        npm install @progress/kendo-react-dropdowns
        npm install @progress/kendo-theme-default
        \`\`\`

        ### Step 3: Validation & Error Resolution (Run in Order)
        Execute these commands and fix any errors before proceeding to the next:

        #### 3.1 TypeScript Compilation Check
        \`\`\`bash
        npx tsc --noEmit
        \`\`\`
        **Fix any TypeScript errors:**
        - Import statements and module resolution
        - Type definitions and interfaces
        - Component prop types
        - Missing type declarations

        #### 3.2 ESLint Code Quality Check
        \`\`\`bash
        npm run lint  # or pnpm lint
        \`\`\`
        **Fix any ESLint errors:**
        - Code style and formatting issues
        - Unused variables and imports
        - Missing dependencies in useEffect
        - Accessibility violations

        #### 3.3 Build Compilation
        \`\`\`bash
        npm run build  # or pnpm build
        \`\`\`
        **Fix any build errors:**
        - Module resolution issues
        - Missing dependencies
        - Configuration problems
        - Asset loading issues

        #### 3.4 Code Formatting (if available)
        \`\`\`bash
        npm run prettier  # or pnpm prettier (if available)
        \`\`\`

        ### Step 4: Testing & Verification
        1. **Start development server** - \`npm start\` or \`npm run dev\`
        2. **Test component rendering** - Verify all Kendo components display correctly
        3. **Test interactions** - Check buttons, inputs, and other interactive elements
        4. **Test responsiveness** - Ensure layout works on different screen sizes
        5. **Test data flow** - Verify state management and event handling

        ### Step 5: Common Issues & Solutions

        #### Missing Kendo Packages:
        - Install specific packages: \`npm install @progress/kendo-react-[component-name]\`
        - Add theme CSS: \`import '@progress/kendo-theme-default/dist/all.css'\`

        #### Import Errors:
        - Check component names match Kendo documentation
        - Verify package versions are compatible
        - Use correct import paths

        #### TypeScript Errors:
        - Add type definitions: \`npm install @types/[package-name]\`
        - Use proper typing for Kendo components
        - Define interfaces for data structures

        #### Styling Issues:
        - Import Kendo theme CSS in your main App component
        - Apply proper CSS classes for layout
        - Check responsive breakpoints

        ### Success Criteria ✅
        The implementation is complete when:
        - [ ] TypeScript compilation passes without errors
        - [ ] ESLint passes without warnings/errors  
        - [ ] Build completes successfully
        - [ ] All Kendo components render correctly
        - [ ] Interactive elements function as expected
        - [ ] Layout is responsive and accessible
        - [ ] No console errors in browser dev tools

        **🎉 Once all criteria are met, your Kendo React page is ready for production!**
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
      console.error('❌ Merger Agent Error:', error);
      return {
        content: [
          {
            type: 'text',
            text: dedent`
              ## ⚠️ Code Generator Network Error

              **Connection Error:**
              ${error instanceof Error ? error.message : 'Unknown network error'}

              **Possible Causes:**
              1. **Server unavailable** - The code generation service endpoint may be down
              2. **Invalid ACT structure** - The component tree format may not be recognized
              3. **Network issues** - Check your internet connection
              4. **Configuration error** - Verify SERVER_URL and SECRET in environment

              **Next Steps:**
              1. Verify the ACT structure is properly formatted
              2. Check server status and retry
              3. Ensure you're using the structure from structure_tool
              4. Contact administrator if issue persists

              **Debug Info:**
              - Check that actStructure contains valid component data
              - Verify component types are recognized Kendo components
              - Ensure the structure follows the ACT schema

              **Timestamp:** ${new Date().toISOString()}
            `
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
