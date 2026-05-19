/**
 * Form-reset-callback lint
 *
 * Every compound that extends CivCompoundElement maintains an
 * internal `_data` field driving its render. CivFormElement's
 * default `formResetCallback()` only resets `value`, not `_data`.
 *
 * If a compound forgets to override `formResetCallback`, calling
 * reset on the parent <form> appears to do nothing visually:
 * `value` resets, `_data` doesn't, the rendered sub-fields still
 * show the old data.
 *
 * This test fixtures every known compound, sets a non-empty value,
 * calls `formResetCallback()`, and asserts `_data` matches `_empty`.
 * Catches both missing overrides AND overrides that forget to reset
 * `_data` (e.g., reset only error props).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';

// Static imports register the custom elements before fixtures run.
import '../address/civ-address.js';
import '../direct-deposit/civ-direct-deposit.js';
import '../income/civ-income.js';
import '../name/civ-name.js';
import '../partnership-history/civ-partnership-history.js';
import '../relationship/civ-relationship.js';
import '../service-history/civ-service-history.js';
import '../signature/civ-signature.js';

// Each entry: tag name + a value that's distinguishable from the
// empty state. The value shape doesn't have to match the compound's
// real schema — we just need _data to be non-empty after assignment
// so the reset is visible.
const COMPOUNDS: Array<{ tag: string; value: Record<string, unknown> }> = [
  { tag: 'civ-address', value: { street1: '123 Main', city: 'Anytown' } },
  { tag: 'civ-direct-deposit', value: { accountType: 'checking', accountNumber: '12345' } },
  { tag: 'civ-income', value: { amount: '5000', frequency: 'monthly' } },
  { tag: 'civ-name', value: { first: 'Pat', last: 'Doe' } },
  { tag: 'civ-partnership-history', value: { partnerFirst: 'Pat' } },
  // civ-race-ethnicity follows a different pattern (private _data,
  // no `_empty`) and tests its own reset directly. Excluded here.
  { tag: 'civ-relationship', value: { relationship: 'spouse' } },
  { tag: 'civ-service-history', value: { branch: 'army' } },
  { tag: 'civ-signature', value: { name: 'Pat Doe', certified: true } },
];

describe('form-reset-callback lint', () => {
  afterEach(cleanupFixtures);

  for (const { tag, value } of COMPOUNDS) {
    it(`${tag} resets _data on formResetCallback()`, async () => {
      // Set value via attribute so connectedCallback hydrates _data
      // before the first render. (Setting .value as a property after
      // attach is a no-op for _data — hydration only happens once.)
      const initial = JSON.stringify(value).replace(/"/g, '&quot;');
      const el = await fixture(`<${tag} legend="test" name="x" value="${initial}"></${tag}>`) as any;
      await elementUpdated(el);

      const emptyJson = JSON.stringify(el._empty);
      const dataBeforeReset = JSON.stringify(el._data);
      // Sanity check — `_data` should be different from `_empty`.
      // If the compound silently rejects the value we passed (some
      // compounds reject if required sub-fields are missing), at
      // least one root field should differ from _empty.
      const hydrated = Object.keys(value).some(
        (k) => JSON.stringify((el._data as any)[k]) !== JSON.stringify((el._empty as any)[k]),
      );
      expect(hydrated, `${tag} did not hydrate _data from value attribute (got ${dataBeforeReset})`).toBe(true);

      el.formResetCallback();
      await elementUpdated(el);

      expect(JSON.stringify(el._data), `${tag} formResetCallback left _data unchanged`).toBe(emptyJson);
    });
  }
});
