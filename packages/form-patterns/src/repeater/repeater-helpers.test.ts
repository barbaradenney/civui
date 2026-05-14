import { describe, it, expect, vi } from 'vitest';
import {
  resolveSummary,
  resolveEditHref,
  rowHeadingLevel,
  rowHeadingText,
  resolveFormStepsSummary,
} from './repeater-helpers.js';

describe('resolveSummary', () => {
  const baseOpts = { itemLabel: 'dependent' };

  it('uses the rowSummary function when provided', () => {
    const result = resolveSummary(
      { firstName: 'Alex', lastName: 'Chen' },
      0,
      { ...baseOpts, rowSummary: (row) => `${row.firstName} ${row.lastName}` },
    );
    expect(result).toBe('Alex Chen');
  });

  it('rowSummary wins over summaryTemplate AND summaryFields', () => {
    const result = resolveSummary(
      { firstName: 'Alex', lastName: 'Chen' },
      0,
      {
        ...baseOpts,
        rowSummary: () => 'from-fn',
        summaryTemplate: 'from-template',
        summaryFields: 'firstName',
      },
    );
    expect(result).toBe('from-fn');
  });

  it('interpolates {prop} placeholders in summaryTemplate', () => {
    const result = resolveSummary(
      { firstName: 'Alex', lastName: 'Chen', relationship: 'Spouse' },
      0,
      { ...baseOpts, summaryTemplate: '{firstName} {lastName} ({relationship})' },
    );
    expect(result).toBe('Alex Chen (Spouse)');
  });

  it('treats missing props in summaryTemplate as empty strings', () => {
    const result = resolveSummary(
      { firstName: 'Alex' },
      0,
      { ...baseOpts, summaryTemplate: '{firstName} {lastName}' },
    );
    expect(result).toBe('Alex ');
  });

  it('summaryTemplate wins over summaryFields', () => {
    const result = resolveSummary(
      { firstName: 'Alex', lastName: 'Chen' },
      0,
      { ...baseOpts, summaryTemplate: 'tmpl', summaryFields: 'firstName,lastName' },
    );
    expect(result).toBe('tmpl');
  });

  it('joins summaryFields with a single space', () => {
    const result = resolveSummary(
      { firstName: 'Alex', lastName: 'Chen' },
      0,
      { ...baseOpts, summaryFields: 'firstName,lastName' },
    );
    expect(result).toBe('Alex Chen');
  });

  it('trims whitespace around each field name in summaryFields', () => {
    const result = resolveSummary(
      { a: 'x', b: 'y' },
      0,
      { ...baseOpts, summaryFields: ' a , b ' },
    );
    expect(result).toBe('x y');
  });

  it('skips empty / null props when joining summaryFields', () => {
    const result = resolveSummary(
      { firstName: 'Alex', middleName: '', lastName: 'Chen' },
      0,
      { ...baseOpts, summaryFields: 'firstName,middleName,lastName' },
    );
    expect(result).toBe('Alex Chen');
  });

  it('falls back to "{itemLabel} {index+1}" when no resolver matches', () => {
    const result = resolveSummary({ id: '1' }, 2, baseOpts);
    expect(result).toBe('dependent 3');
  });

  it('falls back when summaryFields list is empty', () => {
    const result = resolveSummary({ a: 'x' }, 0, { ...baseOpts, summaryFields: '' });
    expect(result).toBe('dependent 1');
  });

  it('falls back when every summaryFields entry resolves to empty', () => {
    const result = resolveSummary(
      { a: '', b: null },
      0,
      { ...baseOpts, summaryFields: 'a,b' },
    );
    expect(result).toBe('dependent 1');
  });
});

describe('resolveEditHref', () => {
  const baseOpts = { idField: 'id' };

  it('returns an empty string when no editHrefPattern is set', () => {
    expect(resolveEditHref({ id: 'abc' }, 0, { ...baseOpts, editHrefPattern: '' })).toBe('');
  });

  it('interpolates {id} from the row', () => {
    const href = resolveEditHref(
      { id: 'abc' },
      0,
      { ...baseOpts, editHrefPattern: '/items/{id}/edit' },
    );
    expect(href).toBe('/items/abc/edit');
  });

  it('interpolates {index} from the index arg', () => {
    const href = resolveEditHref(
      { id: 'abc' },
      3,
      { ...baseOpts, editHrefPattern: '/items/{index}' },
    );
    expect(href).toBe('/items/3');
  });

  it('interpolates both {id} and {index} when both appear', () => {
    const href = resolveEditHref(
      { id: 'abc' },
      3,
      { ...baseOpts, editHrefPattern: '/items/{id}/at/{index}' },
    );
    expect(href).toBe('/items/abc/at/3');
  });

  it('URL-encodes {id} values containing slashes / spaces', () => {
    const href = resolveEditHref(
      { id: 'a/b c' },
      0,
      { ...baseOpts, editHrefPattern: '/items/{id}' },
    );
    expect(href).toBe('/items/a%2Fb%20c');
  });

  it('falls back to {index} and calls onMissingId when row has no id', () => {
    const onMissingId = vi.fn();
    const href = resolveEditHref(
      { firstName: 'Alex' },
      5,
      { ...baseOpts, editHrefPattern: '/items/{id}', onMissingId },
    );
    expect(href).toBe('/items/5');
    expect(onMissingId).toHaveBeenCalledWith('id');
  });

  it('falls back when the id field is empty string', () => {
    const onMissingId = vi.fn();
    const href = resolveEditHref(
      { id: '' },
      2,
      { ...baseOpts, editHrefPattern: '/items/{id}', onMissingId },
    );
    expect(href).toBe('/items/2');
    expect(onMissingId).toHaveBeenCalledOnce();
  });

  it('skips onMissingId when {id} is not in the pattern', () => {
    const onMissingId = vi.fn();
    resolveEditHref(
      { firstName: 'Alex' },
      0,
      { ...baseOpts, editHrefPattern: '/items/{index}', onMissingId },
    );
    expect(onMissingId).not.toHaveBeenCalled();
  });

  it('sanitizes unsafe schemes', () => {
    const href = resolveEditHref(
      { id: 'javascript:alert(1)' },
      0,
      { ...baseOpts, editHrefPattern: '/items/{id}' },
    );
    // The encoded "javascript:" is harmless inside a path segment, but the
    // helper still runs the result through sanitizeHref as defense-in-depth.
    expect(href).not.toMatch(/^javascript:/);
  });
});

describe('rowHeadingLevel', () => {
  it('defaults to h3 when no legend level is set (legendLevel undefined → h2 base + 1)', () => {
    expect(rowHeadingLevel(undefined)).toBe(3);
  });

  it('returns legendLevel + 1', () => {
    expect(rowHeadingLevel(1)).toBe(2);
    expect(rowHeadingLevel(2)).toBe(3);
    expect(rowHeadingLevel(3)).toBe(4);
    expect(rowHeadingLevel(4)).toBe(5);
    expect(rowHeadingLevel(5)).toBe(6);
  });

  it('clamps at h6 when legend is already at the bottom of the outline', () => {
    expect(rowHeadingLevel(6)).toBe(6);
    expect(rowHeadingLevel(99)).toBe(6);
  });
});

describe('rowHeadingText', () => {
  it('renders "{itemLabel} {index+1}" using the i18n template', () => {
    expect(rowHeadingText('dependent', 0)).toBe('dependent 1');
    expect(rowHeadingText('dependent', 4)).toBe('dependent 5');
  });

  it('handles plural-ish item labels verbatim — capitalization is a CSS concern', () => {
    expect(rowHeadingText('Phone number', 0)).toBe('Phone number 1');
  });
});

describe('resolveFormStepsSummary', () => {
  it('joins up to three non-empty values with commas', () => {
    const result = resolveFormStepsSummary(
      { firstName: 'Alex', lastName: 'Chen', email: 'a@b.gov' },
      0,
      'dependent',
    );
    expect(result).toBe('Alex, Chen, a@b.gov');
  });

  it('caps at three values even when more are present', () => {
    const result = resolveFormStepsSummary(
      { a: '1', b: '2', c: '3', d: '4', e: '5' },
      0,
      'item',
    );
    expect(result.split(',').length).toBe(3);
  });

  it('skips empty / whitespace-only values', () => {
    const result = resolveFormStepsSummary(
      { firstName: 'Alex', middleName: '   ', lastName: 'Chen' },
      0,
      'dependent',
    );
    expect(result).toBe('Alex, Chen');
  });

  it('skips values that look like JSON blobs (start with `{`)', () => {
    // Some compound components stringify their value as `{ ... }` — those
    // shouldn't leak into the summary line.
    const result = resolveFormStepsSummary(
      { name: 'Alex', address: '{"street":"123 Main"}', phone: '555-0123' },
      0,
      'dependent',
    );
    expect(result).toBe('Alex, 555-0123');
  });

  it('falls back to "{itemLabel} {index+1}" when nothing usable remains', () => {
    expect(resolveFormStepsSummary({}, 0, 'dependent')).toBe('dependent 1');
    expect(resolveFormStepsSummary({ a: '', b: '   ' }, 2, 'item')).toBe('item 3');
  });

  it('uses the raw itemLabel (no i18n) — form-steps summary is not a heading', () => {
    // resolveFormStepsSummary is summary-line text under a heading that's
    // already i18n'd via rowHeadingText. So the fallback uses the literal
    // itemLabel rather than going through t('repeaterItemLabel').
    const result = resolveFormStepsSummary({}, 0, 'phone number');
    expect(result).toBe('phone number 1');
  });
});
