#!/usr/bin/env npx tsx
/**
 * Generate a `@civui/schema` skeleton from an existing Lit component
 * source file.
 *
 * The component scaffolder (`pnpm scaffold:component`, `civ generate
 * component`) already creates a schema for NEW components. This tool
 * handles the other case: you have an existing component without a
 * schema, and you want to bootstrap one without writing it by hand.
 *
 * Usage:
 *   pnpm generate:schema civ-<name>
 *   pnpm generate:schema civ-modal
 *
 * The generated schema:
 *   - extracts `@property` declarations from the Lit source
 *   - maps TypeScript types to schema types (string / number / boolean / enum)
 *   - preserves `attribute:` overrides from the Lit decorator
 *   - extracts JSDoc descriptions when present
 *   - filters inherited base-class props (label, value, error, etc.)
 *
 * What it WON'T do:
 *   - guess `webOnly: true` markers — review and add manually
 *   - infer enum values from union types in the prop type (those live
 *     in component code, not the @property decorator) — fill in
 *     `values:` for each enum prop by hand
 *   - declare events — scan for `dispatch(this, '...')` calls and add
 *     them yourself (the lint:jsdoc-events gate will tell you which)
 *   - register the component in `tools/schema-parity.ts`
 *     `COVERED_COMPONENTS` — run `pnpm parity:schema --platforms` to
 *     confirm coverage after manual registration
 *
 * After generation, edit the file to:
 *   1. Fix the `description` to match the component's contract.
 *   2. Fill in enum `values:` arrays.
 *   3. Add event declarations.
 *   4. Mark web-specific props with `webOnly: true`.
 *   5. Run `pnpm validate:schemas` to confirm structural correctness.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const ROOT = join(import.meta.dirname, '..');
const SCHEMA_DIR = join(ROOT, 'packages/schema/src/components');

// Props that EVERY CivBaseElement / CivFormElement carries. Always filtered.
// Kept in sync (by hand) with tools/lib/inherited.ts INHERITED_FORM_PROPS
// — that file is the source of truth for the schema-parity check.
const ALWAYS_INHERITED = new Set([
  'label',
  'name',
  'value',
  'hint',
  'error',
  'required',
  'disabled',
  'readonly',
  'touched',
  'requiredMessage',
  'disableAnalytics',
  'analyticsId',
  'analyticsCategory',
]);

// Props added by mixin / specialised base class — only filtered when the
// source actually uses that base class. Conditionally applied so a non-
// preset component with its own `placeholder` prop isn't silently dropped.
const CONDITIONAL_INHERITED: Array<{ marker: RegExp; props: string[] }> = [
  // CivBooleanFormElement
  {
    marker: /\bCivBooleanFormElement\b/,
    props: ['checked', 'description', 'extraDescribedby'],
  },
  // LegendHeadingMixin
  {
    marker: /\bLegendHeadingMixin\b/,
    props: ['headingLevel', 'size'],
  },
  // PresetInputWrapper — forwards text-input props to its inner child.
  {
    marker: /\bPresetInputWrapper\b/,
    props: [
      'type',
      'placeholder',
      'pattern',
      'maxlength',
      'minlength',
      'autocomplete',
      'inputmode',
      'mask',
      'maskPattern',
      'maskMode',
      'validate',
      'prefix',
      'suffix',
      'clearable',
      'leadingIcon',
      'trailingIcon',
      'leadingIconLabel',
      'trailingIconLabel',
      'hideCharCount',
      'width',
      'autofocus',
    ],
  },
];

function inheritedPropsFor(source: string): Set<string> {
  const set = new Set(ALWAYS_INHERITED);
  for (const { marker, props } of CONDITIONAL_INHERITED) {
    if (marker.test(source)) {
      for (const p of props) set.add(p);
    }
  }
  return set;
}

interface PropInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object';
  attribute?: string;
  default?: string | number | boolean;
  description?: string;
}

/** Custom events dispatched by a component — name only. Detail shapes need human review. */
export function parseDispatchedEvents(source: string): string[] {
  const events = new Set<string>();
  // `dispatch(this, 'civ-foo', ...)` from @civui/core
  for (const m of source.matchAll(/dispatch\s*\(\s*this\s*,\s*['"]([a-z-]+)['"]/g)) {
    events.add(m[1]);
  }
  // `new CustomEvent('civ-foo', ...)`
  for (const m of source.matchAll(/new\s+CustomEvent\s*\(\s*['"]([a-z-]+)['"]/g)) {
    events.add(m[1]);
  }
  // Filter base-class dispatches that the schema doesn't need to declare.
  const baseEvents = new Set(['civ-input', 'civ-change', 'civ-analytics', 'civ-reset']);
  return [...events].filter((e) => !baseEvents.has(e)).sort();
}

/**
 * Parses @property decorators from a Lit source string. Returns
 * one PropInfo per declaration, in source order.
 */
export function parseProperties(source: string): PropInfo[] {
  const props: PropInfo[] = [];
  const inherited = inheritedPropsFor(source);

  // Match @property({ ... }) decorators followed by the property name
  // and an optional type annotation + default.
  //
  // Capture groups:
  //   1: decorator option block (the { ... } inside the parens) — may
  //      be empty if `@property()` was called with no args
  //   2: property name
  //   3: optional type annotation (after `:` before `=` or `;`)
  //   4: optional default initializer (after `=`)
  const propertyRegex =
    /@property\s*\(\s*(?:\{([^}]*)\})?\s*\)\s*(?:override\s+|declare\s+)?(?:public\s+|protected\s+|private\s+)?(\w+)(?:\s*:\s*([^=;]+))?(?:\s*=\s*([^;\n]+))?[;\n]/g;

  let m: RegExpExecArray | null;
  while ((m = propertyRegex.exec(source)) !== null) {
    const [, options, propName, typeAnn, defaultExpr] = m;
    if (inherited.has(propName)) continue;

    const optionsStr = options || '';
    let typeFromDecorator: string | undefined;
    let attribute: string | undefined;

    // Extract `type: ...` from the options block.
    const typeMatch = optionsStr.match(/type\s*:\s*(\w+)/);
    if (typeMatch) typeFromDecorator = typeMatch[1].toLowerCase();

    // Extract `attribute: '...'` (string literal or `false`).
    const attrMatch = optionsStr.match(/attribute\s*:\s*(?:'([^']+)'|"([^"]+)"|false)/);
    if (attrMatch) {
      if (attrMatch[1] !== undefined) attribute = attrMatch[1];
      else if (attrMatch[2] !== undefined) attribute = attrMatch[2];
    }

    const schemaType = inferSchemaType(typeFromDecorator, typeAnn?.trim(), defaultExpr?.trim());
    const info: PropInfo = { name: propName, type: schemaType };
    if (attribute !== undefined && attribute !== defaultAttribute(propName)) {
      info.attribute = attribute;
    }
    const def = parseDefault(defaultExpr?.trim(), schemaType);
    if (def !== undefined) info.default = def;

    // Try to find a `/** ... */` JSDoc immediately above this decorator.
    const upToHere = source.slice(0, m.index);
    const jsdocMatch = upToHere.match(/\/\*\*\s*([^*]+?)\s*\*\/\s*(?:@\w+\s*\([^)]*\)\s*)*$/);
    if (jsdocMatch) {
      const lines = jsdocMatch[1]
        .split('\n')
        .map((l) => l.replace(/^\s*\*\s?/, '').trim())
        .filter((l) => !l.startsWith('@'));
      const desc = lines.join(' ').trim();
      if (desc) info.description = desc;
    }

    props.push(info);
  }

  return props;
}

function inferSchemaType(
  decoratorType: string | undefined,
  typeAnnotation: string | undefined,
  defaultExpr: string | undefined,
): PropInfo['type'] {
  if (decoratorType === 'boolean') return 'boolean';
  if (decoratorType === 'number') return 'number';
  if (decoratorType === 'array') return 'array';
  if (decoratorType === 'object') return 'object';

  if (typeAnnotation) {
    if (typeAnnotation.includes('boolean')) return 'boolean';
    if (typeAnnotation.includes('number')) return 'number';
    if (typeAnnotation.includes('|')) {
      // Likely a union of string literals → enum.
      const hasStringLits = /['"][^'"]*['"]/.test(typeAnnotation);
      if (hasStringLits) return 'enum';
    }
    if (typeAnnotation.includes('[]') || typeAnnotation.startsWith('Array<')) return 'array';
  }

  if (defaultExpr) {
    if (defaultExpr === 'true' || defaultExpr === 'false') return 'boolean';
    if (/^-?\d+(\.\d+)?$/.test(defaultExpr)) return 'number';
    if (defaultExpr.startsWith('[')) return 'array';
    if (defaultExpr.startsWith('{')) return 'object';
  }

  return 'string';
}

function parseDefault(
  defaultExpr: string | undefined,
  type: PropInfo['type'],
): PropInfo['default'] | undefined {
  if (defaultExpr === undefined) return undefined;
  if (type === 'boolean') {
    if (defaultExpr === 'true') return true;
    if (defaultExpr === 'false') return false;
  }
  if (type === 'number') {
    const n = Number(defaultExpr);
    if (!Number.isNaN(n)) return n;
  }
  if (type === 'string' || type === 'enum') {
    const m = defaultExpr.match(/^['"]([^'"]*)['"]$/);
    if (m) return m[1];
  }
  return undefined;
}

function defaultAttribute(propName: string): string {
  // Lit's default: camelCase → kebab-case.
  return propName.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export interface RenderOptions {
  category?: string;
  extends?: string;
  events?: string[];
}

export function renderSchema(
  componentName: string,
  props: PropInfo[],
  options: RenderOptions = {},
): string {
  const category = options.category ?? 'form-control';
  const extendsBase = options.extends ?? 'CivFormElement';
  const events = options.events ?? [];
  const isFormControl = extendsBase === 'CivFormElement';

  const lines: string[] = [];
  lines.push(`import type { ComponentSchema } from '../schema.types.js';`);
  lines.push('');
  lines.push(`const schema: ComponentSchema = {`);
  lines.push(`  $schema: '1.0',`);
  lines.push(`  name: '${componentName}',`);
  lines.push(
    `  description: 'TODO: one-paragraph contract — match the description in the Lit source.',`,
  );
  lines.push(`  category: '${category}',`);
  lines.push(`  extends: '${extendsBase}',`);
  lines.push(`  isGroup: false,`);
  lines.push('');
  lines.push(`  props: {`);

  for (const p of props) {
    lines.push(`    ${p.name}: {`);
    lines.push(`      type: '${p.type}',`);
    lines.push(
      `      description: ${JSON.stringify(p.description ?? `TODO: describe ${p.name}.`)},`,
    );
    if (p.default !== undefined) {
      lines.push(`      default: ${JSON.stringify(p.default)},`);
    }
    if (p.attribute !== undefined) {
      lines.push(`      attribute: '${p.attribute}',`);
    }
    if (p.type === 'enum') {
      lines.push(`      values: [], // TODO: fill in enum values from the component source`);
    }
    lines.push(`    },`);
  }

  lines.push(`  },`);
  lines.push('');
  lines.push(`  events: {`);
  if (events.length > 0) {
    for (const evt of events) {
      lines.push(`    '${evt}': {`);
      lines.push(`      description: ${JSON.stringify(`TODO: describe ${evt}.`)},`);
      lines.push(`      detail: {`);
      lines.push(`        // TODO: fill in event detail keys from the dispatch call.`);
      lines.push(`      },`);
      lines.push(`    },`);
    }
  } else {
    lines.push(
      `    // TODO: declare custom events. \`civ-input\` / \`civ-change\` come from the base class.`,
    );
  }
  lines.push(`  },`);
  lines.push('');
  lines.push(`  a11y: {`);
  lines.push(`    role: '${isFormControl ? 'textbox' : 'group'}', // TODO: confirm the ARIA role`);
  lines.push(`    requiredIndicator: '${isFormControl ? 'asterisk' : 'none'}',`);
  lines.push(`    errorAnnouncement: 'polite',`);
  lines.push(`  },`);
  lines.push('');
  if (isFormControl) {
    lines.push(`  renderOrder: [`);
    lines.push(`    { type: 'label' },`);
    lines.push(`    { type: 'hint' },`);
    lines.push(`    { type: 'error' },`);
    lines.push(`    { type: 'input' },`);
    lines.push(`  ],`);
  } else {
    lines.push(`  renderOrder: [`);
    lines.push(`    {`);
    lines.push(`      type: 'container',`);
    lines.push(`      children: [{ type: 'slot', bindings: { name: 'default' } }],`);
    lines.push(`    },`);
    lines.push(`  ],`);
  }
  lines.push('');
  lines.push(`  form: {`);
  lines.push(`    valueMode: 'string',`);
  lines.push(`    formAssociated: ${isFormControl},`);
  lines.push(`    resetBehavior: '${isFormControl ? 'restore-default-value' : 'none'}',`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push('');
  lines.push(`export default schema;`);
  lines.push('');
  return lines.join('\n');
}

function findComponentSource(componentName: string): string | null {
  try {
    const result = execSync(
      `find packages -type f -name "${componentName}.ts" -not -path "*/node_modules/*" -not -path "*/dist/*"`,
      { cwd: ROOT, encoding: 'utf-8' },
    ).trim();
    const lines = result.split('\n').filter(Boolean);
    return lines.length > 0 ? join(ROOT, lines[0]) : null;
  } catch {
    return null;
  }
}

function parseFlags(argv: string[]): {
  positional: string[];
  category?: string;
  extendsBase?: string;
} {
  const positional: string[] = [];
  let category: string | undefined;
  let extendsBase: string | undefined;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--category=')) category = arg.slice('--category='.length);
    else if (arg.startsWith('--extends=')) extendsBase = arg.slice('--extends='.length);
    else positional.push(arg);
  }
  return { positional, category, extendsBase };
}

const VALID_CATEGORIES = ['form-control', 'form-group', 'form-container', 'ui', 'feedback', 'navigation', 'overlay'];
const VALID_EXTENDS = ['CivFormElement', 'CivBaseElement'];

function main(): number {
  const { positional, category, extendsBase } = parseFlags(process.argv);
  const arg = positional[0];
  if (!arg) {
    console.error('Usage: pnpm generate:schema civ-<name> [--category=<cat>] [--extends=<base>]');
    console.error(`  --category: one of ${VALID_CATEGORIES.join(', ')} (default: form-control)`);
    console.error(`  --extends:  one of ${VALID_EXTENDS.join(', ')} (default: CivFormElement)`);
    return 1;
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    console.error(`Invalid --category: "${category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
    return 1;
  }
  if (extendsBase && !VALID_EXTENDS.includes(extendsBase)) {
    console.error(`Invalid --extends: "${extendsBase}". Valid: ${VALID_EXTENDS.join(', ')}`);
    return 1;
  }

  const componentName = arg.startsWith('civ-') ? arg : `civ-${arg}`;
  if (!/^civ-[a-z][a-z0-9-]*$/.test(componentName)) {
    console.error(`Invalid component name: ${componentName}`);
    console.error('Must be kebab-case with civ- prefix (e.g. civ-modal).');
    return 1;
  }

  const schemaPath = join(SCHEMA_DIR, `${componentName}.schema.ts`);
  if (existsSync(schemaPath)) {
    console.error(`✗ schema already exists: packages/schema/src/components/${componentName}.schema.ts`);
    console.error('  Delete it first if you want to regenerate from source.');
    return 1;
  }

  const sourcePath = findComponentSource(componentName);
  if (!sourcePath) {
    console.error(`✗ could not find Lit source for ${componentName}.`);
    console.error(`  Looked for: packages/**/${componentName}.ts`);
    return 1;
  }

  const source = readFileSync(sourcePath, 'utf-8');
  const props = parseProperties(source);
  const events = parseDispatchedEvents(source);
  const schema = renderSchema(componentName, props, { category, extends: extendsBase, events });

  writeFileSync(schemaPath, schema);
  console.log(`✓ generated packages/schema/src/components/${componentName}.schema.ts`);
  console.log(`  • ${props.length} props extracted from ${sourcePath.replace(ROOT + '/', '')}`);
  console.log(`  • ${events.length} custom event(s) extracted from dispatch() / new CustomEvent() calls`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit the description and confirm the a11y role.');
  console.log('  2. Fill in enum values for any enum-typed props.');
  console.log('  3. Fill in event detail keys for each extracted event.');
  console.log('  4. Mark web-specific props with `webOnly: true`.');
  console.log('  5. Register in `tools/schema-parity.ts` COVERED_COMPONENTS.');
  console.log('  6. Run `pnpm validate:schemas && pnpm parity:schema --platforms`.');

  return 0;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try {
    return import.meta.url === pathToFileURL(argv).href;
  } catch {
    return false;
  }
}

if (isCliInvocation()) {
  process.exit(main());
}
