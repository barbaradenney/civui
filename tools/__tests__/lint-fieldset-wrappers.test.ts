/**
 * Tests for tools/lint-fieldset-wrappers.ts.
 *
 * Each test runs the linter end-to-end against a temp file rather than
 * mocking internals — the contract is "given this HTML, do you flag it?"
 * which is most reliably tested through the public entry.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { runLint } from '../lint-fieldset-wrappers.js';

// Temp file helpers — write a file under packages/.scratch/ so the
// linter's SCAN_ROOTS picks it up. The tests clean up after themselves.
const SCRATCH = join(import.meta.dirname, '../..', 'packages', '.lint-scratch');

function makeFile(name: string, content: string): string {
  try { mkdtempSync(SCRATCH); } catch { /* already exists */ }
  // Use mkdtemp pattern — simpler is just ensuring the dir exists.
  // Actually we want a stable path, so just create the dir if missing.
  const fs = require('fs');
  if (!fs.existsSync(SCRATCH)) fs.mkdirSync(SCRATCH, { recursive: true });
  const path = join(SCRATCH, name);
  writeFileSync(path, content);
  return path;
}

afterEach(() => {
  try { rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* ignore */ }
});

function violationsFor(filePath: string) {
  const { violations } = runLint();
  return violations.filter((v) => v.file === filePath);
}

describe('lint-fieldset-wrappers', () => {
  it('flags civ-radio-group wrapped in civ-fieldset (multi-line)', () => {
    const path = makeFile('flag-radio.mdx', `
\`\`\`html
<civ-fieldset legend="Pick">
  <civ-radio-group name="x">
    <civ-radio value="a"></civ-radio>
  </civ-radio-group>
</civ-fieldset>
\`\`\`
`);
    const v = violationsFor(path);
    expect(v.length).toBe(1);
    expect(v[0].inner).toBe('civ-radio-group');
  });

  it('flags single-line wrap', () => {
    const path = makeFile('inline.mdx', `
\`\`\`html
<civ-fieldset legend="X"><civ-memorable-date name="d"></civ-memorable-date></civ-fieldset>
\`\`\`
`);
    const v = violationsFor(path);
    expect(v.length).toBe(1);
    expect(v[0].inner).toBe('civ-memorable-date');
  });

  it('does NOT flag self-contained usage (no wrapper)', () => {
    const path = makeFile('clean.mdx', `
\`\`\`html
<civ-radio-group legend="Pick" name="x">
  <civ-radio value="a"></civ-radio>
</civ-radio-group>
\`\`\`
`);
    expect(violationsFor(path)).toEqual([]);
  });

  it('does NOT flag civ-fieldset wrapping non-self-contained controls', () => {
    // Multiple text-inputs wrapped in civ-fieldset for grouping is the
    // legitimate use case the wrapper exists for.
    const path = makeFile('genuine-grouping.mdx', `
\`\`\`html
<civ-fieldset legend="Mailing address">
  <civ-text-input label="Street" name="street"></civ-text-input>
  <civ-text-input label="City" name="city"></civ-text-input>
</civ-fieldset>
\`\`\`
`);
    expect(violationsFor(path)).toEqual([]);
  });

  it('ignores tag mentions inside inline backticks (markdown prose)', () => {
    const path = makeFile('prose.md', `
Group components like \`<civ-radio-group>\` and \`<civ-memorable-date>\`
used to require \`<civ-fieldset>\` wrapping. They are now self-contained.
`);
    expect(violationsFor(path)).toEqual([]);
  });

  it('flags tag usage inside fenced code blocks (anti-pattern in examples)', () => {
    const path = makeFile('example.mdx', `
Use the new pattern:

\`\`\`html
<civ-fieldset legend="X">
  <civ-checkbox-group name="x"></civ-checkbox-group>
</civ-fieldset>
\`\`\`
`);
    const v = violationsFor(path);
    expect(v.length).toBe(1);
    expect(v[0].inner).toBe('civ-checkbox-group');
  });

  it('reports the line of the GROUP component, not the wrapping fieldset', () => {
    const path = makeFile('lines.mdx', `
\`\`\`html
<civ-fieldset legend="Y">
  <civ-yes-no name="y"></civ-yes-no>
</civ-fieldset>
\`\`\`
`);
    const v = violationsFor(path);
    expect(v.length).toBe(1);
    expect(v[0].inner).toBe('civ-yes-no');
    // The yes-no line is line 4 (1: blank, 2: ```html, 3: fieldset, 4: yes-no)
    expect(v[0].line).toBe(4);
    expect(v[0].fieldsetLine).toBe(3);
  });

  it('handles depth-aware nesting (close on next line pops the stack)', () => {
    // The first fieldset wraps the radio-group (flag); after it closes,
    // the second fieldset wraps an address (legit) and should NOT flag.
    const path = makeFile('nested.mdx', `
\`\`\`html
<civ-fieldset legend="A">
  <civ-radio-group name="a"></civ-radio-group>
</civ-fieldset>

<civ-fieldset legend="B">
  <civ-address name="b"></civ-address>
</civ-fieldset>
\`\`\`
`);
    const v = violationsFor(path);
    expect(v.length).toBe(1);
    expect(v[0].inner).toBe('civ-radio-group');
  });
});
