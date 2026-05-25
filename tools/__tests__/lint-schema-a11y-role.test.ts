/**
 * Tests for tools/lint-schema-a11y-role.ts.
 *
 * Two kinds of coverage:
 *
 * 1. `extractJsRoleSets` unit tests — verify the parser correctly
 *    identifies `this.setAttribute('role', '...')` calls and ignores
 *    role attributes on non-host receivers / template strings.
 * 2. `runLint` regression test against the real repo — every covered
 *    component must currently match its schema. The lint is wired
 *    into `validate:lints` so a regression flips CI red.
 */

import { describe, it, expect } from 'vitest';
import { extractJsRoleSets, extractTemplateHostRole, runLint } from '../lint-schema-a11y-role.js';

describe('extractJsRoleSets', () => {
  it('finds a single role set via this.setAttribute', () => {
    const src = `
      connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'listitem');
      }
    `;
    expect([...extractJsRoleSets(src)]).toEqual(['listitem']);
  });

  it('finds multiple distinct roles set in different lifecycle phases', () => {
    // A real-world variant: a component that conditionally swaps its
    // role based on a prop. The lint surfaces this as a "multiple
    // roles" diagnostic so a human can resolve.
    const src = `
      connectedCallback() {
        if (this.standalone) {
          this.setAttribute('role', 'group');
        } else {
          this.setAttribute('role', 'listitem');
        }
      }
    `;
    expect([...extractJsRoleSets(src)].sort()).toEqual(['group', 'listitem']);
  });

  it('ignores role attributes on non-host receivers', () => {
    // A common pattern: the host stays roleless and the rendered
    // child gets the role. The lint must NOT pick this up as a
    // host-level role.
    const src = `
      const panel = document.createElement('div');
      panel.setAttribute('role', 'dialog');
      this.appendChild(panel);
    `;
    expect([...extractJsRoleSets(src)]).toEqual([]);
  });

  it('ignores role= in html`` template literals', () => {
    // Light-DOM Lit components render their template as CHILDREN of
    // the host — `role` here is on the child, not on `this`.
    const src = `
      render() {
        return html\`<div role="region">...</div>\`;
      }
    `;
    expect([...extractJsRoleSets(src)]).toEqual([]);
  });

  it('deduplicates when the same role is set in multiple places', () => {
    const src = `
      connectedCallback() {
        this.setAttribute('role', 'listitem');
      }
      _onSomething() {
        this.setAttribute('role', 'listitem');
      }
    `;
    expect([...extractJsRoleSets(src)]).toEqual(['listitem']);
  });

  it('handles double-quoted role names', () => {
    const src = `this.setAttribute("role", "alert");`;
    expect([...extractJsRoleSets(src)]).toEqual(['alert']);
  });

  it('returns empty when no setAttribute role call exists', () => {
    const src = `connectedCallback() { super.connectedCallback(); }`;
    expect([...extractJsRoleSets(src)]).toEqual([]);
  });
});

describe('extractTemplateHostRole', () => {
  it('returns null even when a template contains role= — light-DOM children are not host', () => {
    // Documented behavior: light-DOM components render children, not
    // host. The function exists for clarity but always returns null.
    const src = `render() { return html\`<div role="region"></div>\`; }`;
    expect(extractTemplateHostRole(src)).toBeNull();
  });
});

describe('runLint (regression)', () => {
  it('every covered component matches its schema today', async () => {
    const findings = await runLint();
    if (findings.length > 0) {
      // Surface what's broken so the failure tells you which
      // component drifted, not just "lint failed".
      const lines = findings.map(
        (f) => `  ${f.component}: ${f.kind} (schema=${f.schemaRole ?? '<unset>'}, source=${f.sourceRoles.join(',') || '<none>'})`,
      );
      throw new Error(`schema a11y.role drift in ${findings.length} component(s):\n${lines.join('\n')}`);
    }
    expect(findings).toEqual([]);
  });
});
