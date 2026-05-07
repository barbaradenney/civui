#!/usr/bin/env npx tsx
/**
 * CivUI component scaffolder.
 *
 * Adding a new cross-platform component touches 9 files. Most of those
 * touches are mechanical glue (schema skeleton, tool registrations,
 * native stubs, Drupal SDC stubs). This tool handles all of that so
 * the human / AI can focus on the meaningful work — the Lit component
 * implementation, the iOS / Android visual logic, the schema fields.
 *
 * Usage:
 *   pnpm scaffold:component <name>
 *
 *     <name>: kebab-case, with or without civ- prefix (e.g. "drawer" or "civ-drawer")
 *
 *   Optional flags:
 *     --package=<pkg>     Lit package owner (defaults to "layout"; choices below)
 *     --category=<cat>    Schema category (defaults to "ui")
 *     --extends=<base>    Base class — CivBaseElement (default) or CivFormElement
 *     --no-native         Skip iOS Swift + Android Kotlin stubs
 *     --no-drupal         Skip Drupal SDC YAML + Twig stubs
 *     --dry-run           Report what would be created, write nothing
 *
 * The Lit component file at the chosen package's src/<name>/civ-<name>.ts
 * is created as a minimal-but-real Lit web component — enough for the
 * parity tool to extract `@property` declarations from. Replace the
 * placeholder render() / props with the real component.
 *
 * After scaffolding:
 *   1. Implement the Lit component (the schema + tool registrations are
 *      already wired).
 *   2. Run `pnpm sync:drupal` to populate the Drupal SDC YAML props from
 *      your schema.
 *   3. Run `pnpm parity:schema --platforms` — the new component will
 *      almost certainly drift on iOS / Android until you fill in the
 *      native parameters; the output tells you which.
 *   4. Commit when all gates pass.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

interface ScaffoldOptions {
  name: string;
  package: string;
  category: string;
  extends: 'CivBaseElement' | 'CivFormElement';
  native: boolean;
  drupal: boolean;
  dryRun: boolean;
}

const VALID_PACKAGES = [
  'actions', 'compound', 'controls', 'core', 'feedback', 'form-patterns',
  'inputs', 'layout', 'navigation', 'overlays',
];

const VALID_CATEGORIES = [
  'form-control', 'form-group', 'form-container', 'ui', 'feedback', 'navigation',
];

function parseArgs(argv: string[]): ScaffoldOptions {
  const args = argv.slice(2);
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) flags[a.slice(2, eq)] = a.slice(eq + 1);
      else flags[a.slice(2)] = true;
    } else positional.push(a);
  }

  if (positional.length === 0) {
    console.error('Usage: pnpm scaffold:component <name> [--package=<pkg>] [--category=<cat>] [--extends=<base>] [--no-native] [--no-drupal] [--dry-run]');
    process.exit(1);
  }

  let name = positional[0];
  if (!name.startsWith('civ-')) name = `civ-${name}`;
  if (!/^civ-[a-z][a-z0-9-]*$/.test(name)) {
    console.error(`Invalid component name "${name}". Use kebab-case starting with civ- (e.g. "civ-drawer").`);
    process.exit(1);
  }

  const pkg = (flags.package as string) || 'layout';
  if (!VALID_PACKAGES.includes(pkg)) {
    console.error(`Invalid --package "${pkg}". Choose one of: ${VALID_PACKAGES.join(', ')}.`);
    process.exit(1);
  }

  const category = (flags.category as string) || 'ui';
  if (!VALID_CATEGORIES.includes(category)) {
    console.error(`Invalid --category "${category}". Choose one of: ${VALID_CATEGORIES.join(', ')}.`);
    process.exit(1);
  }

  const ext = (flags.extends as string) || 'CivBaseElement';
  if (ext !== 'CivBaseElement' && ext !== 'CivFormElement') {
    console.error(`Invalid --extends "${ext}". Choose CivBaseElement or CivFormElement.`);
    process.exit(1);
  }

  return {
    name,
    package: pkg,
    category,
    extends: ext as 'CivBaseElement' | 'CivFormElement',
    native: !flags['no-native'],
    drupal: !flags['no-drupal'],
    dryRun: !!flags['dry-run'],
  };
}

function pascalCase(name: string): string {
  return name.replace(/^civ-/, '').split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
}

function slug(name: string): string {
  return name.replace(/^civ-/, '');
}

function ensureDir(path: string, dry: boolean): void {
  if (existsSync(path)) return;
  if (dry) console.log(`[dry-run] would mkdir ${path}`);
  else mkdirSync(path, { recursive: true });
}

function writeIfMissing(path: string, content: string, dry: boolean): boolean {
  if (existsSync(path)) {
    console.log(`✗ skipped (already exists): ${path}`);
    return false;
  }
  if (dry) {
    console.log(`[dry-run] would write ${path}`);
    return true;
  }
  ensureDir(dirname(path), false);
  writeFileSync(path, content);
  console.log(`✓ wrote ${path}`);
  return true;
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

function litSkeleton(o: ScaffoldOptions): string {
  const klass = `Civ${pascalCase(o.name)}`;
  const baseImport = o.extends === 'CivFormElement'
    ? "import { CivFormElement, dispatch } from '@civui/core';"
    : "import { CivBaseElement } from '@civui/core';";
  return `import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
${baseImport}

/**
 * CivUI ${pascalCase(o.name)}
 *
 * TODO: replace this description with the component's purpose, the
 * primary use case, and any usage notes (when to pick this over a
 * sibling component). The schema's description should mirror this.
 *
 * @element ${o.name}
 *
 * @example
 * \`\`\`html
 * <${o.name} label="..."></${o.name}>
 * \`\`\`
 */
@customElement('${o.name}')
export class ${klass} extends ${o.extends} {
  /**
   * TODO: declare the component's @property fields. Each one should
   * also appear in the schema at packages/schema/src/components/${o.name}.schema.ts.
   * Inherited form props (label, value, hint, error, required, disabled,
   * readonly) come from the base class — don't redeclare.
   */

  override render() {
    return html\`
      <div class="${o.name}">
        <slot></slot>
      </div>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${o.name}': ${klass};
  }
}
`;
}

function indexBarrel(o: ScaffoldOptions): string {
  return `export { Civ${pascalCase(o.name)} } from './${o.name}.js';
`;
}

function litTestSkeleton(o: ScaffoldOptions): string {
  const klass = `Civ${pascalCase(o.name)}`;
  return `import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './${o.name}.js';
import type { ${klass} } from './${o.name}.js';

describe('${o.name}', () => {
  afterEach(cleanupFixtures);

  it('renders', async () => {
    const el = await fixture<${klass}>(\`<${o.name}></${o.name}>\`);
    await elementUpdated(el);
    expect(el).toBeInstanceOf(HTMLElement);
  });

  // TODO: add component-specific tests covering each public prop, event,
  // and accessibility behavior.
});
`;
}

function schemaSkeleton(o: ScaffoldOptions): string {
  return `import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: '${o.name}',
  description: 'TODO: one-paragraph contract — purpose, primary use case, notable composition. Match the description in the Lit source.',
  category: '${o.category}',
  extends: '${o.extends}',
  isGroup: false,

  props: {
    // TODO: declare each component-specific prop here. Inherited form
    // props (label, value, hint, error, required, disabled, readonly,
    // touched, requiredMessage) are filtered automatically — don't add.
    //
    // Example shape:
    //
    //   variant: {
    //     type: 'enum',
    //     description: 'Visual variant — primary, secondary, tertiary.',
    //     default: 'primary',
    //     values: ['primary', 'secondary', 'tertiary'],
    //   },
  },

  events: {
    // TODO: declare any custom events the component dispatches.
    // \`civ-input\` and \`civ-change\` are dispatched by the base class
    // for form components — declare them here only if the component
    // adds extra detail keys.
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: ${o.extends === 'CivFormElement'},
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
`;
}

function swiftSkeleton(o: ScaffoldOptions): string {
  const klass = `Civ${pascalCase(o.name)}`;
  return `// CivUI — ${klass} for SwiftUI
// TODO: implement the SwiftUI view that mirrors the schema at
// packages/schema/src/components/${o.name}.schema.ts.

import SwiftUI

public struct ${klass}: View {
    // TODO: declare \`public var\` (and \`@Binding public var\` for
    // bound values) for every non-webOnly schema prop. Booleans use
    // is-prefix (e.g. \`isRequired\`).

    public init() {}

    public var body: some View {
        EmptyView()
    }
}

#if DEBUG
struct ${klass}_Previews: PreviewProvider {
    static var previews: some View {
        ${klass}()
    }
}
#endif
`;
}

function kotlinSkeleton(o: ScaffoldOptions): string {
  const klass = `Civ${pascalCase(o.name)}`;
  return `// CivUI — ${klass} for Jetpack Compose
// TODO: implement the @Composable function that mirrors the schema at
// packages/schema/src/components/${o.name}.schema.ts.

package gov.civui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun ${klass}(
    modifier: Modifier = Modifier,
    // TODO: add a parameter for every non-webOnly schema prop. The
    // schema-parity check matches by name, so use the same camelCase
    // names as the schema (Kotlin reserved words like \`when\` use
    // backtick escaping).
) {
    Column(modifier = modifier) {}
}
`;
}

function drupalYamlSkeleton(o: ScaffoldOptions): string {
  return `$schema: https://git.drupalcode.org/project/drupal/-/raw/HEAD/core/assets/schemas/v1/metadata.schema.json
name: ${pascalCase(o.name).replace(/([A-Z])/g, ' $1').trim()}
status: stable
group: CivUI
description: 'TODO: one-line description matching the schema'

props:
  type: object
  properties:
    # TODO: \`pnpm sync:drupal\` will populate this from your schema.
    # The placeholder ensures the SDC validator doesn't complain about
    # an empty properties block.
    label:
      title: Label
      type: string

libraryOverrides:
  dependencies:
    - civui/civui
`;
}

function drupalTwigSkeleton(o: ScaffoldOptions): string {
  return `<${o.name}
  {% if label %}label="{{ label }}"{% endif %}
></${o.name}>
`;
}

// ---------------------------------------------------------------------------
// Tool-table registrations (insert into existing files)
// ---------------------------------------------------------------------------

function registerInSchemaParity(o: ScaffoldOptions, dry: boolean): boolean {
  const path = join(ROOT, 'tools/schema-parity.ts');
  const src = readFileSync(path, 'utf-8');
  if (src.includes(`name: '${o.name}'`)) {
    console.log(`✗ already registered in tools/schema-parity.ts`);
    return false;
  }
  const klass = `Civ${pascalCase(o.name)}`;
  const litPath = `packages/${o.package}/src/${slug(o.name)}/${o.name}.ts`;
  const iosPath = `packages/ios/Sources/CivUI/${klass}.swift`;
  const androidPath = `packages/android/src/main/kotlin/gov/civui/components/${klass}.kt`;
  const drupalPath = `packages/drupal/civui/components/${slug(o.name)}/${slug(o.name)}.component.yml`;

  // Build the entry — match the existing format (one line, key-aligned).
  const entryLine = `  { name: '${o.name}',${' '.repeat(Math.max(1, 28 - o.name.length))}source: '${litPath}',${o.native ? `${' '.repeat(2)}ios: '${iosPath}',${' '.repeat(2)}android: '${androidPath}',` : ''}${o.drupal ? `${' '.repeat(2)}drupal: '${drupalPath}'` : ''} },`;

  // Insert before the closing `];` of COVERED_COMPONENTS.
  const closingMatch = src.match(/\nconst COVERED_COMPONENTS: ComponentSpec\[\] = \[[\s\S]*?\n(\];)/);
  if (!closingMatch) {
    console.error('Could not locate COVERED_COMPONENTS array in tools/schema-parity.ts.');
    return false;
  }
  const insertAt = src.lastIndexOf('];', closingMatch.index! + closingMatch[0].length);
  const next = src.slice(0, insertAt) + entryLine + '\n' + src.slice(insertAt);
  if (dry) {
    console.log(`[dry-run] would register in tools/schema-parity.ts`);
    return true;
  }
  writeFileSync(path, next);
  console.log(`✓ registered in tools/schema-parity.ts`);
  return true;
}

function registerInSyncTool(toolPath: string, line: string, dry: boolean): boolean {
  const fullPath = join(ROOT, toolPath);
  const src = readFileSync(fullPath, 'utf-8');
  if (src.includes(line.trim())) {
    console.log(`✗ already registered in ${toolPath}`);
    return false;
  }
  // Insert before the closing `];` of the COMPONENTS array.
  const closingIdx = src.indexOf('];', src.indexOf('const COMPONENTS'));
  if (closingIdx < 0) {
    console.error(`Could not locate COMPONENTS array in ${toolPath}.`);
    return false;
  }
  const next = src.slice(0, closingIdx) + line + '\n' + src.slice(closingIdx);
  if (dry) {
    console.log(`[dry-run] would register in ${toolPath}`);
    return true;
  }
  writeFileSync(fullPath, next);
  console.log(`✓ registered in ${toolPath}`);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const o = parseArgs(process.argv);
  console.log(`Scaffolding ${o.name} → package: ${o.package}, category: ${o.category}, extends: ${o.extends}`);

  // 1. Lit source + test + barrel
  const litDir = join(ROOT, `packages/${o.package}/src/${slug(o.name)}`);
  writeIfMissing(join(litDir, `${o.name}.ts`), litSkeleton(o), o.dryRun);
  writeIfMissing(join(litDir, `${o.name}.test.ts`), litTestSkeleton(o), o.dryRun);
  writeIfMissing(join(litDir, 'index.ts'), indexBarrel(o), o.dryRun);

  // 2. Schema
  writeIfMissing(
    join(ROOT, `packages/schema/src/components/${o.name}.schema.ts`),
    schemaSkeleton(o),
    o.dryRun,
  );

  // 3. Native files
  if (o.native) {
    const klass = `Civ${pascalCase(o.name)}`;
    writeIfMissing(join(ROOT, `packages/ios/Sources/CivUI/${klass}.swift`), swiftSkeleton(o), o.dryRun);
    writeIfMissing(join(ROOT, `packages/android/src/main/kotlin/gov/civui/components/${klass}.kt`), kotlinSkeleton(o), o.dryRun);
  }

  // 4. Drupal SDC
  if (o.drupal) {
    const drupalDir = join(ROOT, `packages/drupal/civui/components/${slug(o.name)}`);
    writeIfMissing(join(drupalDir, `${slug(o.name)}.component.yml`), drupalYamlSkeleton(o), o.dryRun);
    writeIfMissing(join(drupalDir, `${slug(o.name)}.twig`), drupalTwigSkeleton(o), o.dryRun);
  }

  // 5. Register in tool tables
  registerInSchemaParity(o, o.dryRun);
  if (o.drupal) {
    registerInSyncTool('tools/sync-drupal-sdc.ts', `  { schema: '${o.name}', drupal: '${slug(o.name)}' },`, o.dryRun);
    registerInSyncTool('tools/sync-drupal-twig.ts', `  '${o.name}',`, o.dryRun);
  }

  console.log('');
  console.log(`Next steps:`);
  console.log(`  1. Implement the Lit component at packages/${o.package}/src/${slug(o.name)}/${o.name}.ts`);
  console.log(`  2. Add @property declarations there AND matching entries in the schema's \`props\` map`);
  if (o.native) {
    console.log(`  3. Implement the iOS view + Android composable (or mark schema props \`webOnly: true\`)`);
  }
  if (o.drupal) {
    console.log(`  4. Run \`pnpm sync:drupal\` to populate Drupal SDC YAML props from the schema`);
  }
  console.log(`  5. Run \`pnpm parity:schema --platforms\` to verify zero drift`);
  console.log(`  6. Run \`pnpm validate\` to confirm all gates pass`);
}

main();
