/**
 * Double-label lint
 *
 * Renders a curated set of components into jsdom and asserts that no
 * native form control (`input` / `select` / `textarea`) ends up with
 * more than one visible labelling element directly associated with it.
 *
 * Two failure shapes this catches:
 *
 *  1. Wrapping `<label>` + child component that also renders its own
 *     `<label for>`. The user sees two stacked labels above one
 *     control. Memorable-date's sub-fields show this today: each
 *     sub-field is wrapped in a `<label>` that contains a visible
 *     `<span>Month</span>` AND a `<civ-select label="Month">` that
 *     renders its own `<label for>` underneath.
 *
 *  2. A `<fieldset>` whose only labelled inner control has its own
 *     `<label for>`. Visually the user sees a fieldset legend AND a
 *     control label both above a single control. Relationship shows
 *     this when no extra sub-controls have appeared yet — the outer
 *     "Relationship details" legend sits above the inner select's
 *     "Relationship to you" label with nothing else inside.
 *
 * The lint is intentionally narrow: it only flags single-control
 * fieldsets. A multi-control fieldset like address (street + city +
 * state inside one "Mailing address" legend) is correct grouping and
 * is left alone.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/inputs';
import '../address/civ-address.js';
import '../name/civ-name.js';
import '../direct-deposit/civ-direct-deposit.js';
import '../relationship/civ-relationship.js';
import '../race-ethnicity/civ-race-ethnicity.js';
import '../income/civ-income.js';

afterEach(cleanupFixtures);

interface Fixture {
  name: string;
  html: string;
}

/**
 * Representative fixtures — one default-state render per component
 * that wraps or composes inner form controls. Single-input components
 * (text-input, select, etc.) render exactly one label by construction
 * and don't need a fixture here.
 */
const FIXTURES: Fixture[] = [
  { name: 'civ-memorable-date', html: '<civ-memorable-date legend="Service start date"></civ-memorable-date>' },
  { name: 'civ-date-range-picker', html: '<civ-date-range-picker legend="Date range"></civ-date-range-picker>' },
  { name: 'civ-relationship', html: '<civ-relationship legend="Relationship details"></civ-relationship>' },
  { name: 'civ-address', html: '<civ-address legend="Mailing address"></civ-address>' },
  { name: 'civ-name', html: '<civ-name legend="Full name"></civ-name>' },
  { name: 'civ-direct-deposit', html: '<civ-direct-deposit legend="Direct deposit"></civ-direct-deposit>' },
  { name: 'civ-income', html: '<civ-income legend="Wages"></civ-income>' },
  { name: 'civ-time-picker', html: '<civ-time-picker legend="Appointment time"></civ-time-picker>' },
];

interface Violation {
  fixture: string;
  rule: 'wrapping-label-plus-child-label' | 'single-control-fieldset-plus-child-label';
  controlTag: string;
  labels: string[];
}

function visibleText(el: Element | null): string {
  if (!el) return '';
  return (el.textContent || '').trim().replace(/\s+/g, ' ');
}

/**
 * Find labelling DOM elements directly associated with `control`:
 *  - the closest ancestor `<label>` element (wrapping label)
 *  - any `<label for="${control.id}">` in the document
 *  - elements referenced by aria-labelledby
 *
 * Returns the distinct element nodes. We don't include ancestor
 * `<legend>`s here — grouping legends are handled by the
 * single-control-fieldset rule below. Two labels with the same text
 * are still two visible labels to the user, so we dedupe by element
 * identity, not by text.
 */
function directLabellers(control: HTMLElement): Element[] {
  const out = new Set<Element>();

  const wrapping = control.closest('label');
  if (wrapping) {
    // Only count the wrapping label when it has visible text of its
    // own — strip any nested form controls + nested labels (those are
    // separate labellers, counted independently) before checking.
    const clone = wrapping.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('label, input, select, textarea, civ-text-input, civ-select, civ-textarea').forEach((n) => n.remove());
    if (visibleText(clone)) out.add(wrapping);
  }

  if (control.id) {
    const forLabels = control.ownerDocument.querySelectorAll(`label[for="${control.id}"]`);
    forLabels.forEach((l) => {
      if (visibleText(l as HTMLElement)) out.add(l);
    });
  }

  const labelledBy = control.getAttribute('aria-labelledby');
  if (labelledBy) {
    for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
      const ref = control.ownerDocument.getElementById(id);
      if (ref && visibleText(ref)) out.add(ref);
    }
  }

  return Array.from(out);
}

function labellerTexts(labellers: Element[]): string[] {
  return labellers.map((l) => {
    // Strip nested labels + controls so each labeller reports just
    // its own text, not its descendants' text.
    const clone = l.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('label, input, select, textarea, civ-text-input, civ-select, civ-textarea').forEach((n) => n.remove());
    return visibleText(clone) || visibleText(l);
  });
}

function ruleWrappingPlusChild(host: HTMLElement, fixtureName: string): Violation[] {
  const out: Violation[] = [];
  const controls = host.querySelectorAll<HTMLElement>('input, select, textarea');
  controls.forEach((c) => {
    const labellers = directLabellers(c);
    if (labellers.length > 1) {
      out.push({
        fixture: fixtureName,
        rule: 'wrapping-label-plus-child-label',
        controlTag: c.tagName.toLowerCase(),
        labels: labellerTexts(labellers),
      });
    }
  });
  return out;
}

function ruleSingleControlFieldset(host: HTMLElement, fixtureName: string): Violation[] {
  const out: Violation[] = [];
  const fieldsets = host.querySelectorAll<HTMLFieldSetElement>('fieldset');
  fieldsets.forEach((fs) => {
    const legend = fs.querySelector(':scope > legend');
    if (!legend) return;
    const legendText = visibleText(legend);
    if (!legendText) return;

    // If the fieldset already contains a nested fieldset with its own
    // legend, the outer legend is functioning as a section heading over
    // multiple labelled sub-sections — not as the lone label for a
    // single inner control. Skip the single-control check in that case.
    // (Relationship's outer "About the dependent" legend sits above
    // <civ-name> + the relationship select; the name fieldset counts as
    // visible content, so the select still needs its own label.)
    const nestedFieldsets = Array.from(fs.querySelectorAll<HTMLFieldSetElement>('fieldset'))
      .filter((nested) => nested !== fs && nested.parentElement?.closest('fieldset') === fs)
      .filter((nested) => visibleText(nested.querySelector(':scope > legend')));
    if (nestedFieldsets.length > 0) return;

    // Count native form controls inside this fieldset that have their
    // own direct label. Don't recurse into nested fieldsets — those
    // are their own scope.
    const allControls = Array.from(fs.querySelectorAll<HTMLElement>('input, select, textarea'));
    const ownControls = allControls.filter((c) => c.closest('fieldset') === fs);
    const labelledOwnControls = ownControls.filter((c) => directLabellers(c).length > 0);

    if (labelledOwnControls.length === 1) {
      const childLabel = labellerTexts(directLabellers(labelledOwnControls[0]))[0];
      if (childLabel && childLabel !== legendText) {
        out.push({
          fixture: fixtureName,
          rule: 'single-control-fieldset-plus-child-label',
          controlTag: labelledOwnControls[0].tagName.toLowerCase(),
          labels: [legendText, childLabel],
        });
      }
    }
  });
  return out;
}

describe('double-label lint', () => {
  for (const f of FIXTURES) {
    it(`${f.name} renders no double labels`, async () => {
      const el = await fixture<HTMLElement>(f.html);
      const violations = [
        ...ruleWrappingPlusChild(el, f.name),
        ...ruleSingleControlFieldset(el, f.name),
      ];

      if (violations.length > 0) {
        const report = violations
          .map((v) => `  [${v.rule}] <${v.controlTag}> labelled by: ${v.labels.map((l) => `"${l}"`).join(' + ')}`)
          .join('\n');
        throw new Error(`${f.name}: ${violations.length} double-label violation(s):\n${report}`);
      }

      expect(violations).toEqual([]);
    });
  }
});
