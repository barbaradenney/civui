/**
 * Required-cascade lint
 *
 * CivUI's section-legend rule: multi-field compounds suppress the
 * `(required)` mark on their own `<legend>` (because a section
 * heading isn't actionable) and instead cascade `required` to the
 * primary required leaf inputs so each carries its own per-field
 * `(required)`. That's the single source of truth — users see the
 * marker exactly where they will be expected to act.
 *
 * If a compound forgets the cascade, the user sees ZERO `(required)`
 * markers anywhere: not on the legend (suppressed by design), not
 * on the leaves (never set). The compound is required but the user
 * has no way to know.
 *
 * civ-direct-deposit, civ-service-history, and civ-signature shipped
 * without the cascade for months and this audit caught them.
 *
 * This test fixtures each multi-field compound with `required=true`
 * and asserts at least one readonly-supporting inner control (the
 * leaf form controls) ended up with `required=true`.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';

import '../address/civ-address.js';
import '../direct-deposit/civ-direct-deposit.js';
import '../income/civ-income.js';
import '../name/civ-name.js';
import '../partnership-history/civ-partnership-history.js';
import '../race-ethnicity/civ-race-ethnicity.js';
import '../relationship/civ-relationship.js';
import '../service-history/civ-service-history.js';
import '../signature/civ-signature.js';

// Multi-field section-legend compounds. (civ-relationship is
// excluded — its required cascade depends on the selected
// relationship category, which means a bare-required fixture
// may not have a stable leaf control to check; covered in its
// own tests.)
const COMPOUNDS = [
  'civ-address',
  'civ-direct-deposit',
  'civ-income',
  'civ-name',
  'civ-partnership-history',
  'civ-race-ethnicity',
  'civ-service-history',
  'civ-signature',
];

// Tags that consume `required` on their host. Selection controls
// also accept required, so include radio-group / checkbox-group /
// segmented-control / yes-no / memorable-date / date-range-picker.
const LEAF_TAGS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-country',
  'civ-currency',
  'civ-date-picker',
  'civ-date-range-picker',
  'civ-ein',
  'civ-email',
  'civ-file-upload',
  'civ-memorable-date',
  'civ-number',
  'civ-phone',
  'civ-routing-number',
  'civ-ssn',
  'civ-time-picker',
  'civ-va-file-number',
  'civ-yes-no',
  'civ-zip',
  'civ-checkbox',
  'civ-checkbox-group',
  'civ-radio-group',
  'civ-segmented-control',
]);

describe('required-cascade lint', () => {
  afterEach(cleanupFixtures);

  for (const tag of COMPOUNDS) {
    it(`${tag} cascades required to at least one leaf control`, async () => {
      const el = await fixture(`<${tag} legend="test" name="x" required></${tag}>`) as any;
      await elementUpdated(el);

      // Walk the rendered light DOM and find all leaf-tag descendants.
      const leaves: Element[] = [];
      const walk = (node: Element) => {
        for (const child of Array.from(node.children)) {
          if (LEAF_TAGS.has(child.tagName.toLowerCase())) {
            leaves.push(child);
          }
          walk(child);
        }
      };
      walk(el);

      expect(leaves.length, `${tag} rendered no leaf form controls`).toBeGreaterThan(0);

      const requiredLeaves = leaves.filter((leaf) => (leaf as any).required === true);
      expect(
        requiredLeaves.length,
        `${tag} forwards required to ZERO leaves — section-legend compounds must cascade required to at least one primary leaf so the user sees an indicator`,
      ).toBeGreaterThan(0);
    });
  }
});
