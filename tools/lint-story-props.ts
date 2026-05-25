#!/usr/bin/env tsx
/**
 * lint-story-props — flag attribute uses in .stories.ts files that
 * don't correspond to a declared @property on the underlying CivUI
 * component.
 *
 * Catches the silently-broken cases surfaced by the form-patterns audit:
 *   • `add-label="..."` on civ-repeater (no such prop)
 *   • `preset="document-type"` on civ-select (preset value doesn't exist)
 *   • `back-label` argType on civ-form-step (phantom control)
 *   • `<civ-progress-bar>` (custom element doesn't exist)
 *
 * Approach
 * --------
 * 1. Build a map of `civ-*` tag → declared @property attribute names
 *    by scanning every TS source under packages/* / src/.
 * 2. Walk every *.stories.ts (excluding *.drupal.stories.ts) and pull
 *    out every `<civ-name attr1 attr2="...">` occurrence inside
 *    html`` template literals. For each attribute, compare to the
 *    component's known prop set.
 * 3. Tolerate:
 *    - lit-html sigils: `?required`, `.options`, `@civ-input`
 *    - standard HTML attributes: id, class, style, title, role,
 *      tabindex, slot, aria-* prefix, data-* prefix
 *    - story-only meta: civui-presets that consumers commonly use
 *
 * Output: lines like `civ-repeater: 'add-label' (used at packages/.../...stories.ts:48)`.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface ComponentMeta {
  tag: string;
  attrs: Set<string>;
}

interface Finding {
  tag: string;
  attr: string;
  file: string;
  line: number;
  context: string;
}

const STANDARD_HTML_ATTRS = new Set([
  'id', 'class', 'style', 'title', 'role', 'tabindex', 'slot', 'lang',
  'autofocus', 'hidden',
  // Test/instrumentation
  'data-testid',
]);

const STORYBOOK_FRAMEWORK_ATTRS = new Set([
  // None — Storybook doesn't inject attrs into rendered HTML
]);

function isStandardAttr(attr: string): boolean {
  if (STANDARD_HTML_ATTRS.has(attr)) return true;
  if (attr.startsWith('aria-')) return true;
  if (attr.startsWith('data-')) return true;
  if (STORYBOOK_FRAMEWORK_ATTRS.has(attr)) return true;
  return false;
}

async function walk(dir: string, predicate: (p: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  async function visit(d: string) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.turbo' || e.name === 'build') continue;
        await visit(p);
      } else if (e.isFile() && predicate(p)) {
        out.push(p);
      }
    }
  }
  await visit(dir);
  return out;
}

const CUSTOM_ELEMENT_TAG_RE = /@customElement\(['"]([^'"]+)['"]\)/g;
const PROPERTY_RE = /@property\(([\s\S]*?)\)[\s\S]*?(?:\s|^)([a-zA-Z_][\w]*)\s*[!?]?\s*[=:]/g;
// Accessor form: `@property(...) get name()` / `@property(...) set name()` /
// `@property(...) accessor name = ...`. The default PROPERTY_RE looks for
// `NAME =`/`NAME:` which doesn't match a getter declaration; without this
// supplement, a component using a manual reactive accessor would have its
// `name` property silently missing from the attrs set.
//
// The options group `(?:[^()]|\([^()]*\))*?` allows one level of nested
// parens so arrow-function converters (e.g. `converter: { fromAttribute:
// (v) => ... }`) don't make the engine backtrack across adjacent
// @property blocks. A flat `[^()]*?` would silently skip such
// declarations and drop the accessor from the attrs set.
const PROPERTY_ACCESSOR_RE = /@property\(((?:[^()]|\([^()]*\))*?)\)\s*(?:get|set|accessor)\s+([a-zA-Z_][\w]*)\b/g;
const ATTRIBUTE_OPT_RE = /attribute:\s*['"]([^'"]+)['"]/;
const ATTRIBUTE_DISABLED_RE = /attribute:\s*false/;

async function buildComponentMap(): Promise<Map<string, ComponentMeta>> {
  // Include .stories.ts files — a handful of stories define one-off demo
  // custom elements (e.g. civ-icon-editor) in the same file.
  const tsFiles = await walk(PACKAGES_DIR, p =>
    p.endsWith('.ts') && !p.endsWith('.test.ts') && !p.includes('/dist/'),
  );
  const map = new Map<string, ComponentMeta>();
  for (const file of tsFiles) {
    const src = await fs.readFile(file, 'utf8');
    const tagMatches = [...src.matchAll(CUSTOM_ELEMENT_TAG_RE)];
    if (tagMatches.length === 0) continue;

    // For files declaring one custom element, attach every @property
    // declaration in the file to it. This is fine because each
    // component lives in its own file by convention.
    const attrs = new Set<string>();

    // Inherited bases — seed prop sets for the known base classes.
    // Every CivUI custom element extends CivBaseElement, which exposes
    // disable-analytics.
    const BASE_RE = /\b(CivBaseElement|CivFormElement|CivBooleanFormElement|CivCompoundElement|PresetInputWrapper)\b/;
    if (BASE_RE.test(src)) {
      attrs.add('disable-analytics');
    }
    // CivFormElement and anything that walks through it carry the
    // standard form-control chrome attrs.
    const FORM_BASE_RE = /\b(CivFormElement|CivBooleanFormElement|CivCompoundElement|PresetInputWrapper)\b/;
    if (FORM_BASE_RE.test(src)) {
      for (const a of ['name', 'value', 'disabled', 'required', 'readonly', 'error', 'hint', 'label', 'required-message', 'touched', 'hide-required-indicator']) {
        attrs.add(a);
      }
    }
    // CivBooleanFormElement adds checked + description + extra-describedby.
    if (/\bCivBooleanFormElement\b/.test(src)) {
      for (const a of ['checked', 'description', 'extra-describedby']) {
        attrs.add(a);
      }
    }
    // LegendHeadingMixin adds heading-level + size on top of whatever it wraps.
    if (/\bLegendHeadingMixin\b/.test(src)) {
      attrs.add('heading-level');
      attrs.add('size');
    }
    // LoadingMixin adds the loading + loading-label props (used by every
    // button-shaped component: civ-button, civ-action-button,
    // civ-text-button — and any future button that wraps it).
    if (/\bLoadingMixin\b/.test(src)) {
      attrs.add('loading');
      attrs.add('loading-label');
    }
    // PresetInputWrapper forwards every civ-text-input prop to its inner
    // child — preset wrappers can accept any text-input attribute. The
    // simplest correct behavior is to also seed the text-input attrs.
    if (/\bPresetInputWrapper\b/.test(src)) {
      for (const a of [
        'type', 'placeholder', 'pattern', 'maxlength', 'minlength',
        'autocomplete', 'inputmode', 'mask', 'mask-pattern', 'mask-mode',
        'validate', 'prefix', 'suffix', 'clearable',
        'leading-icon', 'trailing-icon', 'leading-icon-label', 'trailing-icon-label',
        'hide-char-count', 'width', 'autofocus',
      ]) {
        attrs.add(a);
      }
    }

    for (const m of src.matchAll(PROPERTY_RE)) {
      const options = m[1] ?? '';
      if (ATTRIBUTE_DISABLED_RE.test(options)) continue; // JS-only property
      const explicit = ATTRIBUTE_OPT_RE.exec(options);
      const propName = m[2];
      if (!propName) continue;
      const attrName = explicit ? explicit[1] : propName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      attrs.add(attrName);
    }
    for (const m of src.matchAll(PROPERTY_ACCESSOR_RE)) {
      const options = m[1] ?? '';
      if (ATTRIBUTE_DISABLED_RE.test(options)) continue;
      const explicit = ATTRIBUTE_OPT_RE.exec(options);
      const propName = m[2];
      if (!propName) continue;
      const attrName = explicit ? explicit[1] : propName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      attrs.add(attrName);
    }

    for (const tagMatch of tagMatches) {
      const tag = tagMatch[1];
      if (map.has(tag)) {
        // Merge with any existing record (shouldn't happen, but be safe)
        const existing = map.get(tag)!;
        for (const a of attrs) existing.attrs.add(a);
      } else {
        map.set(tag, { tag, attrs: new Set(attrs) });
      }
    }
  }
  return map;
}

// Strip lit-html sigils from attribute names: `?required` → `required`,
// `.options` → null (property binding, not an HTML attr), `@click` → null.
function normaliseAttrName(raw: string): string | null {
  if (raw.startsWith('.')) return null;   // property binding — skip
  if (raw.startsWith('@')) return null;   // event listener — skip
  if (raw.startsWith('?')) return raw.slice(1).toLowerCase();
  return raw.toLowerCase();
}

const TAG_OPEN_RE = /<(civ-[a-z][a-z0-9-]*)([\s\S]*?)(?<!=)\/?>/g;

/** Extract attribute names from an opening-tag attribute chunk, skipping
 *  over quoted values, lit-html ${...} expressions, and the `=` operator. */
function extractAttrNames(chunk: string): string[] {
  const names: string[] = [];
  let i = 0;
  while (i < chunk.length) {
    const c = chunk[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' || c === '>') break;

    // Read attribute name
    const nameStart = i;
    while (i < chunk.length && !/[\s=/>]/.test(chunk[i])) i++;
    const name = chunk.slice(nameStart, i);
    if (name) names.push(name);

    // Skip whitespace before optional '='
    while (i < chunk.length && /\s/.test(chunk[i])) i++;
    if (chunk[i] !== '=') continue;
    i++; // consume '='
    while (i < chunk.length && /\s/.test(chunk[i])) i++;

    // Skip the value (quoted or lit-html ${...} bare)
    const q = chunk[i];
    if (q === '"' || q === "'") {
      i++;
      while (i < chunk.length && chunk[i] !== q) {
        if (chunk[i] === '$' && chunk[i + 1] === '{') {
          // Skip balanced ${ ... }
          i += 2;
          let depth = 1;
          while (i < chunk.length && depth > 0) {
            if (chunk[i] === '{') depth++;
            else if (chunk[i] === '}') depth--;
            i++;
          }
        } else {
          i++;
        }
      }
      i++; // closing quote
    } else if (q === '$' && chunk[i + 1] === '{') {
      i += 2;
      let depth = 1;
      while (i < chunk.length && depth > 0) {
        if (chunk[i] === '{') depth++;
        else if (chunk[i] === '}') depth--;
        i++;
      }
    } else {
      // Unquoted value — read to whitespace or '>'
      while (i < chunk.length && !/[\s/>]/.test(chunk[i])) i++;
    }
  }
  return names;
}

async function lintStories(componentMap: Map<string, ComponentMeta>): Promise<Finding[]> {
  const stories = await walk(PACKAGES_DIR, p => p.endsWith('.stories.ts') && !p.includes('.drupal.'));
  const findings: Finding[] = [];

  for (const file of stories) {
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split('\n');

    for (const tagMatch of src.matchAll(TAG_OPEN_RE)) {
      const tag = tagMatch[1];
      const meta = componentMap.get(tag);
      if (!meta) {
        // Unknown civ-* tag — flag as a missing custom element.
        const offset = tagMatch.index ?? 0;
        const lineNumber = src.slice(0, offset).split('\n').length;
        findings.push({
          tag,
          attr: '<unknown element>',
          file: path.relative(REPO_ROOT, file),
          line: lineNumber,
          context: lines[lineNumber - 1]?.trim().slice(0, 100) ?? '',
        });
        continue;
      }

      const attrChunk = tagMatch[2];
      const attrNames = extractAttrNames(attrChunk);
      for (const raw of attrNames) {
        const name = normaliseAttrName(raw);
        if (!name) continue;
        if (isStandardAttr(name)) continue;
        if (meta.attrs.has(name)) continue;

        const offset = tagMatch.index ?? 0;
        const lineNumber = src.slice(0, offset).split('\n').length;
        findings.push({
          tag,
          attr: name,
          file: path.relative(REPO_ROOT, file),
          line: lineNumber,
          context: lines[lineNumber - 1]?.trim().slice(0, 100) ?? '',
        });
      }
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const componentMap = await buildComponentMap();
  const findings = await lintStories(componentMap);

  if (findings.length === 0) {
    console.log(`✓ All story <civ-*> attributes resolve to declared @property attributes.`);
    return;
  }

  // Group by tag + attr for readability.
  const grouped = new Map<string, Finding[]>();
  for (const f of findings) {
    const key = `${f.tag}::${f.attr}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(f);
  }

  console.error(`✗ ${findings.length} unknown attribute use(s) across ${grouped.size} <tag, attr> pair(s):\n`);
  for (const [key, list] of grouped) {
    const [tag, attr] = key.split('::');
    console.error(`  <${tag}> ${attr}  (${list.length} use${list.length === 1 ? '' : 's'})`);
    for (const f of list.slice(0, 3)) {
      console.error(`    ${f.file}:${f.line}`);
      console.error(`      ${f.context}`);
    }
    if (list.length > 3) console.error(`    … and ${list.length - 3} more`);
    console.error('');
  }
  printRuleLink('story-props');
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
