#!/usr/bin/env npx tsx
/**
 * CivUI Drupal SDC sync — appends missing schema props to each
 * component's *.component.yml file. Preserves all existing content;
 * only adds entries that are missing.
 *
 * Idempotent: running twice produces no changes if the schema and
 * SDC are in sync.
 *
 * Usage: npx tsx tools/sync-drupal-sdc.ts [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

interface ComponentMapping {
  schema: string;
  drupal: string;
}

const COMPONENTS: ComponentMapping[] = [
  { schema: 'civ-text-input', drupal: 'text-input' },
  { schema: 'civ-checkbox', drupal: 'checkbox' },
  { schema: 'civ-radio-group', drupal: 'radio-group' },
  { schema: 'civ-yes-no', drupal: 'yes-no' },
  { schema: 'civ-checkbox-group', drupal: 'checkbox-group' },
  { schema: 'civ-combobox', drupal: 'combobox' },
  { schema: 'civ-date-picker', drupal: 'date-picker' },
  { schema: 'civ-file-upload', drupal: 'file-upload' },
  { schema: 'civ-memorable-date', drupal: 'memorable-date' },
  { schema: 'civ-segmented-control', drupal: 'segmented-control' },
  { schema: 'civ-select', drupal: 'select' },
  { schema: 'civ-textarea', drupal: 'textarea' },
  { schema: 'civ-toggle', drupal: 'toggle' },
  { schema: 'civ-address', drupal: 'address' },
  { schema: 'civ-repeater', drupal: 'repeater' },
  { schema: 'civ-name', drupal: 'name' },
  { schema: 'civ-direct-deposit', drupal: 'direct-deposit' },
  { schema: 'civ-signature', drupal: 'signature' },
  { schema: 'civ-form-step', drupal: 'form-step' },
  { schema: 'civ-progress-percent', drupal: 'progress-percent' },
  { schema: 'civ-race-ethnicity', drupal: 'race-ethnicity' },
  { schema: 'civ-marriage-history', drupal: 'marriage-history' },
  { schema: 'civ-relationship', drupal: 'relationship' },
  { schema: 'civ-service-history', drupal: 'service-history' },
  { schema: 'civ-filterable-list', drupal: 'filterable-list' },
];

const INHERITED_FORM_PROPS = new Set([
  'label', 'name', 'value', 'hint', 'error',
  'required', 'requiredMessage', 'disabled', 'readonly',
  'touched', 'disableAnalytics',
]);

function camelToSnake(name: string): string {
  return name.replace(/([A-Z]+)/g, '_$1').replace(/^_/, '').toLowerCase();
}

/**
 * Resolve the Drupal SDC prop key for a schema prop. The convention is
 * to mirror the Lit HTML attribute the Twig template actually renders,
 * with kebab-case converted to snake_case:
 *
 * - When the schema declares `attribute: 'foo-bar'`, Drupal uses `foo_bar`.
 * - Otherwise Lit defaults to the lowercased property name; Drupal uses
 *   snake_case so `showMiddle` becomes `show_middle`.
 */
function drupalKeyFor(propName: string, def: any): string {
  if (def.attribute) return def.attribute.replace(/-/g, '_');
  return camelToSnake(propName);
}

function camelToTitle(name: string): string {
  // showStreet2 → "Show street 2"
  return name
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

function schemaTypeToDrupal(type: string): string {
  switch (type) {
    case 'number':
      return 'integer';
    case 'enum':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    default:
      return 'string';
  }
}

function escapeYamlString(s: string): string {
  // Wrap in single quotes; escape internal single quotes by doubling.
  return `'${s.replace(/'/g, "''")}'`;
}

function renderPropYaml(propName: string, def: any, indent: string): string {
  const key = drupalKeyFor(propName, def);
  const lines = [`${indent}${key}:`];
  lines.push(`${indent}  title: ${camelToTitle(propName)}`);
  lines.push(`${indent}  type: ${schemaTypeToDrupal(def.type)}`);
  if (def.values && def.values.length > 0) {
    const enumList = def.values
      .filter((v: string) => v !== '')
      .map((v: string) => `'${v}'`)
      .join(', ');
    if (enumList) {
      lines.push(`${indent}  enum: [${enumList}]`);
    }
  }
  if (def.default !== undefined && def.default !== '') {
    if (typeof def.default === 'string') {
      lines.push(`${indent}  default: ${escapeYamlString(def.default)}`);
    } else {
      lines.push(`${indent}  default: ${def.default}`);
    }
  }
  if (def.description) {
    // Trim very long descriptions to keep YAML readable.
    const desc = def.description.length > 240
      ? def.description.slice(0, 237) + '...'
      : def.description;
    lines.push(`${indent}  description: ${escapeYamlString(desc)}`);
  }
  return lines.join('\n');
}

function existingDrupalProps(yaml: string): Set<string> {
  const names = new Set<string>();
  const lines = yaml.split('\n');
  let inProperties = false;
  let baseIndent = 0;
  for (const line of lines) {
    const propsMatch = line.match(/^(\s*)properties\s*:/);
    if (propsMatch && !inProperties) {
      inProperties = true;
      baseIndent = propsMatch[1].length;
      continue;
    }
    if (!inProperties) continue;
    const m = line.match(/^(\s*)([\w-]+)\s*:/);
    if (!m) continue;
    const indent = m[1].length;
    if (indent <= baseIndent && line.trim() !== '') {
      inProperties = false;
      continue;
    }
    if (indent === baseIndent + 2) {
      names.add(m[2]);
    }
  }
  return names;
}

interface SyncResult {
  component: string;
  added: string[];
  skipped: 'no-schema' | 'no-yaml' | null;
}

async function syncComponent(c: ComponentMapping): Promise<SyncResult> {
  const schemaPath = join(ROOT, 'packages/schema/src/components', `${c.schema}.schema.ts`);
  const yamlPath = join(ROOT, 'packages/drupal/civui/components', c.drupal, `${c.drupal}.component.yml`);
  if (!existsSync(schemaPath)) return { component: c.schema, added: [], skipped: 'no-schema' };
  if (!existsSync(yamlPath)) return { component: c.schema, added: [], skipped: 'no-yaml' };

  const mod = await import(pathToFileURL(schemaPath).href);
  const schema = mod.default ?? mod;
  const schemaProps = schema.props ?? {};

  const yaml = readFileSync(yamlPath, 'utf-8');
  const existing = existingDrupalProps(yaml);

  const toAdd: Array<{ name: string; def: any }> = [];
  for (const [propName, def] of Object.entries(schemaProps) as [string, any][]) {
    if (INHERITED_FORM_PROPS.has(propName)) continue;
    if (def.webOnly) continue;
    const drupalKey = drupalKeyFor(propName, def);
    // Match against the resolved key (which honors the schema's attribute
    // override, e.g. `validateType` → `validate`) plus the bare snake form
    // and the camelCase form, so older SDCs that already declared the prop
    // under a slightly different name still register as present.
    if (
      existing.has(propName) ||
      existing.has(drupalKey) ||
      existing.has(camelToSnake(propName))
    ) continue;
    toAdd.push({ name: propName, def });
  }

  if (toAdd.length === 0) return { component: c.schema, added: [], skipped: null };

  // Find the indentation under the existing `properties:` block.
  // SDC convention is 4-space indent for each prop key.
  const indent = '    ';
  const additions = toAdd.map((p) => renderPropYaml(p.name, p.def, indent)).join('\n');

  // Insert the additions at the end of the `properties:` block. The
  // SDC may have other top-level sections after `props:` (`slots:`,
  // `libraryOverrides:`, etc.) — we need to insert BEFORE the first
  // of those, not before `libraryOverrides:` specifically. Find the
  // end of the `properties:` block by scanning forward from the
  // `properties:` line until we hit another top-level (non-indented)
  // key, or end of file.
  const lines = yaml.split('\n');
  let propsLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^props\s*:/.test(lines[i])) {
      // Then look ahead for the `properties:` child line.
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\s+properties\s*:/.test(lines[j])) {
          propsLineIdx = j;
          break;
        }
      }
      break;
    }
  }
  if (propsLineIdx < 0) {
    // No `props.properties` — skip.
    return { component: c.schema, added: [], skipped: null };
  }
  // Walk forward from the `properties:` line. The block ends at the
  // first line whose indentation is at or below the indentation of
  // `properties:` itself (i.e. another top-level or sibling key).
  const propsIndent = (lines[propsLineIdx].match(/^(\s*)/) ?? ['', ''])[1].length;
  let endIdx = lines.length; // default: end of file
  for (let i = propsLineIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const indent = (line.match(/^(\s*)/) ?? ['', ''])[1].length;
    if (indent <= propsIndent) {
      endIdx = i;
      break;
    }
  }
  // Trim trailing blank lines inside the block so spacing stays clean.
  while (endIdx > propsLineIdx + 1 && lines[endIdx - 1].trim() === '') endIdx--;
  const before = lines.slice(0, endIdx).join('\n');
  const after = lines.slice(endIdx).join('\n');
  const sep = after.length > 0 ? '\n\n' : '\n';
  const newYaml = `${before}\n${additions}${sep}${after}`;

  if (!DRY_RUN) writeFileSync(yamlPath, newYaml);
  return { component: c.schema, added: toAdd.map((p) => p.name), skipped: null };
}

async function main() {
  const results: SyncResult[] = [];
  for (const c of COMPONENTS) {
    results.push(await syncComponent(c));
  }
  let totalAdded = 0;
  for (const r of results) {
    if (r.skipped === 'no-schema') {
      console.log(`⚠  ${r.component}: no schema file`);
      continue;
    }
    if (r.skipped === 'no-yaml') {
      console.log(`⚠  ${r.component}: no Drupal SDC YAML`);
      continue;
    }
    if (r.added.length === 0) {
      console.log(`✓  ${r.component} (already in sync)`);
      continue;
    }
    totalAdded += r.added.length;
    console.log(`✗  ${r.component}: added ${r.added.length} prop(s) — ${r.added.join(', ')}`);
  }
  console.log(`\n${DRY_RUN ? '[dry-run] would add' : 'added'} ${totalAdded} prop(s) across ${COMPONENTS.length} components.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
