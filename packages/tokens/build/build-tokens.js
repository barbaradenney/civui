/**
 * CivUI Token Builder — Style Dictionary v4
 *
 * Reads W3C DTCG .tokens.json files and outputs:
 * - CSS custom properties (dist/css/tokens.css)
 * - Tailwind preset (dist/tailwind/preset.js)
 * - TypeScript constants (dist/js/tokens.js + tokens.d.ts)
 * - React Native values (dist/react-native/tokens.js)
 * - Swift constants (dist/swift/CivTokens.swift)
 * - Kotlin constants (dist/kotlin/CivTokens.kt)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');
const distDir = join(__dirname, '..', 'dist');

// Read all DTCG token files (excludes scales config and dark mode overrides)
function loadTokens() {
  const tokens = {};
  const files = readdirSync(srcDir).filter(
    (f) => f.endsWith('.tokens.json') && f !== 'scales.tokens.json' && f !== 'color-dark.tokens.json',
  );
  for (const file of files) {
    const content = JSON.parse(readFileSync(join(srcDir, file), 'utf-8'));
    Object.assign(tokens, content);
  }
  return tokens;
}

// Load dark mode color overrides
function loadDarkTokens() {
  const darkFile = join(srcDir, 'color-dark.tokens.json');
  return JSON.parse(readFileSync(darkFile, 'utf-8'));
}

// Build dark mode CSS overrides wrapped in @media (prefers-color-scheme: dark)
function buildDarkCSS(darkTokens) {
  const flat = flattenTokens(darkTokens);
  const lines = [
    '',
    '/* Dark mode — system preference */',
    '@media (prefers-color-scheme: dark) {',
    '  :root {',
  ];
  for (const token of flat) {
    const varName = `--civ-${token.path}`;
    lines.push(`    ${varName}: ${toCSSValue(token)};`);
  }
  lines.push('  }', '}');
  return lines.join('\n');
}

// Collect all leaf token paths from a token tree (for parity checking)
function collectTokenPaths(obj, prefix = '', result = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value.$value !== undefined) {
      result.push(path);
    } else if (typeof value === 'object') {
      collectTokenPaths(value, path, result);
    }
  }
  return result;
}

// Verify dark tokens have the same keys as the corresponding light tokens
function validateDarkTokenParity(lightTokens, darkTokens) {
  const lightPaths = collectTokenPaths(lightTokens).sort();
  const darkPaths = collectTokenPaths(darkTokens).sort();
  const missingInDark = lightPaths.filter((p) => !darkPaths.includes(p));
  const extraInDark = darkPaths.filter((p) => !lightPaths.includes(p));
  const errors = [];
  if (missingInDark.length > 0) {
    errors.push(`Dark tokens missing keys present in light tokens: ${missingInDark.join(', ')}`);
  }
  if (extraInDark.length > 0) {
    errors.push(`Dark tokens have extra keys not in light tokens: ${extraInDark.join(', ')}`);
  }
  if (errors.length > 0) {
    throw new Error(`Token parity check failed:\n  ${errors.join('\n  ')}`);
  }
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
    if (scaleName === 'default') continue; // default = :root baseline

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
    lines.push(`[data-civ-scale="${scaleName}"] {`);
    for (const [name, value] of Object.entries(cssFontSize)) {
      lines.push(`  --civ-typography-fontSize-${name}: ${value};`);
    }
    for (const [key, value] of Object.entries(cssSpacing)) {
      lines.push(`  --civ-spacing-${key}: ${value};`);
    }
    lines.push(`  --civ-typography-lineHeight-normal: ${lineHeight.body};`);
    lines.push(`  --civ-typography-lineHeight-tight: ${lineHeight.heading};`);
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
  const lines = ['/* Auto-generated by @civui/tokens — do not edit */', '', ':root {'];
  for (const token of flat) {
    const varName = `--civ-${token.path}`;
    let value = toCSSValue(token);
    // Convert font sizes from px to rem for text-resize accessibility (WCAG 1.4.4)
    if (token.path.startsWith('typography-fontSize-') && typeof token.value === 'string' && token.value.endsWith('px')) {
      const px = parseFloat(token.value);
      value = `${px / 16}rem`;
    }
    lines.push(`  ${varName}: ${value};`);
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
    const varRef = `var(--civ-${token.path})`;

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

  const preset = `// Auto-generated by @civui/tokens — do not edit
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
  const lines = ['// Auto-generated by @civui/tokens — do not edit', ''];

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
  return `// Auto-generated by @civui/tokens — do not edit
export declare const tokens: Record<string, any>;
export declare const scales: Record<string, any>;
export type TokenPath = string;
export declare function token(path: string): string;
`;
}

// Resolve a token value for React Native output
function resolveRnValue(token) {
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
}

// Build React Native tokens
function buildReactNative(tokens, scalesRn) {
  const obj = resolveTokenTree(tokens, resolveRnValue);

  const lines = ['// Auto-generated by @civui/tokens — do not edit', ''];
  lines.push(`export const tokens = ${JSON.stringify(obj, null, 2)};`);
  lines.push('');
  if (scalesRn) {
    lines.push(`export const scales = ${JSON.stringify(scalesRn, null, 2)};`);
    lines.push('');
  }
  return lines.join('\n');
}

// Convert hex color string to Swift Color literal components
function hexToSwiftComponents(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return { r: round(r, 3), g: round(g, 3), b: round(b, 3) };
}

// Convert a token key to Swift camelCase identifier
function toSwiftIdentifier(key) {
  // Handle numeric keys like "0.5", "2xl"
  if (/^\d/.test(key)) {
    return `_${key.replace('.', '_')}`;
  }
  // Convert dash-case to camelCase
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Convert a token key to Kotlin camelCase identifier
function toKotlinIdentifier(key) {
  if (/^\d/.test(key)) {
    return `_${key.replace('.', '_')}`;
  }
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Build Swift token constants
function buildSwift(tokens, darkTokens, scalesRn) {
  const lines = [
    '// Auto-generated by @civui/tokens — do not edit',
    '',
    'import SwiftUI',
    '',
    '// MARK: - CivTokens',
    '',
    '/// CivUI design tokens for SwiftUI.',
    '/// Government design system — WCAG AA accessible, Section 508 compliant.',
    'public enum CivTokens {',
  ];

  // Colors
  lines.push('');
  lines.push('    // MARK: Colors');
  lines.push('');
  lines.push('    public enum Colors {');
  buildSwiftColorGroup(tokens.color, lines, '        ', false);
  lines.push('    }');

  // Dark colors
  lines.push('');
  lines.push('    // MARK: Dark Colors');
  lines.push('');
  lines.push('    public enum DarkColors {');
  buildSwiftColorGroup(darkTokens.color, lines, '        ', false);
  lines.push('    }');

  // Adaptive color helper
  lines.push('');
  lines.push('    // MARK: Adaptive Colors');
  lines.push('');
  lines.push('    /// Returns the appropriate color for the current color scheme.');
  lines.push('    public static func color(_ light: Color, dark: Color, colorScheme: ColorScheme) -> Color {');
  lines.push('        colorScheme == .dark ? dark : light');
  lines.push('    }');

  // Spacing
  lines.push('');
  lines.push('    // MARK: Spacing');
  lines.push('');
  lines.push('    public enum Spacing {');
  for (const [key, val] of Object.entries(tokens.spacing)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = toSwiftIdentifier(key);
    lines.push(`        public static let ${id}: CGFloat = ${px}`);
  }
  lines.push('    }');

  // Typography
  lines.push('');
  lines.push('    // MARK: Typography');
  lines.push('');
  lines.push('    public enum Typography {');

  // Font families
  lines.push('        public enum FontFamily {');
  for (const [key, val] of Object.entries(tokens.typography.fontFamily)) {
    if (key.startsWith('$')) continue;
    const primary = val.$value[0];
    lines.push(`            public static let ${toSwiftIdentifier(key)} = "${primary}"`);
  }
  lines.push('        }');

  // Font sizes
  lines.push('');
  lines.push('        public enum FontSize {');
  for (const [key, val] of Object.entries(tokens.typography.fontSize)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    lines.push(`            public static let ${toSwiftIdentifier(key)}: CGFloat = ${px}`);
  }
  lines.push('        }');

  // Font weights
  lines.push('');
  lines.push('        public enum FontWeight {');
  for (const [key, val] of Object.entries(tokens.typography.fontWeight)) {
    if (key.startsWith('$')) continue;
    const swiftWeight = { 300: '.light', 400: '.regular', 600: '.semibold', 700: '.bold' }[val.$value] || '.regular';
    lines.push(`            public static let ${toSwiftIdentifier(key)}: Font.Weight = ${swiftWeight}`);
  }
  lines.push('        }');

  // Line heights
  lines.push('');
  lines.push('        public enum LineHeight {');
  for (const [key, val] of Object.entries(tokens.typography.lineHeight)) {
    if (key.startsWith('$')) continue;
    lines.push(`            public static let ${toSwiftIdentifier(key)}: CGFloat = ${val.$value}`);
  }
  lines.push('        }');

  lines.push('    }');

  // Border
  lines.push('');
  lines.push('    // MARK: Border');
  lines.push('');
  lines.push('    public enum Border {');
  lines.push('        public enum Radius {');
  for (const [key, val] of Object.entries(tokens.border.radius)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = key === 'DEFAULT' ? 'default_' : toSwiftIdentifier(key);
    lines.push(`            public static let ${id}: CGFloat = ${px}`);
  }
  lines.push('        }');
  lines.push('');
  lines.push('        public enum Width {');
  for (const [key, val] of Object.entries(tokens.border.width)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = key === 'DEFAULT' ? 'default_' : toSwiftIdentifier(key);
    lines.push(`            public static let ${id}: CGFloat = ${px}`);
  }
  lines.push('        }');
  lines.push('    }');

  // Shadow
  lines.push('');
  lines.push('    // MARK: Shadow');
  lines.push('');
  lines.push('    public struct ShadowValue {');
  lines.push('        public let x: CGFloat');
  lines.push('        public let y: CGFloat');
  lines.push('        public let blur: CGFloat');
  lines.push('        public let color: Color');
  lines.push('    }');
  lines.push('');
  lines.push('    public enum Shadow {');
  for (const [key, val] of Object.entries(tokens.shadow)) {
    if (key.startsWith('$')) continue;
    const s = val.$value;
    const id = key === 'DEFAULT' ? 'default_' : toSwiftIdentifier(key);
    const x = parseFloat(s.offsetX);
    const y = parseFloat(s.offsetY);
    const blur = parseFloat(s.blur);
    // Parse rgba color for shadow
    const colorStr = s.color === 'transparent' ? '.clear' : `.black.opacity(0.1)`;
    lines.push(`        public static let ${id} = ShadowValue(x: ${x}, y: ${y}, blur: ${blur}, color: ${colorStr})`);
  }
  lines.push('    }');

  // Motion
  lines.push('');
  lines.push('    // MARK: Motion');
  lines.push('');
  lines.push('    public enum Motion {');
  lines.push('        public enum Duration {');
  for (const [key, val] of Object.entries(tokens.motion.duration)) {
    if (key.startsWith('$')) continue;
    const ms = parseFloat(val.$value);
    const seconds = round(ms / 1000, 3);
    lines.push(`            public static let ${toSwiftIdentifier(key)}: Double = ${seconds}`);
  }
  lines.push('        }');
  lines.push('');
  lines.push('        public enum Easing {');
  for (const [key, val] of Object.entries(tokens.motion.easing)) {
    if (key.startsWith('$')) continue;
    const [x1, y1, x2, y2] = val.$value;
    const id = toSwiftIdentifier(key);
    lines.push(`            public static let ${id} = UnitCurve.bezier(startControlPoint: UnitPoint(x: ${x1}, y: ${y1}), endControlPoint: UnitPoint(x: ${x2}, y: ${y2}))`);
  }
  lines.push('        }');
  lines.push('    }');

  // Focus
  lines.push('');
  lines.push('    // MARK: Focus');
  lines.push('');
  lines.push('    public enum Focus {');
  const focusOutlineColor = hexToSwiftComponents(tokens.focus.outline.color.$value);
  lines.push(`        public static let outlineColor = Color(red: ${focusOutlineColor.r}, green: ${focusOutlineColor.g}, blue: ${focusOutlineColor.b})`);
  lines.push(`        public static let outlineWidth: CGFloat = ${parseFloat(tokens.focus.outline.width.$value)}`);
  lines.push(`        public static let outlineOffset: CGFloat = ${parseFloat(tokens.focus.outline.offset.$value)}`);
  const focusShadowColor = hexToSwiftComponents(tokens.focus.shadow.color.$value);
  lines.push(`        public static let shadowColor = Color(red: ${focusShadowColor.r}, green: ${focusShadowColor.g}, blue: ${focusShadowColor.b})`);
  lines.push(`        public static let shadowSpread: CGFloat = ${parseFloat(tokens.focus.shadow.spread.$value)}`);
  lines.push('    }');

  // Scales
  if (scalesRn) {
    lines.push('');
    lines.push('    // MARK: Density Scales');
    lines.push('');
    lines.push('    public enum Scale {');
    for (const [scaleName, scale] of Object.entries(scalesRn)) {
      const enumName = scaleName.charAt(0).toUpperCase() + scaleName.slice(1);
      lines.push(`        public enum ${enumName} {`);
      lines.push('            public enum FontSize {');
      for (const [key, val] of Object.entries(scale.fontSize)) {
        lines.push(`                public static let ${toSwiftIdentifier(key)}: CGFloat = ${val}`);
      }
      lines.push('            }');
      lines.push('            public enum Spacing {');
      for (const [key, val] of Object.entries(scale.spacing)) {
        lines.push(`                public static let ${toSwiftIdentifier(key)}: CGFloat = ${val}`);
      }
      lines.push('            }');
      lines.push(`            public static let bodyLineHeight: CGFloat = ${scale.lineHeight.body}`);
      lines.push(`            public static let headingLineHeight: CGFloat = ${scale.lineHeight.heading}`);
      lines.push('        }');
    }
    lines.push('    }');
  }

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// Recursively build Swift color enums from color token tree
function buildSwiftColorGroup(colorObj, lines, indent, isNested) {
  for (const [key, val] of Object.entries(colorObj)) {
    if (key.startsWith('$')) continue;

    // Check if this level has $type (direct children are leaves)
    if (val.$value !== undefined) {
      // Leaf node — a color value
      const id = key === 'DEFAULT' ? 'default_' : toSwiftIdentifier(key);
      const { r, g, b } = hexToSwiftComponents(val.$value);
      lines.push(`${indent}public static let ${id} = Color(red: ${r}, green: ${g}, blue: ${b})`);
    } else if (val.$type === 'color' || (typeof val === 'object' && !val.$value)) {
      // Group node — nested enum
      const enumName = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(`${indent}public enum ${enumName} {`);
      buildSwiftColorGroup(val, lines, indent + '    ', true);
      lines.push(`${indent}}`);
    }
  }
}

// Build Kotlin token constants for Jetpack Compose
function buildKotlin(tokens, darkTokens, scalesRn) {
  const lines = [
    '// Auto-generated by @civui/tokens — do not edit',
    '',
    'package gov.civui.tokens',
    '',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.unit.dp',
    'import androidx.compose.ui.unit.sp',
    '',
    '/**',
    ' * CivUI design tokens for Jetpack Compose.',
    ' * Government design system — WCAG AA accessible, Section 508 compliant.',
    ' */',
    'object CivTokens {',
  ];

  // Colors
  lines.push('');
  lines.push('    // region Colors');
  lines.push('');
  lines.push('    object Colors {');
  buildKotlinColorGroup(tokens.color, lines, '        ');
  lines.push('    }');

  // Dark colors
  lines.push('');
  lines.push('    // region Dark Colors');
  lines.push('');
  lines.push('    object DarkColors {');
  buildKotlinColorGroup(darkTokens.color, lines, '        ');
  lines.push('    }');

  // Spacing
  lines.push('');
  lines.push('    // region Spacing');
  lines.push('');
  lines.push('    object Spacing {');
  for (const [key, val] of Object.entries(tokens.spacing)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = toKotlinIdentifier(key);
    lines.push(`        val ${id} = ${px}.dp`);
  }
  lines.push('    }');

  // Typography
  lines.push('');
  lines.push('    // region Typography');
  lines.push('');
  lines.push('    object Typography {');

  lines.push('        object FontFamily {');
  for (const [key, val] of Object.entries(tokens.typography.fontFamily)) {
    if (key.startsWith('$')) continue;
    const primary = val.$value[0];
    lines.push(`            const val ${toKotlinIdentifier(key)} = "${primary}"`);
  }
  lines.push('        }');

  lines.push('');
  lines.push('        object FontSize {');
  for (const [key, val] of Object.entries(tokens.typography.fontSize)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    lines.push(`            val ${toKotlinIdentifier(key)} = ${px}.sp`);
  }
  lines.push('        }');

  lines.push('');
  lines.push('        object FontWeights {');
  for (const [key, val] of Object.entries(tokens.typography.fontWeight)) {
    if (key.startsWith('$')) continue;
    const kotlinWeight = {
      300: 'FontWeight.Light',
      400: 'FontWeight.Normal',
      600: 'FontWeight.SemiBold',
      700: 'FontWeight.Bold',
    }[val.$value] || 'FontWeight.Normal';
    lines.push(`            val ${toKotlinIdentifier(key)} = ${kotlinWeight}`);
  }
  lines.push('        }');

  lines.push('');
  lines.push('        object LineHeight {');
  for (const [key, val] of Object.entries(tokens.typography.lineHeight)) {
    if (key.startsWith('$')) continue;
    lines.push(`            const val ${toKotlinIdentifier(key)} = ${val.$value}f`);
  }
  lines.push('        }');

  lines.push('    }');

  // Border
  lines.push('');
  lines.push('    // region Border');
  lines.push('');
  lines.push('    object Border {');
  lines.push('        object Radius {');
  for (const [key, val] of Object.entries(tokens.border.radius)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = key === 'DEFAULT' ? 'default_' : toKotlinIdentifier(key);
    lines.push(`            val ${id} = ${px}.dp`);
  }
  lines.push('        }');
  lines.push('');
  lines.push('        object Width {');
  for (const [key, val] of Object.entries(tokens.border.width)) {
    if (key.startsWith('$')) continue;
    const px = parseFloat(val.$value);
    const id = key === 'DEFAULT' ? 'default_' : toKotlinIdentifier(key);
    lines.push(`            val ${id} = ${px}.dp`);
  }
  lines.push('        }');
  lines.push('    }');

  // Shadow
  lines.push('');
  lines.push('    // region Shadow');
  lines.push('');
  lines.push('    data class ShadowValue(val x: Float, val y: Float, val blur: Float, val color: Color)');
  lines.push('');
  lines.push('    object Shadow {');
  for (const [key, val] of Object.entries(tokens.shadow)) {
    if (key.startsWith('$')) continue;
    const s = val.$value;
    const id = key === 'DEFAULT' ? 'default_' : toKotlinIdentifier(key);
    const x = parseFloat(s.offsetX);
    const y = parseFloat(s.offsetY);
    const blur = parseFloat(s.blur);
    const colorStr = s.color === 'transparent' ? 'Color.Transparent' : 'Color.Black.copy(alpha = 0.1f)';
    lines.push(`        val ${id} = ShadowValue(x = ${x}f, y = ${y}f, blur = ${blur}f, color = ${colorStr})`);
  }
  lines.push('    }');

  // Motion
  lines.push('');
  lines.push('    // region Motion');
  lines.push('');
  lines.push('    object Motion {');
  lines.push('        object Duration {');
  for (const [key, val] of Object.entries(tokens.motion.duration)) {
    if (key.startsWith('$')) continue;
    const ms = parseFloat(val.$value);
    lines.push(`            const val ${toKotlinIdentifier(key)} = ${Math.round(ms)}`);
  }
  lines.push('        }');
  lines.push('');
  lines.push('        object Easing {');
  for (const [key, val] of Object.entries(tokens.motion.easing)) {
    if (key.startsWith('$')) continue;
    const [x1, y1, x2, y2] = val.$value;
    const id = toKotlinIdentifier(key);
    lines.push(`            val ${id} = androidx.compose.animation.core.CubicBezierEasing(${x1}f, ${y1}f, ${x2}f, ${y2}f)`);
  }
  lines.push('        }');
  lines.push('    }');

  // Focus
  lines.push('');
  lines.push('    // region Focus');
  lines.push('');
  lines.push('    object Focus {');
  const focusOutlineHex = tokens.focus.outline.color.$value.replace('#', '');
  lines.push(`        val outlineColor = Color(0xFF${focusOutlineHex.toUpperCase()})`);
  lines.push(`        val outlineWidth = ${parseFloat(tokens.focus.outline.width.$value)}.dp`);
  lines.push(`        val outlineOffset = ${parseFloat(tokens.focus.outline.offset.$value)}.dp`);
  const focusShadowHex = tokens.focus.shadow.color.$value.replace('#', '');
  lines.push(`        val shadowColor = Color(0xFF${focusShadowHex.toUpperCase()})`);
  lines.push(`        val shadowSpread = ${parseFloat(tokens.focus.shadow.spread.$value)}.dp`);
  lines.push('    }');

  // Scales
  if (scalesRn) {
    lines.push('');
    lines.push('    // region Density Scales');
    lines.push('');
    lines.push('    object Scale {');
    for (const [scaleName, scale] of Object.entries(scalesRn)) {
      const objName = scaleName.charAt(0).toUpperCase() + scaleName.slice(1);
      lines.push(`        object ${objName} {`);
      lines.push('            object FontSize {');
      for (const [key, val] of Object.entries(scale.fontSize)) {
        lines.push(`                val ${toKotlinIdentifier(key)} = ${round(val, 1)}.sp`);
      }
      lines.push('            }');
      lines.push('            object Spacing {');
      for (const [key, val] of Object.entries(scale.spacing)) {
        lines.push(`                val ${toKotlinIdentifier(key)} = ${val}.dp`);
      }
      lines.push('            }');
      lines.push(`            const val bodyLineHeight = ${scale.lineHeight.body}f`);
      lines.push(`            const val headingLineHeight = ${scale.lineHeight.heading}f`);
      lines.push('        }');
    }
    lines.push('    }');
  }

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// Recursively build Kotlin color objects from color token tree
function buildKotlinColorGroup(colorObj, lines, indent) {
  for (const [key, val] of Object.entries(colorObj)) {
    if (key.startsWith('$')) continue;

    if (val.$value !== undefined) {
      const id = key === 'DEFAULT' ? 'default_' : toKotlinIdentifier(key);
      const hex = val.$value.replace('#', '').toUpperCase();
      lines.push(`${indent}val ${id} = Color(0xFF${hex})`);
    } else if (val.$type === 'color' || (typeof val === 'object' && !val.$value)) {
      const objName = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(`${indent}object ${objName} {`);
      buildKotlinColorGroup(val, lines, indent + '    ');
      lines.push(`${indent}}`);
    }
  }
}

// Main build
function build() {
  const tokens = loadTokens();
  const scalesConfig = loadScalesConfig();
  const darkTokens = loadDarkTokens();

  // Validate dark token keys match light token keys
  validateDarkTokenParity({ color: tokens.color }, darkTokens);

  // Compute contextual scale overrides
  const { css: scalesCss, js: scalesJs, rn: scalesRn } = buildScales(tokens, scalesConfig);

  // Build dark mode CSS overrides
  const darkCss = buildDarkCSS(darkTokens);

  // Ensure output directories
  for (const dir of ['css', 'tailwind', 'js', 'react-native', 'swift', 'kotlin']) {
    mkdirSync(join(distDir, dir), { recursive: true });
  }

  // CSS — base tokens + scale overrides + dark mode
  writeFileSync(join(distDir, 'css', 'tokens.css'), buildCSS(tokens) + '\n' + scalesCss + '\n' + darkCss);

  // Tailwind preset
  writeFileSync(join(distDir, 'tailwind', 'preset.js'), buildTailwindPreset(tokens));

  // TypeScript — tokens + scales export
  writeFileSync(join(distDir, 'js', 'tokens.js'), buildTypeScript(tokens, scalesJs));
  writeFileSync(join(distDir, 'js', 'tokens.d.ts'), buildTypeScriptDeclarations());

  // React Native — tokens + scales + dark tokens export
  const darkRnTokens = resolveTokenTree(darkTokens, resolveRnValue);
  writeFileSync(
    join(distDir, 'react-native', 'tokens.js'),
    buildReactNative(tokens, scalesRn) + '\n' +
    `export const darkTokens = ${JSON.stringify(darkRnTokens, null, 2)};\n`,
  );

  // Swift — native iOS tokens
  writeFileSync(join(distDir, 'swift', 'CivTokens.swift'), buildSwift(tokens, darkTokens, scalesRn));

  // Kotlin — native Android tokens
  writeFileSync(join(distDir, 'kotlin', 'CivTokens.kt'), buildKotlin(tokens, darkTokens, scalesRn));

  console.log('Tokens built successfully:');
  console.log('  dist/css/tokens.css');
  console.log('  dist/tailwind/preset.js');
  console.log('  dist/js/tokens.js');
  console.log('  dist/react-native/tokens.js');
  console.log('  dist/swift/CivTokens.swift');
  console.log('  dist/kotlin/CivTokens.kt');
}

build();
