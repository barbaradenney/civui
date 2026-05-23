import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import type { AnalyticsEventDetail } from '@civui/core';

import '../ssn/civ-ssn.js';
import '../ein/civ-ein.js';
import '../zip/civ-zip.js';
import '../phone/civ-phone.js';
import '../email/civ-email.js';
import '../currency/civ-currency.js';
import '../routing-number/civ-routing-number.js';
import '../va-file-number/civ-va-file-number.js';
import '../country/civ-country.js';

const PRESETS = [
  'civ-ssn',
  'civ-ein',
  'civ-zip',
  'civ-phone',
  'civ-email',
  'civ-currency',
  'civ-routing-number',
  'civ-va-file-number',
  'civ-country',
];

describe('PresetInputWrapper civ-analytics restamping', () => {
  afterEach(cleanupFixtures);

  for (const tag of PRESETS) {
    it(`${tag} restamps componentName to the wrapper tag`, async () => {
      const el = await fixture(`<${tag} name="field"></${tag}>`);
      const inner = el.querySelector('civ-text-input, civ-combobox')!;

      const events: AnalyticsEventDetail[] = [];
      el.addEventListener('civ-analytics', (e: Event) => {
        events.push((e as CustomEvent<AnalyticsEventDetail>).detail);
      });

      inner.dispatchEvent(
        new CustomEvent('civ-analytics', {
          detail: {
            componentName: inner.tagName.toLowerCase(),
            action: 'change',
            fieldName: 'field',
            label: 'Label',
            timestamp: '2026-05-23T00:00:00.000Z',
            details: { piiMasked: true },
          } satisfies AnalyticsEventDetail,
          bubbles: true,
          composed: true,
        }),
      );

      expect(events).toHaveLength(1);
      expect(events[0].componentName).toBe(tag);
      expect(events[0].action).toBe('change');
      expect(events[0].fieldName).toBe('field');
      expect(events[0].label).toBe('Label');
      expect(events[0].details).toEqual({ piiMasked: true });
    });
  }

  it('does not re-dispatch an event already stamped with the wrapper tag', async () => {
    const el = await fixture('<civ-ssn name="ssn"></civ-ssn>');
    let count = 0;
    el.addEventListener('civ-analytics', () => {
      count += 1;
    });

    el.dispatchEvent(
      new CustomEvent('civ-analytics', {
        detail: {
          componentName: 'civ-ssn',
          action: 'change',
          timestamp: '2026-05-23T00:00:00.000Z',
        } satisfies AnalyticsEventDetail,
        bubbles: true,
        composed: true,
      }),
    );

    expect(count).toBe(1);
  });
});
