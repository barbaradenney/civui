#!/usr/bin/env npx tsx
/**
 * CivUI Drupal Twig sync — for each component, regenerates its
 * `*.twig` template so that every prop declared in the matching SDC
 * YAML is rendered as an attribute on the `<civ-*>` web component.
 *
 * Boolean props render as bare attributes:
 *   {% if disabled %}disabled{% endif %}
 *
 * Non-boolean props render with a value:
 *   {% if placeholder %}placeholder="{{ placeholder }}"{% endif %}
 *
 * The HTML attribute name comes from the schema's explicit `attribute`
 * field when present (e.g. `validateType` → `validate`); otherwise
 * we convert the SDC's snake_case key to kebab-case.
 *
 * Idempotent: running twice produces no change if the SDC and schema
 * are in sync.
 *
 * Usage: pnpm sync:drupal-twig [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ROOT = join(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try {
    return import.meta.url === pathToFileURL(argv).href;
  } catch {
    return false;
  }
}

const COMPONENTS = [
  'civ-text-input', 'civ-checkbox', 'civ-radio-group', 'civ-radio', 'civ-yes-no',
  'civ-checkbox-group', 'civ-combobox', 'civ-date-picker', 'civ-file-upload',
  'civ-memorable-date', 'civ-segmented-control', 'civ-select', 'civ-textarea',
  'civ-toggle', 'civ-address', 'civ-repeater', 'civ-name', 'civ-direct-deposit',
  'civ-signature', 'civ-form-step', 'civ-progress-percent', 'civ-race-ethnicity',
  'civ-partnership-history', 'civ-relationship', 'civ-service-history',
  'civ-filterable-list',
  'civ-support-resources',
  'civ-date-range-picker',
  'civ-progress-header',
  'civ-data-field',
  'civ-conditional',
  'civ-summary',
  'civ-modal',
  'civ-action-sheet',
  'civ-drawer',
  'civ-alert',
  'civ-badge',
  'civ-count',
  'civ-card',
  'civ-divider',
  'civ-tag',
  'civ-list',
  'civ-list-item',
  'civ-page-header',
  'civ-section-intro',
  'civ-button',
  'civ-link',
  'civ-link-card',
  'civ-skip-link',
  'civ-action-button',
  'civ-button-group',
  'civ-icon',
  'civ-filter-chip',
  'civ-filter-chip-group',
  'civ-disclosure',
  'civ-read-more',
  // Preset input wrappers — each is a self-contained web component
  // that extends text-input with a baked-in mask and validation.
  // Drupal SDCs mirror that shape: a thin pass-through twig that
  // forwards label/hint/error/required/disabled to the web element.
  'civ-ssn', 'civ-ein', 'civ-phone', 'civ-email', 'civ-zip',
  'civ-currency', 'civ-routing-number', 'civ-va-file-number', 'civ-country',
  'civ-time-picker',
];

function camelToKebab(name: string): string {
  return name.replace(/([A-Z]+)/g, '-$1').replace(/^-/, '').toLowerCase();
}

export function snakeToKebab(name: string): string {
  return name.replace(/_/g, '-');
}

export function parseSdcPropsFromYaml(src: string): YamlProp[] {
  const lines = src.split('\n');
  const props: YamlProp[] = [];
  let inProperties = false;
  let baseIndent = 0;
  let currentKey: string | null = null;
  let currentIndent = 0;
  let pendingType: string | null = null;
  for (const line of lines) {
    const propsMatch = line.match(/^(\s*)properties\s*:/);
    if (propsMatch && !inProperties) {
      inProperties = true;
      baseIndent = propsMatch[1].length;
      continue;
    }
    if (!inProperties) continue;
    const m = line.match(/^(\s*)([\w-]+)\s*:(.*)$/);
    if (m) {
      const indent = m[1].length;
      // Top-level (sibling) key — flush any in-flight prop and bail if
      // we've dedented past the properties block.
      if (indent <= baseIndent && line.trim() !== '') {
        if (currentKey) props.push({ key: currentKey, type: pendingType ?? 'string' });
        return props;
      }
      if (indent === baseIndent + 2) {
        if (currentKey) props.push({ key: currentKey, type: pendingType ?? 'string' });
        currentKey = m[2];
        currentIndent = indent;
        pendingType = null;
      } else if (currentKey && m[2] === 'type' && indent > currentIndent) {
        pendingType = m[3].trim();
      }
    }
  }
  if (currentKey) props.push({ key: currentKey, type: pendingType ?? 'string' });
  return props;
}

function parseSdcProps(yamlPath: string): YamlProp[] {
  return parseSdcPropsFromYaml(readFileSync(yamlPath, 'utf-8'));
}

/**
 * Parse the `slots:` block of a Drupal SDC YAML and return the slot
 * names in **declaration order**.
 *
 * Order matters: the rendered Twig emits one `{% block %}` per slot in
 * the order returned here, and Twig blocks render at their lexical
 * position. A page-level `start` slot declared *after* `default` would
 * render leading content visually after the body — almost always
 * wrong. Author SDC YAMLs with slots in the natural reading order
 * (start → default → end → footer / extras).
 */
export function parseSdcSlotsFromYaml(src: string): string[] {
  const lines = src.split('\n');
  const slots: string[] = [];
  let inSlots = false;
  let baseIndent = 0;
  for (const line of lines) {
    const slotsMatch = line.match(/^(\s*)slots\s*:/);
    if (slotsMatch && !inSlots) {
      inSlots = true;
      baseIndent = slotsMatch[1].length;
      continue;
    }
    if (!inSlots) continue;
    const m = line.match(/^(\s*)([\w-]+)\s*:/);
    if (!m) continue;
    const indent = m[1].length;
    if (indent <= baseIndent && line.trim() !== '') {
      // dedented past the slots block
      return slots;
    }
    if (indent === baseIndent + 2) {
      slots.push(m[2]);
    }
  }
  return slots;
}

function parseSdcSlots(yamlPath: string): string[] {
  return parseSdcSlotsFromYaml(readFileSync(yamlPath, 'utf-8'));
}

export interface AttrLookup {
  [propName: string]: string;
}

export interface YamlProp {
  /** Drupal SDC key (snake_case) */
  key: string;
  /** YAML type: boolean, integer, string, array */
  type: string;
}

async function loadSchemaAttributes(componentName: string): Promise<AttrLookup> {
  const schemaPath = join(ROOT, 'packages/schema/src/components', `${componentName}.schema.ts`);
  if (!existsSync(schemaPath)) return {};
  const mod = await import(pathToFileURL(schemaPath).href);
  const schema = mod.default ?? mod;
  const attrs: AttrLookup = {};
  for (const [propName, def] of Object.entries(schema.props ?? {}) as [string, any][]) {
    if (def.attribute) attrs[propName] = def.attribute;
  }
  return attrs;
}

export function htmlAttrFor(snakeKey: string, schemaAttrs: AttrLookup): string {
  // Two ways the snake_case key relates to a camelCase schema prop:
  //   show_middle ↔ showMiddle (camelToSnake(showMiddle) === show_middle)
  //   validate    ↔ validateType  (schema explicit attribute: 'validate')
  // First check if any schema prop's explicit attribute matches when
  // converted; that wins. Otherwise convert snake → kebab.
  for (const [propName, attr] of Object.entries(schemaAttrs)) {
    if (attr.replace(/-/g, '_') === snakeKey) return attr;
  }
  return snakeToKebab(snakeKey);
}

export function renderTwigLine(prop: YamlProp, attrName: string): string {
  if (prop.type === 'boolean') {
    return `  {% if ${prop.key} %}${attrName}{% endif %}`;
  }
  if (prop.type === 'array') {
    // Arrays render as JSON-encoded attribute values so the web
    // component's JSON-parsing prop converters can read them. Single-
    // quoted so embedded double-quotes in JSON don't terminate early.
    return `  {% if ${prop.key} %}${attrName}='{{ ${prop.key}|json_encode|raw }}'{% endif %}`;
  }
  return `  {% if ${prop.key} %}${attrName}="{{ ${prop.key} }}"{% endif %}`;
}

interface SyncResult {
  component: string;
  changed: boolean;
  skipped?: 'no-yaml' | 'no-twig';
}

async function syncComponent(name: string): Promise<SyncResult> {
  const slug = name.replace(/^civ-/, '');
  const yamlPath = join(ROOT, 'packages/drupal/civui/components', slug, `${slug}.component.yml`);
  const twigPath = join(ROOT, 'packages/drupal/civui/components', slug, `${slug}.twig`);
  if (!existsSync(yamlPath)) return { component: name, changed: false, skipped: 'no-yaml' };
  if (!existsSync(twigPath)) return { component: name, changed: false, skipped: 'no-twig' };

  const yamlProps = parseSdcProps(yamlPath);
  const yamlSlots = parseSdcSlots(yamlPath);
  const schemaAttrs = await loadSchemaAttributes(name);

  const tag = name; // civ-text-input, etc.
  const lines: string[] = [`<${tag}`];
  for (const prop of yamlProps) {
    const attrName = htmlAttrFor(prop.key, schemaAttrs);
    lines.push(renderTwigLine(prop, attrName));
  }
  if (yamlSlots.length === 0) {
    // Self-closing-style: render the closing tag immediately after the
    // attribute block. Drupal SDC convention writes it as `></tag>` on
    // its own line for diffability.
    lines.push(`></${tag}>`);
  } else {
    lines.push('>');
    for (const slot of yamlSlots) {
      lines.push(`  {% block ${slot} %}{{ ${slot} }}{% endblock %}`);
    }
    lines.push(`</${tag}>`);
  }
  lines.push(''); // trailing newline
  const newTwig = lines.join('\n');

  const existing = readFileSync(twigPath, 'utf-8');
  if (existing === newTwig) return { component: name, changed: false };
  if (!DRY_RUN) writeFileSync(twigPath, newTwig);
  return { component: name, changed: true };
}

async function main() {
  let changed = 0;
  for (const name of COMPONENTS) {
    const r = await syncComponent(name);
    if (r.skipped) {
      console.log(`⚠  ${name}: ${r.skipped}`);
      continue;
    }
    if (r.changed) {
      changed++;
      console.log(`✗  ${name}: regenerated`);
    } else {
      console.log(`✓  ${name} (already in sync)`);
    }
  }
  console.log(`\n${DRY_RUN ? '[dry-run] would update' : 'updated'} ${changed} twig template(s).`);
}

if (isCliInvocation()) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
