#!/usr/bin/env npx tsx
/**
 * CivUI Contract Reference doc generator (for Storybook).
 *
 * Walks every `*.schema.ts` in `@civui/schema` and emits a Storybook
 * MDX docs page per component. Output lives in
 * `.storybook/contract/civ-<name>.docs.mdx` — these pages are
 * **generated artifacts** and should not be hand-edited (changes get
 * overwritten on next Storybook build).
 *
 * The contract pages serve as a developer-facing reference inside
 * Storybook (where worked examples + Storybook controls already live),
 * sidebar-grouped under "Contract". The matching Docusaurus pages under
 * `/components/...` continue to host narrative usage docs and link
 * across to the Storybook contract page via an injected admonition.
 *
 * Why Storybook? Contract details (props, events, types) are inherently
 * developer-facing. Putting them in Docusaurus next to narrative usage
 * docs created redundancy with Storybook's existing prop tables, and
 * forced a context switch when developers wanted to see a component's
 * full surface. Co-locating with stories closes that gap.
 *
 * Usage:
 *   pnpm storybook:contract           # regenerate all pages
 *   pnpm storybook:contract --dry-run # report what would change
 *
 * The Storybook `prestorybook` / `prestorybook:build` scripts run this
 * automatically so the generated pages are always in sync with the
 * schemas at build / dev-server time.
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');
const SCHEMAS_DIR = join(ROOT, 'packages/schema/src/components');
const COMPONENTS_DOC_DIR = join(ROOT, 'apps/docs/docs/components');
const OUTPUT_DIR = join(ROOT, '.storybook/contract');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Some schemas share a component doc page with related siblings — the
 * docs are organized around capability groups (e.g. one "Date" page
 * covering picker / range-picker / memorable-date) rather than 1:1.
 * Map the schema slug to the canonical doc-page slug for these aliases.
 */
const SLUG_ALIAS: Record<string, string> = {
  'checkbox-group': 'checkbox',
  'radio-group': 'radio',
  'date-picker': 'date',
  'date-range-picker': 'date',
  'memorable-date': 'date',
  'progress-steps': 'progress',
  'progress-header': 'progress',
  'progress-percent': 'progress',
  'filter-chip-group': 'filter-chip',
};

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

function camelToKebab(name: string): string {
  return name.replace(/([A-Z]+)/g, '-$1').replace(/^-/, '').toLowerCase();
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

function renderPage(schema: ComponentSchema): string {
  const out: string[] = [];
  // Storybook MDX preamble — places the page under "Contract" in the sidebar.
  out.push(`import { Meta } from '@storybook/blocks';`);
  out.push('');
  out.push(`<Meta title="Contract/${schema.name}" />`);
  out.push('');
  out.push(`# ${schema.name}`);
  out.push('');
  out.push(`> **Auto-generated from \`packages/schema/src/components/${schema.name}.schema.ts\`** — do not hand-edit. Run \`pnpm storybook:contract\` (or rebuild Storybook) to regenerate.`);
  out.push('');
  // Body description, with MDX-significant chars escaped.
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

/**
 * Walk apps/docs/docs/components/<category>/<slug>.mdx and build a map
 * from slug (e.g. "button") to its Docusaurus URL (e.g.
 * "/components/actions/button"). Used for the reverse-link admonition.
 */
function buildComponentPageMap(): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(COMPONENTS_DOC_DIR)) return map;
  const categories = readdirSync(COMPONENTS_DOC_DIR);
  for (const category of categories) {
    const categoryPath = join(COMPONENTS_DOC_DIR, category);
    let entries: string[];
    try {
      entries = readdirSync(categoryPath);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.endsWith('.mdx') && !entry.endsWith('.md')) continue;
      const slug = entry.replace(/\.(mdx|md)$/, '');
      map.set(slug, `/components/${category}/${slug}`);
    }
  }
  return map;
}

function buildReverseMap(schemas: ComponentSchema[], componentPageMap: Map<string, string>): Map<string, string[]> {
  const reverse = new Map<string, string[]>();
  for (const schema of schemas) {
    const slug = schema.name.replace(/^civ-/, '');
    const url = resolveComponentPageUrl(slug, componentPageMap);
    if (!url) continue;
    if (!reverse.has(url)) reverse.set(url, []);
    reverse.get(url)!.push(schema.name);
  }
  return reverse;
}

function resolveComponentPageUrl(slug: string, map: Map<string, string>): string | undefined {
  if (map.has(slug)) return map.get(slug);
  const alias = SLUG_ALIAS[slug];
  if (alias && map.has(alias)) return map.get(alias);
  return undefined;
}

const CONTRACT_LINK_MARKER_START = '<!-- contract-link:start -->';
const CONTRACT_LINK_MARKER_END = '<!-- contract-link:end -->';

/**
 * The Storybook URL for an MDX docs page titled "Contract/civ-button" is
 * `?path=/docs/contract-civ-button--docs`. The slug is lowercase, with
 * `/` collapsed to `-`. Storybook is mounted at /civui/storybook/ on
 * the deployed site.
 */
function storybookContractUrl(schemaName: string): string {
  return `pathname:///civui/storybook/?path=/docs/contract-${schemaName}--docs`;
}

/**
 * Inject (or refresh) a "Contract reference" admonition into each
 * Docusaurus component page that has matching schemas. Idempotent —
 * uses HTML-comment markers so we can update without touching the
 * rest of the hand-written page. Placed immediately after the H1.
 */
function injectContractLinkIntoComponentPage(
  pagePath: string,
  schemaNames: string[],
): { changed: boolean } {
  const original = readFileSync(pagePath, 'utf-8');
  const links = schemaNames
    .map((name) => `[\`${name}\`](${storybookContractUrl(name)})`)
    .join(' · ');
  const block = [
    CONTRACT_LINK_MARKER_START,
    '',
    `> **Contract reference:** ${links} — auto-generated structured contract for cross-platform implementation.`,
    '',
    CONTRACT_LINK_MARKER_END,
  ].join('\n');

  const markerRegex = new RegExp(`\\n*${CONTRACT_LINK_MARKER_START}[\\s\\S]*?${CONTRACT_LINK_MARKER_END}\\n*`, 'gm');
  const cleaned = original.replace(markerRegex, '\n\n');

  // Insert immediately after the H1 title.
  const h1Match = cleaned.match(/^# .+$/m);
  let next: string;
  if (h1Match && h1Match.index !== undefined) {
    const insertAt = h1Match.index + h1Match[0].length;
    next = cleaned.slice(0, insertAt) + '\n\n' + block + cleaned.slice(insertAt);
  } else {
    const fmEnd = cleaned.indexOf('\n---', 4);
    if (fmEnd < 0) return { changed: false };
    const insertAt = cleaned.indexOf('\n', fmEnd + 4) + 1;
    next = cleaned.slice(0, insertAt) + '\n' + block + '\n' + cleaned.slice(insertAt);
  }
  if (next === original) return { changed: false };
  if (!DRY_RUN) writeFileSync(pagePath, next);
  return { changed: true };
}

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

  const componentPageMap = buildComponentPageMap();

  const allSchemas: ComponentSchema[] = [];
  for (const f of files) allSchemas.push(await loadSchema(f));

  let written = 0;
  for (const schema of allSchemas) {
    const outPath = join(OUTPUT_DIR, `${schema.name}.docs.mdx`);
    const content = renderPage(schema);
    const existing = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : '';
    if (existing === content) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] would write ${outPath}`);
    } else {
      writeFileSync(outPath, content);
    }
    written++;
  }

  // Inject reverse "Contract reference" links into each Docusaurus
  // component page, pointing at the Storybook contract URL. Idempotent
  // via marker blocks.
  const reverseMap = buildReverseMap(allSchemas, componentPageMap);
  let pagesUpdated = 0;
  for (const [url, schemaNames] of reverseMap) {
    const rel = url.replace(/^\/components\//, '');
    const baseDir = join(COMPONENTS_DOC_DIR, ...rel.split('/').slice(0, -1));
    const slug = rel.split('/').pop()!;
    let pagePath = join(baseDir, `${slug}.mdx`);
    if (!existsSync(pagePath)) pagePath = join(baseDir, `${slug}.md`);
    if (!existsSync(pagePath)) continue;
    const { changed } = injectContractLinkIntoComponentPage(pagePath, schemaNames.sort());
    if (changed) {
      pagesUpdated++;
      if (DRY_RUN) console.log(`[dry-run] would update component page ${pagePath}`);
    }
  }

  console.log(`${DRY_RUN ? '[dry-run] would update' : 'updated'} ${written} Storybook MDX file(s) and ${pagesUpdated} Docusaurus component page(s) for ${files.length} schema(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
