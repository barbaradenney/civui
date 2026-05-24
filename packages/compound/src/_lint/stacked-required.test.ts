/**
 * No-(required)-on-multi-field-legend lint
 *
 * Multi-field compounds (`civ-fieldset`, `civ-address`, `civ-name`,
 * `civ-relationship`, `civ-direct-deposit`, `civ-partnership-history`,
 * `civ-service-history`) render a `<legend>` that's a *section heading*
 * — not a question the user answers. The user can't act on the
 * legend; they act on the inputs inside. Showing `(required)` on a
 * section legend is decorative, and combined with the `required`
 * cascade to children it produces stacked indicators ("(required)"
 * once per nesting level) — the bug we hit on civ-relationship's
 * "With Errors" story.
 *
 * Convention:
 *  - **Self-contained group components** (`civ-radio-group`,
 *    `civ-yes-no`, `civ-checkbox-group`, `civ-memorable-date`,
 *    `civ-date-range-picker`, `civ-segmented-control`) — the legend
 *    IS the question. `(required)` belongs there.
 *  - **Multi-field grouping** (the compounds above) — the legend is
 *    a section heading. `(required)` belongs on the leaf inputs that
 *    receive user input. Pass `showRequired: false` to `renderLegend`
 *    in the compound's `render()` to suppress it.
 *
 * This lint asserts the rule structurally: when each multi-field
 * compound is fixtured with `required` set, no `.civ-required-mark`
 * appears inside any `<legend>`. Indicators inside `<label>` elements
 * on the leaf inputs are expected and not counted.
 *
 * If you add a new multi-field compound, add a fixture below.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/inputs';
import '../address/civ-address.js';
import '../name/civ-name.js';
import '../direct-deposit/civ-direct-deposit.js';
import '../relationship/civ-relationship.js';
import '../partnership-history/civ-partnership-history.js';
import '../service-history/civ-service-history.js';
import '../race-ethnicity/civ-race-ethnicity.js';
import '../signature/civ-signature.js';
import '../income/civ-income.js';

// civ-fieldset lives in @civui/form-patterns (a higher layer in the
// build order). It follows the same rule — `showRequired: false` is
// passed in its render() — but isn't fixtured here because compound
// can't depend on form-patterns. If the rule grows, lift this lint
// to a tools/ test that imports from both packages.

afterEach(cleanupFixtures);

interface Fixture {
  name: string;
  html: string;
}

const FIXTURES: Fixture[] = [
  { name: 'civ-address', html: '<civ-address legend="Mailing address" required></civ-address>' },
  { name: 'civ-name', html: '<civ-name legend="Full name" required></civ-name>' },
  { name: 'civ-relationship (default)', html: '<civ-relationship legend="About this person" required></civ-relationship>' },
  { name: 'civ-relationship (dependent preset)', html: '<civ-relationship legend="About the dependent" preset="dependent" show-adoption-date required></civ-relationship>' },
  { name: 'civ-direct-deposit', html: '<civ-direct-deposit legend="Direct deposit" required></civ-direct-deposit>' },
  { name: 'civ-partnership-history', html: '<civ-partnership-history legend="Partnership history" required></civ-partnership-history>' },
  { name: 'civ-service-history', html: '<civ-service-history legend="Service history" required></civ-service-history>' },
  { name: 'civ-race-ethnicity', html: '<civ-race-ethnicity legend="Race and ethnicity" required></civ-race-ethnicity>' },
  { name: 'civ-signature', html: '<civ-signature legend="Certification and signature" required></civ-signature>' },
  { name: 'civ-income', html: '<civ-income legend="Monthly income" required></civ-income>' },
];

interface Violation {
  fixture: string;
  legendText: string;
  owner: string;
}

/**
 * Tags whose legends are section headings (NOT user-facing questions).
 * Only these are checked — nested self-contained group components like
 * `civ-radio-group` legitimately render `(required)` on their legend
 * because the legend IS the question they're asking.
 */
const MULTI_FIELD_COMPOUNDS = new Set([
  'civ-fieldset',
  'civ-address',
  'civ-name',
  'civ-relationship',
  'civ-direct-deposit',
  'civ-partnership-history',
  'civ-service-history',
  'civ-race-ethnicity',
  'civ-signature',
  'civ-income',
]);

function legendOwner(legend: Element): string | null {
  let el: Element | null = legend.parentElement;
  while (el) {
    const tag = el.tagName.toLowerCase();
    if (tag.includes('-')) return tag;
    el = el.parentElement;
  }
  return null;
}

function legendsWithRequiredMark(host: HTMLElement, fixtureName: string): Violation[] {
  const out: Violation[] = [];
  host.querySelectorAll('legend').forEach((legend) => {
    if (!legend.querySelector('.civ-required-mark')) return;
    const owner = legendOwner(legend);
    if (!owner || !MULTI_FIELD_COMPOUNDS.has(owner)) return;
    const clone = legend.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.civ-required-mark').forEach((n) => n.remove());
    const text = (clone.textContent || '').trim().replace(/\s+/g, ' ');
    out.push({ fixture: fixtureName, legendText: text, owner });
  });
  return out;
}

describe('no-required-mark-on-multi-field-legend lint', () => {
  for (const f of FIXTURES) {
    it(`${f.name} renders no (required) inside any <legend>`, async () => {
      const el = await fixture<HTMLElement>(f.html);
      await elementUpdated(el);

      const violations = legendsWithRequiredMark(el, f.name);
      if (violations.length > 0) {
        const report = violations.map((v) => `  <${v.owner}> <legend>"${v.legendText}"</legend> contains .civ-required-mark`).join('\n');
        throw new Error(`${f.name}: ${violations.length} legend(s) with (required) mark. Multi-field compound legends are section headings, not questions — pass \`showRequired: false\` to renderLegend.\n${report}`);
      }
      expect(violations).toEqual([]);
    });
  }
});
