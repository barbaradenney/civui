import pdf from 'pdf-parse';
import type { FormSchema, FormField, FieldType } from '../schema/index.js';

interface AcroFormField {
  fieldName: string;
  fieldType: string;
  fieldFlags: number;
  fieldValue: string;
  fieldOptions: string[];
}

// pdf.js annotation subtypes that represent form widgets
const WIDGET_SUBTYPE = 'Widget';

function inferTypeFromPdfField(field: AcroFormField): FieldType {
  const name = field.fieldName.toLowerCase();
  const type = field.fieldType;

  // AcroForm field types: Tx=text, Btn=button, Ch=choice
  if (type === 'Ch') {
    return 'select';
  }

  if (type === 'Btn') {
    // PDF spec: bit 16 (0x8000) = radio buttons
    const isRadio = (field.fieldFlags & 0x8000) !== 0;
    return isRadio ? 'radio' : 'checkbox';
  }

  // Text fields — use name heuristics
  if (name.includes('email') || name.includes('e-mail') || name.includes('e_mail'))
    return 'email';
  if (name.includes('phone') || name.includes('tel') || name.includes('fax'))
    return 'tel';
  if (name.includes('ssn') || name.includes('social_security') || name.includes('social security'))
    return 'ssn';
  if (name.includes('zip') || name.includes('postal'))
    return 'zip';
  if (name.includes('dob') || name.includes('birth') || name.includes('date_of_birth') || name.includes('date of birth'))
    return 'memorable-date';
  if (name.includes('date'))
    return 'date';

  return 'text';
}

function nameToLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')       // camelCase
    .replace(/[_.\-]+/g, ' ')                     // separators
    .replace(/\b\w/g, (c) => c.toUpperCase())     // capitalize
    .trim();
}

/** Max raw text chars to return (prevents oversized MCP responses). */
const MAX_RAW_TEXT_LENGTH = 10_000;

export interface ParsePdfResult {
  schema: FormSchema | null;
  rawText: string;
  hasAcroForm: boolean;
  fieldCount: number;
}

/** pdf.js page proxy — subset of methods we use. */
interface PdfPageProxy {
  getTextContent: (opts?: {
    normalizeWhitespace?: boolean;
    disableCombineTextItems?: boolean;
  }) => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
  getAnnotations: () => Promise<Array<{
    subtype?: string;
    fieldName?: string;
    fieldType?: string;
    fieldFlags?: number;
    fieldValue?: string;
    options?: Array<{ exportValue?: string; displayValue?: string }>;
  }>>;
}

/**
 * Replicate pdf-parse's default `render_page` text extraction.
 * We must do this ourselves because pdf-parse uses the `pagerender`
 * return value AS the page text — it does not fall back to its own
 * extraction when a custom `pagerender` is provided.
 */
async function renderPageText(pageData: PdfPageProxy): Promise<string> {
  const content = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  });
  let lastY: number | undefined;
  let text = '';
  for (const item of content.items) {
    if (lastY === item.transform[5] || lastY === undefined) {
      text += item.str;
    } else {
      text += '\n' + item.str;
    }
    lastY = item.transform[5];
  }
  return text;
}

export async function parsePDF(pdfBuffer: Buffer): Promise<ParsePdfResult> {
  // Single pass: extract text and AcroForm annotations together.
  // pdf-parse's `pagerender` callback replaces its default text renderer,
  // so we render text ourselves AND extract annotations in one callback.
  const acroFields: AcroFormField[] = [];
  const seenNames = new Set<string>();

  const data = await pdf(pdfBuffer, {
    pagerender: async (pageData: PdfPageProxy) => {
      // Extract annotations (form fields) from this page
      try {
        const annotations = await pageData.getAnnotations();
        for (const ann of annotations) {
          if (ann.subtype !== WIDGET_SUBTYPE) continue;
          const name = ann.fieldName ?? '';
          if (!name || seenNames.has(name)) continue;
          seenNames.add(name);

          acroFields.push({
            fieldName: name,
            fieldType: ann.fieldType ?? 'Tx',
            fieldFlags: ann.fieldFlags ?? 0,
            fieldValue: ann.fieldValue ?? '',
            fieldOptions: ann.options?.map((o) => o.exportValue ?? o.displayValue ?? '') ?? [],
          });
        }
      } catch {
        // Some pages may not support getAnnotations — skip silently
      }

      // Extract and return page text (replaces pdf-parse's default renderer)
      return renderPageText(pageData);
    },
  });

  const rawText = data.text.slice(0, MAX_RAW_TEXT_LENGTH);
  const title: string | undefined = data.info?.Title || undefined;

  if (acroFields.length === 0) {
    // No AcroForm fields — return raw text for AI-assisted extraction
    return {
      schema: null,
      rawText,
      hasAcroForm: false,
      fieldCount: 0,
    };
  }

  const fields: FormField[] = acroFields.map((af) => {
    const fieldType = inferTypeFromPdfField(af);
    const label = nameToLabel(af.fieldName);
    const field: FormField = {
      type: fieldType,
      name: af.fieldName,
      label,
      value: af.fieldValue || undefined,
    };

    if (af.fieldOptions.length > 0 && (fieldType === 'select' || fieldType === 'radio')) {
      field.options = af.fieldOptions.map((opt) => ({
        value: opt,
        label: opt,
      }));
    }

    return field;
  });

  return {
    schema: {
      title,
      sections: [{ fields }],
    },
    rawText,
    hasAcroForm: true,
    fieldCount: fields.length,
  };
}

// Exported for testing
export { inferTypeFromPdfField, nameToLabel };
export type { AcroFormField };
