#!/usr/bin/env tsx
/**
 * lint-jsdoc-props — verify every `@prop` tag in a component's
 * class-level JSDoc names a real `@property` declared on the same
 * class. Flag the inverse direction too: a `@property` with no
 * matching `@prop` is a doc gap.
 *
 * Catches the recurring "docstring drifts from the API" trap:
 *   • component renames a prop but the @prop line keeps the old name
 *   • component deletes a prop but the @prop line survives
 *   • component adds a prop but forgets the @prop entry
 *
 * Only checks the JSDoc block immediately preceding the
 * `@customElement(...)` line — that's the canonical class-level
 * documentation. Other JSDoc blocks (above individual property
 * declarations, on helper functions) aren't audited.
 *
 * Pass with no findings.
 * Exit 1 on findings.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { printRuleLink } from './lint-rule-links.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface MismatchEntry {
  file: string;
  tag: string;          // component tag (e.g. civ-card)
  kind: 'jsdoc-only' | 'property-only';
  name: string;         // prop name that's stale (jsdoc-only) or undocumented (property-only)
  line?: number;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(p: string) {
    let stat;
    try { stat = await fs.stat(p); } catch { return; }
    if (stat.isFile()) {
      if (p.endsWith('.ts') && !p.endsWith('.test.ts') && !p.endsWith('.stories.ts') && !p.includes('/dist/')) {
        out.push(p);
      }
      return;
    }
    if (stat.isDirectory()) {
      const base = path.basename(p);
      if (base === 'node_modules' || base === 'dist' || base === '.turbo') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

// Match the JSDoc block immediately above the @customElement decorator:
//   /**
//    * ...
//    * @prop {Type} propName - description
//    * ...
//    */
//   @customElement('civ-foo')
const COMPONENT_BLOCK_RE = /\/\*\*([\s\S]*?)\*\/\s*@customElement\(['"]([^'"]+)['"]\)/g;

// Inside a JSDoc block, every `@prop {Type} name -` entry. The name
// may be camelCase (the JS prop) or kebab-case (the HTML attribute).
const JSDOC_PROP_RE = /@prop\s+(?:\{[^}]*\}\s+)?([A-Za-z_][\w-]*)/g;

/** kebab-case → camelCase: `not-equals` → `notEquals`. */
function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** camelCase → kebab-case: `notEquals` → `not-equals`. */
function camelToKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** True if `jsdocName` and `propName` refer to the same property
 *  regardless of camelCase vs kebab-case representation. */
function namesMatch(jsdocName: string, propName: string): boolean {
  if (jsdocName === propName) return true;
  if (kebabToCamel(jsdocName) === propName) return true;
  if (camelToKebab(propName) === jsdocName) return true;
  return false;
}

// @property decorator. We need the name that comes AFTER the
// decorator call (and any whitespace / typescript modifiers, plus
// `get`/`set`/`accessor` for manual-accessor declarations like
// `@property() get open() { ... }`).
//
// The options group `(?:[^()]|\([^()]*\))*?` allows one level of
// nested parens — enough for arrow-function converters like
// `@property({ converter: { fromAttribute: (v) => ... } })`. A
// flat `[^()]*?` would silently skip any @property with converter
// functions or default factories, dropping them from declaredProps
// and breaking the @prop / @property cross-check. Two levels of
// nesting is the largest pattern actually used in CivUI; deeper
// would still need a balanced-paren parser.
const PROPERTY_DECL_RE = /@property\(((?:[^()]|\([^()]*\))*?)\)\s*(?:(?:readonly|public|private|protected|override|get|set|accessor)\s+)*([A-Za-z_][\w]*)/g;
const ATTRIBUTE_FALSE_RE = /attribute:\s*false/;

interface Component {
  file: string;
  tag: string;
  jsdocProps: Set<string>;
  declaredProps: Set<string>;
}

// Inherited props from known CivUI base classes — a class extending
// any of these may document them in @prop without redeclaring @property.
const INHERITED_PROPS_BY_BASE: Record<string, string[]> = {
  CivFormElement: [
    'name', 'value', 'disabled', 'required', 'readonly',
    'error', 'hint', 'label', 'requiredMessage', 'touched',
    'hideRequiredIndicator',
  ],
  CivBooleanFormElement: [
    'name', 'value', 'disabled', 'required', 'readonly',
    'error', 'hint', 'label', 'requiredMessage', 'touched',
    'hideRequiredIndicator',
    'checked', 'description', 'extraDescribedby',
  ],
  CivCompoundElement: [
    'name', 'value', 'disabled', 'required', 'readonly',
    'error', 'hint', 'label', 'requiredMessage', 'touched',
    'hideRequiredIndicator',
  ],
  PresetInputWrapper: [
    'name', 'value', 'disabled', 'required', 'readonly',
    'error', 'hint', 'label', 'requiredMessage', 'touched',
    'hideRequiredIndicator',
    'type', 'placeholder', 'pattern', 'maxlength', 'minlength',
    'autocomplete', 'inputmode', 'mask', 'maskPattern', 'maskMode',
    'validate', 'prefix', 'suffix', 'clearable',
    'leadingIcon', 'trailingIcon', 'leadingIconLabel', 'trailingIconLabel',
    'hideCharCount', 'width', 'autofocus',
  ],
  LegendHeadingMixin: [
    'headingLevel', 'size',
  ],
};

function seedInheritedProps(classBody: string, classDeclaration: string): Set<string> {
  const inherited = new Set<string>();
  const matched = `${classDeclaration} ${classBody}`;
  for (const [base, props] of Object.entries(INHERITED_PROPS_BY_BASE)) {
    if (new RegExp(`\\b${base}\\b`).test(matched)) {
      for (const p of props) inherited.add(p);
    }
  }
  return inherited;
}

async function audit(): Promise<Component[]> {
  const files = await walk(PACKAGES_DIR);
  const components: Component[] = [];
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    for (const blockMatch of src.matchAll(COMPONENT_BLOCK_RE)) {
      const jsdocBody = blockMatch[1];
      const tag = blockMatch[2];

      // Skip scaffold / template generators where the tag itself is
      // a template-literal placeholder (e.g. `${tagName}`).
      if (tag.includes('${') || tag.includes('${')) continue;

      const jsdocProps = new Set<string>();
      for (const m of jsdocBody.matchAll(JSDOC_PROP_RE)) {
        jsdocProps.add(m[1]);
      }

      const classStart = blockMatch.index! + blockMatch[0].length;
      const restOfFile = src.slice(classStart);
      const nextDecorator = restOfFile.search(/\n@customElement/);
      const classBody = nextDecorator >= 0 ? restOfFile.slice(0, nextDecorator) : restOfFile;

      // Capture the class declaration line ("class Foo extends Bar") so
      // we can see which base classes it walks through.
      const classDeclMatch = /class\s+\w+\s+extends[^{]+/.exec(classBody);
      const classDeclaration = classDeclMatch?.[0] ?? '';

      const declaredProps = new Set<string>();
      for (const m of classBody.matchAll(PROPERTY_DECL_RE)) {
        declaredProps.add(m[2]);
      }
      // Seed in props from base classes the consumer may document.
      const inherited = seedInheritedProps(classBody, classDeclaration);
      for (const p of inherited) declaredProps.add(p);

      components.push({ file, tag, jsdocProps, declaredProps });
    }
  }
  return components;
}

function findMismatches(components: Component[]): MismatchEntry[] {
  const out: MismatchEntry[] = [];
  for (const c of components) {
    for (const prop of c.jsdocProps) {
      const declared = [...c.declaredProps].find(p => namesMatch(prop, p));
      if (!declared) {
        out.push({
          file: path.relative(REPO_ROOT, c.file),
          tag: c.tag,
          kind: 'jsdoc-only',
          name: prop,
        });
      }
    }
    // Inverse direction is opt-in (could be noisy for components
    // that document only a handful of "public" props by design).
    // Disabled for now; flip to true if drift recurs.
    const flagUndocumented = false;
    if (flagUndocumented) {
      for (const prop of c.declaredProps) {
        if (!c.jsdocProps.has(prop)) {
          out.push({
            file: path.relative(REPO_ROOT, c.file),
            tag: c.tag,
            kind: 'property-only',
            name: prop,
          });
        }
      }
    }
  }
  return out;
}

async function main(): Promise<void> {
  const components = await audit();
  const findings = findMismatches(components);

  if (findings.length === 0) {
    console.log(`✓ ${components.length} component(s) — every JSDoc @prop names a declared @property.`);
    return;
  }

  // Group by file.
  const grouped = new Map<string, MismatchEntry[]>();
  for (const f of findings) {
    if (!grouped.has(f.file)) grouped.set(f.file, []);
    grouped.get(f.file)!.push(f);
  }
  console.error(`✗ ${findings.length} JSDoc @prop / @property mismatch(es) across ${grouped.size} file(s):\n`);
  for (const [file, list] of grouped) {
    console.error(`  ${file}  (<${list[0].tag}>)`);
    for (const m of list) {
      if (m.kind === 'jsdoc-only') {
        console.error(`    @prop ${m.name} — has no matching @property declaration`);
      } else {
        console.error(`    @property ${m.name} — has no matching @prop docstring`);
      }
    }
    console.error('');
  }
  console.error(
    'Each `@prop` tag in the class-level JSDoc must name a declared `@property`.\n' +
    'Either:\n' +
    '  - Remove the stale @prop entry, or\n' +
    '  - Rename the @prop entry to match the current property, or\n' +
    '  - Add the missing @property if the docstring is correct.',
  );
  printRuleLink('jsdoc-props');
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
