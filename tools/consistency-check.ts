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
const COMPONENT_DIRS = [
  join(ROOT, 'packages/inputs/src'),
  join(ROOT, 'packages/controls/src'),
  join(ROOT, 'packages/compound/src'),
  join(ROOT, 'packages/form-patterns/src'),
  join(ROOT, 'packages/actions/src'),
  join(ROOT, 'packages/overlays/src'),
  join(ROOT, 'packages/layout/src'),
  join(ROOT, 'packages/navigation/src'),
  join(ROOT, 'packages/feedback/src'),
];
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

  for (const baseDir of COMPONENT_DIRS) {
    if (!existsSync(baseDir)) continue;
    const dirs = readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());

    for (const dir of dirs) {
      const dirPath = join(baseDir, dir.name);
      const files = readdirSync(dirPath)
        .filter(f => f.startsWith('civ-') && f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.stories.'));
      for (const file of files) {
        const path = join(dirPath, file);
        const src = readFileSync(path, 'utf-8');
        components.push({
          name: file.replace('.ts', ''),
          path,
          src,
          lines: src.split('\n'),
        });
      }
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

const FORM_CLASS_RE = /extends\s+(CivFormElement|CivBooleanFormElement|LightDomSlotMixin\(CivFormElement\)|LightDomTextMixin\(CivFormElement\)|PresetInputWrapper)/;
const BASE_CLASS_RE = /extends\s+(CivBaseElement|LightDomSlotMixin\(CivBaseElement\)|LightDomTextMixin\(CivBaseElement\))/;

// Preset wrapper components that delegate to an inner civ-text-input or
// civ-combobox child. They don't call renderLabel/renderHint/renderError
// directly — the wrapped child does — so the render-order, aria-attribute,
// and label-association audits don't apply. Bare controls and self-
// contained group components are NOT in this set: they each render their
// own chrome and are audited normally.
const CHILD_INPUT_WRAPPERS = new Set([
  'civ-country',
  'civ-ssn', 'civ-ein', 'civ-zip', 'civ-phone', 'civ-email',
  'civ-currency', 'civ-routing-number', 'civ-va-file-number',
]);

function checkBaseClass(comp: ComponentFile) {
  const isFormComponent = FORM_CLASS_RE.test(comp.src);
  const isBaseComponent = BASE_CLASS_RE.test(comp.src);

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
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (CHILD_INPUT_WRAPPERS.has(comp.name)) return; // Label/hint/error rendered by the inner child input

  // Check that render uses renderLabel/renderLegend, renderHint, renderError in order.
  // Compound components (address, direct-deposit, etc.) use `renderFormHeader(...)`
  // which renders the legend/hint/error block as a unit — that's a recognized
  // path and counts as both renderHint and renderError being present.
  const hasFormHeader = /renderFormHeader\(/.test(comp.src);
  const hasLabel = /renderLabel\(/.test(comp.src) || /renderLegend\(/.test(comp.src) || hasFormHeader;
  const hasHint = /renderHint\(/.test(comp.src) || hasFormHeader;
  const hasError = /renderError\(/.test(comp.src) || hasFormHeader;

  if (!hasLabel && !comp.name.includes('checkbox') && !comp.name.includes('radio') && !comp.name.includes('toggle') && !comp.name.includes('segment')) {
    addIssue(comp.path, 'render-order', 'warning', `${comp.name} does not use renderLabel() or renderLegend()`);
  }
  if (!hasHint && !comp.name.includes('segment') && !comp.name.includes('radio') && !comp.name.includes('checkbox') && comp.name !== 'civ-conditional' && comp.name !== 'civ-progress' && comp.name !== 'civ-progress-bar') {
    addIssue(comp.path, 'render-order', 'warning', `${comp.name} does not use renderHint()`);
  }
  if (!hasError && !comp.name.includes('segment') && !comp.name.includes('radio') && !comp.name.includes('checkbox') && comp.name !== 'civ-conditional' && comp.name !== 'civ-progress' && comp.name !== 'civ-progress-bar') {
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
    // Self-contained components with tile layouts (checkbox, radio,
    // segmented-control) deliberately render the error OUTSIDE the
    // tile body — typically above the tile so the user sees the
    // validation message before they interact with the control. The
    // generic "hint must come before error in source" rule doesn't
    // fit that layout, so skip it for those families. The same
    // components are also excluded from the `hasHint` / `hasError`
    // existence warnings above for the same reason.
    const isTileLayout = comp.name.includes('checkbox') ||
                         comp.name.includes('radio') ||
                         comp.name.includes('segment');
    if (!isTileLayout) {
      const hintIdx = comp.src.indexOf('renderHint(');
      const errorIdx = comp.src.indexOf('renderError(');
      if (hintIdx > errorIdx && errorIdx !== -1) {
        addIssue(comp.path, 'render-order', 'error', `${comp.name} renders error before hint`);
      }
    }
  }
}

function checkAriaAttributes(comp: ComponentFile) {
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  // Components in CHILD_INPUT_WRAPPERS render their input via a child element
  // (civ-text-input, civ-date-picker, etc.) that owns the aria-* attributes
  // — preset wrappers (ssn/ein/zip/...), composite groups (date-range-
  // picker, memorable-date, checkbox-group), and bare controls all delegate.
  // Checking aria attributes on the wrapper would require seeing into the
  // rendered child template, which the static check doesn't do.
  if (CHILD_INPUT_WRAPPERS.has(comp.name)) return;

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
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar') return;
  // Preset wrappers (civ-ssn / civ-ein / etc.) dispatch civ-input and
  // civ-change via the PresetInputWrapper base class's _onInput / _onChange
  // methods. The static check looks for the dispatch in the consumer's own
  // file, so explicitly skip components that extend PresetInputWrapper.
  if (/extends\s+PresetInputWrapper/.test(comp.src)) return;

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
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar' || comp.name === 'civ-icon') return;
  if (NO_ANALYTICS.has(comp.name)) return; // Structural components don't fire analytics
  // Preset wrappers delegate analytics to the wrapped civ-text-input child
  // (which itself inherits sendAnalytics via _handleChange). The static
  // check looks at the consumer's own file, so skip explicitly.
  if (/extends\s+PresetInputWrapper/.test(comp.src)) return;

  // sendAnalytics can be called directly OR inherited via _handleChange from base class
  const hasAnalytics = comp.src.includes('sendAnalytics') || comp.src.includes('_handleChange');
  if (!hasAnalytics) {
    addIssue(comp.path, 'analytics', 'warning', `${comp.name} does not call sendAnalytics()`);
  }
}

function checkFocusRing(comp: ComponentFile) {
  // Focus ring is applied by a global rule in civ.css to every native
  // interactive element — components shouldn't add their own focus-* class.
  // Flag the deprecated focus:civ-outline-* AND the now-redundant
  // focus-visible:civ-focus-ring per-element class.
  const deprecated = ['focus:civ-outline', 'focus:civ-ring', 'focus-visible:civ-focus-ring'];
  for (const pattern of deprecated) {
    if (comp.src.includes(pattern)) {
      // Allow the inverse variant — it's still a real opt-in for dark backgrounds.
      if (pattern === 'focus-visible:civ-focus-ring' && !comp.src.match(/focus-visible:civ-focus-ring(?!-inverse)/)) continue;
      const lineNum = comp.lines.findIndex(l => {
        if (!l.includes(pattern)) return false;
        return pattern !== 'focus-visible:civ-focus-ring' || /focus-visible:civ-focus-ring(?!-inverse)/.test(l);
      });
      addIssue(comp.path, 'focus-ring', 'error', `${comp.name} uses deprecated ${pattern} — focus ring is now applied globally by civ.css to native interactive elements`, lineNum + 1);
      return;
    }
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
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar') return;

  if (!comp.src.includes('formResetCallback') && !comp.src.includes('_handleChange')) {
    addIssue(comp.path, 'form-reset', 'info', `${comp.name} does not override formResetCallback()`);
  }
}

function checkDisabledState(comp: ComponentFile) {
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar') return;

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
// Components bundled inside another native file (no separate .swift/.kt needed)
const CHILD_COMPONENTS = new Set([
  'civ-segment',       // Inside CivSegmentedControl
  'civ-radio-group',   // Inside CivRadio
  'civ-button-group',  // Inside CivActionButton
  'civ-list-item',     // Inside CivList
]);
// Structural/display/utility components that don't need analytics
const NO_ANALYTICS = new Set([
  'civ-fieldset', 'civ-segment',
  'civ-card', 'civ-divider', 'civ-tag', 'civ-page-header',
  'civ-button-group', 'civ-list',
  'civ-skip-link', 'civ-data-field',
  'civ-summary', 'civ-icon',
  // Compound components delegate analytics to child form fields
  'civ-address', 'civ-name', 'civ-signature',
  'civ-direct-deposit', 'civ-partnership-history', 'civ-relationship',
  'civ-service-history', 'civ-race-ethnicity',
  // Wrappers that delegate to a single child input — the child's
  // sendAnalytics fires for the actual user interaction.
  'civ-country', 'civ-date-range-picker',
  // civ-action-link wraps civ-link (which has sendAnalytics('click')).
  // civ-filter-chip-group's individual chips each fire sendAnalytics on
  // change / remove. Aggregate group-level analytics would be redundant
  // with the per-chip events.
  'civ-action-link', 'civ-filter-chip-group',
  // Orchestration components delegate to child fields/buttons
  'civ-form-step', 'civ-repeater',
  // Display / progress / overlay / layout components — no user-action surface
  // worth tracking (overlay close events aren't conversion events; progress
  // indicators have no user input; section/support content is presentational).
  'civ-progress-header', 'civ-progress-percent', 'civ-progress-steps',
  'civ-section-intro', 'civ-support-resources',
  'civ-badge', 'civ-count',
  'civ-action-sheet', 'civ-modal',
  'civ-filterable-list', 'civ-image-preview', 'civ-input-group',
]);

function checkNativeCounterparts(comp: ComponentFile) {
  if (comp.name === 'civ-icon') return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress-bar') return;
  if (CHILD_COMPONENTS.has(comp.name)) return; // Part of parent component on native
  // civ-fieldset is a web-only layout wrapper — no native counterpart needed
  if (comp.name === 'civ-fieldset') return;
  if (comp.name === 'civ-race-ethnicity') return; // Compound web component
  if (comp.src.includes('extends PresetInputWrapper')) return; // Preset wrappers

  const componentName = comp.name.replace('civ-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  const iosPath = join(ROOT, `packages/ios/Sources/CivUI/Civ${componentName}.swift`);
  const androidPath = join(ROOT, `packages/android/src/main/kotlin/gov/civui/components/Civ${componentName}.kt`);

  if (!existsSync(iosPath)) {
    addIssue(comp.path, 'native-ios', 'error', `${comp.name} has no iOS counterpart (expected Civ${componentName}.swift)`);
  }
  if (!existsSync(androidPath)) {
    addIssue(comp.path, 'native-android', 'error', `${comp.name} has no Android counterpart (expected Civ${componentName}.kt)`);
  }

  // Drupal SDC check (informational — does not block CI)
  const drupalName = comp.name.replace('civ-', '');
  const drupalPath = join(ROOT, `packages/drupal/civui/components/${drupalName}`);
  if (!existsSync(drupalPath)) {
    addIssue(comp.path, 'drupal-sdc', 'warn', `${comp.name} has no Drupal SDC (expected components/${drupalName}/)`);
  }
}

// ── A11y checks ──────────────────────────────────────────────

function checkA11yErrorAnnouncement(comp: ComponentFile) {
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar') return;
  if (CHILD_INPUT_WRAPPERS.has(comp.name)) return; // Error rendering handled by the inner child input

  // Errors should use role="alert" (handled by renderError), announce(), or
  // be wrapped via renderFormHeader() — the latter is the common pattern in
  // compound components where the legend/hint/error block is rendered as a
  // unit and the error message inside carries the role="alert" attribute.
  const hasErrorChannel = comp.src.includes('renderError') ||
                          comp.src.includes('role="alert"') ||
                          comp.src.includes('announce(') ||
                          comp.src.includes('renderFormHeader(');
  if (!hasErrorChannel) {
    addIssue(comp.path, 'a11y-error-announce', 'warning', `${comp.name} does not use renderError() or role="alert" for error announcements`);
  }
}

function checkA11yLabelAssociation(comp: ComponentFile) {
  const isFormParticipating = FORM_CLASS_RE.test(comp.src);
  if (!isFormParticipating) return;
  if (CHILD_COMPONENTS.has(comp.name)) return;
  if (CHILD_INPUT_WRAPPERS.has(comp.name)) return; // Label association handled by the inner child input
  if (comp.name === 'civ-conditional' || comp.name === 'civ-progress' || comp.name === 'civ-progress-bar') return;

  // Every form control needs a label/legend associated via for/id or inline <label>
  const hasLabelAssociation = comp.src.includes('renderLabel(') || comp.src.includes('renderLegend(') || comp.src.includes('aria-label') || comp.src.includes('<label');
  if (!hasLabelAssociation) {
    addIssue(comp.path, 'a11y-label', 'error', `${comp.name} has no label association (renderLabel, renderLegend, or aria-label)`);
  }
}

function checkA11yColorNotSoleIndicator(comp: ComponentFile) {
  if (comp.name === 'civ-icon') return; // Icons don't display errors
  // Error states should use more than just color (border, text, icon).
  if (comp.src.includes('civ-text-error') || comp.src.includes('civ-border-error')) {
    // A non-color indicator can be: a renderError call (role="alert"), an
    // explicit role="alert" element, an `<civ-icon name="error">` (the icon
    // shape itself is non-color), OR a renderFormHeader call (which the
    // compound components use to render the alert region as a unit).
    const hasNonColorIndicator =
      comp.src.includes('renderError') ||
      comp.src.includes('role="alert"') ||
      comp.src.includes('renderFormHeader(') ||
      /<civ-icon[^>]*name="error"/.test(comp.src);
    // Preset input wrappers (civ-ssn, civ-zip, etc.) delegate primary
    // error rendering to the inner civ-text-input / civ-combobox child.
    // The `civ-text-error` they use internally is for secondary indicators
    // (character-count overrun, file-size overflow icon) that always
    // accompany a non-color signal — not the primary error message.
    const isChildInputWrapper = CHILD_INPUT_WRAPPERS.has(comp.name);
    if (!hasNonColorIndicator && !isChildInputWrapper && !CHILD_COMPONENTS.has(comp.name)) {
      addIssue(comp.path, 'a11y-color-only', 'warning', `${comp.name} may use color as sole error indicator — verify text/icon accompanies color change`);
    }
  }
}

function checkA11yTouchTarget(comp: ComponentFile) {
  // Interactive elements should have adequate touch targets
  // Check for small sizing classes without adequate padding
  for (let i = 0; i < comp.lines.length; i++) {
    const line = comp.lines[i];
    if (line.includes('civ-w-4') && line.includes('civ-h-4') && !line.includes('civ-p-')) {
      addIssue(comp.path, 'a11y-touch-target', 'warning', `Potentially small touch target (16px). WCAG 2.2 requires 24x24px minimum.`, i + 1);
    }
  }
}

function checkA11yKeyboardHandler(comp: ComponentFile) {
  // Components with click handlers should also handle keyboard
  const hasClick = comp.src.includes('@click=');
  const hasKeydown = comp.src.includes('@keydown=') || comp.src.includes('keydown');
  const hasNativeInteractive = comp.src.includes('<button') || comp.src.includes('<a ') || comp.src.includes('<a\n') || comp.src.includes('role="button"') || comp.src.includes('<input') || comp.src.includes('<select') || comp.src.includes('<textarea') || comp.src.includes('<civ-button') || comp.src.includes('<civ-action-button') || comp.src.includes('<civ-link');

  if (hasClick && !hasKeydown && !hasNativeInteractive) {
    addIssue(comp.path, 'a11y-keyboard', 'warning', `${comp.name} has click handlers but may be missing keyboard handlers for non-button elements`);
  }
}

// ── i18n checks ──────────────────────────────────────────────

function checkI18nHardcodedStrings(comp: ComponentFile) {
  // Check for hardcoded English strings that should use t()
  const hardcodedPatterns = [
    // Common hardcoded strings in HTML templates
    { pattern: />\s*Required\s*</i, label: '"Required"' },
    { pattern: />\s*Error\s*</i, label: '"Error"' },
    { pattern: />\s*Select\s*</i, label: '"Select"' },
    { pattern: />\s*Cancel\s*</i, label: '"Cancel"' },
    { pattern: />\s*Remove\s*</i, label: '"Remove"' },
    { pattern: />\s*characters? remaining\s*</i, label: '"characters remaining"' },
    { pattern: />\s*words? remaining\s*</i, label: '"words remaining"' },
  ];

  for (let i = 0; i < comp.lines.length; i++) {
    const line = comp.lines[i];
    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) continue;

    for (const { pattern, label } of hardcodedPatterns) {
      if (pattern.test(line) && !line.includes('t(') && !line.includes('interpolate(')) {
        addIssue(comp.path, 'i18n-hardcoded', 'warning', `Possible hardcoded string ${label} — should use t() for i18n`, i + 1);
      }
    }
  }
}

function checkI18nAriaLabels(comp: ComponentFile) {
  // Check for hardcoded aria-label strings (should be localizable)
  for (let i = 0; i < comp.lines.length; i++) {
    const line = comp.lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    const match = line.match(/aria-label="([^"$]+)"/);
    if (match && !match[1].includes('${') && match[1].length > 1) {
      // It's a static aria-label string — should it be localizable?
      const value = match[1];
      // Skip if it's a short dynamic expression
      if (!/^(Step|Go to|Cancel|Clear|Remove|Retry|Upload|Choose|Previous|Next)/.test(value)) continue;
      addIssue(comp.path, 'i18n-aria-label', 'info', `Static aria-label "${value}" — consider using t() for localization`, i + 1);
    }
  }
}

function checkI18nPlaceholders(comp: ComponentFile) {
  // Check for hardcoded placeholder text
  for (let i = 0; i < comp.lines.length; i++) {
    const line = comp.lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    const match = line.match(/placeholder="([^"$]+)"/);
    if (match && !match[1].includes('${') && match[1].length > 3) {
      addIssue(comp.path, 'i18n-placeholder', 'info', `Static placeholder "${match[1]}" — consider using t() for localization`, i + 1);
    }
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
  // A11y checks
  checkA11yErrorAnnouncement(comp);
  checkA11yLabelAssociation(comp);
  checkA11yColorNotSoleIndicator(comp);
  checkA11yTouchTarget(comp);
  checkA11yKeyboardHandler(comp);
  // i18n checks
  checkI18nHardcodedStrings(comp);
  checkI18nAriaLabels(comp);
  checkI18nPlaceholders(comp);
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
