import { describe, it, expect } from 'vitest';
import { escapeCell, isCliInvocation } from '../sync-doc-tables.js';

describe('isCliInvocation (side-effect guard)', () => {
  it('returns false when the module is imported (not invoked as CLI)', () => {
    // Under vitest, process.argv[1] is the test runner, not
    // sync-doc-tables.ts — so main() must NOT run on import. Without
    // this guard, importing the module (e.g. for escapeCell) regenerated
    // all 115 doc partials against the real docs dir and could truncate
    // a partial to 0 bytes under the parallel runner.
    expect(isCliInvocation()).toBe(false);
  });
});

describe('escapeCell', () => {
  it('backslash-escapes pipes (table delimiter collision)', () => {
    expect(escapeCell("'a' | 'b'")).toBe("'a' \\| 'b'");
  });

  it('replaces newlines with spaces', () => {
    expect(escapeCell('line one\nline two')).toBe('line one line two');
  });

  it('escapes bare `<` and `>` outside backticks (MDX parses them as JSX)', () => {
    expect(escapeCell('Rendered as <select> element')).toBe('Rendered as &lt;select&gt; element');
  });

  it('leaves `<tag>` inside backticks alone (already safe in MDX)', () => {
    expect(escapeCell('Use `<select>` directly')).toBe('Use `<select>` directly');
  });

  it('escapes bare `{…}` outside backticks (MDX parses them as JSX expression slots)', () => {
    expect(escapeCell('Interpolates {name} and {count}'))
      .toBe('Interpolates &lcub;name&rcub; and &lcub;count&rcub;');
  });

  it('leaves `{…}` inside backticks alone', () => {
    expect(escapeCell('Use `{name}` interpolation')).toBe('Use `{name}` interpolation');
  });

  it('handles mixed brace/tag content correctly', () => {
    expect(escapeCell('Error template for {name}: rendered in <span>'))
      .toBe('Error template for &lcub;name&rcub;: rendered in &lt;span&gt;');
  });

  it('handles toggling code spans', () => {
    expect(escapeCell('`<a>` for HTML and {name} for interpolation'))
      .toBe('`<a>` for HTML and &lcub;name&rcub; for interpolation');
  });

  it('handles object-shape descriptions like {id, name, size}', () => {
    expect(escapeCell('Each item: {id, name, size, url?, type?}'))
      .toBe('Each item: &lcub;id, name, size, url?, type?&rcub;');
  });

  it('does not double-escape already-entity content', () => {
    // `&lt;` already-entity content should pass through unchanged.
    expect(escapeCell('Use &lt;b&gt; for bold')).toBe('Use &lt;b&gt; for bold');
  });
});
