import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-itemized-total.js';
import './civ-itemized-item.js';
import type { CivItemizedTotal } from './civ-itemized-total.js';
import type { CivItemizedItem } from './civ-itemized-item.js';

afterEach(cleanupFixtures);

// `Intl.NumberFormat` output for currency includes a non-breaking
// space (U+00A0) and locale-dependent grouping separators. The tests
// normalize that whitespace so assertions don't depend on the host
// locale or runtime.
const normalize = (s: string | null | undefined): string =>
  (s ?? '').replace(/ /g, ' ').trim();

describe('civ-itemized-total', () => {
  it('relocates slotted items into the rendered list container', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
        <civ-itemized-item label="Extra" amount="50"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const items = el.querySelector('.civ-itemized-total__items')!;
    expect(items.querySelectorAll('civ-itemized-item')).toHaveLength(2);
  });

  it('auto-sums child amounts when total-amount is not set', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="1663.06"></civ-itemized-item>
        <civ-itemized-item label="Spouse" amount="185.00"></civ-itemized-item>
        <civ-itemized-item label="Child" amount="133.00"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const total = normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent);
    // 1663.06 + 185 + 133 = 1981.06
    expect(total).toBe('$1,981.06');
  });

  it('uses total-amount when set, ignoring children for the total', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total total-amount="9999.99">
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
        <civ-itemized-item label="Extra" amount="50"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const total = normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent);
    expect(total).toBe('$9,999.99');
  });

  it('renders the heading at the configured level', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total heading="Monthly benefit" heading-level="2">
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const heading = el.querySelector('.civ-itemized-total__heading');
    expect(heading?.textContent).toBe('Monthly benefit');
    expect(heading?.getAttribute('aria-level')).toBe('2');
    expect(heading?.getAttribute('role')).toBe('heading');
  });

  it('omits the heading when not set', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-total__heading')).toBeNull();
  });

  it('renders the configured total label', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total total-label="Total monthly amount">
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-total__total-label')?.textContent).toBe(
      'Total monthly amount',
    );
  });

  it('defaults the total label to "Total"', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-total__total-label')?.textContent).toBe('Total');
  });

  it('subtracts negative amounts from the auto-sum', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Wages" amount="500"></civ-itemized-item>
        <civ-itemized-item label="Tax credit" amount="-50"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const total = normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent);
    expect(total).toBe('$450.00');
  });

  it('excludes value-label rows from the auto-sum', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
        <civ-itemized-item label="Service fee" value-label="Pending"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const total = normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent);
    expect(total).toBe('$100.00');
  });

  it('reflects total-intent to the host attribute', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total total-intent="positive">
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.getAttribute('total-intent')).toBe('positive');
    expect(
      el
        .querySelector('.civ-itemized-total__total')
        ?.classList.contains('civ-itemized-total__total--positive'),
    ).toBe(true);
  });

  it('re-formats child amounts when currency changes', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base" amount="100"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(normalize(el.querySelector('.civ-itemized-row__amount')?.textContent)).toBe('$100.00');
    el.currency = 'EUR';
    await elementUpdated(el);
    // The first child element is the row inside the item.
    const formatted = normalize(el.querySelector('.civ-itemized-row__amount')?.textContent);
    // Different locales render EUR as "€100.00" or "100,00 €" — we
    // assert the EUR symbol is present without locking the exact form.
    expect(formatted).toContain('€');
  });

  it('re-computes total when a child amount property changes', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="A" amount="100"></civ-itemized-item>
        <civ-itemized-item label="B" amount="50"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent)).toBe(
      '$150.00',
    );
    const items = el.querySelectorAll<CivItemizedItem>('civ-itemized-item');
    items[1].amount = 75;
    await elementUpdated(items[1]);
    // The parent reruns the sum on its own `updated` cycle. The
    // child's `updated` happens first because attribute changes cascade
    // bottom-up in jsdom — trigger a parent update by touching a prop.
    el.requestUpdate();
    await elementUpdated(el);
    expect(normalize(el.querySelector('.civ-itemized-total__total-amount')?.textContent)).toBe(
      '$175.00',
    );
  });
});

describe('civ-itemized-item', () => {
  it('renders label and formatted amount', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Base rate" amount="1663.06"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-row__label-text')?.textContent).toBe('Base rate');
    expect(normalize(el.querySelector('.civ-itemized-row__amount')?.textContent)).toBe('$1,663.06');
  });

  it('renders the optional note below the label', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Clothing" amount="93.41" note="Annual / 12"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-row__note')?.textContent).toBe('Annual / 12');
  });

  it('uses value-label verbatim when set', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Service fee" value-label="Pending"></civ-itemized-item>
      </civ-itemized-total>
    `);
    expect(el.querySelector('.civ-itemized-row__amount')?.textContent?.trim()).toBe('Pending');
  });

  it('applies an intent class to the amount', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Credit" amount="-50" intent="negative"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const amount = el.querySelector('.civ-itemized-row__amount');
    expect(amount?.classList.contains('civ-itemized-row__amount--negative')).toBe(true);
  });

  it('renders the amount with a locale-aware minus when negative', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="Refund" amount="-50.00"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const text = normalize(el.querySelector('.civ-itemized-row__amount')?.textContent);
    // Negative en-US currency renders as "-$50.00".
    expect(text).toMatch(/^-\$50\.00$/);
  });

  it('reflects intent to the host attribute', async () => {
    const el = await fixture<CivItemizedTotal>(`
      <civ-itemized-total>
        <civ-itemized-item label="x" amount="1" intent="positive"></civ-itemized-item>
      </civ-itemized-total>
    `);
    const item = el.querySelector('civ-itemized-item')!;
    expect(item.getAttribute('intent')).toBe('positive');
  });
});
