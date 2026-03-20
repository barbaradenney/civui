#!/usr/bin/env node --experimental-strip-types
/**
 * CivUI Component Consistency Checker
 *
 * Scans all web component source files and verifies they follow
 * the same patterns: imports, base classes, render order, ARIA,
 * events, analytics, CSS classes, and more.
 *
 * Usage: node --experimental-strip-types tools/consistency-check.ts
 * Or:    pnpm consistency
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');
const FORMS_DIR = join(ROOT, 'packages/forms/src');
const CORE_ICON = join(ROOT, 'packages/core/src/icon/civ-icon.ts');

interface Issue {
  file: string;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

const issues: Issue[] = [];

function addIssue(file: string, rule: string, severity: Issue['severity'], message: string, line?: number) {
  issues.push({ file: file.replace(ROOT + '/', ''), rule, severity, message, line });
}

// ── Discover components ──────────────────────────────────────

interface ComponentFile {
  name: string;
  path: string;
  src: string;
  lines: string[];
}

function discoverComponents(): ComponentFile[] {
  const components: ComponentFile[] = [];
  const dirs = readdirSync(FORMS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const dir of dirs) {
    const files = readdirSync(join(FORMS_DIR, dir.name))
      .filter(f => f.startsWith('civ-') && f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.stories.'));
    for (const file of files) {
      const path = join(FORMS_DIR, dir.name, file);
      const src = readFileSync(path, 'utf-8');
      components.push({
        name: file.replace('.ts', ''),
        path,
        src,
        lines: src.split('\n'),
      });
    }
  }

  // Include icon component
  if (existsSync(CORE_ICON)) {
    const src = readFileSync(CORE_ICON, 'utf-8');
    components.push({ name: 'civ-icon', path: CORE_ICON, src, lines: src.split('\n') });
  }

  return components;
}

// ── Rules ────────────────────────────────────────────────────

function checkBaseClass(comp: ComponentFile) {
  const isFormComponent = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  const isBaseComponent = /extends\s+(CivBaseElement|LightDomContainerMixin\(CivBaseElement\))/.test(comp.src);

  if (!isFormComponent && !isBaseComponent) {
    addIssue(comp.path, 'base-class', 'error', `${comp.name} does not extend CivBaseElement or CivFormElement`);
  }
}

function checkCustomElement(comp: ComponentFile) {
  if (!/@customElement\(/.test(comp.src)) {
    addIssue(comp.path, 'custom-element', 'error', `${comp.name} missing @customElement decorator`);
  }
}

function checkRenderOrder(comp: ComponentFile) {
  const isFormParticipating = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  if (!isFormParticipating) return;

  // Check that render uses renderLabel/renderLegend, renderHint, renderError in order
  const hasLabel = /renderLabel\(/.test(comp.src) || /renderLegend\(/.test(comp.src);
  const hasHint = /renderHint\(/.test(comp.src);
  const hasError = /renderError\(/.test(comp.src);

  if (!hasLabel && !comp.name.includes('checkbox') && !comp.name.includes('radio') && !comp.name.includes('toggle') && !comp.name.includes('segment')) {
    addIssue(comp.path, 'render-order', 'warning', `${comp.name} does not use renderLabel() or renderLegend()`);
  }
  if (!hasHint && !comp.name.includes('segment') && !comp.name.includes('radio') && !comp.name.includes('checkbox') && comp.name !== 'civ-conditional' && comp.name !== 'civ-progress-steps' && comp.name !== 'civ-progress-bar') {
    addIssue(comp.path, 'render-order', 'warning', `${comp.name} does not use renderHint()`);
  }
  if (!hasError && !comp.name.includes('segment') && !comp.name.includes('radio') && !comp.name.includes('checkbox') && comp.name !== 'civ-conditional' && comp.name !== 'civ-progress-steps' && comp.name !== 'civ-progress-bar') {
    addIssue(comp.path, 'render-order', 'warning', `${comp.name} does not use renderError()`);
  }

  // Check order: label before hint before error
  if (hasLabel && hasHint) {
    const labelIdx = comp.src.indexOf('renderLabel(') !== -1 ? comp.src.indexOf('renderLabel(') : comp.src.indexOf('renderLegend(');
    const hintIdx = comp.src.indexOf('renderHint(');
    if (labelIdx > hintIdx && hintIdx !== -1) {
      addIssue(comp.path, 'render-order', 'error', `${comp.name} renders hint before label/legend`);
    }
  }
  if (hasHint && hasError) {
    const hintIdx = comp.src.indexOf('renderHint(');
    const errorIdx = comp.src.indexOf('renderError(');
    if (hintIdx > errorIdx && errorIdx !== -1) {
      addIssue(comp.path, 'render-order', 'error', `${comp.name} renders error before hint`);
    }
  }
}

function checkAriaAttributes(comp: ComponentFile) {
  const isFormParticipating = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  if (!isFormParticipating) return;

  // Check for aria-invalid
  if (!comp.src.includes('aria-invalid') && !comp.name.includes('segment') && !comp.name.includes('conditional') && !comp.name.includes('progress') && !comp.name.includes('form-group')) {
    addIssue(comp.path, 'aria', 'warning', `${comp.name} does not set aria-invalid`);
  }

  // Check for aria-required
  if (!comp.src.includes('aria-required') && !comp.name.includes('segment') && !comp.name.includes('conditional') && !comp.name.includes('progress') && !comp.name.includes('form-group')) {
    addIssue(comp.path, 'aria', 'warning', `${comp.name} does not set aria-required`);
  }

  // Check for aria-describedby
  if (!comp.src.includes('aria-describedby') && !comp.name.includes('segment') && !comp.name.includes('conditional') && !comp.name.includes('progress') && !comp.name.includes('form-group')) {
    addIssue(comp.path, 'aria', 'info', `${comp.name} does not set aria-describedby`);
  }
}

function checkEvents(comp: ComponentFile) {
  const isFormParticipating = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-steps' || comp.name === 'civ-progress-bar') return;

  // Check for civ-input event
  if (!comp.src.includes("'civ-input'") && !comp.src.includes('_handleInput')) {
    addIssue(comp.path, 'events', 'warning', `${comp.name} does not dispatch civ-input event`);
  }

  // Check for civ-change event
  if (!comp.src.includes("'civ-change'") && !comp.src.includes('_handleChange')) {
    addIssue(comp.path, 'events', 'warning', `${comp.name} does not dispatch civ-change event`);
  }
}

function checkAnalytics(comp: ComponentFile) {
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-steps' || comp.name === 'civ-progress-bar' || comp.name === 'civ-icon') return;
  if (NO_ANALYTICS.has(comp.name)) return; // Structural components don't fire analytics

  // sendAnalytics can be called directly OR inherited via _handleChange from base class
  const hasAnalytics = comp.src.includes('sendAnalytics') || comp.src.includes('_handleChange');
  if (!hasAnalytics) {
    addIssue(comp.path, 'analytics', 'warning', `${comp.name} does not call sendAnalytics()`);
  }
}

function checkFocusRing(comp: ComponentFile) {
  // Check that interactive elements use focus-visible:civ-focus-ring
  if (comp.src.includes('focus:civ-outline') || comp.src.includes('focus:civ-ring')) {
    const lineNum = comp.lines.findIndex(l => l.includes('focus:civ-outline') || l.includes('focus:civ-ring'));
    addIssue(comp.path, 'focus-ring', 'error', `${comp.name} uses deprecated focus: class instead of focus-visible:civ-focus-ring`, lineNum + 1);
  }
}

function checkTailwindPrefix(comp: ComponentFile) {
  // Check for Tailwind classes without civ- prefix
  const tailwindRegex = /\bclass="[^"]*\b(text-|bg-|border-|p-|m-|flex|grid|gap-|rounded|shadow|font-|w-|h-)(?!civ-)/;
  for (let i = 0; i < comp.lines.length; i++) {
    const line = comp.lines[i];
    // Skip import lines, comments, and string literals
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) continue;
    if (tailwindRegex.test(line)) {
      // Check if it's inside a class attribute
      const match = line.match(/class="([^"]*)"/);
      if (match) {
        const classes = match[1].split(/\s+/);
        const unprefixed = classes.filter(c =>
          /^(text-|bg-|border-|p-|m-|flex|grid|gap-|rounded|shadow|font-|w-|h-)/.test(c) &&
          !c.startsWith('civ-') &&
          c !== 'focus-visible:civ-focus-ring'
        );
        if (unprefixed.length > 0) {
          addIssue(comp.path, 'tailwind-prefix', 'error', `Unprefixed Tailwind classes: ${unprefixed.join(', ')}`, i + 1);
        }
      }
    }
  }
}

function checkFormReset(comp: ComponentFile) {
  const isFormParticipating = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-steps' || comp.name === 'civ-progress-bar' || comp.name === 'civ-form-group') return;

  if (!comp.src.includes('formResetCallback') && !comp.src.includes('_handleChange')) {
    addIssue(comp.path, 'form-reset', 'info', `${comp.name} does not override formResetCallback()`);
  }
}

function checkDisabledState(comp: ComponentFile) {
  const isFormParticipating = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomContainerMixin\(CivFormElement\))/.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-steps' || comp.name === 'civ-progress-bar') return;

  if (!comp.src.includes('disabled')) {
    addIssue(comp.path, 'disabled', 'warning', `${comp.name} does not handle disabled state`);
  }
}

function checkTestFile(comp: ComponentFile) {
  if (CHILD_COMPONENTS.has(comp.name)) return; // Tested as part of parent
  const testPath = comp.path.replace('.ts', '.test.ts');
  if (!existsSync(testPath)) {
    addIssue(comp.path, 'test-file', 'error', `${comp.name} has no test file`);
  }
}

function checkStoryFile(comp: ComponentFile) {
  const storyPath = comp.path.replace('.ts', '.stories.ts');
  if (!existsSync(storyPath)) {
    // Check if there's a shared story file in the same directory
    const dir = join(comp.path, '..');
    const storyFiles = readdirSync(dir).filter(f => f.endsWith('.stories.ts'));
    if (storyFiles.length === 0) {
      addIssue(comp.path, 'story-file', 'warning', `${comp.name} has no story file`);
    }
  }
}

function checkJSDoc(comp: ComponentFile) {
  if (!comp.src.includes('@element')) {
    addIssue(comp.path, 'jsdoc', 'info', `${comp.name} missing @element JSDoc tag`);
  }
}

// Child components that are part of their parent on native (no separate file needed)
const CHILD_COMPONENTS = new Set(['civ-segment', 'civ-radio-group']);
// Structural/utility components that don't need analytics
const NO_ANALYTICS = new Set(['civ-fieldset', 'civ-form-group', 'civ-segment']);

function checkNativeCounterparts(comp: ComponentFile) {
  if (comp.name === 'civ-icon') return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-bar') return;
  if (CHILD_COMPONENTS.has(comp.name)) return; // Part of parent component on native

  const componentName = comp.name.replace('civ-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const iosPath = join(ROOT, `packages/ios/Sources/CivUI/Civ${componentName}.swift`);
  const androidPath = join(ROOT, `packages/android/src/main/kotlin/gov/civui/components/Civ${componentName}.kt`);

  if (!existsSync(iosPath)) {
    addIssue(comp.path, 'native-ios', 'error', `${comp.name} has no iOS counterpart (expected Civ${componentName}.swift)`);
  }
  if (!existsSync(androidPath)) {
    addIssue(comp.path, 'native-android', 'error', `${comp.name} has no Android counterpart (expected Civ${componentName}.kt)`);
  }
}

// ── Run all checks ───────────────────────────────────────────

const components = discoverComponents();

for (const comp of components) {
  checkBaseClass(comp);
  checkCustomElement(comp);
  checkRenderOrder(comp);
  checkAriaAttributes(comp);
  checkEvents(comp);
  checkAnalytics(comp);
  checkFocusRing(comp);
  checkTailwindPrefix(comp);
  checkFormReset(comp);
  checkDisabledState(comp);
  checkTestFile(comp);
  checkStoryFile(comp);
  checkJSDoc(comp);
  checkNativeCounterparts(comp);
}

// ── Output ───────────────────────────────────────────────────

const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');
const infos = issues.filter(i => i.severity === 'info');

console.log(`\nCivUI Consistency Check — ${components.length} components scanned\n`);

if (errors.length > 0) {
  console.log(`\x1b[31m✗ ${errors.length} errors\x1b[0m`);
  for (const e of errors) {
    console.log(`  \x1b[31m✗\x1b[0m [${e.rule}] ${e.file}${e.line ? `:${e.line}` : ''}`);
    console.log(`    ${e.message}`);
  }
}

if (warnings.length > 0) {
  console.log(`\n\x1b[33m⚠ ${warnings.length} warnings\x1b[0m`);
  for (const w of warnings) {
    console.log(`  \x1b[33m⚠\x1b[0m [${w.rule}] ${w.file}${w.line ? `:${w.line}` : ''}`);
    console.log(`    ${w.message}`);
  }
}

if (infos.length > 0) {
  console.log(`\n\x1b[36mℹ ${infos.length} info\x1b[0m`);
  for (const info of infos) {
    console.log(`  \x1b[36mℹ\x1b[0m [${info.rule}] ${info.file}${info.line ? `:${info.line}` : ''}`);
    console.log(`    ${info.message}`);
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\x1b[32m✓ All components are consistent!\x1b[0m');
}

console.log(`\nSummary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info\n`);

if (errors.length > 0) process.exit(1);
