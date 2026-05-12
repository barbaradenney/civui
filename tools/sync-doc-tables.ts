#!/usr/bin/env tsx
/**
 * sync-doc-tables — generate Markdown partials with Props and Events
 * tables for every covered CivUI component, from @civui/schema.
 *
 * Each output file lives next to the doc page that consumes it, under
 * apps/docs/docs/components/{category}/_{component}.props.mdx and
 * _{component}.events.mdx. Doc pages import them via:
 *
 *   import PropsTable from './_civ-text-input.props.mdx';
 *   <PropsTable />
 *
 * Why: the audit caught at least one stale hand-written Props table
 * (overview.mdx still listed civ-form-field months after the
 * component was deleted). Generating from the schema means the docs
 * track the schema, full stop.
 *
 * Run via `pnpm sync:doc-tables`. CI / `pnpm validate:doc-tables`
 * runs `git diff --exit-code` on the output to catch drift.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ComponentSchema, PropDef, EventDef } from '@civui/schema';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMA_DIR = path.join(REPO_ROOT, 'packages/schema/src/components');
const DOCS_DIR = path.join(REPO_ROOT, 'apps/docs/docs/components');

const GENERATED_BANNER = `{/* Generated from @civui/schema by tools/sync-doc-tables.ts.
    Do not edit by hand — run \`pnpm sync:doc-tables\` to regenerate. */}\n\n`;

function escapeCell(input: string): string {
  return input.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatDefault(def: PropDef): string {
  if (def.default === undefined) return '—';
  if (typeof def.default === 'string') return `\`'${def.default}'\``;
  if (Array.isArray(def.default)) return '`[]`';
  return `\`${String(def.default)}\``;
}

function formatType(def: PropDef): string {
  if (def.type === 'enum' && def.values) {
    return def.values.map(v => `\`'${v}'\``).join(' \\| ');
  }
  return `\`${def.type}\``;
}

function renderProps(name: string, props: Record<string, PropDef>): string {
  const entries = Object.entries(props).filter(([, def]) => !def.webOnly === false || true);
  if (entries.length === 0) return `${GENERATED_BANNER}_${name} has no documented props beyond the inherited form-element chrome (label / hint / error / required / disabled / name / value)._\n`;

  const rows = entries.map(([propName, def]) => {
    const attr = def.attribute ?? propName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const type = formatType(def);
    const dflt = formatDefault(def);
    const desc = escapeCell(def.description);
    return `| \`${attr}\` | ${type} | ${dflt} | ${desc} |`;
  });

  return (
    `${GENERATED_BANNER}` +
    `| Attribute | Type | Default | Description |\n` +
    `|-----------|------|---------|-------------|\n` +
    `${rows.join('\n')}\n`
  );
}

function renderEvents(name: string, events: Record<string, EventDef>): string {
  const entries = Object.entries(events);
  if (entries.length === 0) return `${GENERATED_BANNER}_${name} does not fire any custom events._\n`;

  const rows = entries.map(([eventName, def]) => {
    const detail = Object.keys(def.detail).length === 0
      ? '—'
      : `\`{ ${Object.entries(def.detail).map(([k, v]) => `${k}: ${v.type}`).join(', ')} }\``;
    return `| \`${eventName}\` | ${detail} | ${escapeCell(def.description)} |`;
  });

  return (
    `${GENERATED_BANNER}` +
    `| Event | Detail | Description |\n` +
    `|-------|--------|-------------|\n` +
    `${rows.join('\n')}\n`
  );
}

/** Locate the component doc page directory for a given schema component name. */
async function findDocDir(componentName: string): Promise<string | null> {
  // Walk apps/docs/docs/components/* looking for {component}.mdx
  const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
  const tag = componentName.replace(/^civ-/, '');
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const candidate = path.join(DOCS_DIR, e.name, `${tag}.mdx`);
    try {
      await fs.access(candidate);
      return path.join(DOCS_DIR, e.name);
    } catch { /* not here */ }
  }
  return null;
}

async function main(): Promise<void> {
  const schemaFiles = (await fs.readdir(SCHEMA_DIR))
    .filter(f => f.endsWith('.schema.ts'))
    .map(f => path.join(SCHEMA_DIR, f));

  let propsWritten = 0;
  let eventsWritten = 0;
  let skippedNoDoc = 0;

  for (const file of schemaFiles) {
    const mod = await import(file) as { default: ComponentSchema };
    const schema = mod.default;
    if (!schema?.name) continue;

    const dir = await findDocDir(schema.name);
    if (!dir) {
      skippedNoDoc++;
      continue;
    }

    const tag = schema.name.replace(/^civ-/, '');
    const propsPath = path.join(dir, `_${tag}.props.mdx`);
    const eventsPath = path.join(dir, `_${tag}.events.mdx`);

    await fs.writeFile(propsPath, renderProps(schema.name, schema.props ?? {}));
    propsWritten++;

    await fs.writeFile(eventsPath, renderEvents(schema.name, schema.events ?? {}));
    eventsWritten++;
  }

  console.log(`✓ wrote ${propsWritten} props partials + ${eventsWritten} events partials`);
  if (skippedNoDoc > 0) {
    console.log(`  (${skippedNoDoc} schema(s) had no matching doc page — skipped)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
