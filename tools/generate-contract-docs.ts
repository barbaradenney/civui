#!/usr/bin/env npx tsx
/**
 * CivUI Contract Reference doc generator
 *
 * Walks every `*.schema.ts` in `@civui/schema` and emits a Docusaurus
 * markdown page documenting the contract for that component. Output
 * lives in `apps/docs/docs/contract/civ-<name>.md` — these pages are
 * **generated artifacts** and should not be hand-edited (changes get
 * overwritten on next build).
 *
 * The contract pages serve as a contractor-facing reference: when a new
 * platform implementation (or a contractor) needs to know exactly which
 * props / events / accessibility behavior a component must expose, this
 * page is the canonical answer. The existing per-component pages under
 * `/components/...` continue to host the worked examples and Storybook
 * embeds — the contract pages are a complementary structured resource.
 *
 * Usage:
 *   pnpm docs:contract           # regenerate all pages
 *   pnpm docs:contract --dry-run # report what would change
 *
 * The Docusaurus `prebuild` script runs this so the generated pages are
 * always in sync with the schemas at build time.
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');
const SCHEMAS_DIR = join(ROOT, 'packages/schema/src/components');
const OUTPUT_DIR = join(ROOT, 'apps/docs/docs/contract');
const DRY_RUN = process.argv.includes('--dry-run');

interface PropDef {
  type: string;
  description?: string;
  default?: unknown;
  attribute?: string;
  values?: string[];
  webOnly?: boolean;
  reflect?: boolean;
}

interface EventDef {
  description?: string;
  detail?: Record<string, { type?: string; description?: string }>;
}

interface ComponentSchema {
  name: string;
  description: string;
  category: string;
  extends: string;
  isGroup?: boolean;
  props: Record<string, PropDef>;
  events: Record<string, EventDef>;
  a11y?: { role?: string; requiredIndicator?: string; errorAnnouncement?: string };
  form?: { valueMode?: string; formAssociated?: boolean };
}

function escapeMd(s: string | undefined): string {
  if (!s) return '';
  // MDX treats `<` followed by a letter as the start of a JSX tag, so any
  // descriptions that mention HTML elements (`<legend>`, `<select>`) blow
  // up the parser. HTML-encode angle brackets, normalize whitespace, and
  // escape table-cell pipes.
  return s
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function formatDefault(d: unknown): string {
  if (d === undefined) return '—';
  if (d === '') return '`""`';
  if (typeof d === 'string') return `\`${d}\``;
  return `\`${JSON.stringify(d)}\``;
}

function formatType(prop: PropDef): string {
  if (prop.type === 'enum' && prop.values && prop.values.length > 0) {
    return prop.values.map((v) => `\`${v || '""'}\``).join(' \\| ');
  }
  return `\`${prop.type}\``;
}

function renderPropsTable(props: Record<string, PropDef>): string {
  const rows = Object.entries(props);
  if (rows.length === 0) return '*No component-specific props (inherits standard form props from base class).*\n';

  const lines: string[] = [];
  lines.push('| Prop | Attribute | Type | Default | Notes |');
  lines.push('|------|-----------|------|---------|-------|');
  for (const [name, prop] of rows) {
    const attr = prop.attribute ?? camelToKebab(name);
    const flags: string[] = [];
    if (prop.webOnly) flags.push('**web-only**');
    if (prop.reflect) flags.push('reflects');
    const description = escapeMd(prop.description);
    const notes = [description, ...flags].filter(Boolean).join('. ');
    lines.push(`| \`${name}\` | \`${attr}\` | ${formatType(prop)} | ${formatDefault(prop.default)} | ${notes} |`);
  }
  return lines.join('\n') + '\n';
}

function camelToKebab(name: string): string {
  return name.replace(/([A-Z]+)/g, '-$1').replace(/^-/, '').toLowerCase();
}

function renderEventsTable(events: Record<string, EventDef>): string {
  const rows = Object.entries(events);
  if (rows.length === 0) return '*No component-specific events (form events `civ-input` and `civ-change` are inherited from the base class).*\n';

  const lines: string[] = [];
  lines.push('| Event | Detail | Description |');
  lines.push('|-------|--------|-------------|');
  for (const [name, evt] of rows) {
    const detail = evt.detail
      ? Object.keys(evt.detail).map((k) => `\`${k}\``).join(', ') || '—'
      : '—';
    lines.push(`| \`${name}\` | ${detail} | ${escapeMd(evt.description)} |`);
  }
  return lines.join('\n') + '\n';
}

function renderA11y(a11y: ComponentSchema['a11y']): string {
  if (!a11y) return '';
  const lines: string[] = [];
  if (a11y.role) lines.push(`- **ARIA role:** \`${a11y.role}\``);
  if (a11y.requiredIndicator) lines.push(`- **Required-indicator style:** \`${a11y.requiredIndicator}\``);
  if (a11y.errorAnnouncement) lines.push(`- **Error announcement:** \`${a11y.errorAnnouncement}\``);
  return lines.join('\n') + '\n';
}

function renderForm(form: ComponentSchema['form']): string {
  if (!form) return '';
  const lines: string[] = [];
  if (form.valueMode) lines.push(`- **Value mode:** \`${form.valueMode}\``);
  if (form.formAssociated !== undefined) lines.push(`- **Form-associated:** ${form.formAssociated ? 'yes (participates in form submission via ElementInternals)' : 'no'}`);
  return lines.join('\n') + '\n';
}

function renderPage(schema: ComponentSchema, position: number): string {
  const out: string[] = [];
  out.push(`---`);
  // Quote scalar values so frontmatter YAML doesn't choke on colons,
  // backticks, or other punctuation in descriptions.
  const yamlString = (s: string) => `'${s.replace(/'/g, "''")}'`;
  out.push(`title: ${yamlString(schema.name)}`);
  out.push(`sidebar_position: ${position}`);
  out.push(`sidebar_label: ${yamlString(schema.name)}`);
  out.push(`description: ${yamlString(escapeMd(schema.description.slice(0, 200)))}`);
  out.push(`---`);
  out.push('');
  out.push(`# ${schema.name}`);
  out.push('');
  out.push(`> **Auto-generated from \`packages/schema/src/components/${schema.name}.schema.ts\`** — do not hand-edit. Run \`pnpm docs:contract\` (or rebuild docs) to regenerate.`);
  out.push('');
  // Escape MDX-significant characters in the body too — `<select>` mentions
  // would otherwise be parsed as JSX tags. Preserve newlines (unlike the
  // table-cell escapeMd, which flattens them).
  out.push(schema.description.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '\\{').replace(/\}/g, '\\}'));
  out.push('');
  out.push('| Field | Value |');
  out.push('|-------|-------|');
  out.push(`| Tag | \`<${schema.name}>\` |`);
  out.push(`| Category | \`${schema.category}\` |`);
  out.push(`| Base class | \`${schema.extends}\` |`);
  out.push(`| Group component | ${schema.isGroup ? 'yes' : 'no'} |`);
  out.push('');
  out.push(`## Props`);
  out.push('');
  out.push(renderPropsTable(schema.props));
  out.push(`## Events`);
  out.push('');
  out.push(renderEventsTable(schema.events));
  const a11yLines = renderA11y(schema.a11y);
  if (a11yLines.trim()) {
    out.push(`## Accessibility`);
    out.push('');
    out.push(a11yLines);
  }
  const formLines = renderForm(schema.form);
  if (formLines.trim()) {
    out.push(`## Form Behavior`);
    out.push('');
    out.push(formLines);
  }
  out.push(`## Cross-platform sources`);
  out.push('');
  out.push('The Lit web implementation is the canonical reference. Each platform ships an equivalent that satisfies the prop / event coverage above. Schema-parity CI fails if any platform drifts.');
  out.push('');
  out.push('| Platform | File |');
  out.push('|----------|------|');
  out.push(`| Web (Lit) | \`packages/.../civ-${schema.name.replace(/^civ-/, '')}.ts\` |`);
  const titleCase = schema.name.replace(/^civ-/, '').split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
  out.push(`| iOS (SwiftUI) | \`packages/ios/Sources/CivUI/Civ${titleCase}.swift\` |`);
  out.push(`| Android (Compose) | \`packages/android/src/main/kotlin/gov/civui/components/Civ${titleCase}.kt\` |`);
  out.push(`| Drupal SDC | \`packages/drupal/civui/components/${schema.name.replace(/^civ-/, '')}/\` |`);
  out.push('');
  return out.join('\n');
}

async function loadSchema(file: string): Promise<ComponentSchema> {
  const path = join(SCHEMAS_DIR, file);
  const mod = await import(pathToFileURL(path).href);
  return mod.default ?? mod;
}

interface CategoryFile {
  label: string;
  position?: number;
  link?: { type: string; title?: string; description?: string };
}

const CATEGORY_FILE: CategoryFile = {
  label: 'Contract Reference',
  position: 100,
  link: {
    type: 'generated-index',
    title: 'Contract Reference',
    description: 'Auto-generated per-component contract documentation. Each page captures the platform-neutral schema (props, events, accessibility, form behavior) that every CivUI platform implementation must satisfy. Generated from `@civui/schema` — do not hand-edit. Use the existing per-component pages under "Components" for worked examples and Storybook embeds.',
  },
};

async function main(): Promise<void> {
  if (!existsSync(OUTPUT_DIR)) {
    if (DRY_RUN) {
      console.log(`[dry-run] would create ${OUTPUT_DIR}`);
    } else {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  }

  const files = readdirSync(SCHEMAS_DIR)
    .filter((f) => f.endsWith('.schema.ts'))
    .sort();

  let written = 0;
  for (let i = 0; i < files.length; i++) {
    const schema = await loadSchema(files[i]);
    const outPath = join(OUTPUT_DIR, `${schema.name}.md`);
    const content = renderPage(schema, i + 1);
    const existing = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : '';
    if (existing === content) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] would write ${outPath}`);
    } else {
      writeFileSync(outPath, content);
    }
    written++;
  }

  // Emit the category file so the sidebar gets a "Contract Reference" entry.
  const categoryPath = join(OUTPUT_DIR, '_category_.json');
  const categoryContent = JSON.stringify(CATEGORY_FILE, null, 2) + '\n';
  const existingCategory = existsSync(categoryPath) ? readFileSync(categoryPath, 'utf-8') : '';
  if (existingCategory !== categoryContent) {
    if (DRY_RUN) {
      console.log(`[dry-run] would write ${categoryPath}`);
    } else {
      writeFileSync(categoryPath, categoryContent);
    }
    written++;
  }

  console.log(`${DRY_RUN ? '[dry-run] would update' : 'updated'} ${written} file(s) for ${files.length} schema(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
