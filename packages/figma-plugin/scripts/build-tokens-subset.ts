#!/usr/bin/env tsx
/**
 * Extract the subset of @civui/tokens the Figma plugin needs and write
 * `manifest-data/tokens.json` for inlining into the plugin bundle.
 *
 * The plugin uses tokens for the *container* (auto-layout frame
 * around the captured body): background color, border, padding,
 * radius. Body visuals are PNG/SVG so they don't need token access.
 *
 * Output shape matches `TokenSubset` in src/shared/types.ts.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { TokenSubset } from '../src/shared/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const REPO = resolve(ROOT, '../..');
const TOKENS_SRC = join(REPO, 'packages/tokens/src');
const OUT = join(ROOT, 'manifest-data/tokens.json');

interface DtcgLeaf {
  $value?: string;
  $type?: string;
  $description?: string;
}
type DtcgTree = { [k: string]: DtcgTree | DtcgLeaf | string };

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/** Walk a DTCG tree, yielding (dotted-path, leaf) pairs for color $type leaves. */
function* walkColors(node: DtcgTree, prefix: string[] = []): Generator<[string, DtcgLeaf]> {
  for (const [key, child] of Object.entries(node)) {
    if (typeof child === 'string') continue;
    if (key.startsWith('$')) continue;
    if (typeof child === 'object' && child !== null && '$value' in child) {
      const path = [...prefix, key === 'DEFAULT' ? '' : key].filter(Boolean).join('-');
      yield [path, child as DtcgLeaf];
    } else if (typeof child === 'object' && child !== null) {
      yield* walkColors(child as DtcgTree, [...prefix, key]);
    }
  }
}

function buildColors(): TokenSubset['colors'] {
  const tree = readJson<{ color: DtcgTree }>(join(TOKENS_SRC, 'color.tokens.json'));
  const out: TokenSubset['colors'] = {};
  for (const [path, leaf] of walkColors(tree.color)) {
    const hex = leaf.$value;
    if (typeof hex !== 'string' || !hex.startsWith('#')) continue;
    out[path] = hexToRgba(hex);
  }
  return out;
}

function buildSpacing(): TokenSubset['spacing'] {
  // Spacing tokens are stored as rem/px strings; the Figma plugin needs px.
  const tree = readJson<{ spacing: DtcgTree }>(join(TOKENS_SRC, 'spacing.tokens.json'));
  const out: TokenSubset['spacing'] = {};
  for (const [path, leaf] of walkColors(tree.spacing)) {
    const raw = leaf.$value;
    if (typeof raw !== 'string') continue;
    if (raw.endsWith('rem')) out[path] = parseFloat(raw) * 16;
    else if (raw.endsWith('px')) out[path] = parseFloat(raw);
    else if (/^-?\d+(\.\d+)?$/.test(raw)) out[path] = parseFloat(raw);
  }
  return out;
}

function buildRadii(): TokenSubset['radii'] {
  const tree = readJson<{ border: DtcgTree }>(join(TOKENS_SRC, 'border.tokens.json'));
  const out: TokenSubset['radii'] = {};
  for (const [path, leaf] of walkColors(tree.border)) {
    if (!path.startsWith('radius')) continue;
    const raw = leaf.$value;
    if (typeof raw !== 'string') continue;
    if (raw.endsWith('rem')) out[path] = parseFloat(raw) * 16;
    else if (raw.endsWith('px')) out[path] = parseFloat(raw);
  }
  return out;
}

function main(): void {
  if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
  const subset: TokenSubset = {
    colors: buildColors(),
    spacing: buildSpacing(),
    radii: buildRadii(),
    typography: {
      fontFamily: 'Source Sans Pro',
      sizes: { sm: 14, base: 16, lg: 18, xl: 20 },
    },
  };
  writeFileSync(OUT, JSON.stringify(subset, null, 2) + '\n');
  console.log(`▸ wrote ${OUT} (${Object.keys(subset.colors).length} colors)`);
}

main();
