/**
 * Tests for tools/lint-status-body-text.ts — the scanLine helper that
 * flags bare AA-failing semantic text classes on <p> body text.
 */
import { describe, it, expect } from 'vitest';
import { scanLine, FORBIDDEN_CLASSES } from '../lint-status-body-text.js';

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
