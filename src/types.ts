import { z } from "zod";

/**
 * Abstract Component Tree (ACT) Schema for Kendo React Components
 * 
 * This schema defines the structure for representing UI components in a hierarchical tree format
 * that can be easily processed to generate Kendo React code. Each node represents a UI element
 * with metadata about its purpose, implementation, and relationship to other components.
 */
export const ACTComponentSchema: z.ZodType<any> = z.lazy(() => z.object({
  component: z
    .string()
    .describe(
      'The Kendo React component type or UI element name. Examples: ' +
      '"Grid", "Button", "Input", "Form", "Panel", "Toolbar", "DropDownList", ' +
      '"DatePicker", "NumericTextBox", "Window", "TabStrip", "TreeView", ' +
      '"Chart", "Scheduler", "Upload", "container", "header", "section", "footer". ' +
      'Use specific Kendo component names when possible, or generic HTML elements for layout.'
    ),
  description: z
    .string()
    .describe(
      'Clear explanation of this component\'s purpose, functionality, and role in the UI. ' +
      'Include details about what data it displays, what actions it enables, and how it ' +
      'contributes to the overall user experience. Examples: ' +
      '"Main data grid displaying user records with sorting and filtering", ' +
      '"Primary action button to save form data", "Navigation header with logo and menu items", ' +
      '"Form container for user registration with validation".'
    ),
  mcpQuery: z
    .string()
    .nullable()
    .describe(
      'Specific MCP query string to retrieve detailed documentation, examples, and best practices ' +
      'for this component. Should be targeted to get relevant Kendo React implementation details. ' +
      'Examples: "Kendo React Grid with filtering and sorting", "Kendo Button with custom styling", ' +
      '"Kendo Form validation examples". Set to null if no specific documentation is needed.'
    ),
  children: z
    .union([z.array(ACTComponentSchema), z.string()])
    .describe(
      'Child components nested within this component, or text content if this is a leaf node. ' +
      'For container components: array of child ACTComponent objects representing nested elements. ' +
      'For content components: string containing the actual text content or empty string. ' +
      'Examples: [button1, button2, input1] for a toolbar, "Submit" for a button, "" for empty containers.'
    )
}).describe(
  'A single node in the Abstract Component Tree representing a UI component with its metadata, ' +
  'purpose, and relationships. This structure enables systematic conversion to Kendo React code ' +
  'while preserving the intended functionality and hierarchy.'
))