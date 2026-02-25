import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inferTypeFromPdfField, nameToLabel } from './parse-pdf.js';
import type { AcroFormField } from './parse-pdf.js';

function field(overrides: Partial<AcroFormField> = {}): AcroFormField {
  return {
    fieldName: '',
    fieldType: 'Tx',
    fieldFlags: 0,
    fieldValue: '',
    fieldOptions: [],
    ...overrides,
  };
}

describe('inferTypeFromPdfField', () => {
  it('maps Ch (choice) type to select', () => {
    expect(inferTypeFromPdfField(field({ fieldType: 'Ch' }))).toBe('select');
  });

  it('maps Btn type without radio flag to checkbox', () => {
    expect(inferTypeFromPdfField(field({ fieldType: 'Btn', fieldFlags: 0 }))).toBe('checkbox');
  });

  it('maps Btn type with radio flag to radio', () => {
    // Bit 16 (0x8000) indicates radio buttons
    expect(inferTypeFromPdfField(field({ fieldType: 'Btn', fieldFlags: 0x8000 }))).toBe('radio');
  });

  it('infers email from field name', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'email_address' }))).toBe('email');
    expect(inferTypeFromPdfField(field({ fieldName: 'e-mail' }))).toBe('email');
  });

  it('infers tel from field name containing "phone"', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'phone_number' }))).toBe('tel');
    expect(inferTypeFromPdfField(field({ fieldName: 'fax' }))).toBe('tel');
  });

  it('infers ssn from field name', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'ssn' }))).toBe('ssn');
    expect(inferTypeFromPdfField(field({ fieldName: 'social_security' }))).toBe('ssn');
  });

  it('infers zip from field name', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'zip_code' }))).toBe('zip');
    expect(inferTypeFromPdfField(field({ fieldName: 'postal_code' }))).toBe('zip');
  });

  it('infers memorable-date from field name containing "dob" or "birth"', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'dob' }))).toBe('memorable-date');
    expect(inferTypeFromPdfField(field({ fieldName: 'date_of_birth' }))).toBe('memorable-date');
  });

  it('infers date from generic date field name', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'start_date' }))).toBe('date');
  });

  it('defaults to text for unknown Tx fields', () => {
    expect(inferTypeFromPdfField(field({ fieldName: 'first_name' }))).toBe('text');
  });
});

describe('nameToLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(nameToLabel('first_name')).toBe('First Name');
  });

  it('converts camelCase to Title Case', () => {
    expect(nameToLabel('firstName')).toBe('First Name');
  });

  it('converts kebab-case to Title Case', () => {
    expect(nameToLabel('first-name')).toBe('First Name');
  });

  it('converts dot.separated to Title Case', () => {
    expect(nameToLabel('user.name')).toBe('User Name');
  });

  it('handles single word', () => {
    expect(nameToLabel('email')).toBe('Email');
  });

  it('handles mixed separators', () => {
    expect(nameToLabel('date_of_birth')).toBe('Date Of Birth');
  });
});

// Mock pdf-parse so parsePDF can be tested without real PDF buffers.
// The mock simulates pdf-parse's actual behavior: for each page it calls
// pagerender(pageData), uses the return value as the page text, and
// concatenates all pages into data.text.
vi.mock('pdf-parse', () => {
  return {
    default: vi.fn(),
  };
});

interface MockPage {
  annotations?: Array<Record<string, unknown>>;
  textItems?: Array<{ str: string; transform: number[] }>;
}

/**
 * Create a mock page object that provides getTextContent and getAnnotations,
 * matching the pdf.js PDFPageProxy shape our code expects.
 */
function mockPage(page: MockPage = {}) {
  return {
    getTextContent: async () => ({
      items: page.textItems ?? [{ str: 'Default text', transform: [0, 0, 0, 0, 0, 0] }],
    }),
    getAnnotations: async () => page.annotations ?? [],
  };
}

/**
 * Simulate pdf-parse behavior: call pagerender for each page, concatenate
 * return values into data.text.
 */
function simulatePdfParse(
  pages: MockPage[],
  info: Record<string, unknown> = {},
) {
  return async (_buf: Buffer, opts?: { pagerender?: (page: unknown) => Promise<string> }) => {
    let text = '';
    if (opts?.pagerender) {
      for (const page of pages) {
        const pageText = await opts.pagerender(mockPage(page));
        text = `${text}\n\n${pageText}`;
      }
    }
    return { text, info, numpages: pages.length };
  };
}

describe('parsePDF', () => {
  let parsePDF: typeof import('./parse-pdf.js').parsePDF;
  let mockPdfParse: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    const pdfParseModule = await import('pdf-parse');
    mockPdfParse = pdfParseModule.default as unknown as ReturnType<typeof vi.fn>;

    const mod = await import('./parse-pdf.js');
    parsePDF = mod.parsePDF;
  });

  it('returns rawText and null schema when no annotations exist', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse(
      [{ textItems: [{ str: 'Plain text content', transform: [0, 0, 0, 0, 0, 0] }] }],
      { Title: 'My Document' },
    ));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.hasAcroForm).toBe(false);
    expect(result.schema).toBeNull();
    expect(result.rawText).toContain('Plain text content');
    expect(result.fieldCount).toBe(0);
  });

  it('extracts AcroForm fields from widget annotations', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse(
      [{
        textItems: [{ str: 'Form page', transform: [0, 0, 0, 0, 0, 0] }],
        annotations: [
          { subtype: 'Widget', fieldName: 'first_name', fieldType: 'Tx', fieldFlags: 0 },
          { subtype: 'Widget', fieldName: 'email_address', fieldType: 'Tx', fieldFlags: 0 },
          { subtype: 'Widget', fieldName: 'state', fieldType: 'Ch', fieldFlags: 0, options: [
            { exportValue: 'CA', displayValue: 'California' },
            { exportValue: 'NY', displayValue: 'New York' },
          ] },
          { subtype: 'Link', fieldName: 'ignored' }, // non-widget — should be skipped
        ],
      }],
      { Title: 'Application' },
    ));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.hasAcroForm).toBe(true);
    expect(result.fieldCount).toBe(3);
    expect(result.schema).not.toBeNull();
    expect(result.rawText).toContain('Form page');

    const fields = result.schema!.sections[0].fields;
    expect(fields[0].type).toBe('text');
    expect(fields[0].name).toBe('first_name');
    expect(fields[0].label).toBe('First Name');

    expect(fields[1].type).toBe('email');
    expect(fields[1].name).toBe('email_address');

    expect(fields[2].type).toBe('select');
    expect(fields[2].options).toHaveLength(2);
    expect(fields[2].options![0].value).toBe('CA');
  });

  it('deduplicates fields with the same name across pages', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse([
      { annotations: [{ subtype: 'Widget', fieldName: 'name', fieldType: 'Tx', fieldFlags: 0 }] },
      { annotations: [{ subtype: 'Widget', fieldName: 'name', fieldType: 'Tx', fieldFlags: 0 }] },
    ]));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.fieldCount).toBe(1);
  });

  it('concatenates text from multiple pages', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse([
      { textItems: [{ str: 'Page one', transform: [0, 0, 0, 0, 0, 0] }] },
      { textItems: [{ str: 'Page two', transform: [0, 0, 0, 0, 0, 0] }] },
    ]));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.rawText).toContain('Page one');
    expect(result.rawText).toContain('Page two');
  });

  it('renders multi-line text using Y-coordinate changes', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse([{
      textItems: [
        { str: 'Line 1', transform: [0, 0, 0, 0, 0, 100] },
        { str: ' continued', transform: [0, 0, 0, 0, 0, 100] }, // same Y → same line
        { str: 'Line 2', transform: [0, 0, 0, 0, 0, 80] },     // different Y → new line
      ],
    }]));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.rawText).toContain('Line 1 continued');
    expect(result.rawText).toContain('\nLine 2');
  });

  it('truncates rawText to 10,000 characters', async () => {
    const longStr = 'x'.repeat(20_000);
    mockPdfParse.mockImplementation(simulatePdfParse([{
      textItems: [{ str: longStr, transform: [0, 0, 0, 0, 0, 0] }],
    }]));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.rawText.length).toBeLessThanOrEqual(10_000);
  });

  it('extracts title from PDF info when form fields exist', async () => {
    mockPdfParse.mockImplementation(simulatePdfParse(
      [{ annotations: [{ subtype: 'Widget', fieldName: 'name', fieldType: 'Tx', fieldFlags: 0 }] }],
      { Title: 'Benefits Form' },
    ));

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.schema).not.toBeNull();
    expect(result.schema!.title).toBe('Benefits Form');
  });

  it('handles getAnnotations throwing gracefully', async () => {
    mockPdfParse.mockImplementation(async (_buf: Buffer, opts?: { pagerender?: (page: unknown) => Promise<string> }) => {
      let text = '';
      if (opts?.pagerender) {
        const pageText = await opts.pagerender({
          getTextContent: async () => ({
            items: [{ str: 'Recovered text', transform: [0, 0, 0, 0, 0, 0] }],
          }),
          getAnnotations: async () => { throw new Error('corrupt page'); },
        });
        text = `\n\n${pageText}`;
      }
      return { text, info: {}, numpages: 1 };
    });

    const result = await parsePDF(Buffer.from('fake'));
    expect(result.hasAcroForm).toBe(false);
    expect(result.schema).toBeNull();
    expect(result.rawText).toContain('Recovered text');
  });
});
