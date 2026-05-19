#!/usr/bin/env tsx
/**
 * CivUI iOS stub allowlist lint.
 *
 * Enforces two invariants:
 *
 *   1. **No new stubs slip in.** Any iOS component whose `body` is
 *      `EmptyView()` (the only content) must be listed in
 *      `tools/ios-stub-allowlist.ts`. The allowlist is a
 *      human-curated record of "we deliberately deferred this
 *      implementation" — see `.claude/rules/audit-debt.md`.
 *
 *   2. **Stubs aren't silently completed.** A component listed in the
 *      allowlist must still have an EmptyView body. If someone removed
 *      EmptyView and shipped real SwiftUI, the allowlist entry is
 *      stale and the lint fails — the entry must be removed in the
 *      same change.
 *
 * Why this matters: an AI agent (or contributor) trying to "fix"
 * empty bodies blind can ship untested SwiftUI to production. Modal
 * presentation, focus traps, keyboard insets, and scrim behaviour
 * have device-specific quirks. Removing an entry should be a
 * deliberate human action accompanied by simulator + physical-device
 * testing.
 *
 * Usage: pnpm lint:ios-stub-allowlist
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { IOS_STUB_ALLOWLIST } from './ios-stub-allowlist.js';
import { printRuleLink } from './lint-rule-links.js';

const ROOT = join(import.meta.dirname, '..');
const IOS_DIR = join(ROOT, 'packages/ios/Sources/CivUI');

/**
 * Returns true if the file's top-level `public var body: some View`
 * block contains only an EmptyView() expression (ignoring comments
 * and blank lines).
 */
function isStubBody(content: string): boolean {
  const match = content.match(
    /public\s+var\s+body\s*:\s*some\s+View\s*\{\s*([\s\S]*?)\s*\}\s*(?:\n|$)/,
  );
  if (!match) return false;

  // Walk balanced braces to find the real closing of body.
  const startIdx = content.search(/public\s+var\s+body\s*:\s*some\s+View\s*\{/);
  if (startIdx < 0) return false;
  const openIdx = content.indexOf('{', startIdx);
  let depth = 1;
  let i = openIdx + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  let inner = content.slice(openIdx + 1, i);
  // Strip block comments first (they may span multiple lines).
  inner = inner.replace(/\/\*[\s\S]*?\*\//g, '');
  // Then strip line comments and split.
  const meaningful = inner
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .filter((line) => line.length > 0);

  return meaningful.length === 1 && meaningful[0] === 'EmptyView()';
}

interface Result {
  newStubs: string[]; // EmptyView body found, not in allowlist
  staleEntries: string[]; // in allowlist, but body is no longer EmptyView
}

function runLint(): Result {
  const newStubs: string[] = [];
  const staleEntries: string[] = [];

  let files: string[] = [];
  try {
    files = readdirSync(IOS_DIR).filter((f) => f.endsWith('.swift'));
  } catch {
    // No iOS directory — nothing to lint.
    return { newStubs, staleEntries };
  }

  const realStubs = new Set<string>();
  for (const file of files) {
    const path = join(IOS_DIR, file);
    const content = readFileSync(path, 'utf-8');
    if (isStubBody(content)) {
      realStubs.add(file);
      if (!IOS_STUB_ALLOWLIST.has(file)) {
        newStubs.push(file);
      }
    }
  }

  for (const allowed of IOS_STUB_ALLOWLIST) {
    if (!realStubs.has(allowed)) {
      staleEntries.push(allowed);
    }
  }

  return { newStubs, staleEntries };
}

function main(): number {
  const { newStubs, staleEntries } = runLint();

  if (newStubs.length === 0 && staleEntries.length === 0) {
    console.log(
      `✓ iOS stub allowlist in sync (${IOS_STUB_ALLOWLIST.size} entries).`,
    );
    return 0;
  }

  let exit = 0;

  if (newStubs.length > 0) {
    exit = 1;
    console.log(
      `✗ ${newStubs.length} iOS component(s) have an EmptyView() body but are NOT in the allowlist:\n`,
    );
    for (const file of newStubs) {
      console.log(`  packages/ios/Sources/CivUI/${file}`);
    }
    console.log(
      `\nIf the body is intentionally empty (deferred implementation), add the filename`,
    );
    console.log(`to IOS_STUB_ALLOWLIST in tools/ios-stub-allowlist.ts.`);
    console.log(`Otherwise, implement the SwiftUI body.`);
    console.log();
    printRuleLink('ios-stub-allowlist');
    console.log();
  }

  if (staleEntries.length > 0) {
    exit = 1;
    console.log(
      `✗ ${staleEntries.length} allowlist entry/entries no longer have an EmptyView() body:\n`,
    );
    for (const file of staleEntries) {
      console.log(`  ${file}`);
    }
    console.log(
      `\nThe body has been implemented. Remove the entry from IOS_STUB_ALLOWLIST`,
    );
    console.log(
      `in tools/ios-stub-allowlist.ts so future edits don't get flagged.`,
    );
    console.log(
      `\nIf you implemented this without device verification, please revert.`,
    );
    console.log();
    printRuleLink('ios-stub-allowlist');
    console.log();
  }

  return exit;
}

function isCliInvocation(): boolean {
  const argv = process.argv[1];
  if (!argv) return false;
  try {
    return import.meta.url === pathToFileURL(argv).href;
  } catch {
    return false;
  }
}

if (isCliInvocation()) {
  process.exit(main());
}

export { runLint, isStubBody };
