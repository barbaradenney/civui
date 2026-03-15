#!/usr/bin/env node

/**
 * Diff Check — Generated vs Hand-Written Component Comparison
 *
 * Compares generated web components against hand-written implementations
 * to identify structural divergence. Reports differences in:
 * - Class name and base class
 * - Property declarations
 * - Event handler methods
 * - Template structure (render elements)
 * - Import patterns
 *
 * Run: pnpm --filter @civui/codegen diff
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

// Map from component name to hand-written file path
const COMPONENT_MAP: Record<string, string> = {
  'civ-text-input': 'forms/src/text-input/civ-text-input.ts',
  'civ-textarea': 'forms/src/textarea/civ-textarea.ts',
  'civ-select': 'forms/src/select/civ-select.ts',
  'civ-checkbox': 'forms/src/checkbox/civ-checkbox.ts',
  'civ-checkbox-group': 'forms/src/checkbox/civ-checkbox-group.ts',
  'civ-toggle': 'forms/src/toggle/civ-toggle.ts',
  'civ-radio-group': 'forms/src/radio/civ-radio-group.ts',
  'civ-combobox': 'forms/src/combobox/civ-combobox.ts',
  'civ-date-picker': 'forms/src/date-picker/civ-date-picker.ts',
  'civ-memorable-date': 'forms/src/date-input/civ-memorable-date.ts',
  'civ-file-upload': 'forms/src/file-upload/civ-file-upload.ts',
  'civ-segmented-control': 'forms/src/segmented-control/civ-segmented-control.ts',
  'civ-form': 'forms/src/form/civ-form.ts',
  'civ-form-group': 'forms/src/form-group/civ-form-group.ts',
  'civ-fieldset': 'forms/src/fieldset/civ-fieldset.ts',
};

interface DiffResult {
  component: string;
  differences: string[];
  handWrittenPath: string;
  generatedPath: string;
}

function extractProperties(code: string): string[] {
  const propRegex = /@property\(\{[^}]+\}\)\s+(\w+)/g;
  const props: string[] = [];
  let match;
  while ((match = propRegex.exec(code)) !== null) {
    props.push(match[1]);
  }
  return props.sort();
}

function extractMethods(code: string): string[] {
  const methodRegex = /(?:private|protected|public|override)?\s+(?:get\s+)?(\w+)\s*\(/g;
  const methods: string[] = [];
  let match;
  while ((match = methodRegex.exec(code)) !== null) {
    const name = match[1];
    if (!['constructor', 'static', 'import', 'export', 'if', 'for', 'while', 'return', 'switch', 'case'].includes(name)) {
      methods.push(name);
    }
  }
  return [...new Set(methods)].sort();
}

function extractBaseClass(code: string): string | null {
  const match = code.match(/class\s+\w+\s+extends\s+(\w+)/);
  return match ? match[1] : null;
}

function extractCustomElement(code: string): string | null {
  const match = code.match(/@customElement\(['"]([^'"]+)['"]\)/);
  return match ? match[1] : null;
}

function extractHTMLElements(code: string): string[] {
  const elRegex = /<(fieldset|input|select|textarea|button|label|div|span|option|abbr)\b/g;
  const elements: string[] = [];
  let match;
  while ((match = elRegex.exec(code)) !== null) {
    elements.push(match[1]);
  }
  return [...new Set(elements)].sort();
}

function extractImports(code: string): string[] {
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }
  return imports.sort();
}

function compareComponent(name: string): DiffResult | null {
  const handWrittenRel = COMPONENT_MAP[name];
  if (!handWrittenRel) return null;

  const handWrittenPath = join(rootDir, handWrittenRel);
  const stripped = name.replace(/^civ-/, '');
  const generatedPath = join(rootDir, 'codegen', 'dist', 'web', stripped, `${name}.generated.ts`);

  if (!existsSync(handWrittenPath)) {
    return { component: name, differences: [`Hand-written file not found: ${handWrittenRel}`], handWrittenPath, generatedPath };
  }

  if (!existsSync(generatedPath)) {
    return { component: name, differences: [`Generated file not found. Run 'pnpm generate' first.`], handWrittenPath, generatedPath };
  }

  const handWritten = readFileSync(handWrittenPath, 'utf-8');
  const generated = readFileSync(generatedPath, 'utf-8');
  const differences: string[] = [];

  // Compare base class
  const hwBase = extractBaseClass(handWritten);
  const genBase = extractBaseClass(generated);
  if (hwBase !== genBase) {
    differences.push(`Base class: hand-written="${hwBase}" generated="${genBase}"`);
  }

  // Compare custom element name
  const hwTag = extractCustomElement(handWritten);
  const genTag = extractCustomElement(generated);
  if (hwTag !== genTag) {
    differences.push(`Custom element: hand-written="${hwTag}" generated="${genTag}"`);
  }

  // Compare properties
  const hwProps = extractProperties(handWritten);
  const genProps = extractProperties(generated);
  const missingProps = hwProps.filter(p => !genProps.includes(p));
  const extraProps = genProps.filter(p => !hwProps.includes(p));
  if (missingProps.length > 0) {
    differences.push(`Props in hand-written but not generated: ${missingProps.join(', ')}`);
  }
  if (extraProps.length > 0) {
    differences.push(`Props in generated but not hand-written: ${extraProps.join(', ')}`);
  }

  // Compare HTML elements used
  const hwElements = extractHTMLElements(handWritten);
  const genElements = extractHTMLElements(generated);
  const missingEls = hwElements.filter(e => !genElements.includes(e));
  const extraEls = genElements.filter(e => !hwElements.includes(e));
  if (missingEls.length > 0) {
    differences.push(`HTML elements in hand-written but not generated: ${missingEls.join(', ')}`);
  }
  if (extraEls.length > 0) {
    differences.push(`HTML elements in generated but not hand-written: ${extraEls.join(', ')}`);
  }

  // Compare import sources
  const hwImports = extractImports(handWritten);
  const genImports = extractImports(generated);
  const missingImports = hwImports.filter(i => !genImports.includes(i));
  if (missingImports.length > 0) {
    differences.push(`Imports in hand-written but not generated: ${missingImports.join(', ')}`);
  }

  return { component: name, differences, handWrittenPath, generatedPath };
}

function main(): void {
  console.log('\nCivUI Diff Check — Generated vs Hand-Written\n');
  console.log('=' .repeat(60));

  let totalDiffs = 0;
  let totalComponents = 0;
  let perfectMatches = 0;

  for (const name of Object.keys(COMPONENT_MAP)) {
    totalComponents++;
    const result = compareComponent(name);
    if (!result) continue;

    if (result.differences.length === 0) {
      console.log(`  ✓ ${name} — no structural differences`);
      perfectMatches++;
    } else {
      console.log(`  △ ${name} — ${result.differences.length} difference(s):`);
      for (const diff of result.differences) {
        console.log(`      ${diff}`);
        totalDiffs++;
      }
    }
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log(`Summary: ${totalComponents} components, ${perfectMatches} perfect matches, ${totalDiffs} total differences`);

  if (totalDiffs > 0) {
    console.log('\nNote: Differences are expected during development. The generated code');
    console.log('captures the schema-defined structure, while hand-written code may include');
    console.log('additional logic (complex event handling, keyboard navigation, etc.).');
  }
}

main();
