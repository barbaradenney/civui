/**
 * Missing-label lint
 *
 * Inverse of `double-labels.test.ts`. Renders a curated set of
 * components into jsdom and asserts that every native form control
 * (`input` / `select` / `textarea`) has at least one labelling element
 * directly associated with it — a wrapping `<label>`, a `<label for>`,
 * an `aria-labelledby` reference, or an `aria-label` attribute.
 *
 * The failure this catches: a compound component renders an inner
 * native control without setting `label=` on its CivUI wrapper. Past
 * example — civ-relationship's inner relationship-type `<civ-select>`
 * shipped for months with no `label` attribute. The default story
 * rendered "About the dependent" + civ-name + an unlabeled select at
 * the bottom (image #8 in the audit thread). The original removal was
 * to dodge a single-control-fieldset double-label warning, but the
 * compound has multiple controls when name fields are shown — so the
 * inner select needed its own label.
 *
 * Hidden inputs and inputs with type="hidden" are skipped — they're
 * not user-facing controls.
 *
 * If you add a compound that renders inner controls and want to lock
 * in that every one gets a label, add a fixture below.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/controls';
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
 * Representative fixtures. Each one is a "this is how the component
 * renders by default in a story" snapshot — if any of these produces
 * an unlabeled native control, a real user would see an unlabeled
 * field in production.
 *
 * `civ-relationship` is fixtured twice: once with default options
 * (general preset, name + select), and once with `preset="dependent"`
 * + `show-adoption-date` to cover the path that ships in the
 * Dependent story.
 */
const FIXTURES: Fixture[] = [
  { name: 'civ-memorable-date', html: '<civ-memorable-date legend="Service start date"></civ-memorable-date>' },
  { name: 'civ-date-range-picker', html: '<civ-date-range-picker legend="Date range"></civ-date-range-picker>' },
  { name: 'civ-relationship (default)', html: '<civ-relationship legend="About this person"></civ-relationship>' },
  { name: 'civ-relationship (dependent preset)', html: '<civ-relationship legend="About the dependent" preset="dependent" show-adoption-date></civ-relationship>' },
  { name: 'civ-address', html: '<civ-address legend="Mailing address"></civ-address>' },
  { name: 'civ-name', html: '<civ-name legend="Full name"></civ-name>' },
  { name: 'civ-direct-deposit', html: '<civ-direct-deposit legend="Direct deposit"></civ-direct-deposit>' },
  { name: 'civ-income', html: '<civ-income legend="Wages"></civ-income>' },
  { name: 'civ-time-picker (with legend)', html: '<civ-time-picker legend="Appointment time"></civ-time-picker>' },
  { name: 'civ-time-picker (no legend)', html: '<civ-time-picker></civ-time-picker>' },
];

interface Violation {
  fixture: string;
  controlTag: string;
  controlType: string;
  controlName: string;
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
 * Conservatively does NOT count enclosing `<fieldset><legend>`. A
 * legend names the *group*, not each individual control; relying on
 * it as the sole label means the user sees only "(group name)" with
 * no per-field label and can't tell what to enter where. The
 * double-labels lint already permits the single-control-fieldset
 * case (one inner control inheriting the legend); this lint stays
 * silent there because the inner control still has a real `<label>`
 * by construction.
 */
function directLabellers(control: HTMLElement): Element[] {
  const out = new Set<Element>();

  const wrapping = control.closest('label');
  if (wrapping) {
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

function hasLabel(control: HTMLElement): boolean {
  if (directLabellers(control).length > 0) return true;
  // aria-label is also a valid labeller (no visible text, but it
  // names the control for assistive tech). Rare in this codebase —
  // CLAUDE.md discourages putting aria-label on hosts — but legal
  // in jsdom and shouldn't be flagged.
  const ariaLabel = (control.getAttribute('aria-label') || '').trim();
  return ariaLabel.length > 0;
}

function isUserFacing(control: HTMLElement): boolean {
  if (control instanceof HTMLInputElement && control.type === 'hidden') return false;
  // Skip controls whose own type is invisible / non-interactive. We
  // don't check computed style — jsdom doesn't compute it — but we do
  // skip the obvious cases.
  if (control.hasAttribute('hidden')) return false;
  return true;
}

function findMissingLabels(host: HTMLElement, fixtureName: string): Violation[] {
  const out: Violation[] = [];
  const controls = host.querySelectorAll<HTMLElement>('input, select, textarea');
  controls.forEach((c) => {
    if (!isUserFacing(c)) return;
    if (hasLabel(c)) return;
    out.push({
      fixture: fixtureName,
      controlTag: c.tagName.toLowerCase(),
      controlType: (c instanceof HTMLInputElement ? c.type : '') || '',
      controlName: c.getAttribute('name') || '',
    });
  });
  return out;
}

describe('missing-label lint', () => {
  for (const f of FIXTURES) {
    it(`${f.name} labels every native control`, async () => {
      const el = await fixture<HTMLElement>(f.html);
      // Some compounds (civ-relationship, civ-race-ethnicity) populate
      // their inner select asynchronously after the first render —
      // wait one frame so option-sync has run.
      await elementUpdated(el);
      const violations = findMissingLabels(el, f.name);

      if (violations.length > 0) {
        const report = violations
          .map((v) => `  <${v.controlTag}${v.controlType ? ` type="${v.controlType}"` : ''}${v.controlName ? ` name="${v.controlName}"` : ''}> has no <label>, aria-label, or aria-labelledby`)
          .join('\n');
        throw new Error(`${f.name}: ${violations.length} missing-label violation(s):\n${report}`);
      }

      expect(violations).toEqual([]);
    });
  }
});
