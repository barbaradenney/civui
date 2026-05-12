#!/usr/bin/env tsx
/**
 * lint-event-listener-leak — fail when a component adds a DOM event
 * listener without a matching remove.
 *
 * The leak shape we're catching:
 *
 *   override connectedCallback(): void {
 *     super.connectedCallback();
 *     document.addEventListener('keydown', this._boundOnKey);
 *   }
 *   override disconnectedCallback(): void {
 *     super.disconnectedCallback();
 *     // ← oops, no removeEventListener
 *   }
 *
 * Reattach-on-reconnect components (`<civ-X>` torn off the DOM and
 * later reattached) accumulate dead listeners + retain references to
 * their previous host. With document-scoped listeners (modal escape,
 * click-outside) the leak is multiplied across every page navigation.
 *
 * The lint is intentionally regex-based — full TS-AST would catch
 * more but cost much more. It checks one shape:
 *
 *   For every component class that calls `addEventListener(name, ...)`
 *   inside `connectedCallback` / `firstUpdated`, there must be a
 *   matching `removeEventListener(name, ...)` somewhere in the same
 *   class (typically in `disconnectedCallback`).
 *
 * In-render addEventListener on a child element (e.g. `@click=...` is
 * managed by Lit) is not a leak; the lint only inspects calls inside
 * connectedCallback / firstUpdated. clickOutside(this, ...) and
 * helper utilities from @civui/core are exempt — they own the
 * teardown internally.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

interface Finding {
  file: string;
  className: string;
  eventName: string;
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
      if (base === 'mcp-server' || base === 'cli' || base === 'content') return;
      for (const name of await fs.readdir(p)) {
        await visit(path.join(p, name));
      }
    }
  }
  await visit(dir);
  return out;
}

/** Extract { className, body } for every class declaration in the file. */
function* iterClasses(src: string): IterableIterator<{ className: string; body: string; classStart: number }> {
  const classRe = /\bclass\s+(\w+)[^{]*\{/g;
  for (const m of src.matchAll(classRe)) {
    const start = m.index! + m[0].length;
    // Find matching close brace.
    let depth = 1;
    let i = start;
    let inString: string | null = null;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (inString) {
        if (c === '\\') { i += 2; continue; }
        if (c === inString) inString = null;
        i++;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { inString = c; i++; continue; }
      if (c === '/' && src[i + 1] === '/') {
        const eol = src.indexOf('\n', i);
        i = eol < 0 ? src.length : eol;
        continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        i = end < 0 ? src.length : end + 2;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    yield { className: m[1], body: src.slice(start, i - 1), classStart: m.index! };
  }
}

/**
 * Find the body of a named method on the class. Returns null if not
 * present. Methods can have leading modifiers (`override`, `async`).
 */
function findMethodBody(classBody: string, methodName: string): string | null {
  // Approximate match: `methodName(...) {` or `override methodName(...) {`
  const re = new RegExp(`(?:override\\s+|async\\s+|protected\\s+|private\\s+|public\\s+)*${methodName}\\s*\\([^)]*\\)\\s*(?::[^{]+)?\\{`, 'g');
  const m = re.exec(classBody);
  if (!m) return null;
  let depth = 1;
  let i = m.index + m[0].length;
  while (i < classBody.length && depth > 0) {
    const c = classBody[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  return classBody.slice(m.index + m[0].length, i - 1);
}

/** Extract event names from `addEventListener('name', ...)` calls. */
function extractAddedListeners(body: string): Set<string> {
  const out = new Set<string>();
  for (const m of body.matchAll(/\baddEventListener\s*\(\s*['"]([^'"]+)['"]/g)) {
    out.add(m[1]);
  }
  return out;
}

function extractRemovedListeners(body: string): Set<string> {
  const out = new Set<string>();
  for (const m of body.matchAll(/\bremoveEventListener\s*\(\s*['"]([^'"]+)['"]/g)) {
    out.add(m[1]);
  }
  return out;
}

async function main(): Promise<void> {
  const files = await walk(PACKAGES_DIR);
  const findings: Finding[] = [];

  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    if (!src.includes('addEventListener')) continue; // fast skip

    for (const { className, body } of iterClasses(src)) {
      const connectedBody = findMethodBody(body, 'connectedCallback') ?? '';
      const firstUpdatedBody = findMethodBody(body, 'firstUpdated') ?? '';
      const lifecycleAdds = new Set([
        ...extractAddedListeners(connectedBody),
        ...extractAddedListeners(firstUpdatedBody),
      ]);
      if (lifecycleAdds.size === 0) continue;

      // Look for removes anywhere in the class body — components
      // typically remove in disconnectedCallback, but some bundle
      // teardown into helper methods (`_teardown()`), so an in-class
      // remove is sufficient.
      const removed = extractRemovedListeners(body);

      for (const evt of lifecycleAdds) {
        if (!removed.has(evt)) {
          findings.push({
            file: path.relative(REPO_ROOT, file),
            className,
            eventName: evt,
          });
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log('✓ no event-listener leaks: every connectedCallback / firstUpdated addEventListener has a matching removeEventListener in the same class.');
    return;
  }

  const grouped = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!grouped.has(f.file)) grouped.set(f.file, []);
    grouped.get(f.file)!.push(f);
  }
  console.error(`✗ ${findings.length} potential event-listener leak(s) across ${grouped.size} file(s):\n`);
  for (const [file, list] of grouped) {
    console.error(`  ${file}  (class ${list[0].className})`);
    for (const f of list) {
      console.error(`    addEventListener('${f.eventName}', ...) with no matching removeEventListener('${f.eventName}', ...)`);
    }
    console.error('');
  }
  console.error(
    'A component that adds a listener in connectedCallback or firstUpdated\n' +
    'must remove it (typically in disconnectedCallback) — otherwise every\n' +
    'detach + reattach cycle leaks a listener and keeps the host alive.\n' +
    'Either:\n' +
    '  - Add the matching removeEventListener call, or\n' +
    '  - Use a managed helper from @civui/core (clickOutside, trapFocus)\n' +
    '    that owns its own teardown.',
  );
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
