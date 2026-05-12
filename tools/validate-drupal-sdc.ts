#!/usr/bin/env node --experimental-strip-types
/**
 * CivUI Drupal SDC Validator
 *
 * Validates that each Drupal Single Directory Component:
 * 1. Has both .component.yml and .twig files
 * 2. YAML parses correctly with required fields
 * 3. Twig outputs the correct <civ-*> web component tag
 * 4. All YAML props appear as attributes in the Twig template
 * 5. Web component tag name matches the directory name
 *
 * Usage: node --experimental-strip-types tools/validate-drupal-sdc.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const DRUPAL_DIR = join(ROOT, 'packages/drupal/civui/components');

interface Issue {
  component: string;
  severity: 'error' | 'warn';
  message: string;
}

const issues: Issue[] = [];

function addIssue(component: string, severity: 'error' | 'warn', message: string) {
  issues.push({ component, severity, message });
}

// Simple YAML parser for component.yml (enough for our structure)
function parseYamlProps(yaml: string): { name: string; props: string[]; slots: string[]; hasLibrary: boolean } {
  const nameMatch = yaml.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim().replace(/['"]/g, '') : '';

  // Extract prop names from properties section
  const props: string[] = [];
  const propsSection = yaml.match(/properties:\n([\s\S]*?)(?=\nslots:|\nlibraryOverrides:|\n[a-z]|\Z)/);
  if (propsSection) {
    const propMatches = propsSection[1].matchAll(/^\s{4}(\w+):\s*$/gm);
    for (const m of propMatches) {
      props.push(m[1]);
    }
  }

  // Extract slot names
  const slots: string[] = [];
  const slotsSection = yaml.match(/^slots:\n([\s\S]*?)(?=\nlibraryOverrides:|\n[a-z]|\Z)/m);
  if (slotsSection) {
    const slotMatches = slotsSection[1].matchAll(/^\s{2}(\w+):\s*$/gm);
    for (const m of slotMatches) {
      slots.push(m[1]);
    }
  }

  const hasLibrary = yaml.includes('civui/civui');

  return { name, props, slots, hasLibrary };
}

// SDC directory name → actual web component tag overrides
const TAG_OVERRIDES: Record<string, string> = {};

// Check that Twig template references the correct web component
function validateTwig(twig: string, dirName: string, yamlProps: string[], yamlSlots: string[]): void {
  const expectedTag = TAG_OVERRIDES[dirName] || `civ-${dirName}`;

  // Check for the opening tag
  if (!twig.includes(`<${expectedTag}`)) {
    addIssue(dirName, 'error', `Twig does not contain <${expectedTag}> tag`);
    return;
  }

  // Check that YAML props appear as attributes in Twig
  for (const prop of yamlProps) {
    // Convert snake_case to kebab-case for HTML attribute matching
    const kebab = prop.replace(/_/g, '-');
    // Check for the prop name in the Twig (as attribute or in conditional)
    if (!twig.includes(prop) && !twig.includes(kebab)) {
      addIssue(dirName, 'warn', `Prop "${prop}" defined in YAML but not found in Twig`);
    }
  }

  // Check that slots use {% block %} syntax
  for (const slot of yamlSlots) {
    if (!twig.includes(`{% block ${slot} %}`)) {
      addIssue(dirName, 'warn', `Slot "${slot}" defined in YAML but no {% block ${slot} %} in Twig`);
    }
  }

  // Check for closing tag
  if (!twig.includes(`</${expectedTag}>`) && !twig.includes(`></${expectedTag}>`)) {
    // Self-closing components are OK for some elements
    if (!twig.includes(`/>`)) {
      addIssue(dirName, 'warn', `No closing </${expectedTag}> tag found`);
    }
  }
}

// Main validation
const dirs = readdirSync(DRUPAL_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

console.log(`Validating ${dirs.length} Drupal SDCs...\n`);

let valid = 0;
let warnings = 0;
let errors = 0;

for (const dir of dirs) {
  const componentDir = join(DRUPAL_DIR, dir);
  const ymlPath = join(componentDir, `${dir}.component.yml`);
  const twigPath = join(componentDir, `${dir}.twig`);

  // Check files exist
  if (!existsSync(ymlPath)) {
    addIssue(dir, 'error', `Missing ${dir}.component.yml`);
    continue;
  }
  if (!existsSync(twigPath)) {
    addIssue(dir, 'error', `Missing ${dir}.twig`);
    continue;
  }

  const yaml = readFileSync(ymlPath, 'utf-8');
  const twig = readFileSync(twigPath, 'utf-8');

  // Validate YAML structure
  const { name, props, slots, hasLibrary } = parseYamlProps(yaml);

  if (!name) {
    addIssue(dir, 'error', 'YAML missing "name" field');
  }

  if (!yaml.includes('status:')) {
    addIssue(dir, 'error', 'YAML missing "status" field');
  }

  if (!hasLibrary) {
    addIssue(dir, 'error', 'YAML missing civui/civui library dependency');
  }

  // Validate Twig
  validateTwig(twig, dir, props, slots);

  // Count results for this component
  const componentIssues = issues.filter(i => i.component === dir);
  const componentErrors = componentIssues.filter(i => i.severity === 'error');

  if (componentErrors.length === 0) {
    valid++;
  }
}

// Report
const allErrors = issues.filter(i => i.severity === 'error');
const allWarnings = issues.filter(i => i.severity === 'warn');

if (allErrors.length > 0) {
  console.log(`\x1b[31m✗ ${allErrors.length} error(s)\x1b[0m`);
  for (const issue of allErrors) {
    console.log(`  \x1b[31m✗\x1b[0m ${issue.component}: ${issue.message}`);
  }
  console.log('');
}

if (allWarnings.length > 0) {
  console.log(`\x1b[33m⚠ ${allWarnings.length} warning(s)\x1b[0m`);
  for (const issue of allWarnings) {
    console.log(`  \x1b[33m⚠\x1b[0m ${issue.component}: ${issue.message}`);
  }
  console.log('');
}

console.log(`${valid}/${dirs.length} components valid`);

if (allErrors.length > 0) {
  process.exit(1);
}
