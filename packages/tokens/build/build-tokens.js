/**
 * CivDS Token Builder — Style Dictionary v4
 *
 * Reads W3C DTCG .tokens.json files and outputs:
 * - CSS custom properties (dist/css/tokens.css)
 * - Tailwind preset (dist/tailwind/preset.js)
 * - TypeScript constants (dist/js/tokens.js + tokens.d.ts)
 * - React Native values (dist/react-native/tokens.js)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');
const distDir = join(__dirname, '..', 'dist');

// Read all DTCG token files (excludes scales config which has a different format)
function loadTokens() {
  const tokens = {};
  const files = readdirSync(srcDir).filter(
    (f) => f.endsWith('.tokens.json') && f !== 'scales.tokens.json',
  );
  for (const file of files) {
    const content = JSON.parse(readFileSync(join(srcDir, file), 'utf-8'));
    Object.assign(tokens, content);
  }
  return tokens;
}

// Load scale configuration
function loadScalesConfig() {
  return JSON.parse(readFileSync(join(srcDir, 'scales.tokens.json'), 'utf-8'));
}

// Flatten nested tokens into dot-path entries
function flattenTokens(obj, prefix = '', result = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}-${key}` : key;
    if (value.$value !== undefined) {
      result.push({ path, value: value.$value, type: value.$type || '' });
    } else if (typeof value === 'object') {
      flattenTokens(value, path, result);
    }
  }
  return result;
}

// Format shadow value
function formatShadow(val) {
  if (typeof val === 'string') return val;
  return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread} ${val.color}`;
}

// Format cubic bezier
function formatCubicBezier(val) {
  if (typeof val === 'string') return val;
  return `cubic-bezier(${val.join(', ')})`;
}

// Format font family
function formatFontFamily(val) {
  if (typeof val === 'string') return val;
  return val.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ');
}

// Resolve value to CSS string
function toCSSValue(token) {
  if (token.type === 'shadow') return formatShadow(token.value);
  if (token.type === 'cubicBezier') return formatCubicBezier(token.value);
  if (token.type === 'fontFamily') return formatFontFamily(token.value);
  return String(token.value);
}

// Round to N decimal places
function round(n, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

// Compute font size at a modular scale step: base * ratio^step
function modularScale(basePx, ratio, step) {
  return basePx * Math.pow(ratio, step);
}

// Compute CSS clamp() for fluid responsive value
// Returns clamp string, or null if max <= min
function fluidClamp(minPx, maxPx, minVp, maxVp) {
  if (maxPx <= minPx) return null;
  const minRem = round(minPx / 16, 3);
  const maxRem = round(maxPx / 16, 3);
  const slope = (maxPx - minPx) / (maxVp - minVp);
  const slopeVw = round(slope * 100, 4);
  const interceptPx = minPx - slope * minVp;
  const interceptRem = round(interceptPx / 16, 4);
  return `clamp(${minRem}rem, calc(${interceptRem}rem + ${slopeVw}vw), ${maxRem}rem)`;
}

// Build scale CSS overrides and JS/RN export objects
function buildScales(tokens, scalesConfig) {
  const { scales, fontSizeSteps, spacingTokens } = scalesConfig;
  const cssBlocks = [];
  const jsScales = {};
  const rnScales = {};

  for (const [scaleName, scale] of Object.entries(scales)) {
    if (scaleName === 'product') continue; // product = :root default

    const isFluid = typeof scale.ratio === 'object'; // has min/max
    const desc = scale.$description || scaleName;
    const cssFontSize = {};
    const jsFontSize = {};
    const rnFontSize = {};

    for (const { step, name } of fontSizeSteps) {
      if (isFluid) {
        const minPx = modularScale(scale.basePx.min, scale.ratio.min, step);
        const maxPx = modularScale(scale.basePx.max, scale.ratio.max, step);
        const clamp = fluidClamp(minPx, maxPx, scale.viewportPx.min, scale.viewportPx.max);
        if (clamp) {
          cssFontSize[name] = clamp;
          jsFontSize[name] = clamp;
        } else {
          // max <= min: use the larger value (product/mobile)
          const rem = `${round(Math.max(minPx, maxPx) / 16, 3)}rem`;
          cssFontSize[name] = rem;
          jsFontSize[name] = rem;
        }
        rnFontSize[name] = round(Math.max(maxPx, minPx), 1);
      } else {
        const px = modularScale(scale.basePx, scale.ratio, step);
        const rem = `${round(px / 16, 3)}rem`;
        cssFontSize[name] = rem;
        jsFontSize[name] = rem;
        rnFontSize[name] = round(px, 1);
      }
    }

    // Spacing overrides
    const cssSpacing = {};
    const jsSpacing = {};
    const rnSpacing = {};
    for (const key of spacingTokens) {
      const basePx = parseFloat(tokens.spacing[key].$value);
      const scaled = Math.round(basePx * scale.spacingFactor);
      cssSpacing[key] = `${scaled}px`;
      jsSpacing[key] = `${scaled}px`;
      rnSpacing[key] = scaled;
    }

    // Line heights
    const lineHeight = { body: scale.lineHeight.body, heading: scale.lineHeight.heading };

    // Build CSS block
    const lines = [];
    lines.push(
      `/* ${scaleName.charAt(0).toUpperCase() + scaleName.slice(1)} scale — ${desc} */`,
    );
    lines.push(`[data-civds-scale="${scaleName}"] {`);
    for (const [name, value] of Object.entries(cssFontSize)) {
      lines.push(`  --civds-typography-fontSize-${name}: ${value};`);
    }
    for (const [key, value] of Object.entries(cssSpacing)) {
      lines.push(`  --civds-spacing-${key}: ${value};`);
    }
    lines.push(`  --civds-typography-lineHeight-normal: ${lineHeight.body};`);
    lines.push(`  --civds-typography-lineHeight-tight: ${lineHeight.heading};`);
    lines.push('}');
    cssBlocks.push(lines.join('\n'));

    // JS/TS export object
    jsScales[scaleName] = { fontSize: jsFontSize, spacing: jsSpacing, lineHeight };
    // React Native export object
    rnScales[scaleName] = { fontSize: rnFontSize, spacing: rnSpacing, lineHeight };
  }

  return { css: cssBlocks.join('\n\n'), js: jsScales, rn: rnScales };
}

// Build CSS custom properties
function buildCSS(tokens) {
  const flat = flattenTokens(tokens);
  const lines = ['/* Auto-generated by @civds/tokens — do not edit */', '', ':root {'];
  for (const token of flat) {
    const varName = `--civds-${token.path}`;
    lines.push(`  ${varName}: ${toCSSValue(token)};`);
  }
  lines.push('}', '');
  return lines.join('\n');
}

// Build Tailwind preset
function buildTailwindPreset(tokens) {
  const flat = flattenTokens(tokens);

  // Group by category
  const colors = {};
  const spacing = {};
  const fontSize = {};
  const fontFamily = {};
  const fontWeight = {};
  const lineHeight = {};
  const borderRadius = {};
  const borderWidth = {};
  const boxShadow = {};
  const transitionDuration = {};
  const transitionTimingFunction = {};

  for (const token of flat) {
    const varRef = `var(--civds-${token.path})`;

    if (token.path.startsWith('color-')) {
      const colorPath = token.path.replace('color-', '');
      setNestedValue(colors, colorPath, varRef);
    } else if (token.path.startsWith('spacing-')) {
      const key = token.path.replace('spacing-', '');
      spacing[key] = varRef;
    } else if (token.path.startsWith('typography-fontSize-')) {
      const key = token.path.replace('typography-fontSize-', '');
      fontSize[key] = varRef;
    } else if (token.path.startsWith('typography-fontFamily-')) {
      const key = token.path.replace('typography-fontFamily-', '');
      fontFamily[key] = [varRef];
    } else if (token.path.startsWith('typography-fontWeight-')) {
      const key = token.path.replace('typography-fontWeight-', '');
      fontWeight[key] = varRef;
    } else if (token.path.startsWith('typography-lineHeight-')) {
      const key = token.path.replace('typography-lineHeight-', '');
      lineHeight[key] = varRef;
    } else if (token.path.startsWith('border-radius-')) {
      const key = token.path.replace('border-radius-', '');
      borderRadius[key] = varRef;
    } else if (token.path.startsWith('border-width-')) {
      const key = token.path.replace('border-width-', '');
      borderWidth[key] = varRef;
    } else if (token.path.startsWith('shadow-')) {
      const key = token.path.replace('shadow-', '');
      boxShadow[key] = varRef;
    } else if (token.path.startsWith('motion-duration-')) {
      const key = token.path.replace('motion-duration-', '');
      transitionDuration[key] = varRef;
    } else if (token.path.startsWith('motion-easing-')) {
      const key = token.path.replace('motion-easing-', '');
      transitionTimingFunction[key] = varRef;
    }
  }

  const preset = `// Auto-generated by @civds/tokens — do not edit
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6).replace(/"/g, "'")},
      spacing: ${JSON.stringify(spacing, null, 6).replace(/"/g, "'")},
      fontSize: ${JSON.stringify(fontSize, null, 6).replace(/"/g, "'")},
      fontWeight: ${JSON.stringify(fontWeight, null, 6).replace(/"/g, "'")},
      lineHeight: ${JSON.stringify(lineHeight, null, 6).replace(/"/g, "'")},
      borderRadius: ${JSON.stringify(borderRadius, null, 6).replace(/"/g, "'")},
      borderWidth: ${JSON.stringify(borderWidth, null, 6).replace(/"/g, "'")},
      boxShadow: ${JSON.stringify(boxShadow, null, 6).replace(/"/g, "'")},
      transitionDuration: ${JSON.stringify(transitionDuration, null, 6).replace(/"/g, "'")},
      transitionTimingFunction: ${JSON.stringify(transitionTimingFunction, null, 6).replace(/"/g, "'")},
    },
  },
};
`;
  return preset;
}

// Helper to set nested object value from dash-path
function setNestedValue(obj, path, value) {
  const parts = path.split('-');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// Recursively build a plain object from token tree, resolving $value leaves
function resolveTokenTree(obj, resolver) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (value.$value !== undefined) {
      result[key] = resolver({ value: value.$value, type: value.$type || '' });
    } else if (typeof value === 'object') {
      result[key] = resolveTokenTree(value, resolver);
    }
  }
  return result;
}

// Build TypeScript constants
function buildTypeScript(tokens, scalesJs) {
  const obj = resolveTokenTree(tokens, (token) => toCSSValue(token));
  const lines = ['// Auto-generated by @civds/tokens — do not edit', ''];

  lines.push(`export const tokens = ${JSON.stringify(obj, null, 2)} as const;`);
  lines.push('');
  if (scalesJs) {
    lines.push(`export const scales = ${JSON.stringify(scalesJs, null, 2)} as const;`);
    lines.push('');
  }
  lines.push('export type TokenPath = string;');
  lines.push('');
  lines.push(
    'export function token(path: string): string {',
    '  const parts = path.split(".");',
    '  let current: any = tokens;',
    '  for (const part of parts) {',
    '    current = current?.[part];',
    '  }',
    '  return current ?? "";',
    '}',
    '',
  );

  return lines.join('\n');
}

// Build TypeScript declarations
function buildTypeScriptDeclarations() {
  return `// Auto-generated by @civds/tokens — do not edit
export declare const tokens: Record<string, any>;
export declare const scales: Record<string, any>;
export type TokenPath = string;
export declare function token(path: string): string;
`;
}

// Build React Native tokens
function buildReactNative(tokens, scalesRn) {
  const obj = resolveTokenTree(tokens, (token) => {
    let val = token.value;
    // Convert px strings to numbers for RN
    if (typeof val === 'string' && val.endsWith('px')) {
      return parseFloat(val);
    }
    // Format complex types
    if (token.type === 'shadow') return formatShadow(val);
    if (token.type === 'cubicBezier') return val; // Keep array for RN
    if (token.type === 'fontFamily') return val; // Keep array for RN
    return val;
  });

  const lines = ['// Auto-generated by @civds/tokens — do not edit', ''];
  lines.push(`export const tokens = ${JSON.stringify(obj, null, 2)};`);
  lines.push('');
  if (scalesRn) {
    lines.push(`export const scales = ${JSON.stringify(scalesRn, null, 2)};`);
    lines.push('');
  }
  return lines.join('\n');
}

// Main build
function build() {
  const tokens = loadTokens();
  const scalesConfig = loadScalesConfig();

  // Compute contextual scale overrides
  const { css: scalesCss, js: scalesJs, rn: scalesRn } = buildScales(tokens, scalesConfig);

  // Ensure output directories
  for (const dir of ['css', 'tailwind', 'js', 'react-native']) {
    mkdirSync(join(distDir, dir), { recursive: true });
  }

  // CSS — base tokens + scale overrides
  writeFileSync(join(distDir, 'css', 'tokens.css'), buildCSS(tokens) + '\n' + scalesCss);

  // Tailwind preset
  writeFileSync(join(distDir, 'tailwind', 'preset.js'), buildTailwindPreset(tokens));

  // TypeScript — tokens + scales export
  writeFileSync(join(distDir, 'js', 'tokens.js'), buildTypeScript(tokens, scalesJs));
  writeFileSync(join(distDir, 'js', 'tokens.d.ts'), buildTypeScriptDeclarations());

  // React Native — tokens + scales export
  writeFileSync(join(distDir, 'react-native', 'tokens.js'), buildReactNative(tokens, scalesRn));

  console.log('Tokens built successfully:');
  console.log('  dist/css/tokens.css');
  console.log('  dist/tailwind/preset.js');
  console.log('  dist/js/tokens.js');
  console.log('  dist/react-native/tokens.js');
}

build();
