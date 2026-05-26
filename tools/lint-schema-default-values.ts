#!/usr/bin/env tsx
/**
 * lint-schema-default-values — every schema prop's `default:` value must
 * match the default declared in each native platform's source.
 *
 * Why
 * ---
 * `pnpm parity:schema` validates that prop *names* exist on each
 * platform but does NOT compare their *default values*. The actions
 * audit found three concrete drifts that slipped through:
 *
 *   - civ-filter-chip.emphasis: iOS+Android default `"default"`,
 *     schema default `"secondary"`. Drupal users hit primary visual
 *     emphasis when the schema implies secondary.
 *   - civ-filter-chip.variant: iOS+Android default `"checkbox"`,
 *     schema default `"toggle"`. Platforms render the wrong default
 *     visual treatment.
 *   - civ-action-chip.count: iOS+Android `Int = 0` (visible default),
 *     schema default `undefined` (hide by default). Native users see
 *     a `(0)` badge on every chip.
 *
 * What this lints
 * ---------------
 * For every component in `COVERED_COMPONENTS` (in `tools/schema-parity.ts`),
 * walks each schema prop with a declared `default:` of type **boolean**,
 * **number**, or **enum** (string-literal subset) and compares against
 * the default declared in:
 *
 *   - iOS Swift  — `public init(name: Type = value, ...)` parameter
 *   - Android Kotlin — `fun CivX(name: Type = value, ...)` parameter
 *   - Drupal SDC YAML — `default: value` line inside the prop block
 *
 * Drift is reported per-platform. The `webOnly: true` props are skipped.
 *
 * Default-value normalization
 * ---------------------------
 * Defaults are compared after normalization:
 *
 *   - Swift enum case `.secondary` → `secondary`
 *   - Quoted strings `"secondary"`, `'secondary'` → `secondary`
 *   - Booleans `true`/`false` → `'true'`/`'false'`
 *   - Numbers `0`, `0.0`, `1500` → `'0'` / `'1500'` (stringified)
 *   - Swift optional `nil`, Kotlin `null` → `__nil__` (treated as
 *     absence — the schema's `default: undefined` matches)
 *
 * Skipped:
 *   - String defaults (too many edge cases — empty strings vs nil vs
 *     locale-resolved fallbacks; the audit's drifts were enum/number,
 *     not string).
 *   - Props whose schema has no `default:` (no contract to enforce).
 *   - Props the platform doesn't declare (parity:schema covers that).
 *   - Props with `webOnly: true`.
 *
 * Caught by: `pnpm lint:schema-default-values`. Wired into
 * `pnpm validate:lints` and the drift-lints CI gate.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  iosPropAlternatives,
  androidPropAlternatives,
  camelToSnake,
} from './schema-parity.js';
import { SCHEMA_DEFAULT_VALUE_ALLOWLIST } from './schema-default-value-allowlist.js';

const ROOT = join(import.meta.dirname, '..');

type Platform = 'ios' | 'android' | 'drupal';

interface Finding {
  componentName: string;
  prop: string;
  platform: Platform;
  schemaDefault: string;
  platformDefault: string;
  platformFile: string;
}

/**
 * Normalize a default expression captured from any platform into a
 * canonical string. Returns `__nil__` for null-like literals (the
 * schema's "no default" matches this). Returns the raw value
 * otherwise (caller decides what to do with it).
 */
export function normalizeDefault(raw: string): string {
  const t = raw.trim();
  if (t === 'nil' || t === 'null' || t === 'None') return '__nil__';
  if (t === 'true' || t === 'false') return t;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) {
    // Drop a trailing `.0` so `0.0` matches `0`.
    return t.replace(/\.0$/, '');
  }
  // SwiftUI `Binding.constant(X)` / `.constant(X)` — recurse on the
  // wrapped value. Used in init defaults for `@Binding` properties.
  const constantMatch = t.match(/^(?:Binding)?\.constant\(([\s\S]*)\)$/);
  if (constantMatch) return normalizeDefault(constantMatch[1]);
  // Strip surrounding single/double quotes (string literal).
  const strMatch = t.match(/^(['"])([\s\S]*)\1$/);
  if (strMatch) return strMatch[2];
  // Swift enum-case shorthand `.primary` → `primary`.
  if (/^\.\w+$/.test(t)) return t.slice(1);
  // Kotlin enum reference `EnumName.CASE_NAME` → `case_name`. The Kotlin
  // convention is to use either SCREAMING_SNAKE_CASE (matching the JVM
  // enum-naming idiom) or PascalCase. Schemas declare lowercase
  // kebab-case-ish values like `'secondary'`, `'info'`. Lowercasing the
  // case name covers single-word cases (the dominant pattern); multi-
  // word cases like `EnumName.PrimaryFilled` would normalize to
  // `primaryfilled` and not match `'primary-filled'` — those need
  // schema-side migration if they appear.
  const enumRefMatch = t.match(/^[A-Z]\w*\.([A-Za-z_]\w*)$/);
  if (enumRefMatch) return enumRefMatch[1].toLowerCase();
  // Otherwise leave as-is.
  return t;
}

/**
 * Normalize the schema's `default:` value (a JS value, not a source
 * expression). Mirrors `normalizeDefault` so cross-platform comparison
 * works.
 */
function normalizeSchemaDefault(value: unknown): string {
  if (value === null || value === undefined) return '__nil__';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Extract `(name, default-expression)` pairs from a Swift source file
 * by parsing the `public init(...)` parameter list. Returns a map
 * keyed by parameter name.
 */
export function parseSwiftInitDefaults(src: string): Map<string, string> {
  const defaults = new Map<string, string>();
  // Find every `public init(` opener; capture the parenthesized
  // parameter list up to the matching `)`.
  const initRegex = /public\s+init\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = initRegex.exec(src)) !== null) {
    const open = m.index + m[0].length - 1; // position of `(`
    const body = extractBalanced(src, open, '(', ')');
    if (!body) continue;
    parseSwiftParams(body, defaults);
  }
  return defaults;
}

/**
 * Walk a Swift init parameter list and capture each parameter's
 * default-value expression (right-hand side of the top-level `=`).
 * Adds to the provided map; later inits don't overwrite earlier ones
 * (first declaration wins, matching the convention of the canonical
 * init being declared first).
 */
function parseSwiftParams(body: string, out: Map<string, string>): void {
  let paramStart = 0;
  let depth = 0;
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if ((ch === ',' && depth === 0) || i === body.length) {
      const piece = body.slice(paramStart, i).trim();
      paramStart = i + 1;
      if (!piece) continue;
      const colonIdx = piece.indexOf(':');
      if (colonIdx < 0) continue;
      const name = piece.slice(0, colonIdx).trim();
      if (!/^[a-zA-Z_]\w*$/.test(name)) continue;
      const rest = piece.slice(colonIdx + 1);
      const eqIdx = findTopLevelEquals(rest);
      if (eqIdx < 0) continue;
      const defaultExpr = rest.slice(eqIdx + 1).trim();
      if (!out.has(name)) out.set(name, defaultExpr);
    }
  }
}

/**
 * Extract `(name, default-expression)` pairs from a Kotlin source file
 * by parsing the `@Composable fun CivX(...)` parameter list.
 */
export function parseKotlinFnDefaults(src: string, displayName: string): Map<string, string> {
  const defaults = new Map<string, string>();
  // Strip comments first.
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const fnRegex = new RegExp(`fun\\s+${displayName}\\s*\\(`);
  const fnMatch = stripped.match(fnRegex);
  if (!fnMatch || fnMatch.index === undefined) return defaults;
  const open = fnMatch.index + fnMatch[0].length - 1;
  const body = extractBalanced(stripped, open, '(', ')');
  if (!body) return defaults;
  parseKotlinParams(body, defaults);
  return defaults;
}

function parseKotlinParams(body: string, out: Map<string, string>): void {
  let paramStart = 0;
  let depth = 0;
  for (let i = 0; i <= body.length; i++) {
    const ch = body[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if ((ch === ',' && depth === 0) || i === body.length) {
      const piece = body.slice(paramStart, i).trim();
      paramStart = i + 1;
      if (!piece) continue;
      const colonIdx = piece.indexOf(':');
      if (colonIdx < 0) continue;
      const name = piece.slice(0, colonIdx).trim().replace(/^`(.+)`$/, '$1');
      if (!/^[a-zA-Z_]\w*$/.test(name)) continue;
      const rest = piece.slice(colonIdx + 1);
      const eqIdx = findTopLevelEquals(rest);
      if (eqIdx < 0) continue;
      const defaultExpr = rest.slice(eqIdx + 1).trim();
      if (!out.has(name)) out.set(name, defaultExpr);
    }
  }
}

/**
 * Extract `(propName, default-value)` pairs from a Drupal SDC YAML.
 * Walks the props.properties block via the same indentation-aware
 * line walker used in `parseDrupalPropsFromYaml`, capturing each
 * prop's `default:` value (if present).
 */
export function parseSdcDefaults(src: string): Map<string, string> {
  const defaults = new Map<string, string>();
  const lines = src.split('\n');
  let state: 'before-props' | 'in-props' | 'in-properties' | 'done' = 'before-props';
  let propsIndent = 0;
  let baseIndent = 0;
  let currentName: string | null = null;
  let currentIndent = 0;
  for (const line of lines) {
    if (state === 'done') break;
    const m = line.match(/^(\s*)([\w-]+)\s*:(.*)$/);
    if (!m) continue;
    const indent = m[1].length;
    const key = m[2];
    const rest = m[3];
    if (state === 'before-props') {
      if (key === 'props' && indent === 0) {
        state = 'in-props';
        propsIndent = indent;
      }
      continue;
    }
    if (state === 'in-props') {
      if (indent <= propsIndent) { state = 'done'; break; }
      if (key === 'properties' && indent === propsIndent + 2) {
        state = 'in-properties';
        baseIndent = indent;
      }
      continue;
    }
    // state === 'in-properties'
    if (indent <= baseIndent) { state = 'done'; break; }
    if (indent === baseIndent + 2) {
      currentName = key;
      currentIndent = indent;
    } else if (currentName && key === 'default' && indent > currentIndent) {
      defaults.set(currentName, rest.trim());
    }
  }
  return defaults;
}

/**
 * Find the position of the first top-level `=` separator. Tracks only
 * round / square / curly bracket depth — generic angle brackets `<>`
 * are deliberately skipped because the `->` function-arrow in Kotlin
 * / Swift lambda types would unbalance the counter.
 */
function findTopLevelEquals(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === '=' && depth === 0 && s[i + 1] !== '=' && s[i - 1] !== '!' && s[i - 1] !== '=') return i;
  }
  return -1;
}

/** Extract a balanced substring starting at the opener index. */
function extractBalanced(src: string, openIdx: number, open: string, close: string): string | null {
  if (src[openIdx] !== open) return null;
  let depth = 0;
  let body = '';
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === open) {
      depth++;
      if (depth === 1) continue;
    } else if (ch === close) {
      depth--;
      if (depth === 0) return body;
    }
    if (depth >= 1) body += ch;
  }
  return null;
}

/**
 * Resolve a schema prop name to the candidate iOS parameter name.
 * Tries `iosPropAlternatives` (which handles `is`-prefix booleans,
 * keyword renames like `type`→`inputType`, and HTML attribute
 * lowercase forms) and picks the first one that has a default
 * declared in the Swift init.
 */
function findIosDefault(
  propName: string,
  defaults: Map<string, string>,
): { name: string; value: string } | null {
  for (const candidate of iosPropAlternatives(propName)) {
    if (defaults.has(candidate)) return { name: candidate, value: defaults.get(candidate)! };
  }
  return null;
}

function findAndroidDefault(
  propName: string,
  defaults: Map<string, string>,
): { name: string; value: string } | null {
  for (const candidate of androidPropAlternatives(propName)) {
    if (defaults.has(candidate)) return { name: candidate, value: defaults.get(candidate)! };
  }
  return null;
}

function findDrupalDefault(
  propName: string,
  def: any,
  defaults: Map<string, string>,
): { name: string; value: string } | null {
  // Mirror `drupalKeyFor` from sync-drupal-sdc.ts.
  const drupalKey = def?.attribute ? def.attribute.replace(/-/g, '_') : camelToSnake(propName);
  if (defaults.has(drupalKey)) return { name: drupalKey, value: defaults.get(drupalKey)! };
  if (defaults.has(propName)) return { name: propName, value: defaults.get(propName)! };
  const snake = camelToSnake(propName);
  if (defaults.has(snake)) return { name: snake, value: defaults.get(snake)! };
  return null;
}

async function main(): Promise<void> {
  const parity = await import(pathToFileURL(join(ROOT, 'tools/schema-parity.ts')).href);
  const covered: Array<{ name: string; ios?: string; android?: string; drupal?: string }>
    = parity.COVERED_COMPONENTS ?? [];

  const findings: Finding[] = [];
  let checkedComponents = 0;
  let comparedDefaults = 0;

  for (const spec of covered) {
    const schemaPath = join(ROOT, `packages/schema/src/components/${spec.name}.schema.ts`);
    const schemaMod = await import(pathToFileURL(schemaPath).href);
    const schema = schemaMod.default ?? schemaMod;
    if (!schema?.props) continue;
    checkedComponents++;

    // Pre-load each platform's defaults once per component.
    const iosDefaults = spec.ios
      ? parseSwiftInitDefaults(readFileSync(join(ROOT, spec.ios), 'utf-8'))
      : new Map<string, string>();
    const androidDefaults = spec.android
      ? parseKotlinFnDefaults(
          readFileSync(join(ROOT, spec.android), 'utf-8'),
          // Compose function name = "Civ" + PascalCased schema name minus `civ-`
          'Civ' + spec.name.slice(4).split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(''),
        )
      : new Map<string, string>();
    const drupalDefaults = spec.drupal
      ? parseSdcDefaults(readFileSync(join(ROOT, spec.drupal), 'utf-8'))
      : new Map<string, string>();

    for (const [propName, def] of Object.entries(schema.props as Record<string, any>)) {
      if (def?.webOnly) continue;
      if (def?.default === undefined) continue;
      // Only compare enum / boolean / number defaults — strings have
      // too many edge cases (empty-string sentinels, locale fallbacks,
      // `aria-label` overrides). The audit's three drifts were all
      // enum/number.
      const type = def?.type;
      if (type !== 'enum' && type !== 'boolean' && type !== 'number') continue;
      const schemaDefault = normalizeSchemaDefault(def.default);
      // Skip `__nil__` schema defaults (would never be set in source).
      if (schemaDefault === '__nil__') continue;

      const platforms: Array<[Platform, string | undefined, { name: string; value: string } | null]> = [
        ['ios', spec.ios, spec.ios ? findIosDefault(propName, iosDefaults) : null],
        ['android', spec.android, spec.android ? findAndroidDefault(propName, androidDefaults) : null],
        ['drupal', spec.drupal, spec.drupal ? findDrupalDefault(propName, def, drupalDefaults) : null],
      ];

      for (const [platform, platformPath, match] of platforms) {
        if (!platformPath) continue; // platform not declared for this component
        if (!match) continue; // prop missing on this platform — parity:schema covers it
        const platformDefault = normalizeDefault(match.value);
        // If the platform default is __nil__ (Swift optional `nil`),
        // skip — that's a deliberate "no default" marker on optional
        // types and the schema default is irrelevant.
        if (platformDefault === '__nil__') continue;
        comparedDefaults++;
        if (platformDefault !== schemaDefault) {
          findings.push({
            componentName: spec.name,
            prop: propName,
            platform,
            schemaDefault,
            platformDefault,
            platformFile: platformPath,
          });
        }
      }
    }
  }

  // Partition findings into allowlisted (known drift) and unexpected
  // (new drift that fails CI). Also detect stale allowlist entries —
  // entries that are no longer drifting (because someone fixed the
  // underlying default) need to be removed.
  const findingKeys = new Set(findings.map((f) => keyOf(f)));
  const allowed: Finding[] = [];
  const unexpected: Finding[] = [];
  for (const f of findings) {
    if (SCHEMA_DEFAULT_VALUE_ALLOWLIST.has(keyOf(f))) allowed.push(f);
    else unexpected.push(f);
  }
  const stale: string[] = [];
  for (const key of SCHEMA_DEFAULT_VALUE_ALLOWLIST) {
    if (!findingKeys.has(key)) stale.push(key);
  }

  if (unexpected.length === 0 && stale.length === 0) {
    const allowedMsg = allowed.length > 0 ? ` (${allowed.length} allowlisted entries — see tools/schema-default-value-allowlist.ts)` : '';
    console.log(`✓ schema default values match native platforms across ${checkedComponents} component(s) (${comparedDefaults} default(s) compared)${allowedMsg}.`);
    return;
  }

  if (unexpected.length > 0) {
    console.error(`✗ ${unexpected.length} new schema default-value drift(s) detected.\n`);
    console.error('Why: schemas in @civui/schema are the contract. A platform whose');
    console.error('     default value disagrees with the schema ships a subtly different');
    console.error('     out-of-the-box visual on that platform, which contractors and');
    console.error('     downstream consumers expect to match the documented contract.\n');

    for (const f of unexpected) {
      console.error(`  ${f.componentName}  ${f.prop}  (${f.platform})`);
      console.error(`    schema:   ${JSON.stringify(f.schemaDefault)}`);
      console.error(`    platform: ${JSON.stringify(f.platformDefault)}  ←  ${f.platformFile}\n`);
    }

    console.error('Fix: update the platform source default to match the schema, OR');
    console.error('     if the platform default is the canonical one, update the');
    console.error('     schema (and run `pnpm sync:drupal` for the Drupal YAML).');
    console.error('     If this drift is intentional and needs to be deferred to a');
    console.error('     follow-up pass, add an entry to tools/schema-default-value-allowlist.ts');
    console.error('     with justification.\n');
  }

  if (stale.length > 0) {
    console.error(`✗ ${stale.length} stale allowlist entr${stale.length === 1 ? 'y' : 'ies'} — drift is gone, entry must be removed:\n`);
    for (const key of stale) console.error(`  ${key}`);
    console.error('\nFix: remove these entries from tools/schema-default-value-allowlist.ts.\n');
  }

  if (allowed.length > 0) {
    console.error(`Plus ${allowed.length} allowlisted drift(s) (warning, not failing).\n`);
  }

  process.exit(1);
}

function keyOf(f: Finding): string {
  return `${f.componentName}:${f.prop}:${f.platform}`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
