#!/usr/bin/env node --experimental-strip-types
/**
 * Import icons from a local clone of wentin/cssicon and convert them
 * to CivUI's icon system.
 *
 * Prerequisites: git clone https://github.com/wentin/cssicon.git /tmp/cssicon
 * Usage: node --experimental-strip-types tools/import-cssicon.ts
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const CSSICON_DIR = '/tmp/cssicon/scss/icons';
const OUTPUT = join(import.meta.dirname, '..', 'tools', 'imported-icons.css');
const BASE = 16; // normalize px values to em (1em = 16px base)

// Skip non-icon entries
const SKIP = new Set([
  'template-before-after.zip', 'template-before.zip', 'template-i-before-after.zip',
  'template-i-before-after', 'template-i.zip', 'template-main.zip',
  'C', 'I', 'N', 'O', 'S',
]);

function readIconFile(iconDir: string, file: string): string {
  const path = join(iconDir, file);
  return existsSync(path) ? readFileSync(path, 'utf-8') : '';
}

/** Convert px to em string. */
function pxToEm(px: number): string {
  if (px === 0) return '0';
  const em = Math.round((px / BASE) * 100) / 100;
  return `${em}em`;
}

/** Convert a negative px to em. */
function signedPxToEm(px: number): string {
  if (px === 0) return '0';
  const em = Math.round((px / BASE) * 100) / 100;
  return `${em}em`;
}

/** Extract CSS properties from SCSS, strip mixins/selectors. */
function extractProperties(scss: string): string[] {
  const lines: string[] = [];
  for (const line of scss.split('\n')) {
    const t = line.trim();
    // Skip empty lines, selectors, braces, comments
    if (!t || t.startsWith('//') || t.startsWith('.')
      || t.startsWith('&') || t === '{' || t === '}') continue;
    // Expand the pseudo mixin
    if (t.includes('pseudo()')) {
      lines.push("content: '';");
      lines.push('position: absolute;');
      continue;
    }
    // Skip other SCSS directives (imports, etc.)
    if (t.startsWith('@')) continue;
    // Clean up property
    let prop = t.endsWith(';') ? t : `${t};`;
    // Skip color: #000 (demo styling)
    if (/^color:\s*#/.test(prop)) continue;
    // Skip position: absolute on main (it's for the demo page layout)
    lines.push(prop);
  }
  return lines;
}

/** Convert all px values in a property line. */
function convertLine(line: string): string {
  // Replace border widths with stroke variable
  let result = line.replace(/(\d+)px\s+solid/g, 'var(--civ-icon-stroke) solid');
  // Replace remaining px values with em
  result = result.replace(/([-]?\d+)px/g, (_, px) => pxToEm(parseInt(px)));
  // background-color → background
  result = result.replace(/background-color/g, 'background');
  return result;
}

/** Build CivUI CSS from icon SCSS files. */
function buildIcon(name: string, iconDir: string): string | null {
  const mainScss = readIconFile(iconDir, 'main.scss');
  const beforeScss = readIconFile(iconDir, 'before.scss');
  const afterScss = readIconFile(iconDir, 'after.scss');

  if (!mainScss && !beforeScss && !afterScss) return null;

  const parts: string[] = [];

  // Extract main element properties (shape-only, not layout)
  const mainProps = extractProperties(mainScss)
    .map(convertLine)
    .filter(l => {
      const prop = l.split(':')[0].trim();
      return ['width', 'height', 'background', 'border-left', 'border-right',
        'border-top', 'border-bottom', 'border', 'border-radius', 'transform',
        'box-shadow', 'box-sizing'].some(p => prop === p || prop.startsWith(p + '-'));
    });

  // ::before
  const beforeProps = extractProperties(beforeScss).map(convertLine);
  if (beforeProps.length > 0) {
    parts.push(`  .civ-icon--${name}::before {\n${beforeProps.map(p => `    ${p}`).join('\n')}\n  }`);
  }

  // ::after
  const afterProps = extractProperties(afterScss).map(convertLine);
  if (afterProps.length > 0) {
    parts.push(`  .civ-icon--${name}::after {\n${afterProps.map(p => `    ${p}`).join('\n')}\n  }`);
  }

  // If main has shape props but no pseudo-elements, put them on ::before
  if (mainProps.length > 0 && beforeProps.length === 0 && afterProps.length === 0) {
    parts.push(`  .civ-icon--${name}::before {\n    content: '';\n    position: absolute;\n${mainProps.map(p => `    ${p}`).join('\n')}\n  }`);
  } else if (mainProps.length > 0) {
    // Main has shape props AND pseudo-elements — put main on host
    // Only width/height matter on host since pseudo-elements handle the rest
  }

  if (parts.length === 0) return null;
  return parts.join('\n');
}

// Main
const iconDirs = readdirSync(CSSICON_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && !SKIP.has(d.name))
  .map(d => d.name)
  .sort();

console.log(`Found ${iconDirs.length} icon directories\n`);

const results: string[] = [];
const newIcons: string[] = [];
let imported = 0;
let skipped = 0;
let existing = 0;

// Existing CivUI icons (from components.css)
const existingNames = [
  'arrow-back', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up',
  'calendar', 'check', 'check-circle', 'chevron-down', 'chevron-left',
  'chevron-right', 'chevron-up', 'close', 'copy', 'download', 'edit',
  'error', 'external-link', 'eye', 'eye-off', 'filter', 'grip', 'help',
  'home', 'info', 'loading', 'location', 'lock', 'mail', 'menu', 'minus',
  'more-horizontal', 'more-vertical', 'phone', 'plus', 'print',
  'required-indicator', 'search', 'settings', 'sort-asc', 'sort-desc',
  'sort-none', 'star', 'star-filled', 'trash', 'upload', 'user', 'warning',
];

for (const name of iconDirs) {
  // Check if we already have this icon
  if (existingNames.includes(name)) {
    existing++;
    continue;
  }

  const iconDir = join(CSSICON_DIR, name);
  const css = buildIcon(name, iconDir);
  if (css) {
    results.push(`  /* ${name} */\n${css}`);
    newIcons.push(name);
    imported++;
  } else {
    skipped++;
  }
}

console.log(`Existing (skipped): ${existing}`);
console.log(`Imported: ${imported}`);
console.log(`Skipped (empty): ${skipped}`);
console.log(`\nNew icons: ${newIcons.join(', ')}\n`);

const output = `/* ── Icons imported from cssicon.space (wentin/cssicon) ───────── */\n/* Auto-generated — review and adjust in the icon editor */\n\n${results.join('\n\n')}\n`;

writeFileSync(OUTPUT, output);
console.log(`Written to: ${OUTPUT}`);
console.log(`\nNext steps:`);
console.log(`1. Review the CSS in ${OUTPUT}`);
console.log(`2. Open each icon in the icon editor to verify at all sizes`);
console.log(`3. Copy approved icons into packages/core/src/styles/components.css`);
console.log(`4. Register each icon in packages/core/src/icon/icon-library.ts`);
