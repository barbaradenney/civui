/**
 * Tests for tools/lint-button-row.ts — `scanContent` flags default
 * `<civ-button>` clusters wrapped in a plain `civ-flex` container (which
 * defeats the mobile full-width flip) and leaves galleries / toolbars /
 * already-correct `.civ-button-row` markup alone.
 */
import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { scanContent } from '../lint-button-row.js';

describe('scanContent', () => {
  it('flags a single default civ-button in a civ-flex wrapper', () => {
    const html = '<div class="civ-flex civ-gap-2 civ-mt-4"><civ-button type="submit">Save</civ-button></div>';
    const f = scanContent(html);
    expect(f).toHaveLength(1);
    expect(f[0].buttons).toBe(1);
  });

  it('flags a primary + secondary civ-button pair in civ-flex', () => {
    const html = '<div class="civ-flex civ-gap-2"><civ-button type="submit">Submit</civ-button><civ-button emphasis="secondary">Cancel</civ-button></div>';
    expect(scanContent(html)[0].buttons).toBe(2);
  });

  it('does NOT flag a cluster already using .civ-button-row', () => {
    const html = '<div class="civ-button-row civ-mt-4"><civ-button type="submit">Submit</civ-button><civ-button emphasis="secondary">Cancel</civ-button></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does NOT flag a variant gallery (civ-flex-wrap)', () => {
    const html = '<div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center"><civ-button emphasis="primary">A</civ-button><civ-button emphasis="secondary">B</civ-button><civ-button emphasis="tertiary">C</civ-button></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does NOT flag a vertical section stack (civ-flex-col)', () => {
    const html = '<div class="civ-flex civ-flex-col civ-gap-6"><civ-button>A</civ-button></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does NOT flag a civ-action-button toolbar (action buttons keep regular width)', () => {
    const html = '<div class="civ-flex civ-gap-2"><civ-action-button label="One"></civ-action-button><civ-action-button label="Two"></civ-action-button></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does NOT count civ-button-group / civ-action-button as a default civ-button', () => {
    const html = '<div class="civ-flex civ-gap-6"><civ-button-group><civ-action-button label="One"></civ-action-button></civ-button-group></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does NOT flag a flex layout container with NO civ-button', () => {
    const html = '<div class="civ-flex civ-gap-2"><civ-text-input label="x"></civ-text-input></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('excludes a mixed cluster (default button + action button) — toolbar intent', () => {
    const html = '<div class="civ-flex civ-gap-2"><civ-button>Save</civ-button><civ-action-button label="More"></civ-action-button></div>';
    expect(scanContent(html)).toEqual([]);
  });

  it('does not double-count: nested flex layout is skipped, leaf is flagged', () => {
    // Outer flex-col holds an inner flex with the buttons. Only the inner
    // leaf (if it were a real cluster) would flag — here the inner is a
    // gallery, so nothing flags.
    const html = `<div class="civ-flex civ-flex-col civ-gap-4">
      <div class="civ-flex civ-gap-3 civ-flex-wrap"><civ-button>A</civ-button><civ-button>B</civ-button></div>
    </div>`;
    expect(scanContent(html)).toEqual([]);
  });

  it('reports the line number of the offending opener', () => {
    const html = ['<p>intro</p>', '<div class="civ-flex civ-gap-2">', '  <civ-button type="submit">Go</civ-button>', '</div>'].join('\n');
    expect(scanContent(html)[0].line).toBe(2);
  });
});

describe('workspace compliance', () => {
  it('no story / mdx flags the button-row rule today', async () => {
    const repoRoot = path.resolve(import.meta.dirname, '..', '..');
    const roots = ['packages', 'apps/docs/docs'];
    const exts = ['.stories.ts', '.mdx', '.twig'];
    const files: string[] = [];
    async function walk(dir: string) {
      let entries;
      try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name === 'dist') continue;
          await walk(full);
        } else if (exts.some((x) => e.name.endsWith(x))) {
          files.push(full);
        }
      }
    }
    for (const r of roots) await walk(path.join(repoRoot, r));
    const offenders: string[] = [];
    for (const file of files) {
      const text = await fs.readFile(file, 'utf8');
      if (scanContent(text).length > 0) offenders.push(path.relative(repoRoot, file));
    }
    expect(offenders).toEqual([]);
  });
});
