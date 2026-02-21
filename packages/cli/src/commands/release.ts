import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { run, findRoot, header, success } from '../utils.js';

const PACKAGES = [
  'packages/tokens/package.json',
  'packages/core/package.json',
  'packages/forms/package.json',
  'packages/react-native/package.json',
  'packages/cli/package.json',
];

/**
 * civds release patch|minor|major
 *
 * Release workflow:
 *   1. Validate (lint, typecheck, test)
 *   2. Bump version in all packages
 *   3. Build all packages
 *   4. Create git commit and tag
 *   5. (Manual) Push and publish
 *
 * Options:
 *   --dry-run   Preview without making changes
 */
export async function release(
  bump: string,
  flags: Record<string, boolean | string>,
): Promise<void> {
  if (!['patch', 'minor', 'major'].includes(bump)) {
    throw new Error('Release type must be: patch, minor, or major');
  }

  const dryRun = flags['dry-run'] === true;
  const root = findRoot();

  header(`CivDS Release: ${bump}${dryRun ? ' (dry run)' : ''}`);

  // Step 1: Get current version
  const rootPkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
  const currentVersion = rootPkg.version;
  const newVersion = bumpVersion(currentVersion, bump as 'patch' | 'minor' | 'major');

  console.log(`\n  Current version: ${currentVersion}`);
  console.log(`  New version:     ${newVersion}`);

  if (dryRun) {
    console.log('\n  [DRY RUN] No changes will be made.\n');

    console.log('  Steps that would run:');
    console.log('    1. Validate (lint, typecheck, test)');
    console.log(`    2. Bump all packages to ${newVersion}`);
    console.log('    3. Build all packages');
    console.log(`    4. Commit: "release: v${newVersion}"`);
    console.log(`    5. Tag: v${newVersion}`);
    console.log('    6. Push to remote');
    console.log('    7. Publish to npm');
    return;
  }

  // Step 2: Validate
  console.log('\n  Step 1/5: Validating...');
  run('npx tsc -b --force');
  run('npx vitest run');
  success('Validation passed');

  // Step 3: Bump versions
  console.log(`\n  Step 2/5: Bumping to ${newVersion}...`);
  bumpAllPackages(root, newVersion);
  success(`All packages bumped to ${newVersion}`);

  // Step 4: Build
  console.log('\n  Step 3/5: Building...');
  run('pnpm turbo build --force');
  success('Build complete');

  // Step 5: Commit and tag
  console.log('\n  Step 4/5: Creating release commit...');
  run('git add -A');
  run(`git commit -m "release: v${newVersion}"`);
  run(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`);
  success(`Committed and tagged v${newVersion}`);

  // Step 6: Instructions
  console.log('\n  Step 5/5: Next steps (manual):');
  console.log(`    git push origin main --tags`);
  console.log(`    pnpm -r publish --access public`);

  console.log(`\n  Release v${newVersion} prepared!\n`);
}

function bumpVersion(version: string, type: 'patch' | 'minor' | 'major'): string {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function bumpAllPackages(root: string, version: string): void {
  // Root package.json
  updateVersion(resolve(root, 'package.json'), version);

  // All workspace packages
  for (const pkgPath of PACKAGES) {
    updateVersion(resolve(root, pkgPath), version);
  }
}

function updateVersion(filePath: string, version: string): void {
  const content = readFileSync(filePath, 'utf-8');
  const pkg = JSON.parse(content);
  pkg.version = version;
  writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
}
