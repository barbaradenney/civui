/**
 * Accessibility audit: runs axe-core against rendered CivUI components and
 * surfaces WCAG violations. This is a manual audit tool, not a CI gate —
 * skipped by default; remove the `.skip` to run it.
 *
 * Lives in @civui/compound because it has the broadest dep coverage (core,
 * inputs, controls, overlays). Components from packages this one doesn't
 * declare (actions, layout, navigation, feedback, form-patterns) are
 * intentionally out of scope here.
 */

import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/inputs';
import '@civui/controls';
import '@civui/overlays/modal';
import '../address/civ-address.js';
import '../name/civ-name.js';

describe.skip('a11y audit (axe-core)', () => {
  const fixtures: Array<[string, string]> = [
    ['text input', `<civ-text-input label="Email address" type="email" name="email" hint="Work email" required></civ-text-input>`],
    ['text input with error', `<civ-text-input label="ZIP code" name="zip" error="Enter a valid ZIP code"></civ-text-input>`],
    ['textarea', `<civ-textarea label="Comments" name="comments"></civ-textarea>`],
    ['select', `<civ-select label="State" name="state" required></civ-select>`],
    ['radio group', `
      <civ-radio-group legend="Preferred contact" name="contact">
        <civ-radio value="email" label="Email"></civ-radio>
        <civ-radio value="phone" label="Phone"></civ-radio>
      </civ-radio-group>`],
    ['checkbox group', `
      <civ-checkbox-group legend="Languages" name="langs">
        <civ-checkbox value="en" label="English"></civ-checkbox>
        <civ-checkbox value="es" label="Spanish"></civ-checkbox>
      </civ-checkbox-group>`],
    ['toggle', `<civ-toggle label="Email me updates" name="opt"></civ-toggle>`],
    ['memorable date', `<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>`],
    ['yes-no', `<civ-yes-no legend="Are you a US citizen?" name="cit"></civ-yes-no>`],
    ['address', `<civ-address legend="Mailing address" name="addr" required></civ-address>`],
    ['name compound', `<civ-name legend="Full name" name="full"></civ-name>`],
  ];

  it('runs axe across representative fixtures', async () => {
    // Inject axe into jsdom (axe needs the global window of the run target)
    (globalThis as any).eval(axe.source);

    const results: Array<{ name: string; violations: any[] }> = [];

    for (const [name, html] of fixtures) {
      const el = await fixture(html);
      await elementUpdated(el);
      // Two animation frames so deferred syncSelectOptions etc. settle
      await new Promise(r => setTimeout(r, 30));

      const result = await new Promise<any>((resolve) => {
        (window as any).axe.run(el, { resultTypes: ['violations'] }, (err: any, r: any) => {
          if (err) resolve({ violations: [], error: err.message });
          else resolve(r);
        });
      });

      results.push({ name, violations: result.violations || [] });
      // Clean up between fixtures so residue doesn't leak into the next axe run
      cleanupFixtures();
    }

    // Report
    const lines: string[] = [];
    lines.push(`\n## Accessibility Audit\n`);
    lines.push(`Fixtures: ${fixtures.length}`);
    const total = results.reduce((sum, r) => sum + r.violations.length, 0);
    lines.push(`Total violation rules triggered: ${total}\n`);

    const byRule = new Map<string, { rule: string; impact: string; help: string; fixtures: Set<string> }>();
    for (const r of results) {
      for (const v of r.violations) {
        if (!byRule.has(v.id)) byRule.set(v.id, { rule: v.id, impact: v.impact, help: v.help, fixtures: new Set() });
        byRule.get(v.id)!.fixtures.add(r.name);
      }
    }

    if (byRule.size === 0) {
      lines.push('No violations.');
    } else {
      for (const v of [...byRule.values()].sort((a, b) => b.fixtures.size - a.fixtures.size)) {
        lines.push(`${v.rule} (${v.impact}) — ${v.fixtures.size} fixture(s)`);
        lines.push(`  ${v.help}`);
        lines.push(`  Affected: ${[...v.fixtures].join(', ')}\n`);
      }
    }

    console.log(lines.join('\n'));
    // Don't fail the build on findings — this is a report, not a gate.
    expect(true).toBe(true);
  }, 30_000);
});
