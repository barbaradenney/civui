import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FormSchema } from './schema/index.js';
import { parseHTML, parsePDF } from './parsers/index.js';
import { generateCivUI } from './generator/index.js';
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  TAILWIND_REFERENCE,
} from './resources/index.js';
import { lookupStyle, ELEMENT_TYPES } from './tools/index.js';

/** 50 MB base64 ≈ ~37.5 MB decoded PDF — generous but bounded. */
const MAX_PDF_BASE64_LENGTH = 50 * 1024 * 1024;

/** 10 MB HTML — large enough for any real form page, prevents memory issues. */
const MAX_HTML_LENGTH = 10 * 1024 * 1024;

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'civui-form-converter',
    version: '0.1.0',
  });

  // --- Resources ---

  server.resource('component-catalog', 'civui://catalog', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: COMPONENT_CATALOG,
      },
    ],
  }));

  server.resource('government-patterns', 'civui://gov-patterns', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: GOVERNMENT_PATTERNS,
      },
    ],
  }));

  server.resource('tailwind-reference', 'civui://tailwind', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: TAILWIND_REFERENCE,
      },
    ],
  }));

  // --- Tools ---

  server.tool(
    'parse_html_form',
    'Parse an HTML form and extract its field structure as a FormSchema. ' +
      'Finds inputs, selects, textareas, fieldsets, and labels. ' +
      'Groups radio buttons and checkboxes by shared name attribute. ' +
      'Infers field types from name heuristics (e.g., "ssn" → SSN, "dob" → memorable-date).',
    {
      html: z
        .string()
        .max(MAX_HTML_LENGTH, 'HTML exceeds 10 MB size limit')
        .describe('Raw HTML string containing one or more <form> elements'),
    },
    async ({ html }) => {
      try {
        const schema = parseHTML(html);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error parsing HTML: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'parse_pdf_form',
    'Parse a PDF form and extract AcroForm fields as a FormSchema. ' +
      'Maps PDF field types (Tx→text, Ch→select, Btn→checkbox/radio). ' +
      'Applies name-based heuristics for SSN, email, date fields. ' +
      'Falls back to returning raw text (truncated to 10k chars) when no AcroForm fields exist.',
    {
      pdfBase64: z
        .string()
        .max(MAX_PDF_BASE64_LENGTH, 'PDF exceeds 50 MB size limit')
        .describe('Base64-encoded PDF file content (max 50 MB)'),
    },
    async ({ pdfBase64 }) => {
      try {
        const buffer = Buffer.from(pdfBase64, 'base64');
        const result = await parsePDF(buffer);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error parsing PDF: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'generate_civui_form',
    'Generate accessible CivUI web component markup from a FormSchema. ' +
      'Maps field types to CivUI tags (text→civ-text-input, radio→civ-radio-group, etc.). ' +
      'Auto-generates hints for date/SSN fields, field-specific required-messages, ' +
      'and wraps sections with headings in civ-fieldset. ' +
      'Never generates deprecated civ-date-input.',
    {
      schema: FormSchema.describe('Form schema describing sections and fields'),
      wrapInCivForm: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to wrap output in <civ-form> (default: true)'),
    },
    async ({ schema, wrapInCivForm }) => {
      try {
        const html = generateCivUI(schema, { wrapInCivForm });
        return {
          content: [
            {
              type: 'text' as const,
              text: html,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error generating CivUI markup: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'style_civui_element',
    'Look up the correct CSS classes, state selectors, and focus ring for a CivUI element. ' +
      'Returns semantic component classes from components.css, state-triggered classes ' +
      '(error, disabled, checked, etc.), and focus ring guidance. ' +
      'Use this to style CivUI elements without guessing class names.',
    {
      element: z
        .enum(ELEMENT_TYPES)
        .describe('The CivUI element type to look up'),
      variant: z
        .string()
        .optional()
        .describe(
          'Optional variant: "tile" (checkbox/radio), "group" (hint/error-text), ' +
            '"horizontal"/"vertical" (group-layout)',
        ),
      state: z
        .array(z.string())
        .optional()
        .describe(
          'Optional state filter: "error", "disabled", "checked", "active", "selected", "dragging". ' +
            'Omit to see all available states.',
        ),
    },
    async ({ element, variant, state }) => {
      try {
        const result = lookupStyle(element, variant, state);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error looking up style: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
