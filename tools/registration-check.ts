#!/usr/bin/env node --experimental-strip-types
/**
 * CivUI Component Registration Checker
 *
 * Verifies that compound components properly import their child
 * component packages so custom elements are registered at runtime.
 *
 * Scans compound component source files for child element tags
 * (e.g., <civ-text-input>) and checks that the corresponding
 * package is imported as a bare side-effect import.
 *
 * Usage: node --experimental-strip-types tools/registration-check.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');

// Map custom element tags to the package that registers them
const TAG_TO_PACKAGE: Record<string, string> = {
  'civ-text-input': '@civui/inputs',
  'civ-textarea': '@civui/inputs',
  'civ-select': '@civui/inputs',
  'civ-combobox': '@civui/inputs',
  'civ-date-picker': '@civui/inputs',
  'civ-memorable-date': '@civui/inputs',
  'civ-file-upload': '@civui/inputs',
  'civ-toggle': '@civui/inputs',
  'civ-yes-no': '@civui/inputs',
  'civ-ssn': '@civui/inputs',
  'civ-phone': '@civui/inputs',
  'civ-email': '@civui/inputs',
  'civ-zip': '@civui/inputs',
  'civ-ein': '@civui/inputs',
  'civ-currency': '@civui/inputs',
  'civ-checkbox': '@civui/controls',
  'civ-checkbox-group': '@civui/controls',
  'civ-radio': '@civui/controls',
  'civ-radio-group': '@civui/controls',
  'civ-segmented-control': '@civui/controls',
  'civ-segment': '@civui/controls',
  'civ-button': '@civui/actions',
  'civ-action-button': '@civui/actions',
  'civ-button-group': '@civui/actions',
  'civ-filter-chip': '@civui/actions',
  'civ-filter-chip-group': '@civui/actions',
  'civ-phone-link': '@civui/actions',
  'civ-email-link': '@civui/actions',
  'civ-card': '@civui/layout',
  'civ-tag': '@civui/layout',
  'civ-divider': '@civui/layout',
  'civ-input-group': '@civui/layout',
  'civ-page-header': '@civui/layout',
  'civ-link': '@civui/navigation',
  'civ-link-card': '@civui/navigation',
  'civ-external-link': '@civui/navigation',
  'civ-download-link': '@civui/navigation',
  'civ-skip-link': '@civui/navigation',
  'civ-task': '@civui/navigation',
  'civ-task-group': '@civui/navigation',
  'civ-task-list': '@civui/navigation',
  'civ-modal': '@civui/overlays',
  'civ-action-sheet': '@civui/overlays',
  'civ-icon': '@civui/core',
  'civ-alert': '@civui/feedback',
  'civ-badge': '@civui/feedback',
};

// Packages whose components compose children from other packages
const COMPOSING_PACKAGES = [
  join(ROOT, 'packages/compound/src'),
  join(ROOT, 'packages/form-patterns/src'),
  join(ROOT, 'packages/navigation/src'),
];

interface Issue {
  file: string;
  tag: string;
  pkg: string;
}

const issues: Issue[] = [];

function findComponentFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subdir = join(dir, entry.name);
      for (const sub of readdirSync(subdir)) {
        if (sub.match(/^civ-.*\.ts$/) && !sub.endsWith('.test.ts') && !sub.endsWith('.stories.ts')) {
          files.push(join(subdir, sub));
        }
      }
    }
  }
  return files;
}

for (const dir of COMPOSING_PACKAGES) {
  for (const file of findComponentFiles(dir)) {
    const raw = readFileSync(file, 'utf-8');
    const fileName = file.replace(ROOT + '/', '');

    // Strip comments so JSDoc @example blocks and prose references
    // don't trigger false positives (e.g., "For buttons, use <civ-button>")
    const content = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments (/** ... */)
      .replace(/\/\/.*$/gm, '');           // line comments

    // Find all <civ-*> tags used in template literals
    const tagMatches = content.matchAll(/<(civ-[\w-]+)/g);
    const usedTags = new Set<string>();
    for (const m of tagMatches) {
      usedTags.add(m[1]);
    }

    // Find the component's own tag (skip self-references)
    const ownTagMatch = content.match(/@customElement\(['"]([^'"]+)['"]\)/);
    const ownTag = ownTagMatch ? ownTagMatch[1] : '';

    // Find all bare side-effect imports
    const importMatches = content.matchAll(/import\s+['"]([^'"]+)['"]/g);
    const importedPackages = new Set<string>();
    for (const m of importMatches) {
      importedPackages.add(m[1]);
    }

    // Also count relative .js imports (same-package siblings)
    const relativeImports = content.matchAll(/import\s+['"](\.[^'"]+)['"]/g);
    const relativeFiles = new Set<string>();
    for (const m of relativeImports) {
      relativeFiles.add(m[1]);
    }

    // Check each used tag
    for (const tag of usedTags) {
      if (tag === ownTag) continue; // Skip self
      if (tag === 'civ-icon') continue; // civ-icon is in @civui/core which is always imported

      const requiredPkg = TAG_TO_PACKAGE[tag];
      if (!requiredPkg) continue; // Unknown tag, skip

      // Check if the package is imported (bare import or sub-path)
      const hasImport = [...importedPackages].some(
        imp => imp === requiredPkg || imp.startsWith(requiredPkg + '/')
      );

      // Check if it's a relative import from the same package
      const isRelative = [...relativeFiles].some(
        imp => imp.includes(tag.replace('civ-', ''))
      );

      if (!hasImport && !isRelative) {
        issues.push({ file: fileName, tag, pkg: requiredPkg });
      }
    }
  }
}

if (issues.length > 0) {
  console.error('Component registration check FAILED:\n');
  for (const { file, tag, pkg } of issues) {
    console.error(`  ${file}: <${tag}> used but ${pkg} not imported`);
    console.error(`    Add: import '${pkg}';`);
    console.error('');
  }
  console.error(`${issues.length} missing import(s) found.`);
  console.error('Child components will render as empty shells without these imports.');
  process.exit(1);
} else {
  console.log('All component registrations verified ✓');
  console.log(`Checked ${COMPOSING_PACKAGES.length} packages for cross-package imports.`);
}
