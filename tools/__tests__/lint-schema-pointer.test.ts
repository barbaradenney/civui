/**
 * Tests for tools/lint-schema-pointer.ts.
 *
 * The lint extracts schema-pointer comments from the top of every
 * component file and verifies the path resolves. The hard part is
 * the comment parser — multiple prefix forms (regular Schema:, em-dash
 * "Preset wrapper — contract:", hyphen "Preset wrapper - contract:")
 * all map to the same `target` extraction. These unit tests pin that
 * parser.
 */
import { describe, it, expect } from 'vitest';
import { extractPointers } from '../lint-schema-pointer.js';

describe('extractPointers', () => {
  it('extracts a plain "// Schema:" pointer', () => {
    const src = `// Schema: packages/schema/src/components/civ-text-input.schema.ts

import { html } from 'lit';`;
    expect(extractPointers(src)).toEqual([
      { target: 'packages/schema/src/components/civ-text-input.schema.ts', line: 1 },
    ]);
  });

  it('extracts an em-dash "// Preset wrapper — contract:" pointer', () => {
    const src = `// Preset wrapper — contract: packages/schema/src/components/civ-text-input.schema.ts

import { html } from 'lit';`;
    expect(extractPointers(src)).toEqual([
      { target: 'packages/schema/src/components/civ-text-input.schema.ts', line: 1 },
    ]);
  });

  it('extracts a hyphen "// Preset wrapper - contract:" pointer (defensive fallback)', () => {
    const src = `// Preset wrapper - contract: packages/schema/src/components/civ-text-input.schema.ts`;
    expect(extractPointers(src)).toEqual([
      { target: 'packages/schema/src/components/civ-text-input.schema.ts', line: 1 },
    ]);
  });

  it('returns the correct line number when the pointer is not on line 1', () => {
    const src = `
// some other comment
// Schema: packages/schema/src/components/civ-foo.schema.ts
import x;`;
    const pointers = extractPointers(src);
    expect(pointers).toHaveLength(1);
    expect(pointers[0].line).toBe(3);
  });

  it('ignores pointers past the first 10 lines (header-only)', () => {
    const lines = Array.from({ length: 15 }, (_, i) => `// line ${i + 1}`);
    lines[12] = '// Schema: should-be-ignored.schema.ts';
    expect(extractPointers(lines.join('\n'))).toEqual([]);
  });

  it('returns empty when no pointer is present', () => {
    const src = `import { html } from 'lit';
export class Foo {}`;
    expect(extractPointers(src)).toEqual([]);
  });

  it('trims trailing whitespace from the target', () => {
    const src = `// Schema:   packages/schema/src/components/civ-foo.schema.ts   `;
    const pointers = extractPointers(src);
    expect(pointers[0].target).toBe('packages/schema/src/components/civ-foo.schema.ts');
  });

  it('returns multiple pointers when both forms appear (unusual but supported)', () => {
    const src = `// Schema: packages/schema/src/components/civ-a.schema.ts
// Preset wrapper — contract: packages/schema/src/components/civ-b.schema.ts`;
    expect(extractPointers(src)).toHaveLength(2);
  });

  it('does not match a // Schema: substring later in a non-comment line', () => {
    // A string literal containing "// Schema:" should not be picked
    // up as a pointer — the regex anchors on a line-leading `//`.
    const src = `const x = "// Schema: not a comment";`;
    expect(extractPointers(src)).toEqual([]);
  });
});
