/**
 * Parsing tool definitions.
 */

import { z } from 'zod';
import { parseHTML, parsePDF } from '../parsers/index.js';
import { formToSchema } from '../tools/index.js';
import type { ToolDefinition } from './types.js';
import { MAX_HTML_LENGTH, MAX_PDF_BASE64_LENGTH } from './constants.js';

export const PARSING_TOOLS: ToolDefinition[] = [
  {
    name: 'parse_html_form',
    description: 'Parse an HTML form and extract its field structure as a FormSchema. Finds inputs, selects, textareas, fieldsets, and labels. Max input: 10 MB. Output: FormSchema ready for generate_civui_form or generate_react_form.',
    params: {
      html: z.string().max(MAX_HTML_LENGTH).describe('Raw HTML string containing form elements'),
    },
    handler: ({ html }) => parseHTML(html),
  },
  {
    name: 'parse_pdf_form',
    description: 'Parse a fillable PDF form into a FormSchema. Extracts text fields, checkboxes, radio buttons, and dropdowns. Input: base64-encoded PDF (max ~37.5 MB decoded). Output: FormSchema ready for generate_civui_form or generate_react_form.',
    params: {
      pdfBase64: z.string().max(MAX_PDF_BASE64_LENGTH).describe('Base64-encoded PDF file content'),
    },
    handler: ({ pdfBase64 }) => parsePDF(pdfBase64),
  },
  {
    name: 'form_to_schema',
    description: 'Convert CivUI HTML back into a FormSchema. Reverse of generate_civui_form.',
    params: {
      html: z.string().max(MAX_HTML_LENGTH).describe('CivUI HTML markup to convert'),
    },
    handler: ({ html }) => formToSchema(html),
  },
];
