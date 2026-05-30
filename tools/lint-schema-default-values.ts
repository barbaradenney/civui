#!/usr/bin/env tsx
/**
 * lint-schema-default-values — a schema prop's `default` must match the
 * default declared in the iOS (Swift) and Android (Kotlin) counterparts.
 *
 * Why
 * ---
 * `pnpm parity:schema` validates prop *names* across platforms and
 * `lint:schema-enum-values` validates enum *value sets* against the Lit
 * source — but neither compares *default values* across platforms. So a
 * native counterpart can declare a different default than the schema
 * documents and the drift ships silently. The 2026-05 combobox audit
 * found exactly this: schema `minQueryLength` default `0` ("load on
 * first focus"), but both Swift and Kotlin defaulted to `1` — an
 * off-by-one a consumer relying on the documented behavior would hit.
 *
 * What this lints
 * ---------------
 * For every component in `COVERED_COMPONENTS` (tools/schema-parity.ts)
 * with an iOS / Android source, for every schema prop that declares a
 * **scalar literal** `default` (string / number / boolean):
 *   - find the matching native init / composable parameter (via the
 *     same name-normalization the parity gate uses — iOS `is`-prefix,
 *     `type`→`inputType`, HTML-attr→camelCase, etc.);
 *   - extract that parameter's default literal;
 *   - compare.
 *
 * Deliberately conservative — only compares when BOTH sides are scalar
 * literals, so it never false-positives on:
 *   - `webOnly` schema props (skipped — no native counterpart);
 *   - non-literal native defaults (`nil`, `null`, `CivLocale.t(...)`,
 *     `emptyList()`, `Modifier`, computed expressions);
 *   - array / object schema defaults;
 *   - props the native file doesn't declare, or declares without a
 *     default.
 *
 * Caught by: `pnpm lint:schema-default-values`. Wired into
 * `pnpm validate:lints` and the drift-lints CI gate.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { iosPropAlternatives, androidPropAlternatives } from './schema-parity.js';

const ROOT = join(import.meta.dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'packages/schema/src/components');

export type Literal =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean };

export interface DefaultFinding {
  component: string;
  platform: 'iOS' | 'Android';
  prop: string;
  nativeName: string;
  schemaDefault: string;
  nativeDefault: string;
}

/**
 * Classify a schema `default` value into a comparable literal, or null
 * if it's not a scalar (array / object / undefined).
 */
export function classifySchemaDefault(def: unknown): Literal | null {
  if (typeof def === 'string') return { kind: 'string', value: def };
  if (typeof def === 'number') return { kind: 'number', value: def };
  if (typeof def === 'boolean') return { kind: 'boolean', value: def };
  return null;
}

/**
 * Classify a raw native default expression (the text after `=` in a
 * Swift init param or a Kotlin composable param) into a comparable
 * literal, or null if it isn't a plain scalar literal. Anything that
 * isn't a quoted string, a number, or `true`/`false` — `nil`, `null`,
 * `emptyList()`, `Modifier`, `CivLocale.t(...)`, etc. — returns null
 * so the comparison is skipped (never a false positive).
 */
export function classifyNativeDefault(raw: string): Literal | null {
  const s = raw.trim();
  if (!s) return null;
  const str = s.match(/^"([^"]*)"$|^'([^']*)'$/);
  if (str) return { kind: 'string', value: str[1] ?? str[2] ?? '' };
  if (s === 'true' || s === 'false') return { kind: 'boolean', value: s === 'true' };
  // Number: optional minus, digits, optional fraction. Tolerate a
  // trailing Kotlin/Swift suffix-free literal only (no `0L`, `0.0f`).
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return { kind: 'number', value: Number(s) };
  return null;
}

export function literalsEqual(a: Literal, b: Literal): boolean {
  if (a.kind === 'number' && b.kind === 'number') return a.value === b.value;
  // Allow a schema number default to match a native string default that
  // is numerically equal (e.g. schema 2 ↔ native "2") — and vice versa —
  // since some props are typed string on one side, number on the other.
  if (a.kind !== b.kind) {
    const an = a.kind === 'number' ? a.value : a.kind === 'string' ? Number(a.value) : NaN;
    const bn = b.kind === 'number' ? b.value : b.kind === 'string' ? Number(b.value) : NaN;
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an === bn;
    return false;
  }
  return a.value === b.value;
}

export function literalToString(lit: Literal): string {
  return lit.kind === 'string' ? JSON.stringify(lit.value) : String(lit.value);
}

/**
 * Slice the balanced parameter list that follows the first match of
 * `opener` (a RegExp matching e.g. `init(` or `fun CivX(`). Returns the
 * text between the opening `(` and its matching `)`, or null.
 */
export function sliceParamList(src: string, opener: RegExp): string | null {
  const m = opener.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length - 1; // index of the opening '('
  if (src[i] !== '(') return null;
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) {
        const start = src.indexOf('(', m.index) + 1;
        return src.slice(start, i);
      }
    }
  }
  return null;
}

/** Split a parameter list on top-level commas, respecting (), <>, [], {}
 * nesting and string literals. */
export function splitTopLevel(params: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  let str: string | null = null;
  for (let i = 0; i < params.length; i++) {
    const ch = params[i];
    if (str) {
      buf += ch;
      if (ch === str && params[i - 1] !== '\\') str = null;
      continue;
    }
    if (ch === '"' || ch === "'") { str = ch; buf += ch; continue; }
    // A `>` preceded by `-` is a lambda arrow (`->`), not a generic close.
    if (ch === '(' || ch === '<' || ch === '[' || ch === '{') depth++;
    else if ((ch === ')' || ch === ']' || ch === '}') || (ch === '>' && params[i - 1] !== '-')) depth--;
    if (ch === ',' && depth === 0) { out.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out;
}

/**
 * Parse a parameter list into name → raw-default-expression for params
 * that declare a default. Handles `name: Type = default` (Swift &
 * Kotlin share this shape). Params without a `=` are omitted (no
 * default to compare). The default expression is captured raw; the
 * caller classifies it.
 */
export function parseParamDefaults(paramList: string): Map<string, string> {
  const defaults = new Map<string, string>();
  for (const part of splitTopLevel(paramList)) {
    const eq = topLevelEqualsIndex(part);
    if (eq < 0) continue;
    const head = part.slice(0, eq);
    const def = part.slice(eq + 1).trim();
    const nameMatch = head.match(/(?:^|[\s(])(\w+)\s*:/);
    if (!nameMatch) continue;
    defaults.set(nameMatch[1], def);
  }
  return defaults;
}

/** Index of the top-level `=` (the default-value assignment) in a single
 * parameter declaration, or -1. Skips `==`/`>=`/`<=` and respects
 * nesting + strings (lambda defaults can contain `->`). */
function topLevelEqualsIndex(part: string): number {
  let depth = 0;
  let str: string | null = null;
  for (let i = 0; i < part.length; i++) {
    const ch = part[i];
    if (str) { if (ch === str && part[i - 1] !== '\\') str = null; continue; }
    if (ch === '"' || ch === "'") { str = ch; continue; }
    // A `>` preceded by `-` is a lambda arrow (`->`), not a generic close.
    if (ch === '(' || ch === '<' || ch === '[' || ch === '{') depth++;
    else if ((ch === ')' || ch === ']' || ch === '}') || (ch === '>' && part[i - 1] !== '-')) depth--;
    else if (ch === '=' && depth === 0 && part[i + 1] !== '=' && part[i - 1] !== '!' &&
      part[i - 1] !== '<' && part[i - 1] !== '>') return i;
  }
  return -1;
}

/** Look up a native default by trying each name alternative. */
function findNativeDefault(
  defaults: Map<string, string>,
  alternatives: string[],
): { name: string; raw: string } | null {
  for (const alt of alternatives) {
    if (defaults.has(alt)) return { name: alt, raw: defaults.get(alt)! };
  }
  return null;
}

export async function collectFindings(): Promise<DefaultFinding[]> {
  const parity = await import(pathToFileURL(join(ROOT, 'tools/schema-parity.ts')).href);
  const covered: Array<{ name: string; ios?: string; android?: string }> =
    parity.COVERED_COMPONENTS ?? parity.default?.COVERED_COMPONENTS ?? [];

  const findings: DefaultFinding[] = [];

  for (const spec of covered) {
    const schemaPath = join(COMPONENTS_DIR, `${spec.name}.schema.ts`);
    if (!existsSync(schemaPath)) continue;
    const mod = await import(pathToFileURL(schemaPath).href);
    const schema = mod.default ?? mod;
    if (!schema?.props) continue;

    // Swift init params.
    let swiftDefaults: Map<string, string> | null = null;
    if (spec.ios) {
      const p = join(ROOT, spec.ios);
      if (existsSync(p)) {
        const list = sliceParamList(readFileSync(p, 'utf-8'), /\binit\s*\(/);
        if (list) swiftDefaults = parseParamDefaults(list);
      }
    }

    // Kotlin composable params.
    let kotlinDefaults: Map<string, string> | null = null;
    if (spec.android) {
      const p = join(ROOT, spec.android);
      if (existsSync(p)) {
        const src = readFileSync(p, 'utf-8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/[^\n]*/g, '');
        const display = `Civ${spec.name.replace(/^civ-/, '').replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())}`;
        const list = sliceParamList(src, new RegExp(`fun\\s+${display}\\s*\\(`));
        if (list) kotlinDefaults = parseParamDefaults(list);
      }
    }

    for (const [propName, propDef] of Object.entries(schema.props as Record<string, any>)) {
      if (propDef?.webOnly) continue;
      if (!('default' in propDef)) continue;
      const schemaLit = classifySchemaDefault(propDef.default);
      if (!schemaLit) continue;
      // String defaults are intentionally NOT compared. Native counterparts
      // routinely default a String param to "" and resolve the real default
      // via a body-level i18n fallback (`label.isEmpty ? t("...") : label`)
      // that this parser can't see — so a "" param default is not the
      // effective default and would false-positive. Number / boolean
      // defaults have no such indirection and are the unambiguous contract.
      if (schemaLit.kind === 'string') continue;

      if (swiftDefaults) {
        const hit = findNativeDefault(swiftDefaults, iosPropAlternatives(propName));
        const nativeLit = hit ? classifyNativeDefault(hit.raw) : null;
        if (hit && nativeLit && !literalsEqual(schemaLit, nativeLit)) {
          findings.push({
            component: spec.name, platform: 'iOS', prop: propName, nativeName: hit.name,
            schemaDefault: literalToString(schemaLit), nativeDefault: literalToString(nativeLit),
          });
        }
      }

      if (kotlinDefaults) {
        const hit = findNativeDefault(kotlinDefaults, androidPropAlternatives(propName));
        const nativeLit = hit ? classifyNativeDefault(hit.raw) : null;
        if (hit && nativeLit && !literalsEqual(schemaLit, nativeLit)) {
          findings.push({
            component: spec.name, platform: 'Android', prop: propName, nativeName: hit.name,
            schemaDefault: literalToString(schemaLit), nativeDefault: literalToString(nativeLit),
          });
        }
      }
    }
  }
  return findings;
}

async function main(): Promise<void> {
  const findings = await collectFindings();
  if (findings.length === 0) {
    console.log('✓ schema default values match the iOS / Android counterparts.');
    return;
  }
  console.error(`✗ ${findings.length} schema↔native default drift(s) detected.\n`);
  console.error('Why: the schema is the cross-platform contract. A native default');
  console.error('     that differs from the schema silently changes behavior for');
  console.error('     iOS / Android consumers relying on the documented default.\n');
  for (const f of findings) {
    console.error(`  ${f.component}  ${f.prop}  (${f.platform} param "${f.nativeName}")`);
    console.error(`    schema default: ${f.schemaDefault}`);
    console.error(`    native default: ${f.nativeDefault}\n`);
  }
  console.error('Fix: change the native default to match the schema, OR — if the');
  console.error('     native value is correct — update the schema `default:` and');
  console.error('     re-sync the Lit source + docs.');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
