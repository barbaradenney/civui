#!/usr/bin/env tsx
/**
 * lint-dead-properties — fail when a Lit `@property` is declared on a
 * component but never read inside the same class.
 *
 * The class of bug this catches (commit 55834c14):
 *
 *   `civ-form-fieldset` declared `requiredMessage` with full attribute
 *   binding and documentation, but the render() method never read it.
 *   Consumers passing `required-message="..."` saw their value
 *   silently ignored. The prop appeared in the schema, the AI guide
 *   description, the docs comparison table — all claiming it worked.
 *   It didn't.
 *
 * To prevent: for each `@property(...)` declaration in a component
 * source file, the field name MUST be referenced via `this.fieldName`
 * somewhere else in the same file. Reading in render(), in lifecycle
 * hooks, in event handlers, in template literals — anything counts as
 * a use. Pure writes (`this.foo = x` with no later read) would still
 * be flagged, but in practice every CivUI prop is either read in
 * render or in a method.
 *
 * False-positive risk: some inherited props (e.g. `disabled` on
 * CivFormElement subclasses) are read by the base class, not by the
 * subclass. Those redeclarations are typically there to document the
 * prop API for that specific component — the lint accepts those by
 * default if the prop name matches a known base-class field.
 *
 * Scope: TypeScript source under packages/, excluding tests and
 * stories. Properties whose backing field is referenced only in
 * tests don't count for this lint (the contract is "the component
 * reads its own prop").
 *
 * Usage: pnpm lint:dead-properties
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');

const SOURCE_ROOTS = ['packages'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'storybook-static', '.next', '.turbo', '__audit__']);
const SOURCE_EXTS = new Set(['.ts', '.tsx']);

// Properties inherited from these base classes are managed by the
// base class itself — subclasses that redeclare them for
// documentation purposes don't need to read them locally.
const INHERITED_PROPS = new Set<string>([
  // CivBaseElement / CivFormElement / CivBooleanFormElement / PresetInputWrapper
  'label', 'legend', 'name', 'value', 'hint', 'error', 'required', 'disabled',
  'readonly', 'touched', 'requiredMessage', 'autocomplete', 'placeholder',
  // LegendHeadingMixin
  'headingLevel', 'size',
]);

/**
 * Known unread `@property` declarations, keyed `ClassName.propName`.
 * Each entry should be either resolved (prop implemented or removed)
 * or a deliberate external-API contract that doesn't need internal
 * use. Keep this list small — items here are silent contract drift
 * waiting to escape.
 */
const KNOWN_UNREAD_PROPS = new Map<string, string>([
  // civ-form action/method are JSDoc'd as "for reference" — external
  // API hooks consumers read (e.g. for form-action routing). The
  // component itself submits via the civ-submit event with the
  // consumer's own handler.
  ['CivForm.action', 'External-only API hook'],
  ['CivForm.method', 'External-only API hook'],
  // hide-required-indicator is meant to suppress the "(required)"
  // mark on form fields whose required state is owned by a parent
  // compound (e.g. memorable-date renders the asterisk once on its
  // own legend and tells the child month/day/year inputs to hide
  // theirs). Declared in CivFormElement and set on memorable-date
  // children via `?hide-required-indicator`, but nothing reads it —
  // the wiring into renderLabel was never landed.
  // TODO: thread `showRequired: this.required && !this.hideRequiredIndicator`
  // into renderFormHeader and renderLabel calls, then drop this entry.
  ['CivFormElement.hideRequiredIndicator', 'TODO: wire into renderLabel via showRequired'],
  // Schema declares conditional country rendering
  // ({ condition: 'showCountry', name: 'country' }), but the
  // implementation always renders the country selector. Tests
  // currently match the implementation; the schema is the drifter.
  // TODO: align schema, implementation, and tests on one behavior.
  ['CivAddress.showCountry', 'TODO: resolve schema vs. implementation drift'],
]);

interface DeadProp {
  file: string;
  className: string;
  propName: string;
  attribute?: string;
}

function* walk(path: string): Generator<string> {
  let stat;
  try { stat = statSync(path); } catch { return; }
  if (stat.isFile()) { yield path; return; }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(join(path, entry));
  }
}

/**
 * Parse `@property(...) fieldName` declarations from a TS file and
 * return them paired with the enclosing class name.
 *
 * The pattern we look for, ignoring whitespace:
 *
 *   @property(... maybe-multiline ...)
 *   FIELDNAME: TYPE = INITIAL;     // typed
 *   FIELDNAME = INITIAL;            // untyped
 *   FIELDNAME?: TYPE;               // optional, no initial
 *
 * Class names come from the nearest preceding
 * `@customElement(...) ... class CivXxxx ...` block.
 */
export function findDeclaredProps(text: string): Array<{ className: string; propName: string; attribute?: string; reflects?: boolean }> {
  const props: Array<{ className: string; propName: string; attribute?: string; reflects?: boolean }> = [];
  // Track current class via a streaming scan of class declarations.
  // Find every `class Civ... extends` location, then for each
  // `@property(...)` decorator that appears between this class's
  // opening brace and the next class declaration, capture the field.
  const classRe = /(?:^|\n)\s*(?:export\s+)?class\s+([A-Z][A-Za-z0-9_]*)\s+(?:extends\s+[A-Z][A-Za-z0-9_<>(),\s]*\s+)?\{/g;
  const classes: Array<{ name: string; start: number; end: number }> = [];
  for (const m of text.matchAll(classRe)) {
    classes.push({ name: m[1], start: m.index! + m[0].length, end: text.length });
  }
  // Cap each class's end at the start of the next class.
  for (let i = 0; i < classes.length - 1; i++) {
    classes[i].end = classes[i + 1].start;
  }
  // Find every `@property(...)` in each class range. We need to
  // balance parens because converter / hasChanged options often
  // include arrow-function parameter lists with their own `(...)`.
  for (const cls of classes) {
    const body = text.slice(cls.start, cls.end);
    let i = 0;
    while (i < body.length) {
      const start = body.indexOf('@property', i);
      if (start < 0) break;
      // Walk past `@property` to the opening `(`.
      let j = start + '@property'.length;
      while (j < body.length && /\s/.test(body[j])) j++;
      if (body[j] !== '(') { i = j; continue; }
      // Balance parens until we match the opening.
      let depth = 1;
      const argsStart = j + 1;
      j++;
      while (j < body.length && depth > 0) {
        const c = body[j];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        // Skip string literals so parens inside don't confuse us.
        else if (c === '"' || c === "'" || c === '`') {
          const quote = c;
          j++;
          while (j < body.length && body[j] !== quote) {
            if (body[j] === '\\') j++;
            j++;
          }
        }
        j++;
      }
      const decoratorArgs = body.slice(argsStart, j - 1);
      // Skip whitespace + optional `?` after the `)` to reach the field name.
      while (j < body.length && /\s/.test(body[j])) j++;
      const nameMatch = body.slice(j).match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      i = j + (nameMatch ? nameMatch[0].length : 1);
      if (!nameMatch) continue;
      const propName = nameMatch[1];
      const attrMatch = decoratorArgs.match(/attribute\s*:\s*['"]([^'"]+)['"]/);
      const attribute = attrMatch ? attrMatch[1] : undefined;
      // `reflect: true` props mirror their value to the DOM attribute,
      // which is then read by CSS attribute selectors or by consumer
      // JS. The component itself doesn't need to read the field for
      // the prop to have an effect, so skip these.
      const reflects = /\breflect\s*:\s*true\b/.test(decoratorArgs);
      props.push({ className: cls.name, propName, attribute, reflects });
    }
  }
  return props;
}

/**
 * Return true when `propName` is referenced in `text` outside its
 * own @property declaration. We require a `this.propName` reference
 * (with a word boundary after the name) — covers reads in render(),
 * lifecycle hooks, methods, template literals.
 */
export function isPropReadInClass(text: string, propName: string): boolean {
  // Build a regex that matches `this.propName` not followed by another
  // identifier character. `[^A-Za-z0-9_]` matches end-of-name boundary.
  const escaped = propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\bthis\\.${escaped}(?![A-Za-z0-9_])`, 'g');
  const matches = [...text.matchAll(re)];
  // Strict requirement: we need at least one `this.propName` reference.
  // (The @property decorator does NOT use `this.` — it's a decorator
  // on the class field. So decorator usages don't count.)
  return matches.length > 0;
}

export interface LintResult {
  dead: DeadProp[];
  filesScanned: number;
  propsScanned: number;
}

export function runLint(): LintResult {
  const dead: DeadProp[] = [];
  let filesScanned = 0;
  let propsScanned = 0;
  for (const root of SOURCE_ROOTS) {
    for (const file of walk(join(ROOT, root))) {
      if (!SOURCE_EXTS.has(extname(file))) continue;
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
      if (file.endsWith('.stories.ts')) continue;
      filesScanned++;
      const text = readFileSync(file, 'utf-8');
      // Only inspect files that actually declare custom elements.
      if (!/@customElement\(/.test(text) && !/extends\s+(Civ[A-Z][A-Za-z0-9_]*|LightDom|LegendHeading|PresetInput)/.test(text)) {
        continue;
      }
      const props = findDeclaredProps(text);
      for (const p of props) {
        propsScanned++;
        if (INHERITED_PROPS.has(p.propName)) continue;
        if (p.reflects) continue; // reflect:true props have an external CSS/JS purpose
        if (KNOWN_UNREAD_PROPS.has(`${p.className}.${p.propName}`)) continue;
        if (isPropReadInClass(text, p.propName)) continue;
        dead.push({ file, className: p.className, propName: p.propName, attribute: p.attribute });
      }
    }
  }
  dead.sort((a, b) => a.file.localeCompare(b.file) || a.propName.localeCompare(b.propName));
  return { dead, filesScanned, propsScanned };
}

function main(): number {
  const { dead, filesScanned, propsScanned } = runLint();
  if (dead.length === 0) {
    console.log(`✓ ${propsScanned} @property declarations across ${filesScanned} component files — every one is read inside its class.`);
    return 0;
  }
  console.log(`✗ ${dead.length} @property declaration(s) appear to be dead (declared but never read via this.fieldName).\n`);
  console.log('Declared-but-unused props are silent contract drift — consumers see the');
  console.log('attribute in docs/schema and assume it works, but setting it does nothing.');
  console.log('Fix by either reading the field in render()/methods or removing the prop.');
  console.log('If the prop is read only by an inherited base class, add the field name to');
  console.log('INHERITED_PROPS in tools/lint-dead-properties.ts.\n');
  for (const d of dead) {
    const rel = relative(ROOT, d.file);
    const attr = d.attribute ? `  [attribute: ${d.attribute}]` : '';
    console.log(`  ${d.className}.${d.propName}${attr}  (${rel})`);
  }
  return 1;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try { return import.meta.url === pathToFileURL(argv).href; }
  catch { return false; }
}

if (isCliInvocation()) process.exit(main());
