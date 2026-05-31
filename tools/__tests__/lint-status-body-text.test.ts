/**
 * Tests for tools/lint-status-body-text.ts — the scanLine helper that
 * flags bare AA-failing semantic text classes on <p> body text.
 */
import { describe, it, expect } from 'vitest';
import { scanLine, scanContent, FORBIDDEN_CLASSES } from '../lint-status-body-text.js';

describe('FORBIDDEN_CLASSES', () => {
  it('covers the three AA-failing DEFAULT shades and not error', () => {
    expect(FORBIDDEN_CLASSES).toEqual(
      expect.arrayContaining(['civ-text-success', 'civ-text-warning', 'civ-text-info']),
    );
    expect(FORBIDDEN_CLASSES).not.toContain('civ-text-error');
  });
});

describe('scanLine', () => {
  it('flags a bare semantic-DEFAULT class on a <p>', () => {
    expect(scanLine('<p class="civ-text-success">All set</p>')).toEqual(['civ-text-success']);
    expect(scanLine('<p class="civ-text-warning civ-m-0">Heads up</p>')).toEqual(['civ-text-warning']);
    expect(scanLine('<p class="civ-text-info">FYI</p>')).toEqual(['civ-text-info']);
  });

  it('does NOT flag the AA-safe -dark / -darkest shades', () => {
    expect(scanLine('<p class="civ-text-success-dark">All set</p>')).toEqual([]);
    expect(scanLine('<p class="civ-text-warning-darkest">Heads up</p>')).toEqual([]);
    expect(scanLine('<p class="civ-text-info-darkest">FYI</p>')).toEqual([]);
  });

  it('does NOT flag civ-text-error (already AA)', () => {
    expect(scanLine('<p class="civ-text-error">Problem</p>')).toEqual([]);
  });

  it('only matches <p> tags, not other elements', () => {
    expect(scanLine('<span class="civ-text-success">x</span>')).toEqual([]);
    expect(scanLine('<div class="civ-text-warning">x</div>')).toEqual([]);
  });

  it('matches JSON-escaped class attributes', () => {
    expect(scanLine('<p class=\\"civ-text-success civ-mt-3\\">')).toEqual(['civ-text-success']);
  });

  it('returns empty for an unrelated line', () => {
    expect(scanLine('<p class="civ-text-base-darkest">body</p>')).toEqual([]);
  });
});

describe('scanContent (multiline-aware)', () => {
  it('flags a forbidden class when the <p> opener spans multiple lines', () => {
    // This is the exact shape that hid in destructive-actions.stories.ts:
    // <p / data-status / class="…" / role="status"> across four lines.
    const text = [
      '        <p',
      '          data-status',
      '          class="civ-text-caption civ-text-success civ-mt-3"',
      '          role="status"',
      '        ></p>',
    ].join('\n');
    const hits = scanContent(text);
    expect(hits).toHaveLength(1);
    expect(hits[0].forbidden).toBe('civ-text-success');
    // Line number points at the `<p` opener (line 1), not the class line.
    expect(hits[0].line).toBe(1);
  });

  it('still flags a single-line <p> (parity with scanLine)', () => {
    const hits = scanContent('<p class="civ-text-warning">x</p>');
    expect(hits.map((h) => h.forbidden)).toEqual(['civ-text-warning']);
  });

  it('does NOT flag the AA-safe -dark shade across lines', () => {
    const text = '<p\n  class="civ-text-success-dark"\n>ok</p>';
    expect(scanContent(text)).toEqual([]);
  });

  it('reports the correct line number for a hit deeper in the file', () => {
    const text = ['line1', 'line2', '<p class="civ-text-info">x</p>'].join('\n');
    const hits = scanContent(text);
    expect(hits[0].line).toBe(3);
  });

  it('does not match non-<p> elements across lines', () => {
    const text = '<span\n  class="civ-text-success"\n>x</span>';
    expect(scanContent(text)).toEqual([]);
  });
});
