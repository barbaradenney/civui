#!/usr/bin/env tsx
/**
 * lint-schema-a11y-role — fail when a schema's `a11y.role` field
 * disagrees with what the component's Lit source sets via
 * `this.setAttribute('role', '...')`.
 *
 * Scope is deliberately narrow. The lint focuses on the two
 * highest-signal drift cases the 2026-05-25 audit surfaced:
 *
 *   1. **Mismatch** — schema says role=X, source says role=Y.
 *      Example: civ-spinner had `role: 'status'` in schema but
 *      `this.setAttribute('role', 'img')` in source.
 *
 *   2. **Source without schema** — source sets a host role via
 *      setAttribute but the schema omits `a11y.role` entirely.
 *      Native implementers reading the schema as a contract
 *      wouldn't know to mirror the role.
 *      Example: civ-tab-nav-item set `role="listitem"` in
 *      connectedCallback but the schema's a11y block was silent.
 *
 * What the lint deliberately does NOT check:
 *
 *   - Roles applied in the rendered template (`<div role="region">...`)
 *     because in a light-DOM Lit component the template renders as
 *     CHILDREN of the host, not the host itself. The visible role
 *     is on the child div; the host is roleless. The audit found
 *     no real drift in these cases — they all matched what the
 *     schema declared, just on the rendered child rather than the
 *     host element.
 *
 *   - Roles inherent to native elements (an `<input>` rendered by
 *     a preset wrapper). The schema describing `role: 'textbox'`
 *     reflects the rendered native element's implicit role.
 *
 *   - Schema-claims-no-source mismatches. Too noisy in a light-DOM
 *     world where most roles live on the rendered child. The
 *     specific civ-popover case (schema claimed `'group'` but the
 *     rendered host had no role and the inner panel carried the
 *     real role) was fixed by removing the schema field — review
 *     catches future instances of this pattern.
 *
 *   - Multiple distinct roles set in source. The lint reports the
 *     full list so a human can resolve, but doesn't try to pick
 *     a "dominant" role automatically.
 *
 * Usage: pnpm lint:schema-a11y-role
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { COVERED_COMPONENTS } from './schema-parity.js';

const ROOT = join(import.meta.dirname, '..');

/**
 * Extract roles set by JS calls in the Lit source.
 *
 * Patterns:
 *   - `this.setAttribute('role', 'foo')`
 *   - `el.setAttribute('role', 'foo')` (any receiver other than `this` is ignored — that's not the host)
 *
 * Returns the set of distinct role string-literal values found set
 * on `this` (the host).
 */
export function extractJsRoleSets(source: string): Set<string> {
  const roles = new Set<string>();
  const re = /\bthis\.setAttribute\(\s*['"]role['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    roles.add(m[1]);
  }
  return roles;
}

/**
 * Extract a role set on the outermost rendered element via inline
 * `role="..."`.
 *
 * Limited to the FIRST `role="..."` occurrence inside an `html` or
 * `staticHtml` template literal. This is intentionally narrow —
 * deeper element role attributes are children, not host.
 *
 * NOTE: light-DOM Lit components don't render a wrapper of their own
 * (the host IS the rendered root), so a `role` attribute inside the
 * template is on a CHILD, not the host. We deliberately return
 * nothing for the template case — host-level roles must be set via
 * `this.setAttribute` so they survive Lit re-renders cleanly. The
 * code path is left here for clarity (and to document the choice).
 */
export function extractTemplateHostRole(_source: string): string | null {
  // Light-DOM Lit components: the rendered template IS the host's
  // children. `role` attributes inside `html\`...\`` are on child
  // elements, NOT the host. The host role must be set with
  // setAttribute (see extractJsRoleSets).
  return null;
}

interface Finding {
  component: string;
  schemaRole: string | undefined;
  sourceRoles: string[];
  kind: 'source-no-schema' | 'mismatch' | 'multiple-source-roles';
}

async function loadSchemaRole(name: string): Promise<string | undefined> {
  const path = join(ROOT, 'packages/schema/src/components', `${name}.schema.ts`);
  if (!existsSync(path)) return undefined;
  const mod = await import(pathToFileURL(path).href);
  const schema = mod.default ?? mod;
  return schema?.a11y?.role;
}

export async function runLint(): Promise<Finding[]> {
  const findings: Finding[] = [];

  for (const spec of COVERED_COMPONENTS) {
    const sourcePath = join(ROOT, spec.source);
    if (!existsSync(sourcePath)) continue;
    const source = readFileSync(sourcePath, 'utf-8');
    const sourceRoles = extractJsRoleSets(source);
    const schemaRole = await loadSchemaRole(spec.name);

    // Multiple distinct roles set in source — schema can declare only
    // one, so this needs human attention regardless.
    if (sourceRoles.size > 1) {
      findings.push({
        component: spec.name,
        schemaRole,
        sourceRoles: [...sourceRoles].sort(),
        kind: 'multiple-source-roles',
      });
      continue;
    }

    const sourceRole = sourceRoles.size === 1 ? [...sourceRoles][0] : undefined;

    // Mismatch: schema says X, source's setAttribute says Y.
    if (schemaRole && sourceRole && schemaRole !== sourceRole) {
      findings.push({
        component: spec.name,
        schemaRole,
        sourceRoles: [sourceRole],
        kind: 'mismatch',
      });
      continue;
    }

    // Source sets a host role via setAttribute but schema omits it.
    // The setAttribute call is the strongest possible signal that
    // the role is intentional and host-level; native implementers
    // need to know about it.
    if (sourceRole && !schemaRole) {
      findings.push({
        component: spec.name,
        schemaRole: undefined,
        sourceRoles: [sourceRole],
        kind: 'source-no-schema',
      });
      continue;
    }
  }

  return findings;
}

function describe(f: Finding): string {
  switch (f.kind) {
    case 'mismatch':
      return `${f.component}: schema declares a11y.role='${f.schemaRole}' but source sets role='${f.sourceRoles[0]}'.`;
    case 'source-no-schema':
      return `${f.component}: source sets role='${f.sourceRoles[0]}' on the host but the schema's a11y block omits 'role'. Add 'role: \\'${f.sourceRoles[0]}\\'' to the schema so native implementers know to mirror it.`;
    case 'multiple-source-roles':
      return `${f.component}: source sets multiple distinct host roles (${f.sourceRoles.join(', ')}). Schema can declare only one — pick the dominant role.`;
  }
}

async function main(): Promise<number> {
  const findings = await runLint();
  if (findings.length === 0) {
    console.log('✓ schema a11y.role fields match the Lit host role on every covered component.');
    return 0;
  }
  console.log(`✗ ${findings.length} component(s) with schema ↔ source role drift:\n`);
  for (const f of findings) {
    console.log(`  ${describe(f)}`);
  }
  console.log('\nThe a11y.role field is the contract documented to other-platform');
  console.log('implementers. Drift here means iOS / Android / Drupal teams will');
  console.log('apply the wrong role. See .claude/rules/audit-debt.md "Schema');
  console.log('a11y.role drift" theme for the rationale.');
  return 1;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try { return import.meta.url === pathToFileURL(argv).href; }
  catch { return false; }
}

if (isCliInvocation()) {
  main().then((code) => process.exit(code));
}
